import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login({ email, password });

    if (result.success) {
      router.push('/profile');
    } else {
      setError(result.error || 'Ошибка авторизации');
    }
  };

  return (
    <div className="auth-container">
      <div className="account-card account-card--center">
        <h2 className="account-title--big">Вход</h2>

        {error && <p className="form-error">{error}</p>}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="Введите email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Пароль</label>
            <input
              type="password"
              className="form-input"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-actions">
            <Link href="/" className="btn">Отменить</Link>
            <button type="submit" className="btn btn--primary">Войти</button>
          </div>
        </form>

        <p className="auth-switch">
          Нет аккаунта? <Link href="/register">Создать</Link>
        </p>
      </div>
    </div>
  );
}
