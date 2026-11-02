export interface UserData {
    id: number;
    nickName: string;
    firstName: string;
    surName: string;
    avatar: string;
    birthDate: string;
    status?: string;
}

export interface ProfileModalProps {
    user: UserData;
    onClose: () => void;
    onCopyNick: () => void;
    copied: boolean;
}