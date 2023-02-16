package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type User struct {
	ID        string               `json: "id"`
	Username  string               `json: "username"`
	Email     string               `json: "email"`
	HeadPhoto string               `json: "headPhoto"`
	Friend    []primitive.ObjectID `bson: "friend"`
}

type Url struct {
	PresignedUrl string `json: "presignedUrl"`
	PhotoUrl     string `json: "photoUrl"`
}

type UserData struct {
	ID        string        `json: "id"`
	Username  string        `json: "username"`
	Email     string        `json: "email"`
	HeadPhoto string        `json: "headPhoto"`
	Friend    []primitive.M `bson: "friend"`
}

type Search struct {
	SearchId string `json: "searchId"`
}
