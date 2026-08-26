package handlers

import (
	config "Messanger/src/Backend/config"
	db "Messanger/src/Backend/database"
	model "Messanger/src/Backend/models"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Получение списка всех пользователей
func GetUsers(c *gin.Context) {
	rows, err := db.DB.Query("SELECT id, nickname, password_hash, avatar_url, firstname, surname, age, register_at FROM users")
	if err != nil {
		fmt.Println(config.Red + err.Error() + config.Reset)
		c.JSON(http.StatusInternalServerError, gin.H{"ошибка:": err.Error()})
		return
	}
	defer rows.Close()

	users := []model.User{}

	for rows.Next() {
		u := model.User{}
		err := rows.Scan(&u.ID, &u.NickName, &u.Password, &u.Avatar, &u.FirstName, &u.SurName, &u.Age, &u.Register_at)

		if err != nil {
			fmt.Println(err)
		}
		users = append(users, u)
	}

	c.JSON(200, users)
}
