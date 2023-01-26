package models

import (
	"github.com/golang-jwt/jwt/v4"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Register struct {
	Username string `json: "username" validate:"required"`
	Email    string `json: "email" validate:"required"`
	Password string `json: "password" validate:"required"`
	Confirm  string `json: "confirm" validate:"required"`
}

type SignUp struct {
	Username string `json: "username"`
	Email    string `json: "email"`
	Password string `json: "password"`
}

type Login struct {
	Email    string `json: "email"`
	Password string `json: "password"`
}

type FoundUser struct {
	ID        primitive.ObjectID `bson:"_id" json: "id"`
	Username  string             `json: "username"`
	Email     string             `json: "email"`
	Password  string             `json: "password"`
	HeadPhoto string             `json:"headPhoto"`
}

type Claims struct {
	Email string `json:"email"`
	jwt.RegisteredClaims
}
