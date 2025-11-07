import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, LoginRequest, RegisterRequest, DeveloperRegisterRequest } from '../types';

interface AuthContextType {
  user: User | null;
  login: (data: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  register: (
    userData: RegisterRequest,
    isDeveloper: boolean,
    devData?: DeveloperRegisterRequest
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const userData: User = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    } catch (err) {
      console.error('Ошибка при получении профиля:', err);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginRequest) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      const tokens: { access_token: string; refresh_token?: string } = await response.json();
      localStorage.setItem('access_token', tokens.access_token);
      if (tokens.refresh_token) {
        localStorage.setItem('refresh_token', tokens.refresh_token);
      }
      await fetchUser(tokens.access_token);
      return { success: true };
    } else {
      const error = await response.json();
      return { success: false, error: error.detail };
    }
  };

  const register = async (
    userData: RegisterRequest,
    isDeveloper: boolean,
    devData?: DeveloperRegisterRequest
  ) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.detail };
    }

    const user = await response.json();

    if (isDeveloper && devData) {
      const token = localStorage.getItem('access_token');
      if (!token) {
        // Если токен не получен — получить его через логин
        const loginResult = await login({ email: userData.email, password: userData.password });
        if (!loginResult.success) return loginResult;
      }

      const devResponse = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY}/developers/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('access_token')}` },
        body: JSON.stringify(devData)
      });

      if (!devResponse.ok) {
        const error = await devResponse.json();
        return { success: false, error: error.detail };
      }
    }

    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};