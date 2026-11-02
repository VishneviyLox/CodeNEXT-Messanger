export interface Message{
    id: number;
    from_user_id: number;
    to_user_id: number;
    message: string;
    date: string; 
    readed: boolean;
}