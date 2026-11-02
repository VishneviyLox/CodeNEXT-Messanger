import { useState, useEffect } from 'react';
import { Menu, User, Settings, LogOut, Search, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './styles/ProfilePage.css';
import ProfileModal from './ProfileModal';
import ChatWindow from './ChatWindow';
import { type UserData } from '../types/userData';
import { getCurrentUser, getChatList, getOrCreateChat } from '../services/authService';
import {type ChatItem } from '../types/chatItems';

export default function ProfilePage() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<UserData[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    
    const [user, setUser] = useState<UserData | null>(null);
    const [chats, setChats] = useState<ChatItem[]>([]); 
    const [isLoading, setIsLoading] = useState(true);

    // Эффект для debounce-поиска (2 секунды после прекращения ввода)
useEffect(() => {
    if (!searchQuery.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        setIsSearchLoading(false); // Сбрасываем загрузку при очистке поля
        return;
    }

    setIsSearching(true);
    setIsSearchLoading(true); // Включаем "Поиск..." сразу при вводе

    const timer = setTimeout(async () => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(
                `http://localhost:8080/api/users?search=${encodeURIComponent(searchQuery)}`, 
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            if (res.ok) {
                const data = await res.json();
                setSearchResults(data || []);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Ошибка поиска:', error);
            setSearchResults([]);
        } finally {
            setIsSearchLoading(false); // Выключаем загрузку после завершения запроса
        }
    }, 500);

    return () => clearTimeout(timer);
}, [searchQuery]);

// Функция начала диалога с найденным пользователем
const handleStartChat = async (foundUser: UserData) => {
    try {
        // Запрашиваем у сервера данные для чата
        const chatData = await getOrCreateChat(foundUser.id);
        
        // Устанавливаем выбранный чат
        setSelectedChatId(chatData.partner_id);
        
        // Если чат новый, добавляем его в список чатов локально,
        // чтобы он появился в сайдбаре без перезагрузки
        if (chatData.is_new_chat) {
            setChats(prev => [{
                partner_id: chatData.partner_id,
                nickname: chatData.nickname,
                first_name: chatData.first_name,
                sur_name: chatData.sur_name,
                avatar: chatData.avatar,
                last_message: '',
                time: new Date().toISOString(),
                unread: 0
            }, ...prev]);
        } else {
            // Если чат существующий, просто поднимаем его наверх
            updateChatLastMessage(chatData.partner_id, '');
        }
        
        // Очищаем поиск
        setSearchQuery("");
        setIsSearching(false);
        
    } catch (error) {
        console.error('Ошибка начала диалога:', error);
        alert('Не удалось начать диалог');
    }
};

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                
                const [userData, chatData] = await Promise.all([
                    getCurrentUser(),
                    getChatList()
                ]);

                setUser(userData);
                setChats(chatData || []);
            } catch (error) {
                console.error('Ошибка загрузки:', error);
                navigate('/auth');
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [navigate]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && selectedChatId !== null) {
                setSelectedChatId(null);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [selectedChatId]);

    if (isLoading || !user) {
        return <div className="loading-screen">Загрузка...</div>;
    }

    const handleCopyNick = () => {
        navigator.clipboard.writeText(user.nickName);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/auth');
    };

    // Исправленная функция форматирования времени
    const formatTime = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        
        return date.toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
    };

    const updateChatLastMessage = (partnerId: number, messageText: string) => {
    setChats(prevChats => {

        const updatedChat = prevChats.find(c => c.partner_id === partnerId);
        if (!updatedChat) return prevChats;


        const newChat = {
            ...updatedChat,
            last_message: messageText,
        };

        const otherChats = prevChats.filter(c => c.partner_id !== partnerId);
        return [newChat, ...otherChats];
    });
};

    const activeChat = chats.find(c => c.partner_id === selectedChatId);

    const syncUserInChats = (updatedUser: UserData) => {
    setChats(prevChats => {
        // Проверяем, есть ли текущий пользователь в списке чатов 
        // (например, если ты пишешь сам себе или система добавляет тебя в список)
        const hasSelfChat = prevChats.some(c => c.partner_id === updatedUser.id);
        
        if (!hasSelfChat) return prevChats;

        return prevChats.map(chat => {
            if (chat.partner_id === updatedUser.id) {
                return {
                    ...chat,
                    first_name: updatedUser.firstName,
                    sur_name: updatedUser.surName,
                    avatar: updatedUser.avatar,
                    nickname: updatedUser.nickName
                };
            }
            return chat;
        });
    });
};

    return (
        <div className="app-layout">
            <aside className="chat-sidebar">
                <div className="sidebar-header">
                    <button className="burger-btn" onClick={() => setIsMenuOpen(true)}>
                        <Menu size={22} />
                    </button>
                    <div className="search-wrapper">
                        <Search size={16} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="@никнейм" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="chat-list">
                    {isSearching ? (
                        isSearchLoading ? (
                            // СОСТОЯНИЕ ЗАГРУЗКИ (пока работает таймер)
                            <div className="empty-chats-placeholder">
                                <p>Поиск...</p>
                            </div>
                        ) : searchResults.length > 0 ? (
                            // РЕЗУЛЬТАТЫ ПОИСКА
                            searchResults.map((user) => (
                                <div 
                                    key={user.id} 
                                    className="chat-item search-result"
                                    onClick={() => handleStartChat(user)}
                                >
                                    <img src={user.avatar} alt={user.nickName} className="chat-avatar" />
                                    <div className="chat-info">
                                        <div className="chat-top">
                                            <span className="chat-name">{user.firstName} {user.surName}</span>
                                        </div>
                                        <div className="chat-bottom">
                                            <p className="chat-msg">@{user.nickName}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            // НИЧЕГО НЕ НАЙДЕНО (таймер закончился, массив пуст)
                            <div className="empty-chats-placeholder">
                                <p>Пользователи не найдены</p>
                            </div>
                        )
                    ) : (
                        // ОБЫЧНЫЙ СПИСОК ЧАТОВ
                        chats.length === 0 ? (
                            <div className="empty-chats-placeholder">
                                <MessageCircle size={32} className="placeholder-icon" />
                                <p>Напишите кому-нибудь :D</p>
                            </div>
                        ) : (
                            chats.map((chat) => (
                                <div 
                                    key={chat.partner_id} 
                                    className={`chat-item ${selectedChatId === chat.partner_id ? 'active' : ''}`}
                                    onClick={() => setSelectedChatId(chat.partner_id)}
                                >
                                    <img src={chat.avatar} alt={chat.nickname} className="chat-avatar" />
                                    <div className="chat-info">
                                        <div className="chat-top">
                                            <span className="chat-name">
                                                {chat.first_name} {chat.sur_name}
                                            </span>
                                            <span className="chat-time">{formatTime(chat.time)}</span>
                                        </div>
                                        <div className="chat-bottom">
                                            <p className="chat-msg">{chat.last_message}</p>
                                            {chat.unread > 0 && (
                                                <span className="unread-badge">{chat.unread}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )
                    )}
                </div>
            </aside>

            <main className="main-content">
                {selectedChatId && activeChat ? (
                    <ChatWindow 
                        partnerId={selectedChatId}
                        partnerFirstName={activeChat.first_name}
                        partnerSurName={activeChat.sur_name}
                        partnerNickname={activeChat.nickname}
                        partnerAvatar={activeChat.avatar}
                        currentUser={user!}
                        onClose={() => setSelectedChatId(null)}
                        onMessageSent={(text) => updateChatLastMessage(selectedChatId, text)}
                    />
                ) : (
                    <div className="empty-state">
                        <MessageCircle size={64} strokeWidth={1} className="empty-icon" />
                        <p>Выберите диалог или напишите кому-нибудь :D</p>
                    </div>
                )}
            </main>

            <div className={`side-menu ${isMenuOpen ? 'open' : ''}`}>
                <div className="menu-header">
                    <img src={user.avatar} alt="Avatar" className="menu-avatar" />
                    <h3>{user.firstName} {user.surName}</h3>
                    <span className="menu-nick">@{user.nickName}</span>
                </div>
                
                <hr className="menu-divider" />

                <nav className="menu-nav">
                    <button className="menu-item" onClick={() => {
                        setIsProfileModalOpen(true);
                        setIsMenuOpen(false);
                    }}>
                        <User size={20}/> Мой профиль
                    </button>
                    <button className="menu-item disabled">
                        <Settings size={20}/> Настройки
                    </button>
                    <button className="menu-item logout" onClick={handleLogout}>
                        <LogOut size={20} color='red'/> Выйти
                    </button>
                </nav>
            </div>

            {isMenuOpen && <div className="overlay" onClick={() => setIsMenuOpen(false)}></div>}

            {isProfileModalOpen && (
                <ProfileModal
                    user={user}
                    onClose={() => setIsProfileModalOpen(false)}
                    onCopyNick={handleCopyNick}
                    copied={copied}
                    onUpdateUser={(updatedData) => {
                        setUser(updatedData);       // 1. Обновляем профиль
                        syncUserInChats(updatedData); // 2. Синхронизируем список чатов
        }} 
                />
            )}
        </div>
    );
}