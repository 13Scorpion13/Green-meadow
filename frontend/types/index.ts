export interface User {
  id: string;
  email: string;
  nickname: string;
  role: 'user' | 'creator' | 'admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  avatar_url?: string;
  developer?: Developer;
}

export interface Developer {
  user_id: string;
  first_name: string;
  last_name: string;
  suppor_phone?: string;
  github_profile?: string;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
}

export interface RegisterRequest {
  email: string;
  nickname: string;
  password: string;
  role: 'user' | 'creator';
}

export interface DeveloperRegisterRequest {
  first_name: string;
  last_name: string;
  github_profile?: string;
}

export interface MediaItem {
  type: "image" | "video";
  src: string;
  alt?: string;
}