package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"the-chat/application/database"
	"the-chat/application/models"
	"the-chat/application/notification"
	"the-chat/application/storage"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/x/bsonx"
)

var messagesCollection *mongo.Collection = database.OpenCollection(database.Client, "messages")

func Send(c *gin.Context) {
	var ctx = context.Background()
	userID, _ := c.Get("id")
	username, _ := c.Get("username")
	userIDString := userID.(string)
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

	IDs := strings.Split(message.RoomID, ",")
	var friendId string
	for i := 0; i < len(IDs); i++ {
		if userID.(string) != IDs[i] {
			friendId = IDs[i]
		}
	}

	if count == 0 {
		_, err := messagesCollection.InsertOne(ctx, bson.M{"roomid": message.RoomID, "unRead": bson.M{userIDString: 0, friendId: 0}})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}
	field := fmt.Sprintf("unRead.%s", friendId)

	messageUpdate := bson.M{"$push": bson.M{"message": bson.M{"sendId": primitiveId, "content": message.Content, "time": message.SendTime, "type": message.Type, "status": "read"}}}
	unReadUpdate := bson.M{"$inc": bson.M{field: 1}}

	userUpdateResult, err := messagesCollection.UpdateOne(ctx, bson.M{"roomid": message.RoomID}, messageUpdate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	updateUnReadResult, err := messagesCollection.UpdateOne(ctx, bson.M{"roomid": message.RoomID}, unReadUpdate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	fmt.Println(userUpdateResult, updateUnReadResult)

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
	for i := 0; i < len(data); i++ {
		if friendId == data[i]["_id"] {
			if data[i]["subscription"] == nil {
				return
			}
			notifyMessage := username.(string) + ": " + message.Content
			notification.Push(data[i]["subscription"].(string), notifyMessage)
			c.JSON(http.StatusOK, gin.H{"message": "success"})
			return
		}
	}
	var searchResult models.SearchResult
	errFind := userCollection.FindOne(ctx, bson.M{"_id": userID}).Decode(&searchResult)
	if errFind != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No this user"})
		return
	}
	if searchResult.Subscription == "" {
		return
	}
	notifyMessage := "Friend request from " + username.(string)
	notification.Push(searchResult.Subscription, notifyMessage)

	c.JSON(http.StatusOK, gin.H{"message": "success"})
}

func Room(c *gin.Context) {
	var ctx = context.Background()
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

	c.JSON(http.StatusOK, gin.H{"data": roomResult})
}

func GetRoom(c *gin.Context) {
	userId, _ := c.Get("id")
	var ctx = context.Background()

	index := mongo.IndexModel{
		Keys: bsonx.Doc{
			{"message.time", bsonx.Int32(1)},
		},
		Options: options.Index().SetName("message_time_index"),
	}
	_, err := messagesCollection.Indexes().CreateOne(ctx, index)

	options := options.Find()
	options.SetProjection(bson.M{"roomid": 1, "unRead": 1, "message": bson.M{"$slice": -1}, "_id": 0})
	options.SetSort(bson.M{"message.time": 1})
	roomResult, err := messagesCollection.Find(ctx, bson.M{"roomid": bson.M{"$regex": userId.(string)}}, options)
	if err != nil {
		fmt.Println(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var roomList []bson.M
	if err = roomResult.All(context.TODO(), &roomList); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	}

	c.JSON(http.StatusOK, gin.H{"data": roomList})
}
func ResetUnRead(c *gin.Context) {
	var ctx = context.Background()
	userId, _ := c.Get("id")
	var roomId models.Room

	if err := c.BindJSON(&roomId); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "post Issue"})
		return
	}

	field := fmt.Sprintf("unRead.%s", userId.(string))

	unReadUpdate := bson.M{"$set": bson.M{field: 0}}

	result, err := messagesCollection.UpdateOne(ctx, bson.M{"roomid": roomId.RoomID}, unReadUpdate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	fmt.Println(result)

	c.JSON(http.StatusOK, gin.H{"status": "success"})
}

func PostFile(c *gin.Context) {
	var fileName models.File

	if err := c.BindJSON(&fileName); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	photoUrl := "https://pub-6cd56288498e4af5b3650c296ca21e82.r2.dev/" + fileName.FileName

	var url models.Url
	url.PresignedUrl = storage.PresignedUrl(fileName.FileName)
	url.PhotoUrl = photoUrl

	c.JSON(http.StatusOK, url)
	database.AllUserData()
}
