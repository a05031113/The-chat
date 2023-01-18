package route

import (
	"the-chat/application/controllers"
	"the-chat/application/render"

	"github.com/gin-gonic/gin"
)

func AddHtmlRouter(r *gin.RouterGroup) {
	html := r.Group("/")
	html.GET("", render.Index)
	html.GET("/chat", render.Chat)
}

func AddAuthRouter(r *gin.RouterGroup) {
	auth := r.Group("/auth")
	auth.GET("/user/:email", controllers.GetUserData)
	auth.POST("/", controllers.Register)
	auth.PUT("/", controllers.Login)
	auth.GET("/refresh", controllers.Refresh)
}
