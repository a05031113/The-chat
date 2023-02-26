package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"the-chat/application/database"
	"the-chat/application/helper"
	"the-chat/application/models"
	"the-chat/application/storage"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func GetUserData(c *gin.Context) {
	var ctx = context.Background()
	id, _ := c.Get("id")
	var user models.User
	var userData models.UserData

	primitiveId, _ := primitive.ObjectIDFromHex(id.(string))

	err := userCollection.FindOne(ctx, bson.M{"_id": primitiveId}).Decode(&user)

	user.ID = id.(string)

	var friendList []primitive.M

	rdb := database.RedisClient()
	val, err := rdb.Get(ctx, "allUserData").Bytes()
	if err != nil {
		panic(err)
	}
	var data []primitive.M
	err = json.Unmarshal(val, &data)
	if err != nil {
		fmt.Println("error:", err)
		return
	}

	for i := 0; i < len(user.Friend); i++ {
		friend := user.Friend[i].Hex()
		for j, user := range data {
			if user["_id"] == friend {
				friendList = append(friendList, data[j])
			}
		}
	}
	userData.ID = user.ID
	userData.Username = user.Username
	userData.Email = user.Email
	userData.HeadPhoto = user.HeadPhoto
	userData.Friend = friendList

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, userData)
}

func GetAllUser(c *gin.Context) {
	var ctx = context.Background()
	rdb := database.RedisClient()
	val, err := rdb.Get(ctx, "allUserData").Bytes()
	if err != nil {
		panic(err)
	}

	var data []primitive.M
	err = json.Unmarshal(val, &data)
	if err != nil {
		fmt.Println("error:", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": data})
}

func GetHeadPhoto(c *gin.Context) {
	var ctx = context.Background()
	id, _ := c.Get("id")
	updateId, _ := primitive.ObjectIDFromHex(id.(string))
	photoUrl := "https://pub-6cd56288498e4af5b3650c296ca21e82.r2.dev/" + id.(string) + "_profile_photo"

	var url models.Url
	url.PresignedUrl = storage.PresignedUrl(id.(string) + "_profile_photo")
	url.PhotoUrl = photoUrl

	_, err := userCollection.UpdateOne(ctx, bson.M{"_id": updateId}, bson.M{"$set": bson.M{"headPhoto": photoUrl}})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, url)
	database.AllUserData()
}

func PostSearch(c *gin.Context) {
	var ctx = context.Background()
	var searchId models.Search

	if err := c.BindJSON(&searchId); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	rdb := database.RedisClient()
	val, err := rdb.Get(ctx, "allUserData").Bytes()
	if err != nil {
		panic(err)
	}
	var data []primitive.M
	err = json.Unmarshal(val, &data)
	if err != nil {
		fmt.Println("error:", err)
		return
	}

	var result primitive.M
	for i, user := range data {
		if user["username"] == searchId.SearchId {
			result = data[i]
		}
	}

	if result == nil {
		var searchResult models.SearchResult
		err := userCollection.FindOne(ctx, bson.M{"username": searchId.SearchId}).Decode(&searchResult)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "No this user"})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"data": map[string]any{
				"_id":       searchResult.ID,
				"username":  searchResult.Username,
				"headPhoto": searchResult.HeadPhoto,
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": result})
}

func GetRecommend(c *gin.Context) {
	var ctx = context.Background()
	rdb := database.RedisClient()
	val, err := rdb.Get(ctx, "allUserData").Bytes()
	if err != nil {
		panic(err)
	}
	var data []primitive.M
	err = json.Unmarshal(val, &data)
	if err != nil {
		fmt.Println("error:", err)
		return
	}
	var nums [3]int
	for i := 0; i < 3; i++ {
		num := rand.Intn(len(data))
		for contains(nums, num) {
			num = rand.Intn(len(data))
		}
		nums[i] = num
	}
	var output [3]primitive.M
	for i := 0; i < len(nums); i++ {
		output[i] = data[nums[i]]
	}
	c.JSON(http.StatusOK, gin.H{"data": output})
}

func PostUpdateUsername(c *gin.Context) {
	var ctx = context.Background()
	id, _ := c.Get("id")
	var updateData models.UpdateData

	if err := c.BindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if updateData.Email == "" && updateData.Username == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no input"})
		return
	}

	primitiveId, _ := primitive.ObjectIDFromHex(id.(string))

	filter := bson.M{"_id": primitiveId}
	if updateData.Email == "" {
		countUsername, err := userCollection.CountDocuments(ctx, bson.M{"username": updateData.Username})
		if err != nil {
			log.Panic(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error while checking email"})
			return
		}
		if countUsername > 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Username already been used"})
			return
		}

		updateUsername := bson.M{
			"$set": bson.M{"username": updateData.Username},
		}
		_, errUpdate := userCollection.UpdateOne(ctx, filter, updateUsername)
		if errUpdate != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"update": true, "username": true})
	} else if updateData.Username == "" {
		emailValid := helper.EmailValid(updateData.Email)
		if !emailValid {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Wrong email format"})
			return
		}
		countEmail, err := userCollection.CountDocuments(ctx, bson.M{"email": updateData.Email})
		if err != nil {
			log.Panic(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error while checking email"})
			return
		}
		if countEmail > 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Email already exist"})
			return
		}
		updateEmail := bson.M{
			"$set": bson.M{"email": updateData.Email},
		}
		_, errUpdate := userCollection.UpdateOne(ctx, filter, updateEmail)
		if errUpdate != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"update": true, "email": true})
	} else {
		emailValid := helper.EmailValid(updateData.Email)
		if !emailValid {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Wrong email format"})
			return
		}
		countUsername, err := userCollection.CountDocuments(ctx, bson.M{"username": updateData.Username})
		if err != nil {
			log.Panic(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error while checking email"})
			return
		}
		if countUsername > 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Username already been used"})
			return
		}
		countEmail, err := userCollection.CountDocuments(ctx, bson.M{"email": updateData.Email})
		if err != nil {
			log.Panic(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error while checking email"})
			return
		}
		if countEmail > 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Email already exist"})
			return
		}

		updateAll := bson.M{
			"$set": bson.M{"username": updateData.Username, "email": updateData.Email},
		}
		_, updateErr := userCollection.UpdateOne(ctx, filter, updateAll)
		if updateErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"update": true, "username": true, "email": true})
	}
}

