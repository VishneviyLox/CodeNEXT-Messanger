import {type Message } from "./message";

export interface MessageBubbleProps {
    message: Message;
    isMyMessage: boolean;
    myAvatar?: string;      
    partnerAvatar?: string; 
}