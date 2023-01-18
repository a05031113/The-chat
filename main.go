package main

import (
	"the-chat/application/route"

	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()
	api := router.Group("/api")
	route.AddAuthRouter(api)
	router.Run(":3000")
}
