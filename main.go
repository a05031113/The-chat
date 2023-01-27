package main

import (
	"the-chat/application/controllers"
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

	api := router.Group("/api")
	api.POST("/auth", controllers.Register)
	api.PUT("/auth", controllers.Login)
	api.GET("/refresh", middleware.RequireRefresh, controllers.Refresh)
	api.DELETE("/logout", middleware.RequireRefresh, controllers.Logout)

	api.GET("/user/data", middleware.Require, controllers.GetUserData)
	api.GET("/user/presigned", middleware.Require, controllers.Presigned)

	api.GET("/chat/allUser", middleware.Require, controllers.AllUser)
	api.POST("/chat/addFriend", middleware.Require, controllers.AddFriend)
	api.GET("/chat/addData", middleware.Require, controllers.AddData)
	api.POST("/chat/checkAdded", middleware.Require, controllers.CheckAdded)

	var hub = ws.NewHub()
	go hub.Run()

	wsRoute := router.Group("/ws")
	wsRoute.GET("/:roomId", func(c *gin.Context) {
		roomId := c.Param("roomId")
		ws.ServeWs(c.Writer, c.Request, roomId)
	})

	router.Run("0.0.0.0:3000")
}
