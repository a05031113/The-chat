package route

import (
	"the-chat/application/controllers"
	"the-chat/application/middleware"
	"the-chat/application/render"

	"github.com/gin-gonic/gin"
)

func AddHtmlRouter(r *gin.RouterGroup) {
	html := r.Group("/")
	html.GET("", render.Index)
	html.GET("/chat", render.Chat)
}

func AddApiRouter(r *gin.RouterGroup) {
	api := r.Group("/")
	api.GET("/auth/user", middleware.Require, controllers.GetUserData)
	api.POST("/auth", controllers.Register)
	api.PUT("/auth", controllers.Login)
	api.GET("/refresh", middleware.RequireRefresh, controllers.Refresh)
	api.DELETE("/logout", middleware.RequireRefresh, controllers.Logout)

	api.GET("/user/presigned", middleware.Require, controllers.Presigned)
}
