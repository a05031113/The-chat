package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"the-chat/application/database"
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

	var result []primitive.M
	for i, user := range data {
		if user["username"] == searchId.SearchId {
			result = append(result, data[i])
		}
	}

	c.JSON(http.StatusOK, gin.H{"data": result})
}
