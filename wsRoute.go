package main

// import (
// 	"github.com/gin-gonic/gin"
// )

// func AddWsRouter(r *gin.RouterGroup) {
// 	wsRoute := r.Group("/ws")

// 	wsRoute.GET("/:roomId", func(c *gin.Context) {
// 		roomId := c.Param("roomId")
// 		ServeWs(c.Writer, c.Request, roomId)
// 	})
// }

// // func(c *gin.Context) {
// // 	roomId := c.Param("roomId")
// // 	ServeWs(c.Writer, c.Request, roomId)
// // }
