package models

type Register struct {
	Name     string `json: "name"`
	Email    string `json: "email"`
	Password string `json: "password"`
}

type User struct {
	Name  string `json: "name"`
	Email string `json: "email"`
}

type Login struct {
	Email    string `json: "email"`
	Password string `json: "password"`
}
