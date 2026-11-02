import { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import { type UserData } from '../types/userData';
import { type Message } from '../types/message';
import { getMessages, sendMessage } from '../services/authService';
import MessageBubble from './MessageBubble';
import './styles/ChatWindow.css';

interface ChatWindowProps {
    partnerId: number;
    partnerFirstName?: string;
    partnerSurName?: string;
    partnerNickname?: string;
    partnerAvatar?: string; 
    currentUser: UserData;
    onClose: () => void;
    onMessageSent?: (text: string) => void;
}

export default function ChatWindow({ 
    partnerId, 
    partnerFirstName,
    partnerSurName,
    partnerNickname,
    partnerAvatar, 
    currentUser, 
    onClose,
    onMessageSent
}: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadMsgs = async () => {
            try {
                const msgs = await getMessages(partnerId);
                setMessages(msgs || []);
            } catch (error) {
                console.error('Ошибка загрузки:', error);
            }
        };
        loadMsgs();
    }, [partnerId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!inputText.trim()) return;
        
        try {
            await sendMessage(currentUser.id, partnerId, inputText);
            
            if (onMessageSent) {
                onMessageSent(inputText);
            }
            
            setInputText("");
            const msgs = await getMessages(partnerId);
            setMessages(msgs);
        } catch (error) {
            console.error('Ошибка отправки:', error);
        }
    };

    // Функция форматирования даты для плашки
    const formatMessageDate = (dateString: string): string => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const y = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

        if (d.getTime() === t.getTime()) return 'Сегодня';
        if (d.getTime() === y.getTime()) return 'Вчера';

        return date.toLocaleDateString('ru-RU', { 
            day: 'numeric', 
            month: 'long' 
        });
    };

    // Переменная для отслеживания последней отрисованной даты
    // Она объявляется ВНУТРИ функции, поэтому сбрасывается при каждом рендере
    let lastRenderedDate = '';

    return (
        <div className="chat-view">
            <div className="chat-header">
                <div className="chat-header-info">
                    <h3>{partnerFirstName} {partnerSurName}</h3>
                    <span className="chat-nick">@{partnerNickname}</span>
                </div>
                <button className="close-chat-btn" onClick={onClose}>
                    <X size={20} />
                </button>
            </div>

            <div className="messages-container">
                {messages.map((msg) => {
                    // Получаем дату сообщения без времени для сравнения
                    const msgDate = new Date(msg.date).toLocaleDateString('ru-RU');
                    
                    // Проверяем, нужно ли показать разделитель
                    const showDivider = msgDate !== lastRenderedDate;
                    if (showDivider) {
                        lastRenderedDate = msgDate;
                    }

                    return (
                        <div key={msg.id}>
                            {/* Плашка с датой */}
                            {showDivider && (
                                <div className="message-date-divider">
                                    <span>{formatMessageDate(msg.date)}</span>
                                </div>
                            )}
                            
                            {/* Сообщение */}
                            <MessageBubble 
                                message={msg} 
                                isMyMessage={msg.from_user_id === currentUser.id}
                                myAvatar={currentUser.avatar}
                                partnerAvatar={partnerAvatar}
                            />
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
                <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Напишите сообщение..."
                />
                <button onClick={handleSend} disabled={!inputText.trim()}>
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
}