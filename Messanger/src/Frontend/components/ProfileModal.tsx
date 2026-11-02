import { useEffect, useState } from 'react';
import { Pencil, X } from 'lucide-react';
import { type ProfileModalProps, type UserData } from '../types/userData';
import './styles/ProfileModal.css';
import { updateProfile } from '../services/authService';

export default function ProfileModal({ 
    user, 
    onClose, 
    onCopyNick, 
    copied,
    onUpdateUser
}: ProfileModalProps & { onUpdateUser?: (data: UserData) => void }){
    
    const [isEditing, setIsEditing] = useState(false);
    
    const [editForm, setEditForm] = useState({
        firstName: user.firstName,
        surName: user.surName,
        status: user.status || '',
        nickName: user.nickName,
        birthDate: user.birthDate,
        avatar: user.avatar
    });

    useEffect(() => {
        setEditForm({
            firstName: user.firstName,
            surName: user.surName,
            status: user.status || '',
            nickName: user.nickName,
            birthDate: user.birthDate,
            avatar: user.avatar
        });
    }, [user]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isEditing) {
                setIsEditing(false);
                setEditForm({
                    firstName: user.firstName,
                    surName: user.surName,
                    status: user.status || '',
                    nickName: user.nickName,
                    birthDate: user.birthDate,
                    avatar: user.avatar
                });
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isEditing, user]);

    const getAgeAndDate = (dateString: string) => {
        if (!dateString) return '';
        const birthDate = new Date(dateString);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        
        const day = birthDate.getDate();
        const month = birthDate.toLocaleDateString('ru-RU', { month: 'short' });
        const year = birthDate.getFullYear();
        return `${day} ${month} ${year} (${age} лет)`;
    };

    const handleSave = async () => {
    try {
        await updateProfile(editForm);
        
        setIsEditing(false);
        
        
        if (onUpdateUser) {
            const newUser = { ...user, ...editForm };
            onUpdateUser(newUser);
        }
        
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        alert('Не удалось сохранить изменения');
    }
};

    const toggleEdit = () => {
        if (isEditing) {
            setEditForm({
                firstName: user.firstName,
                surName: user.surName,
                status: user.status || '',
                nickName: user.nickName,
                birthDate: user.birthDate,
                avatar: user.avatar
            });
        }
        setIsEditing(!isEditing);
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="profile-modal">
                
                <div className="modal-header-bg">
                    <div className="header-actions-right">
                        <button className="icon-btn edit-btn" title={isEditing ? "Отмена" : "Редактировать"} onClick={toggleEdit}>
                            {isEditing ? <X size={20} /> : <Pencil size={20} />}
                        </button>
                        <button className="icon-btn close-btn" onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="avatar-container">
                        <img src={editForm.avatar} alt="Avatar" className="big-avatar" />
                        <div className="online-status">
                            <span>был(а) сегодня в 12:40</span>
                        </div>
                    </div>
                </div>

                <div className="modal-info-list">
                    
                    {isEditing ? (
                        <div className="edit-form">
                            <div className="edit-row">
                                <label>Имя</label>
                                <input value={editForm.firstName} onChange={e => setEditForm({...editForm, firstName: e.target.value})} />
                            </div>
                            <div className="edit-row">
                                <label>Фамилия</label>
                                <input value={editForm.surName} onChange={e => setEditForm({...editForm, surName: e.target.value})} />
                            </div>
                            <div className="edit-row">
                                <label>О себе</label>
                                <textarea value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} rows={3} />
                            </div>
                            <div className="edit-row">
                                <label>Никнейм</label>
                                <input value={editForm.nickName} onChange={e => setEditForm({...editForm, nickName: e.target.value})} />
                            </div>
                            <div className="edit-row">
                                <label>Дата рождения</label>
                                <input type="date" value={editForm.birthDate} onChange={e => setEditForm({...editForm, birthDate: e.target.value})} />
                            </div>
                            <div className="edit-row">
                                <label>Ссылка на аватар</label>
                                <input value={editForm.avatar} onChange={e => setEditForm({...editForm, avatar: e.target.value})} />
                            </div>
                            
                            <div className="save-button-wrapper">
                                <button className="save-btn" onClick={handleSave}>Сохранить</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="info-row">
                                <div className="info-value name-text">{user.firstName} {user.surName}</div>
                                <div className="info-label">Имя фамилия</div>
                            </div>

                            <div className="info-row">
                                <div className="info-value status-text">
                                    {user.status || " "}
                                </div>
                                <div className="info-label">О себе</div>
                            </div>

                            <div className="info-row">
                                <div className="info-value id-link">id: {user.id}</div>
                                <div className="info-label">ID пользователя</div>
                            </div>

                            <div className="info-row clickable-row" onClick={onCopyNick}>
                                <div className="info-value username-link">
                                    @{user.nickName}
                                    {copied && <span className="copy-badge">Скопировано</span>}
                                </div>
                                <div className="info-label">Имя пользователя</div>
                            </div>

                            <div className="info-row">
                                <div className="info-value date-val">
                                    {getAgeAndDate(user.birthDate)}
                                </div>
                                <div className="info-label">День рождения</div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}