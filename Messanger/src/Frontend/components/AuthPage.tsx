//front
import { useState } from 'react'
import './styles/AuthPage.css'
import { useNavigate } from 'react-router-dom'

//back
import { registerUser, loginUser } from '../services/authService'
import { type RegisterData } from '../types/registerData'


export default function AuthPage(){

    const [isActive, setIsActive] = useState(false)
    const navigate = useNavigate()

    const [regData, setRegData] = useState<RegisterData>({
      nickname: '',
      firstName: '',
      surName: '',
      avatar: '',
      birthDate: '',
      password: '' });

    // Состояние для входа
    const [loginData, setLoginData] = useState({ nickname: '', password: '' });

    const handleRegister = async() => {
      try {
        await registerUser(regData);

        navigate('/profilePage')
      }
      catch (error){
        console.error(error)
      }
    } 

    const handleLogin = async () => {
      try {
        await loginUser(loginData.nickname, loginData.password);
        navigate('/profilePage'); // Перенаправляем на профиль после входа
      } catch (error) {
        console.error(error);
      }
    };

    //отображение фронта
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
      <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
        <h1>Создать аккаунт</h1>
        <input type="text" placeholder="Никнейм" value={regData.nickname} onChange={(e) => setRegData({... regData, nickname: e.target.value})}/>
        <input type="text" placeholder="Имя" value={regData.firstName} onChange={(e) => setRegData({... regData, firstName: e.target.value})}/>
        <input type="text" placeholder="Фамилия" value={regData.surName} onChange={(e) => setRegData({... regData, surName: e.target.value})}/>
        <input type="text" placeholder="Вставьте ссылку для фотографии профиля" value={regData.avatar} onChange={(e) => setRegData({... regData, avatar: e.target.value})}/>
        <input type="date" placeholder="Дата рождения" value={regData.birthDate} onChange={(e) => setRegData({... regData, birthDate: e.target.value})}/>
        <input type="password" placeholder="Пароль" value={regData.password} onChange={(e) => setRegData({... regData, password: e.target.value})}/>
        <button onClick={() => navigate('/auth/preview')}>Предпросмотр</button>
        <button type='button' onClick={handleRegister}>Зарегистрироваться</button>
      </form>
    </div>
    <div className="form-container sign-in">
      <form onSubmit={(e) => e.preventDefault()}>
        <h1>Войти</h1>
        <input type="text" placeholder="Никнейм" 
            value={loginData.nickname}
            onChange={(e) => setLoginData({...loginData, nickname: e.target.value})} />
        <input type="password" placeholder="Пароль" 
            value={loginData.password}
            onChange={(e) => setLoginData({...loginData, password: e.target.value})} />
          <button type='button' onClick={handleLogin}>Войти</button>
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
