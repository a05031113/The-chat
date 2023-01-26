package route

import (
	"the-chat/application/controllers"
	"the-chat/application/middleware"
	"the-chat/application/render"
	"the-chat/application/webSocket"

	"github.com/gin-gonic/gin"
)

func AddHtmlRouter(r *gin.RouterGroup) {
	html := r.Group("/")
	html.GET("", render.Index)
	html.GET("/chat", render.Chat)
}

func AddApiRouter(r *gin.RouterGroup) {
	api := r.Group("/")
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
}

func AddWsRouter(r *gin.RouterGroup) {
	ws := r.Group("/ws")
	ws.GET("/", webSocket.ServeWs)

}
