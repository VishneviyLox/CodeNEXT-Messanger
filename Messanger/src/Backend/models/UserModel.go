package models

//Модель данных пользователя
type User struct {
	ID        int    `json:"id"`
	NickName  string `json:"nickname"`
	Password  string `json:"password"`
	Avatar    string `json:"avatar"`
	FirstName string `json:"firstname"`
	SurName   string `json:"surname"`
	Age       int    `json:"age"`
	Register_at string `json:"register_at"`
}