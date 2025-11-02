import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  if (loading) return <div>Загрузка...</div>;

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div>
      <h2>Профиль</h2>
      <p>ID: {user.id}</p>
      <p>Email: {user.email}</p>
      <p>Никнейм: {user.nickname}</p>
      <p>Роль: {user.role}</p>
      {user.developer && (
        <div>
          <h3>Профиль разработчика</h3>
          <p>Имя: {user.developer.first_name}</p>
          <p>Фамилия: {user.developer.last_name}</p>
          <p>GitHub: <a href={user.developer.github_profile || '#'} target="_blank" rel="noopener noreferrer">{user.developer.github_profile}</a></p>
        </div>
      )}
      <button onClick={logout}>Выйти</button>
      <Link href="/">← На главную</Link>
    </div>
  );
}