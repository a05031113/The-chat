package helper

import (
	"net/http"
	"os"
	"time"

	"github.com/dlclark/regexp2"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"
)

func EmailValid(email string) bool {
	emailRegex := regexp2.MustCompile(`^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$`, 0)
	isMatch, _ := emailRegex.MatchString(email)
	return isMatch
}

func PasswordValid(password string) bool {
	passwordRegex := regexp2.MustCompile(`^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$`, 0)
	isMatch, _ := passwordRegex.MatchString(password)
	return isMatch
}

func ConfirmValid(password string, confirm string) bool {
	if password == confirm {
		return true
	} else {
		return false
	}
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func GenerateJWT(c *gin.Context, id string, username string, email string) bool {

	var jwtKey = []byte(os.Getenv("SECRET_KEY"))
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":       id,
		"username": username,
		"email":    email,
		"exp":      time.Now().Add(time.Hour * 1).Unix(),
	})
	accessTokenString, err := accessToken.SignedString(jwtKey)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return false
	}
	AccessExpirationTime := time.Now().Add(1 * time.Minute)
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "accessToken",
		Value:    accessTokenString,
		Expires:  AccessExpirationTime,
		HttpOnly: true,
	})

	refreshExpireTime := time.Now().Add(24 * 7 * time.Hour)
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":       id,
		"username": username,
		"email":    email,
		"exp":      time.Now().Add(time.Hour * 7 * 24).Unix(),
	})
	refreshTokenString, err := refreshToken.SignedString(jwtKey)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return false
	}

	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "refreshToken",
		Value:    refreshTokenString,
		Expires:  refreshExpireTime,
		HttpOnly: true,
	})

	return true
}

func SetAccessToken(c *gin.Context, id string, username string, email string) {
	var jwtKey = []byte(os.Getenv("SECRET_KEY"))
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":       id,
		"username": username,
		"email":    email,
		"exp":      time.Now().Add(time.Minute * 10).Unix(),
	})
	accessTokenString, err := accessToken.SignedString(jwtKey)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	AccessExpirationTime := time.Now().Add(1 * time.Hour)
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "accessToken",
		Value:    accessTokenString,
		Expires:  AccessExpirationTime,
		HttpOnly: true,
	})
	c.JSON(http.StatusOK, gin.H{"refresh": "success"})
}
