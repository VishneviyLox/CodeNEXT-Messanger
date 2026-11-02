package database

import (
	config "Messanger/src/Backend/services/config"
	"database/sql"
	_ "github.com/lib/pq"
	model "Messanger/src/Backend/models"
)

var DB * sql.DB

// Подключение к базе данных
func ConnectDB(){
	var err error
	ConnStr := "user=postgres password=Shadow876warrior dbname=CodeNEXTMessanger sslmode=disable"
	DB,err = sql.Open("postgres", ConnStr)

	if err != nil{
		panic(config.Red + err.Error() + config.Reset)
	}
	 
}

func GetChatList(userID int) ([]model.ChatPreview, error) {
    rows, err := DB.Query(GetChatListSQL, userID)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var chats []model.ChatPreview
    
    for rows.Next() {
        var chat model.ChatPreview
        
        // ИСПРАВЛЕНО: Теперь сканируем ровно 7 аргументов
        err := rows.Scan(
            &chat.PartnerID,      // 1. partner_id
            &chat.Nickname,       // 2. nickname
            &chat.FirstName,      // 3. first_name (НОВОЕ)
            &chat.SurName,        // 4. sur_name (НОВОЕ)
            &chat.Avatar,         // 5. avatar
            &chat.LastMessage,    // 6. last_message
            &chat.Time,           // 7. time
        )
        if err != nil {
            return nil, err
        }
        
        chats = append(chats, chat)
    }

    if err = rows.Err(); err != nil {
        return nil, err
    }

    return chats, nil
}

//Функция отправки сообщения
func SendMessage(fromUserID, toUserID int, text string) error{
	_,err := DB.Exec(SendMessageSQL, fromUserID, toUserID, text)
	
	return  err
}

func GetMessage (userID, partnerID int) ([]model.Message, error){
	rows, err := DB.Query(GetMessagesSQL, userID, partnerID)
	if err != nil{
		return nil,err
	}
	defer rows.Close()

	var messages []model.Message
	for rows.Next(){
		var msg model.Message
		err := rows.Scan(&msg.ID, &msg.FromUserID, &msg.ToUserID, &msg.Text, &msg.CreatedAt, &msg.IsRead)

		if err != nil {
            return nil, err
        }

		messages = append(messages, msg)
	}

	return messages, nil
}

// GetMessages возвращает историю переписки между двумя пользователями
func GetMessages(userID, partnerID int) ([]model.Message, error) {
    rows, err := DB.Query(GetMessagesSQL, userID, partnerID) // Используем константу SQL из dbQueries.go
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var messages []model.Message
    for rows.Next() {
        var msg model.Message
        // Убедись, что порядок полей совпадает с SELECT в SQL-запросе
        err := rows.Scan(
            &msg.ID, 
            &msg.FromUserID, 
            &msg.ToUserID, 
            &msg.Text, 
            &msg.CreatedAt, 
            &msg.IsRead,
        )
        if err != nil {
            return nil, err
        }
        messages = append(messages, msg)
    }

    return messages, nil
}