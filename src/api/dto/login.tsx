export interface LoginData {
  jwt: string;
  refresh_token: string;
  expiration_date: string;
  avatar_url: string;
  language: string;
  pending_validation: boolean;
}
