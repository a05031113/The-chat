package controllers

import (
	"context"
	"fmt"
	"net/http"
	"the-chat/application/database"
	"the-chat/application/models"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var addFriendCollection *mongo.Collection = database.OpenCollection(database.Client, "addFriend")

func AllUser(c *gin.Context) {
	username, _ := c.Get("username")
	var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)

	opts := options.Find().SetProjection(bson.D{{"username", 1}, {"headPhoto", 1}})
	cursor, err := userCollection.Find(ctx, bson.M{}, opts)
	defer cancel()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	}
	var results []bson.M
	if err = cursor.All(context.TODO(), &results); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	}

	var output []primitive.M
	for _, result := range results {
		if result["username"] != username.(string) {
			// id := result["_id"].(primitive.ObjectID)
			// idString := id.Hex()
			// result["_id"] = idString
			output = append(output, result)
		}
	}
	c.JSON(http.StatusOK, gin.H{"data": output})
}

func AddFriend(c *gin.Context) {
	var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
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

	result, err := addFriendCollection.InsertOne(ctx, insertID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer cancel()
	fmt.Println(result)

	c.JSON(http.StatusOK, gin.H{"add": "success"})
}

func AddData(c *gin.Context) {
	var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
	userID, _ := c.Get("id")

	primitiveId, _ := primitive.ObjectIDFromHex(userID.(string))

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
	defer cancel()

	var addResults []bson.M
	if err = addResult.All(context.TODO(), &addResults); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	}

	var addOutput []primitive.ObjectID
	for _, result := range addResults {
		addOutput = append(addOutput, result["addedid"].(primitive.ObjectID))
	}

	var addedResults []bson.M
	if err = addedResult.All(context.TODO(), &addedResults); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	}

	var addedOutput []primitive.ObjectID
	for _, result := range addedResults {
		addedOutput = append(addedOutput, result["addid"].(primitive.ObjectID))
	}

	c.JSON(http.StatusOK, gin.H{"add": addOutput, "added": addedOutput})
}

func CheckAdded(c *gin.Context) {
	var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
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
	defer cancel()
	fmt.Println(deleteResult, userUpdateResult, addedUpdateResult)

	c.JSON(http.StatusOK, gin.H{"add": "success"})
}
