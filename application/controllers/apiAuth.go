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
	"go.mongodb.org/mongo-driver/mongo"
	"gopkg.in/mgo.v2/bson"
)

var userCollection *mongo.Collection = database.OpenCollection(database.Client, "users")
var validate = validator.New()

func GetUserData(c *gin.Context) {
	id, _ := c.Get("id")
	username, _ := c.Get("username")
	email, _ := c.Get("email")

	var user models.User
	user.ID = id.(string)
	user.Email = email.(string)
	user.Username = username.(string)
	c.JSON(http.StatusOK, user)
}

func Register(c *gin.Context) {
	var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
	var register models.Register

	if err := c.BindJSON(&register); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	err := validate.Struct(register)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	emailValid := helper.EmailValid(register.Email)
	if !emailValid {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Wrong email format"})
		return
	}

	passwordValid := helper.PasswordValid(register.Password)
	if !passwordValid {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Wrong password format"})
		return
	}

	confirmValid := helper.ConfirmValid(register.Password, register.Confirm)
	if !confirmValid {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Wrong password format"})
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

	hashPass, _ := helper.HashPassword(register.Password)
	var signUp models.SignUp
	signUp.Username = register.Username
	signUp.Email = register.Email
	signUp.Password = hashPass

	resultInsertNumber, insertErr := userCollection.InsertOne(ctx, signUp)
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
	var foundUser models.FoundUser

	if err := c.BindJSON(&login); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "check"})
		return
	}

	err := userCollection.FindOne(ctx, bson.M{"email": login.Email}).Decode(&foundUser)
	defer cancel()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "email or password is incorrect"})
		return
	}

	match := helper.CheckPasswordHash(login.Password, foundUser.Password)
	if !match {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email or password is incorrect"})
		return
	}

	helper.GenerateJWT(c, foundUser.ID.Hex(), foundUser.Username, foundUser.Email)

	c.JSON(http.StatusOK, gin.H{"headPhoto": foundUser.HeadPhoto})
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
}
