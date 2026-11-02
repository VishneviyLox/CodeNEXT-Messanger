package handlers

import (
	"strings"
	db "Messanger/src/Backend/database"
	model "Messanger/src/Backend/models"
	service "Messanger/src/Backend/services"
	"net/http"
	"strconv"
	"github.com/gin-gonic/gin"
)

// Получение списка всех пользователей
func GetUsers(c *gin.Context) {

	users, err := db.GetAllUsers()

	if err != nil {
		service.ConsoleError(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	}

	c.JSON(200, users)
}

// Регистрация нового пользователя
func Register(c *gin.Context) {

	var input model.Register

	if err := c.ShouldBindJSON(&input); err != nil {
		service.ConsoleError(err)
		c.JSON(400, gin.H{"error": "неверный формат данных"})
		return
	}

	var exists bool

	err := db.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE nickname = $1)", input.NickName).Scan(&exists)
	if err != nil {
		service.ConsoleError(err)
		c.JSON(500, gin.H{"error": "ошибка базы данных"})
		return
	}
	if exists {
		c.JSON(409, gin.H{"error": "никнейм уже занят"})
		return
	}

	// Хешируем пароль
	hash, err := service.HashPassword(input.Password)
	if err != nil {
		service.ConsoleError(err)
		c.JSON(500, gin.H{"error": "не удалось захешировать пароль"})
		return
	}

	newID, err := db.InsertUser(model.User{
		NickName:     input.NickName,
		PasswordHash: string(hash),
		Avatar:       input.Avatar,
		FirstName:    input.FirstName,
		SurName:      input.SurName,
		BirthDate:    input.BirthDate,
	})

	if err != nil {
		service.ConsoleError(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "не удалось сохранить пользователя"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "пользователь создан", "id": newID})
}

// Функция авторизации пользователя
func LogIn(c *gin.Context) {
	var input model.Register

	if err := c.ShouldBindJSON(&input); err != nil {
		service.ConsoleError(err)
		c.JSON(400, gin.H{"error": "неверный формат данных"})
		return
	}

	var userID int
	var passwordHash string

	err := db.DB.QueryRow("SELECT id, password_hash FROM users WHERE nickname = $1", input.NickName).Scan(&userID, &passwordHash)
	if err != nil {
		service.ConsoleError(err)
		c.JSON(401, gin.H{"error": "Неверный логин "})
		return
	}

	err = service.CheckPassword(input.Password, passwordHash)
	if err != nil {
		c.JSON(401, gin.H{"error": "Неверный пароль"})
		return
	}

	token, err := service.GenerateToken(userID, input.NickName)

	if err != nil {
    	c.JSON(500, gin.H{"error": "ошибка генерации токена"})
    	return
	}

	c.JSON(200, gin.H{
    "token": token,
    "user": gin.H{
        "id":       userID,
        "nickname": input.NickName,
    },
})

}

//Функция получения профиля
func GetProfile(c *gin.Context){

	authHeader := c.GetHeader("Authorization")

	if authHeader == ""{
		c.JSON(401,gin.H{"error": "Вы потеряли где-то токен. Ищите..."})
		return
	}

	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	claims,err := service.ValidateToken(tokenString)

	if err != nil {
        c.JSON(401, gin.H{"error": "невалидный токен"})
        return
    }

	userID := int(claims["user_id"].(float64))

	var user model.User

	err = db.DB.QueryRow(
        "SELECT id, nickname, firstname, surname, avatar_url, birthdate, status FROM users WHERE id = $1",
        userID,
    ).Scan(&user.ID, &user.NickName, &user.FirstName, &user.SurName, &user.Avatar, &user.BirthDate, &user.Status)
    
	if err != nil {
        service.ConsoleError(err)
        c.JSON(500, gin.H{"error": "ошибка базы данных"})
        return
    }

    c.JSON(200, gin.H{"user": user})
}

//Функция обновления данных о юзере
func UpdateProfile(c *gin.Context){
	authHeader := c.GetHeader("Authorization")
	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	claims,err := service.ValidateToken(tokenString)
	if err != nil {
        c.JSON(401, gin.H{"error": "невалидный токен"})
        return
    }

	userID := int(claims["user_id"].(float64))

	var input model.User
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(400, gin.H{"error": "неверный формат данных"})
        return
    }

	_, err = db.DB.Exec(
    "UPDATE users SET nickname = $1, firstname = $2, surname = $3, avatar_url = $4, birthdate = $5, status = $6 WHERE id = $7", input.NickName,
    input.FirstName, input.SurName, input.Avatar, input.BirthDate, input.Status, userID,)
	
	 if err != nil {
        service.ConsoleError(err)
        c.JSON(500, gin.H{"error": "ошибка обновления"})
        return
    }

	var updatedUser model.User
    err = db.DB.QueryRow(
        "SELECT id, nickname, firstname, surname, avatar_url, birthdate, status FROM users WHERE id = $1",
        userID,
    ).Scan(&updatedUser.ID, &updatedUser.NickName, &updatedUser.FirstName, &updatedUser.SurName, &updatedUser.Avatar, &updatedUser.BirthDate, &updatedUser.Status)

    if err != nil {
        service.ConsoleError(err)
        c.JSON(500, gin.H{"error": "ошибка получения обновленных данных"})
        return
    }

    c.JSON(200, gin.H{"user": updatedUser})
}