func PostUpdatePassword(c *gin.Context) {
	var ctx = context.Background()
	id, _ := c.Get("id")
	var passwordData models.PasswordData
	var foundUser models.FoundUser

	if err := c.BindJSON(&passwordData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if passwordData.Current == "" || passwordData.New == "" || passwordData.Confirmation == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No input"})
	}
	primitiveId, _ := primitive.ObjectIDFromHex(id.(string))

	err := userCollection.FindOne(ctx, bson.M{"_id": primitiveId}).Decode(&foundUser)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Please login again"})
		return
	}

	match := helper.CheckPasswordHash(passwordData.Current, foundUser.Password)
	if !match {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Current password is incorrect"})
		return
	}

	if passwordData.New != passwordData.Confirmation {
		c.JSON(http.StatusBadRequest, gin.H{"error": "New passwords are different"})
		return
	}

	passwordValid := helper.PasswordValid(passwordData.New)
	if !passwordValid {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Wrong password format"})
		return
	}

	hashPass, _ := helper.HashPassword(passwordData.New)

	filter := bson.M{"_id": primitiveId}
	updatePassword := bson.M{
		"$set": bson.M{"password": hashPass},
	}
	_, updateErr := userCollection.UpdateOne(ctx, filter, updatePassword)
	if updateErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"update": true})
}

func contains(nums [3]int, num int) bool {
	for _, n := range nums {
		if n == num {
			return true
		}
	}
	return false
}
