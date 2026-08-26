package main

import (
	dataBase "Messanger/src/Backend/database"
	handlers "Messanger/src/Backend/handlers"

	"github.com/gin-gonic/gin"
)

func main(){
	
	dataBase.ConnectDB()

	server := gin.Default()

	server.GET("hello", handlers.GetUsers)

	server.Run(":8080")
}
