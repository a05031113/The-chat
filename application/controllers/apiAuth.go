package controllers

import (
	"context"
	"log"
	"net/http"
	"the-chat/application/database"
	"the-chat/application/helper"
	"the-chat/application/models"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var userCollection *mongo.Collection = database.OpenCollection(database.Client, "users")
var validate = validator.New()

func Register(c *gin.Context) {
	var ctx = context.Background()
	var register models.Register

	if err := c.BindJSON(&register); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	err := validate.Struct(register)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	emailValid := helper.EmailValid(register.Email)
	if !emailValid {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Wrong email format"})
		return
	}

	passwordValid := helper.PasswordValid(register.Password)
	if !passwordValid {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Wrong password format"})
		return
	}

	confirmValid := helper.ConfirmValid(register.Password, register.Confirm)
	if !confirmValid {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Passwords are different"})
		return
	}

	count, err := userCollection.CountDocuments(ctx, bson.M{"email": register.Email})
	if err != nil {
		log.Panic(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error while checking email"})
		return
	}
	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Account already exist"})
		return
	}

	countUsername, err := userCollection.CountDocuments(ctx, bson.M{"username": register.Username})
	if err != nil {
		log.Panic(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error while checking email"})
		return
	}
	if countUsername > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username already been used"})
		return
	}

	IDs := []string{
		"63ef1bc69eb0f2e1b9625c71",
		"63e8f050aa2a9e7e77bfdeba",
		"63e8f0aeaa2a9e7e77bfdebb",
	}

	var objectIDs []primitive.ObjectID

	for i := 0; i < len(IDs); i++ {
		primitiveId, _ := primitive.ObjectIDFromHex(IDs[i])
		objectIDs = append(objectIDs, primitiveId)
	}

	hashPass, _ := helper.HashPassword(register.Password)
	var signUp models.SignUp
	signUp.Username = register.Username
	signUp.Email = register.Email
	signUp.Password = hashPass
	signUp.Friend = objectIDs

	Id, insertErr := userCollection.InsertOne(ctx, signUp)
	if insertErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error while insert data"})
		return
	}

	for i := 0; i < len(IDs); i++ {
		primitiveId, _ := primitive.ObjectIDFromHex(IDs[i])
		userUpdate := bson.M{"$push": bson.M{"friend": Id.InsertedID}}
		_, err := userCollection.UpdateOne(ctx, bson.M{"_id": primitiveId}, userUpdate)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"register": "success"})
	database.AllUserData()
}

func Login(c *gin.Context) {
	var ctx = context.Background()
	var login models.Login
	var foundUser models.FoundUser

	if err := c.BindJSON(&login); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	err := userCollection.FindOne(ctx, bson.M{"email": login.Email}).Decode(&foundUser)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email or password is incorrect"})
		return
	}

	match := helper.CheckPasswordHash(login.Password, foundUser.Password)
	if !match {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email or password is incorrect"})
		return
	}

	JWTStatus := helper.GenerateJWT(c, foundUser.ID.Hex(), foundUser.Username, foundUser.Email)
	if !JWTStatus {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	}

	c.JSON(http.StatusOK, gin.H{"login": "success"})
}

func Refresh(c *gin.Context) {
	id, _ := c.Get("id")
	username, _ := c.Get("username")
	email, _ := c.Get("email")
	helper.SetAccessToken(c, id.(string), username.(string), email.(string))
}

func Logout(c *gin.Context) {
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "accessToken",
		Value:    "",
		Expires:  time.Unix(0, 0),
		HttpOnly: true,
	})
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "refreshToken",
		Value:    "",
		Expires:  time.Unix(0, 0),
		HttpOnly: true,
	})
	c.JSON(http.StatusOK, gin.H{"logout": "success"})
}
