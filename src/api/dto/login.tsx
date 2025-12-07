export interface LoginData {
  id: number;
  jwt: string;
  refresh_token: string;
  expiration_date: string | number; // Puede venir como string o timestamp
  avatar_url: string;
  language: string;
  pending_validation: boolean;
  is_admin?: boolean;
  isAdmin?: boolean; // También puede venir como camelCase desde el backend
}
