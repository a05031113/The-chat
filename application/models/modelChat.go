package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type AddFriendData struct {
	ID string `json: "id"`
}

type InsertID struct {
	AddId   primitive.ObjectID `bson: "addId"`
	AddedId primitive.ObjectID `bson: "addedId`
}
