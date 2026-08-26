import { useState } from 'react'
import './styles/AuthPage.css'
import { useNavigate } from 'react-router-dom'


export default function AuthPage(){

    const [isActive, setIsActive] = useState(false)
    const navigate = useNavigate()

    return(
        <>
  <meta charSet="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
  />
  <link rel="stylesheet" href="AuthPage.css" />
  <title>Добро пожаловать!</title>
  <div className={`container ${isActive ? 'active' : ''}`} id="container">
    <div className="form-container sign-up">
      <form>
        <h1>Создать аккаунт</h1>
        <input type="text" placeholder="Имя пользователя" />
        <input type="text" placeholder="Имя" />
        <input type="text" placeholder="Фамилия" />
        <input type="text" placeholder="Вставьте ссылку для фотографии профиля" />
        <input type="date" placeholder="Дата рождения" />
        <input type="password" placeholder="Пароль" />
        <button onClick={() => navigate('/auth/preview')}>Предпросмотр</button>
        <button>Зарегистрироваться</button>
      </form>
    </div>
    <div className="form-container sign-in">
      <form>
        <h1>Войти</h1>
        <input type="login" placeholder="Имя пользователя" />
        <input type="password" placeholder="Пароль" />
        <a href="#" className='forgot-link'>Забыли пароль?</a>
        <button>Войти</button>
      </form>
    </div>
    <div className="toggle-container">
      <div className="toggle">
        <div className="toggle-panel toggle-left">
          <h1 className='title'>Добро пожаловать!</h1>
          <p>Уже есть аккаунт?
             <br />Тогда входи, чего тут делать :D
          </p>
          <button className="hidden" id="login" onClick={() => setIsActive(false)}>
            Войти
          </button>
        </div>
        <div className="toggle-panel toggle-right">
          <h1 className='title'>Привет, Друг!</h1>
          <p>Впервые здесь?<br />
           Создай аккаунт, это не трудно :D</p>
          <button className="hidden" id="register" onClick={() => setIsActive(true)}>
            Создать
          </button>
        </div>
      </div>
    </div>
  </div>
</>

    )
}
