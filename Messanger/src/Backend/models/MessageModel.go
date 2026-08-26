package models

type MessageModel struct {
	ID int `json:"id"`
	//nickname from
	//nickname for
	Message string `json:"message"`
	Date string `json:"date"` //доработать в бд скорее всего отличается
	Readed bool `json:"readed"` // Добавить новое поле в бд
}