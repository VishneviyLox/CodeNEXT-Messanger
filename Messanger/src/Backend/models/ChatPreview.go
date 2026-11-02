package models

import "time"

type ChatPreview struct {
    PartnerID    int       `json:"partner_id"`
    Nickname     string    `json:"nickname"`
    FirstName    string    `json:"first_name"`  // <-- ДОБАВЬ
    SurName      string    `json:"sur_name"`    // <-- ДОБАВЬ
    Avatar       string    `json:"avatar"`
    LastMessage  string    `json:"last_message"`
    Time         time.Time `json:"time"`
    UnreadCount  int       `json:"unread"`
}