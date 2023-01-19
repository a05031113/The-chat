package controllers

import (
	"context"
	"fmt"
	"net/http"
	"the-chat/application/models"
	"the-chat/application/storage"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"gopkg.in/mgo.v2/bson"
)

func Presigned(c *gin.Context) {
	var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
	id, _ := c.Get("id")
	updateId, _ := primitive.ObjectIDFromHex(id.(string))
	photoUrl := "https://pub-6cd56288498e4af5b3650c296ca21e82.r2.dev/" + id.(string) + "_profile_photo"

	var url models.Url
	url.PresignedUrl = storage.PresignedUrl(id.(string) + "_profile_photo")
	url.PhotoUrl = photoUrl

	updateHeadPhoto, err := userCollection.UpdateOne(ctx, bson.M{"_id": updateId}, bson.M{"$set": bson.M{"headPhoto": photoUrl}})
	defer cancel()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	fmt.Println(updateHeadPhoto)
	c.JSON(http.StatusOK, url)
}
