package main

import (
	"the-chat/application/route"

	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()
	router.LoadHTMLGlob("templates/*")
	router.Static("/static", "./frontend")

	html := router.Group("/")
	route.AddHtmlRouter(html)

	api := router.Group("/api")
	route.AddApiRouter(api)

	router.Run(":3000")
}
