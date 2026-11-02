package services

import (
	config "Messanger/src/Backend/services/config"
	"fmt"
)

//Обработчик ошибки в консоль
func ConsoleError(err error){
	fmt.Println(config.Red + err.Error() + config.Reset)
}
