package database

import (
	config "Messanger/Backend/config"
	"database/sql"
	_ "github.com/lib/pq"
)

var DB * sql.DB

// Подключение к базе данных
func ConnectDB(){
	var err error
	ConnStr := "user=postgres password=Shadow876warrior dbname=CodeNEXTMessanger sslmode=disable"
	DB,err = sql.Open("postgres", ConnStr)

	if err != nil{
		panic(config.Red + err.Error() + config.Reset)
		return
	}
	 
}