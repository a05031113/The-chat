package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"the-chat/application/database"
	"the-chat/application/models"
	"the-chat/application/storage"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func GetUserData(c *gin.Context) {
	var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
	id, _ := c.Get("id")
	var user models.User

	primitiveId, _ := primitive.ObjectIDFromHex(id.(string))

	err := userCollection.FindOne(ctx, bson.M{"_id": primitiveId}).Decode(&user)
	defer cancel()

	user.ID = id.(string)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, user)
}

func AllUser(c *gin.Context) {
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

func Presigned(c *gin.Context) {
	var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
	id, _ := c.Get("id")
	updateId, _ := primitive.ObjectIDFromHex(id.(string))
	photoUrl := "https://pub-6cd56288498e4af5b3650c296ca21e82.r2.dev/" + id.(string) + "_profile_photo"

	var url models.Url
	url.PresignedUrl = storage.PresignedUrl(id.(string) + "_profile_photo")
	url.PhotoUrl = photoUrl

	_, err := userCollection.UpdateOne(ctx, bson.M{"_id": updateId}, bson.M{"$set": bson.M{"headPhoto": photoUrl}})
	defer cancel()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, url)
	database.AllUserData()
}
