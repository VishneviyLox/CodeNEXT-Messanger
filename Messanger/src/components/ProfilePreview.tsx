import { useLocation, useNavigate } from 'react-router-dom';
import './styles/Profile.css';

interface UserData {
    nickname: string;
    firstName: string;
    surname: string;
    avatar: string;
    birthDate: string;
}

export default function ProfilePreview() {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Если данные не переданы, используем заглушки
    const data = (location.state as UserData) || {
        firstName: 'Имя',
        surname: 'Фамилия',
        nickname: '@nickname',
        birthDate: '01.01.2000',
        avatar: 'https://via.placeholder.com/150'
    };

    return (
        <div className="preview-container">
            <div className="profile-card">
                <div className="profile-header">
                    <div className="avatar-wrapper">
                        <img 
                            src={data.avatar || 'https://via.placeholder.com/150'} 
                            alt="Аватар" 
                            className="profile-avatar" 
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150'; }} 
                        />
                    </div>
                    <div className="profile-info">
                        <h1>{data.firstName} {data.surname}</h1>
                        <p className="nickname">{data.nickname}</p>
                        <p className="birth-date">Дата рождения: {data.birthDate}</p>
                    </div>
                </div>

                <div className="profile-actions">
                    <button className="btn btn-back" onClick={() => navigate(-1)}>
                        ← Назад к редактированию
                    </button>
                    <button className="btn btn-confirm" onClick={() => navigate('/register-success')}>
                        Подтвердить и создать аккаунт
                    </button>
                </div>
            </div>
        </div>
    );
}