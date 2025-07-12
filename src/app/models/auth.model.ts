import { ApiResponse } from './api.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginData {
  token: string;
  username: string;
}

export type LoginResponse = ApiResponse<LoginData>;