//Получение сообщений
func GetMessages(c *gin.Context) {
    // 1. Получаем user_id из токена
    authHeader := c.GetHeader("Authorization")
    if authHeader == "" {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "нет токена"})
        return
    }

    tokenString := strings.TrimPrefix(authHeader, "Bearer ")
    claims, err := service.ValidateToken(tokenString)
    if err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "невалидный токен"})
        return
    }

    userIDFloat, ok := claims["user_id"].(float64)
    if !ok {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ошибка получения ID"})
        return
    }
    userID := int(userIDFloat)

    // 2. Получаем partner_id из query-параметров
    partnerIDStr := c.Query("partner_id")
    if partnerIDStr == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "не указан partner_id"})
        return
    }

    partnerID, err := strconv.Atoi(partnerIDStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "неверный формат partner_id"})
        return
    }

    // 3. Загружаем сообщения
    messages, err := db.GetMessages(userID, partnerID)
    if err != nil {
        service.ConsoleError(err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ошибка загрузки сообщений"})
        return
    }

    c.JSON(http.StatusOK, messages)
}

// Отправка сообщений
func SendMessage(c *gin.Context) {
    // 1. Получаем user_id из токена
    authHeader := c.GetHeader("Authorization")
    if authHeader == "" {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "нет токена"})
        return
    }

    tokenString := strings.TrimPrefix(authHeader, "Bearer ")
    claims, err := service.ValidateToken(tokenString)
    if err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "невалидный токен"})
        return
    }

    userIDFloat, ok := claims["user_id"].(float64)
    if !ok {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ошибка получения ID"})
        return
    }
    fromUserID := int(userIDFloat)

    // 2. Парсим тело запроса
    var input struct {
        ToUserID int    `json:"to_user_id"`
        Text     string `json:"message"`
    }

    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "неверный формат данных"})
        return
    }

    if input.ToUserID == 0 || input.Text == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "укажите получателя и текст"})
        return
    }

    // 3. Сохраняем сообщение в БД
    err = db.SendMessage(fromUserID, input.ToUserID, input.Text)
    if err != nil {
        service.ConsoleError(err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ошибка отправки"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

// HandleGetChatList - это настоящий хендлер для Gin
func HandleGetChatList(c *gin.Context) {
    // 1. Получаем user_id из токена (как ты делал раньше)
    authHeader := c.GetHeader("Authorization")
    if authHeader == "" {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "нет токена"})
        return
    }

    tokenString := strings.TrimPrefix(authHeader, "Bearer ")
    claims, err := service.ValidateToken(tokenString)
    if err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "невалидный токен"})
        return
    }

    userIDFloat, ok := claims["user_id"].(float64)
    if !ok {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ошибка получения ID"})
        return
    }
    userID := int(userIDFloat)

    // 2. Вызываем твою функцию БД с правильным аргументом
    chats, err := db.GetChatList(userID)
    if err != nil {
        service.ConsoleError(err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ошибка получения списка чатов"})
        return
    }

    c.JSON(http.StatusOK, chats)
}

//Поиск пользователя 
func SearchUsers(c *gin.Context) {
    search := c.Query("search")
    if search == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "укажите поисковый запрос"})
        return
    }

    // ILIKE делает регистронезависимый поиск по содержимому
    rows, err := db.DB.Query(
        "SELECT id, nickname, firstname, surname, avatar_url FROM users WHERE nickname ILIKE $1 LIMIT 20",
        "%"+search+"%",
    )
    if err != nil {
        service.ConsoleError(err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ошибка поиска"})
        return
    }
    defer rows.Close()

    var users []model.User
    for rows.Next() {
        var u model.User
        err := rows.Scan(&u.ID, &u.NickName, &u.FirstName, &u.SurName, &u.Avatar)
        if err != nil {
            continue
        }
        users = append(users, u)
    }

    c.JSON(http.StatusOK, users)
}

//Создание нового чата с пользователями 
func GetOrCreateChat(c *gin.Context){
	authHeader := c.GetHeader("Authorization")
	if authHeader == ""{
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Тюти токена брат"})
		return
	}

	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	claims, err := service.ValidateToken(tokenString)
	if err != nil{
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Невалидный токен брат"})
		return
	}

	userIDFloat, ok := claims["user_id"].(float64)
	if !ok{
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка получения токена брат"})
		return
	}

	currentUserID := int(userIDFloat)

	partnerIDStr := c.Query("partner_id")

	partnerID, err := strconv.Atoi(partnerIDStr)

	if err != nil || partnerID == currentUserID {
		c.JSON(http.StatusBadRequest, gin.H {"error": "Некорректный ID собеседника брат"})
		return
	}

	var chatExists bool

	err = db.DB.QueryRow(`
	SELECT EXISTS(SELECT 1 FROM messages WHERE
	(from_user_id = $1 AND to_user_id = $2) OR
	(from_user_id = $2 AND to_user_id = $1)
	LIMIT 1)
	`, currentUserID, partnerID).Scan(&chatExists)

	if err != nil {
		service.ConsoleError(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка проверки чата брат"})
		return
	}

	var partner model.User
	err = db.DB.QueryRow(
		"SELECT id, nickname, firstname, surname, avatar_url FROM users WHERE id = $1", partnerID,
	).Scan(&partner.ID, &partner.NickName, &partner.FirstName, &partner.SurName, &partner.Avatar)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Пользователь не найден брат"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"partner_id": partner.ID,
		"nickname": partner.NickName,
		"first_name": partner.FirstName,
		"sur_name": partner.SurName,
		"avatar": partner.Avatar,
		"is_new_chat": !chatExists,
	})
}


