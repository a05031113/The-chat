package notification

import (
	"encoding/json"
	"fmt"
	"os"

	webpush "github.com/SherClockHolmes/webpush-go"
)

const (
	vapidPublicKey = "BP4Gr911IgbUc0w07ByT9X0QfWnVdfwCl0PBXklAxsZBMAg5lDSxgQ6GCmWc8UC6b0bd-v7X83NHN1OsFXJLru0"
)

func Push(subscription string, message string) {
	// fmt.Println(subscription)
	// Decode subscription
	s := &webpush.Subscription{}
	json.Unmarshal([]byte(subscription), s)

	// Send Notification
	resp, err := webpush.SendNotification([]byte(message), s, &webpush.Options{
		Subscriber:      "example@example", // Do not include "mailto:"
		VAPIDPublicKey:  vapidPublicKey,
		VAPIDPrivateKey: os.Getenv("push"),
		TTL:             30,
	})
	if err != nil {
		fmt.Println(err.Error())
	}
	defer resp.Body.Close()
}
