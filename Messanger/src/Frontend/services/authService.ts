import type { AuthResponse } from '../types/authResponse';
import type { ChatItem } from '../types/chatItems';
import type { RegisterData } from '../types/registerData';
import type { UserData } from '../types/userData';
import type { Message } from '../types/message';

const API_URL = 'http://localhost:8080/api';

export const registerUser = async (userData: RegisterData) => {
    const response = await fetch(`${API_URL}/register`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });

    if (!response.ok) throw new Error('Ошибка регистрации');

    const result = await response.json();
    localStorage.setItem('authToken', result.token);
    return result;
}

export const loginUser = async (nickname: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, password })
    });

    if (!response.ok) throw new Error('Неверный логин или пароль');
    
    const result = await response.json();
    localStorage.setItem('authToken', result.token);
    return result;
}

export const getCurrentUser = async (): Promise<AuthResponse['user']> => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Нет токена');

    const res = await fetch(`${API_URL}/profile/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!res.ok) throw new Error('Ошибка загрузки профиля');
    const data = await res.json();
    return data.user;
};

export const updateProfile = async (userData: Partial<UserData>) => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Нет токена');

    const response = await fetch(`${API_URL}/profile/me`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
    });

    if (!response.ok) throw new Error('Ошибка обновления профиля');
    return response.json();
}

export const getChatList = async (): Promise<ChatItem[]> => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Нет токена');

    const res = await fetch(`${API_URL}/chats`, {
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
    });

    if (!res.ok) throw new Error('Ошибка загрузки чатов');
    return res.json();
}

export const getMessages = async (partnerID: number): Promise<Message[]> => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Нет токена');

    const res = await fetch(
        `${API_URL}/messages?partner_id=${partnerID}`, 
        { headers: { 'Authorization': `Bearer ${token}` } }
    );

    if (!res.ok) throw new Error('Ошибка загрузки сообщений');
    return res.json();
};

export const sendMessage = async (fromUserID: number, toUserID: number, text: string) => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Нет токена');

    const res = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
            from_user_id: fromUserID, 
            to_user_id: toUserID, 
            message: text 
        })
    });

    if (!res.ok) throw new Error('Ошибка отправки сообщения');
    return res.json();
};

export const getOrCreateChat = async (partnerId: number) => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Нет токена');

    const res = await fetch(
        `${API_URL}/chats/start?partner_id=${partnerId}`,
        {headers: {'Authorization': `Bearer ${token}`}}
    );

    if (!res.ok) throw new Error('Ошибка диалога');
    return res.json();
}