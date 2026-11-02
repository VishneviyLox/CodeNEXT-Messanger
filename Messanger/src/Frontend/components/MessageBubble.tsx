import './styles/MessageBubble.css';
import {type MessageBubbleProps } from '../types/MessageBubbleProps';

export default function MessageBubble({ 
    message, 
    isMyMessage, 
    myAvatar, 
    partnerAvatar 
}: MessageBubbleProps) {
    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const avatarUrl = isMyMessage ? myAvatar : partnerAvatar;

    return (
        <div className={`message-bubble ${isMyMessage ? 'my-message' : 'partner-message'}`}>
            {!isMyMessage && avatarUrl && (
                <img src={avatarUrl} alt="Avatar" className="msg-avatar" />
            )}
            
            <div className="msg-content">
                <p className="msg-text">{message.message}</p>
                <span className="msg-time">{formatTime(message.date)}</span>
            </div>
        </div>
    );
}