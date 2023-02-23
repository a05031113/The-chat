package controllers

import (
	"context"
	"fmt"
	"net/http"
	"the-chat/application/database"
	"the-chat/application/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

func PostSubscribe(c *gin.Context) {
	var ctx = context.Background()
	userID, _ := c.Get("id")
	var subscription models.Subscription

	if err := c.BindJSON(&subscription); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	_, err := userCollection.UpdateOne(ctx, bson.M{"_id": userID}, bson.M{"$set": bson.M{"subscription": subscription.Subscription}})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"update": true})
	database.AllUserData()

	fmt.Println(userID)
	fmt.Println(subscription)
}
