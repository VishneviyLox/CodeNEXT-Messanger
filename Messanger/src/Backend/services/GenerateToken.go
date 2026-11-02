package services

import (
    "time"
    "github.com/golang-jwt/jwt/v5"
	"os"
)

var jwtSecret = []byte(os.Getenv("JWT_SECRET"))

func GenerateToken(userID int, nickname string) (string, error) {
    claims := jwt.MapClaims{
        "user_id":  userID,
        "nickname": nickname,
        "exp":      time.Now().Add(time.Hour * 24).Unix(), // токен живёт 24 часа
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(jwtSecret)
}