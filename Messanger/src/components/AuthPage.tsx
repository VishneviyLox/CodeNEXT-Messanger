import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/AuthPage.css';

// Описываем тип данных пользователя
interface UserData {
    nickname: string;
    firstName: string;
    surname: string;
    avatar: string;
    birthDate: string;
    password: string;
}

export default function AuthPage() {
    const [isActive, setIsActive] = useState(false);
    const navigate = useNavigate();

    // Состояние для хранения данных формы
    const [formData, setFormData] = useState<UserData>({
        nickname: '',
        firstName: '',
        surname: '',
        avatar: '',
        birthDate: '',
        password: ''
    });

    // Обновляем состояние при вводе
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Переход на предпросмотр с передачей данных
    const handlePreview = (e: React.FormEvent) => {
        e.preventDefault(); // Чтобы форма не перезагружала страницу
        navigate('/auth/preview', { state: formData });
    };

    return (
        <>
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" />
            <title>Добро пожаловать!</title>
            
            <div className={`container ${isActive ? 'active' : ''}`} id="container">
                <div className="form-container sign-up">
                    <form onSubmit={handlePreview}>
                        <h1>Создать аккаунт</h1>
                        <input type="text" name="nickname" placeholder="Никнейм" value={formData.nickname} onChange={handleChange} required />
                        <input type="text" name="firstName" placeholder="Имя" value={formData.firstName} onChange={handleChange} required />
                        <input type="text" name="surname" placeholder="Фамилия" value={formData.surname} onChange={handleChange} required />
                        <input type="text" name="avatar" placeholder="Ссылка на фото профиля" value={formData.avatar} onChange={handleChange} />
                        <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} required />
                        <input type="password" name="password" placeholder="Пароль" value={formData.password} onChange={handleChange} required />
                        
                        <button type="submit">Предпросмотр</button>
                        <button type="button">Зарегистрироваться</button>
                    </form>
                </div>
                
                <div className="form-container sign-in">
                    <form>
                        <h1>Войти</h1>
                        <input type="text" placeholder="Никнейм" />
                        <input type="password" placeholder="Пароль" />
                        <a href="#" className='forgot-link'>Забыли пароль?</a>
                        <button>Войти</button>
                    </form>
                </div>
                <div className="toggle-container">
                    <div className="toggle">
                        <div className="toggle-panel toggle-left">
                            <h1 className='title'>Добро пожаловать!</h1>
                            <p>Уже есть аккаунт?<br />Тогда входи, чего тут делать :D</p>
                            <button className="hidden" id="login" onClick={() => setIsActive(false)}>Войти</button>
                        </div>
                        <div className="toggle-panel toggle-right">
                            <h1 className='title'>Привет, Друг!</h1>
                            <p>Впервые здесь?<br />Создай аккаунт, это не трудно :D</p>
                            <button className="hidden" id="register" onClick={() => setIsActive(true)}>Создать</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}