import {type UserData } from "./userData";

export interface ChatWindowProps {
    partnerId: number;
    partnerName: string;
    partnerAvatar?: string;
    currentUser: UserData;
    onClose: () => void;
}