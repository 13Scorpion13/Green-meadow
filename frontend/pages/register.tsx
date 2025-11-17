import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { RegisterRequest } from '@/types';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isDeveloper, setIsDeveloper] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const userData: RegisterRequest = { email, nickname, password, role: "user" };

    if (isDeveloper) {
      sessionStorage.setItem('tempUserData', JSON.stringify(userData));
      router.push('/register-developer');
    } else {
      const result = await register(userData, false);
      if (result.success) {
        router.push('/profile');
      } else {
        setError(result.error || 'Неизвестная ошибка');
      }
    }
  };

  return (
    <div className="auth-container">
    <div className="account-card account-card--center">
      <h2 className="account-title--big">Регистрация</h2>

        {error && <p className="form-error">{JSON.stringify(error)}</p>}

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-input"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Никнейм</label>
            <input 
              type="text" 
              className="form-input"
              value={nickname} 
              onChange={(e) => setNickname(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Пароль</label>
            <input 
              type="password" 
              className="form-input"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Повторите пароль</label>
            <input 
              type="password" 
              className="form-input"
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
            />
          </div>

          <label className="checkbox-line">
            <input type="checkbox" checked={isDeveloper} onChange={(e) => setIsDeveloper(e.target.checked)} />
            Я хочу стать разработчиком
          </label>

          <div className="form-actions">
            <Link href="/" className="btn">Отменить</Link>
            <button type="submit" className="btn btn--primary">Войти</button>
          </div>
        </form>

        <p className="auth-switch">
          Уже есть аккаунт? <Link href="/login">Войти</Link>
        </p>
      
    </div>
  </div>
  );
}
