package models

type Url struct {
	PresignedUrl string `json: "presignedUrl"`
	PhotoUrl     string `json: "photoUrl"`
}
