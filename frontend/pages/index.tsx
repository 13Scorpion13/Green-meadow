import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Добро пожаловать в маркетплейс AI-агентов!</h1>
      {user ? (
        <div>
          <p>Привет, {user.nickname}!</p>
          <Link href="/profile">Мой профиль</Link> | <button onClick={logout}>Выйти</button>
        </div>
      ) : (
        <div>
          <Link href="/register">Зарегистрироваться</Link> | <Link href="/login">Войти</Link>
        </div>
      )}
    </div>
  );
}