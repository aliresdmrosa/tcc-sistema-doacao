export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  id: number;
  email: string;
  perfil: string;
}
