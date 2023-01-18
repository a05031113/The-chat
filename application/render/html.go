package render

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func Index(c *gin.Context) {
	c.HTML(http.StatusOK, "index.html", nil)
}

func Chat(c *gin.Context) {
	c.HTML(http.StatusOK, "chat.html", nil)
}
