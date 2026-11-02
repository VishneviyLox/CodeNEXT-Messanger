package models

import "time"

type Message struct {
    ID          int       `json:"id"`
    FromUserID  int       `json:"from_user_id"`
    ToUserID    int       `json:"to_user_id"`
    Text        string    `json:"message"`
    CreatedAt   time.Time `json:"date"`
    IsRead      bool      `json:"readed"`
}

// Для создания нового сообщения (без ID и даты)
type CreateMessage struct {
    FromUserID int    `json:"from_user_id"`
    ToUserID   int    `json:"to_user_id"`
    Text       string `json:"message"`
}