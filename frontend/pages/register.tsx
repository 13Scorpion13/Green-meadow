import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { RegisterRequest } from '../types';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [isDeveloper, setIsDeveloper] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const userData: RegisterRequest = { email, nickname, password, role: "user" };

    if (isDeveloper) {
      // Сохраняем в sessionStorage (или localStorage), чтобы передать на следующую страницу
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
    <div>
      <h2>Регистрация</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Email: <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Никнейм: <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} required />
        </label>
        <label>
          Пароль: <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <label>
          <input type="checkbox" checked={isDeveloper} onChange={(e) => setIsDeveloper(e.target.checked)} />
          Я хочу стать разработчиком
        </label>
        <button type="submit">Зарегистрироваться</button>
      </form>
      <Link href="/">← На главную</Link>
    </div>
  );
}