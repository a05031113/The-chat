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

var messagesCollection *mongo.Collection = database.OpenCollection(database.Client, "messages")

func Send(c *gin.Context) {
	var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
	userID, _ := c.Get("id")
	var message models.SendMessage

	if err := c.BindJSON(&message); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	primitiveId, _ := primitive.ObjectIDFromHex(userID.(string))

	count, err := messagesCollection.CountDocuments(ctx, bson.M{"roomid": message.RoomID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	var room models.Room
	room.RoomID = message.RoomID

	if count == 0 {
		_, err := messagesCollection.InsertOne(ctx, room)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	messageUpdate := bson.M{"$push": bson.M{"message": bson.M{"sendId": primitiveId, "content": message.Content, "time": message.SendTime, "type": message.Type}}}

	userUpdateResult, err := messagesCollection.UpdateOne(ctx, bson.M{"roomid": message.RoomID}, messageUpdate)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer cancel()

	fmt.Println(userUpdateResult)

	c.JSON(http.StatusOK, gin.H{"message": "success"})
}

func Room(c *gin.Context) {
	var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
	var room models.Room

	if err := c.BindJSON(&room); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var roomResult bson.M
	err := messagesCollection.FindOne(ctx, bson.M{"roomid": room.RoomID}).Decode(&roomResult)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"data": nil})
		return
	}
	defer cancel()

	c.JSON(http.StatusOK, gin.H{"data": roomResult})
}

func GetRoom(c *gin.Context) {
	userId, _ := c.Get("id")
	var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)

	// index := mongo.IndexModel{
	// 	Keys: bsonx.Doc{
	// 		{"message.time", bsonx.Int32(1)},
	// 	},
	// 	Options: options.Index().SetName("message_time_index"),
	// }

	// _, err := messagesCollection.Indexes().CreateOne(ctx, index)

	options := options.Find()
	options.SetProjection(bson.M{"roomid": 1, "message": bson.M{"$slice": -1}, "_id": 0})
	// options.SetSort(bson.M{"message.time": -1})
	roomResult, err := messagesCollection.Find(ctx, bson.M{"roomid": bson.M{"$regex": userId.(string)}}, options)
	if err != nil {
		fmt.Println(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer cancel()

	var roomList []bson.M
	if err = roomResult.All(context.TODO(), &roomList); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	}

	c.JSON(http.StatusOK, gin.H{"data": roomList})
}
