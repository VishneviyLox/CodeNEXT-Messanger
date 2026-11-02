package services

import (
	"golang.org/x/crypto/bcrypt"
)


// Проверка пароля
func CheckPassword(password string, hash string) error {
    return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
}