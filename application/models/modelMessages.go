package models

type SendMessage struct {
	RoomID   string `json: "roomId"`
	Content  string `json: "content"`
	SendTime string `json: "sendTime"`
	Type     string `json: "type"`
}

type Room struct {
	RoomID string `json: "roomId"`
}

type File struct {
	FileName string `json: "fileName"`
}
