package services

import (
	"golang.org/x/crypto/bcrypt"
)

//Хеширование пароля пользователя
func HashPassword(password string)([]byte, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	return hash, nil
}

