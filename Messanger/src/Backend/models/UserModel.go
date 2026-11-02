package models

//Модель данных пользователя
type User struct {
	ID           int     `json:"id"`
	NickName     string  `json:"nickName"`
	PasswordHash string  `json:"password_hash"`
	Avatar       string  `json:"avatar"`
	FirstName    string  `json:"firstName"`
	SurName      string  `json:"surName"`
	BirthDate    string `json:"birthDate"`
	Register_at  string  `json:"register_at"`
	Status string `json:"status"`
}
