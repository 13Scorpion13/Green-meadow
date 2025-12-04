export interface Developer {
  user_id: string;
  first_name: string;
  last_name: string;
  suppor_phone?: string;      // опционально → string | undefined
  github_profile?: string;    // опционально → string | undefined
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  nickname: string;
  role: 'user' | 'creator' | 'admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  avatar_url: string | null;     // ← было ?: string → теперь точно null или строка
  developer: Developer | null;   // ← было ?: Developer → теперь null или объект
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