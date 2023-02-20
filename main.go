package main

import (
	"the-chat/application/controllers"
	"the-chat/application/database"
	"the-chat/application/middleware"
	"the-chat/application/render"
	"the-chat/application/ws"

	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()
	router.LoadHTMLGlob("templates/*")
	router.Static("/static", "./frontend")

	html := router.Group("/")
	html.GET("", render.Index)
	html.GET("/chat", render.Chat)
	html.GET("/room/:uuid", render.Room)

	api := router.Group("/api")
	api.POST("/auth", controllers.Register)
	api.PUT("/auth", controllers.Login)
	api.GET("/refresh", middleware.RequireRefresh, controllers.Refresh)
	api.DELETE("/logout", middleware.RequireRefresh, controllers.Logout)

	api.GET("/user/data", middleware.Require, controllers.GetUserData)
	api.GET("/user/headPhoto", middleware.Require, controllers.GetHeadPhoto)
	api.GET("/user/allUser", middleware.Require, controllers.GetAllUser)
	api.POST("/user/search", middleware.Require, controllers.PostSearch)
	api.GET("/user/recommend", middleware.Require, controllers.GetRecommend)
	api.POST("/user/update/username", middleware.Require, controllers.PostUpdateUsername)
	api.POST("/user/update/password", middleware.Require, controllers.PostUpdatePassword)

	api.POST("/chat/add/friend", middleware.Require, controllers.AddFriend)
	api.GET("/chat/add/data", middleware.Require, controllers.AddData)
	api.POST("/chat/add/check", middleware.Require, controllers.CheckAdded)

	api.POST("/messages/send", middleware.Require, controllers.Send)
	api.POST("/messages/room", middleware.Require, controllers.Room)
	api.GET("/messages/room", middleware.Require, controllers.GetRoom)
	api.PATCH("/messages/resetUnRead", middleware.Require, controllers.ResetUnRead)
	api.POST("messages/file", middleware.Require, controllers.PostFile)

	var hub = ws.NewHub()
	go hub.Run()

	wsRoute := router.Group("/ws")
	wsRoute.GET("/:roomId", ws.ServeWs)

	router.Run("0.0.0.0:3000")
}

func init() {
	database.AllUserData()
	// database.LoginList()
}
