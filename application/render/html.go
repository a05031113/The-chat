package render

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	guuid "github.com/google/uuid"
)

func Index(c *gin.Context) {
	c.HTML(http.StatusOK, "index.html", nil)
}

func Chat(c *gin.Context) {
	c.HTML(http.StatusOK, "chat.html", nil)
}

func Room(c *gin.Context) {
	uuid := c.Param("uuid")
	if uuid == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "none"})
	}

	c.HTML(http.StatusOK, "room.html", nil)
}

func RoomCreate(c *gin.Context) {
	c.Redirect(http.StatusMovedPermanently, fmt.Sprintf("/room/%s", guuid.New().String()))
}
