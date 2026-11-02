export interface AuthResponse {
  token: string;
  user: {
    id: number;
    nickName: string;
    firstName: string;
    surName: string;
    avatar: string;
    birthDate: string;
    status?: string;
  };
}