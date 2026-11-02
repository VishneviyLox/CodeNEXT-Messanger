package models

// модель приёма инпутов пользователя при регистрации
type Register struct{
	NickName  string `json:"nickName"`
	Password  string `json:"password"`
	Avatar    string `json:"avatar"`
	FirstName string `json:"firstName"`
	SurName   string `json:"surName"`
	BirthDate      string    `json:"birthDate"`
}