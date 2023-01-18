package route

import (
	"the-chat/application/controllers"

	"github.com/gin-gonic/gin"
)

func AddAuthRouter(r *gin.RouterGroup) {

	auth := r.Group("/auth")
	auth.GET("/user/:email", controllers.GetUserData)
	auth.POST("/", controllers.Register)
	auth.PUT("/", controllers.Login)
}
