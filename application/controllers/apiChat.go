package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"the-chat/application/database"
	"the-chat/application/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var addFriendCollection *mongo.Collection = database.OpenCollection(database.Client, "addFriend")

func AddFriend(c *gin.Context) {
	var ctx = context.Background()
	var addFriendData models.AddFriendData
	userID, _ := c.Get("id")

	if err := c.BindJSON(&addFriendData); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var insertID models.InsertID

	primitiveAddId, _ := primitive.ObjectIDFromHex(userID.(string))
	primitiveAddedId, _ := primitive.ObjectIDFromHex(addFriendData.ID)

	count, err := addFriendCollection.CountDocuments(ctx, bson.M{"addid": primitiveAddId, "addedid": primitiveAddedId})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "already sent"})
		return
	}

	insertID.AddId = primitiveAddId
	insertID.AddedId = primitiveAddedId
	insertID.Introduction = addFriendData.Introduction

	result, err := addFriendCollection.InsertOne(ctx, insertID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	fmt.Println(result)

	c.JSON(http.StatusOK, gin.H{"add": "success"})
}

func AddData(c *gin.Context) {
	var ctx = context.Background()
	userID, _ := c.Get("id")

	primitiveId, _ := primitive.ObjectIDFromHex(userID.(string))

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

	addOpts := options.Find().SetProjection(bson.D{{"_id", 0}})
	addResult, err := addFriendCollection.Find(ctx, bson.M{"addid": primitiveId}, addOpts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	addedOpts := options.Find().SetProjection(bson.D{{"_id", 0}})
	addedResult, err := addFriendCollection.Find(ctx, bson.M{"addedid": primitiveId}, addedOpts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var addResults []bson.M
	if err = addResult.All(context.TODO(), &addResults); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	}
	var addConvert []primitive.ObjectID
	for _, result := range addResults {
		addConvert = append(addConvert, result["addedid"].(primitive.ObjectID))
	}
	var addOutput []primitive.M
	for i := 0; i < len(addConvert); i++ {
		for j, user := range data {
			if addConvert[i].Hex() == user["_id"] {
				addOutput = append(addOutput, data[j])
			}
		}
	}

	var addedResults []bson.M
	if err = addedResult.All(context.TODO(), &addedResults); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	}
	var addedConvert []map[string]interface{}
	for _, result := range addedResults {
		addMap := map[string]interface{}{
			"addid":        result["addid"].(primitive.ObjectID),
			"introduction": result["introduction"],
		}
		addedConvert = append(addedConvert, addMap)
	}
	var addedOutput []primitive.M
	for i := 0; i < len(addedConvert); i++ {
		checkId := addedConvert[i]["addid"]
		for j, user := range data {
			primitiveId, _ := primitive.ObjectIDFromHex(user["_id"].(string))
			if checkId == primitiveId {
				data[j]["introduction"] = addedConvert[i]["introduction"]
				addedOutput = append(addedOutput, data[j])
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{"add": addOutput, "added": addedOutput})
}

func CheckAdded(c *gin.Context) {
	var ctx = context.Background()
	var checkAddedData models.AddFriendData
	userID, _ := c.Get("id")

	if err := c.BindJSON(&checkAddedData); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	primitiveAddId, _ := primitive.ObjectIDFromHex(checkAddedData.ID)
	primitiveUserId, _ := primitive.ObjectIDFromHex(userID.(string))

	count, err := addFriendCollection.CountDocuments(ctx, bson.M{"_id": primitiveUserId, "friend": primitiveAddId})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "already sent"})
		return
	}
	userUpdate := bson.M{"$push": bson.M{"friend": primitiveAddId}}
	addUpdate := bson.M{"$push": bson.M{"friend": primitiveUserId}}

	userUpdateResult, err := userCollection.UpdateOne(ctx, bson.M{"_id": primitiveUserId}, userUpdate)
	addedUpdateResult, err := userCollection.UpdateOne(ctx, bson.M{"_id": primitiveAddId}, addUpdate)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	deleteResult, err := addFriendCollection.DeleteOne(ctx, bson.M{"addid": primitiveAddId, "addedid": primitiveUserId})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	fmt.Println(deleteResult, userUpdateResult, addedUpdateResult)

	c.JSON(http.StatusOK, gin.H{"add": "success"})
}
