package main

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestIndex(t *testing.T) {
	router := setupServer()

	response := httptest.NewRecorder()

	request, _ := http.NewRequest("GET", "/", nil)

	router.ServeHTTP(response, request)
	assert.Equal(t, http.StatusOK, response.Code)
}

func TestChat(t *testing.T) {
	router := setupServer()

	response := httptest.NewRecorder()

	request, _ := http.NewRequest("GET", "/chat", nil)

	router.ServeHTTP(response, request)
	assert.Equal(t, http.StatusOK, response.Code)
}

func TestRoom(t *testing.T) {
	router := setupServer()

	response := httptest.NewRecorder()

	request, _ := http.NewRequest("GET", "/room/:uuid", nil)

	router.ServeHTTP(response, request)
	assert.Equal(t, http.StatusOK, response.Code)
}

// func TestRegister(t *testing.T) {
// 	router := setupServer()

// 	response := httptest.NewRecorder()

// 	mock := models.SignUp{
// 		Username: "testUsername",
// 		Email:    "testEmail",
// 		Password: "testPass",
// 	}
// 	jsonValue, _ := json.Marshal(mock)
// 	request, _ := http.NewRequest("POST", "/api/auth", bytes.NewBuffer(jsonValue))

// 	router.ServeHTTP(response, request)
// 	assert.Equal(t, http.StatusOK, response.Code)
// }
