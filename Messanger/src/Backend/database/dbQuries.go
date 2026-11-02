package database

import (
	"Messanger/src/Backend/models"
)

// InsertUser добавляет пользователя в таблицу users
func InsertUser(user models.User) (int, error) {
	var newID int

	err := DB.QueryRow(`
		INSERT INTO users (nickname, password_hash, avatar_url, firstname, surname, birthdate, register_at)
		VALUES ($1, $2, $3, $4, $5, $6, now())
		RETURNING id`,
		user.NickName, user.PasswordHash, user.Avatar,
		user.FirstName, user.SurName, user.BirthDate,
	).Scan(&newID)

	if err != nil {
		return 0, err
	}

	return newID, nil
}

// GetAllUsers получает список всех пользователей

func GetAllUsers() ([]models.User, error) {
	rows, err := DB.Query("SELECT id, nickname, password_hash, avatar_url, firstname, surname, birthdate, register_at FROM users")

	//Ошибка во время запроса
	if err != nil {
		return nil, err
	}

	defer rows.Close() // Закрываем поток

	users := []models.User{}

	for rows.Next() {
		u := models.User{}
		err := rows.Scan(&u.ID, &u.NickName, &u.PasswordHash, &u.Avatar, &u.FirstName, &u.SurName, &u.BirthDate, &u.Register_at)
		if err != nil {
			return nil, err // Ошибка сканирования
		}
		users = append(users, u)
	}

	return users, nil
}

const GetChatListSQL = `
    SELECT 
        partner_id,
        u.nickname,
        u.firstname,   
        u.surname,    
        u.avatar_url AS avatar,
        lm.last_message,
        lm.time
    FROM (
        SELECT DISTINCT ON (partner_id)
            CASE WHEN from_user_id = $1 THEN to_user_id ELSE from_user_id END AS partner_id,
            text AS last_message,
            created_at AS time
        FROM messages
        WHERE from_user_id = $1 OR to_user_id = $1
        ORDER BY partner_id, created_at DESC
    ) AS lm
    JOIN users u ON u.id = lm.partner_id
    ORDER BY lm.time DESC;
`

const SendMessageSQL = `
    INSERT INTO messages (from_user_id, to_user_id, text, created_at, is_read)
    VALUES ($1, $2, $3, NOW(), false)
`

const GetMessagesSQL = `
    SELECT id, from_user_id, to_user_id, text, created_at, is_read
    FROM messages
    WHERE (from_user_id = $1 AND to_user_id = $2) 
       OR (from_user_id = $2 AND to_user_id = $1)
    ORDER BY created_at ASC
`
