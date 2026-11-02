package main

import (
	dataBase "Messanger/src/Backend/database"
	handlers "Messanger/src/Backend/handlers"
	"github.com/joho/godotenv"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	
	godotenv.Load()
	dataBase.ConnectDB()

	server := gin.Default()

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:5173"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Content-Type", "Authorization"}

	server.Use(cors.New(config))

	server.GET("api/allUsers", handlers.GetUsers)
	server.GET("api/profile/me", handlers.GetProfile)
	server.GET("/api/chats", handlers.HandleGetChatList)
	server.GET("/api/messages", handlers.GetMessages)
	server.GET("/api/users", handlers.SearchUsers)
	server.GET("/api/chats/start", handlers.GetOrCreateChat)

	server.POST("api/register", handlers.Register)
	server.POST("api/login", handlers.LogIn)
	server.POST("/api/messages", handlers.SendMessage)

	server.PUT("api/profile/me", handlers.UpdateProfile)

	server.Run(":8080")
}
