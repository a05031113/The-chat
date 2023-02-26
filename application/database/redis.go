package database

import (
	"context"
	"encoding/json"
	"os"

	"github.com/redis/go-redis/v9"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var ctx = context.Background()

func RedisClient() *redis.Client {
	rdb := redis.NewClient(&redis.Options{
		Addr:     os.Getenv("Redis_Addr"),
		Password: "", // no password set
		DB:       0,  // use default DB
	})

	return rdb
}

var userCollection *mongo.Collection = OpenCollection(Client, "users")

func AllUserData() error {
	var ctx = context.Background()

	opts := options.Find().SetProjection(bson.D{{"username", 1}, {"headPhoto", 1}, {"subscription", 1}})
	cursor, err := userCollection.Find(ctx, bson.M{}, opts)
	if err != nil {
		return err
	}
	var results []bson.M
	if err = cursor.All(context.TODO(), &results); err != nil {
		return err
	}

	var output []primitive.M
	for _, result := range results {
		output = append(output, result)
	}

	jsonOutput, err := json.Marshal(output)
	if err != nil {
		return err
	}

	rdb := RedisClient()
	err2 := rdb.Set(ctx, "allUserData", jsonOutput, 0).Err()
	if err2 != nil {
		panic(err2)
	}
	return nil
}
