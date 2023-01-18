package controllers

import (
	"context"
	"log"
	"net/http"
	"the-chat/database"
	"the-chat/models"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
	"gopkg.in/mgo.v2/bson"
)

var userCollection *mongo.Collection = database.OpenCollection(database.Client, "users")

func GetUserData(c *gin.Context) {
	email := c.Param("email")
	var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
	var user models.User

	err := userCollection.FindOne(ctx, bson.M{"email": email}).Decode(&user)
	defer cancel()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, user)
}
func Register(c *gin.Context) {
	var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
	var register models.Register

	if err := c.BindJSON(&register); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	count, err := userCollection.CountDocuments(ctx, bson.M{"email": register.Email})
	defer cancel()
	if err != nil {
		log.Panic(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error while checking email"})
		return
	}

	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Account already exist"})
		return
	}

	hashPass, _ := HashPassword(register.Password)
	register.Password = hashPass

	resultInsertNumber, insertErr := userCollection.InsertOne(ctx, register)
	if insertErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error while insert data"})
		return
	}
	defer cancel()
	c.JSON(http.StatusOK, resultInsertNumber)
}
func Login(c *gin.Context) {
	var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
	var login models.Login
	var foundUser models.Login

	if err := c.BindJSON(&login); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	err := userCollection.FindOne(ctx, bson.M{"email": login.Email}).Decode(&foundUser)
	defer cancel()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "email or password is incorrect"})
		return
	}
	match := CheckPasswordHash(login.Password, foundUser.Password)
	if !match {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email or password is incorrect"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"login": true})
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
