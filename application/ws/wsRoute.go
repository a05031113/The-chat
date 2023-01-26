package ws

import (
	"github.com/gin-gonic/gin"
)

func AddWsRouter(r *gin.RouterGroup, wsHandler *Handler) {
	wsRoute := r.Group("/ws")

	wsRoute.GET("/:roomId", wsHandler.ServeWs)
}

// func(c *gin.Context) {
// 	roomId := c.Param("roomId")
// 	ServeWs(c.Writer, c.Request, roomId)
// }
