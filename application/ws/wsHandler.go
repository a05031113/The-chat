package ws

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
	maxMessageSize = 102400
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  102400,
	WriteBufferSize: 102400,
}

type connection struct {
	ws   *websocket.Conn
	send chan []byte
}

var h = Hub{
	broadcast:  make(chan message),
	register:   make(chan subscription),
	unregister: make(chan subscription),
	rooms:      make(map[string]map[*connection]bool),
}

func ServeWs(c *gin.Context) {
	roomId := c.Param("roomId")
	ws, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println(err.Error())
		return
	}
	conn := &connection{send: make(chan []byte, 256), ws: ws}
	subscript := subscription{conn, roomId}
	h.register <- subscript
	go subscript.writePump()
	go subscript.readPump()
}

func (s subscription) readPump() {
	connection := s.conn
	defer func() {
		h.unregister <- s
		connection.ws.Close()
	}()
	connection.ws.SetReadLimit(maxMessageSize)
	connection.ws.SetReadDeadline(time.Now().Add(pongWait))
	connection.ws.SetPongHandler(func(string) error {
		connection.ws.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})
	for {
		_, msg, err := connection.ws.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Panicf("error: %v", err)
			}
			break
		}
		m := message{msg, s.room}
		h.broadcast <- m
	}
}

func (s subscription) writePump() {
	connection := s.conn
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		connection.ws.Close()
	}()
	for {
		select {
		case message, ok := <-connection.send:
			if !ok {
				connection.write(websocket.CloseMessage, []byte{})
				return
			}
			if err := connection.write(websocket.TextMessage, message); err != nil {
				return
			}
		case <-ticker.C:
			if err := connection.write(websocket.PingMessage, []byte{}); err != nil {
				return
			}
		}
	}
}

func (c *connection) write(mt int, payload []byte) error {
	c.ws.SetWriteDeadline(time.Now().Add(writeWait))
	return c.ws.WriteMessage(mt, payload)
}
