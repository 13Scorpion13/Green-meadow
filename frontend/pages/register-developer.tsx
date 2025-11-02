import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { DeveloperRegisterRequest } from '../types';
import Link from 'next/link';

export default function DeveloperRegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  // Получаем временные данные
  const tempUserData = sessionStorage.getItem('tempUserData');
  if (!tempUserData) {
    router.push('/register');
    return null;
  }

  const userData = JSON.parse(tempUserData);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [githubProfile, setGithubProfile] = useState('');

  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const devData: DeveloperRegisterRequest = { first_name: firstName, last_name: lastName, github_profile: githubProfile };

    const result = await register(userData, true, devData);
    // Удаляем временные данные
    sessionStorage.removeItem('tempUserData');

    if (result.success) {
      router.push('/profile');
    } else {
      setError(result.error || 'Неизвестная ошибка');
    }
  };

  return (
    <div>
      <h2>Профиль разработчика</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Имя: <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        </label>
        <label>
          Фамилия: <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </label>
        <label>
          GitHub профиль: <input type="url" value={githubProfile} onChange={(e) => setGithubProfile(e.target.value)} />
        </label>
        <button type="submit">Зарегистрироваться</button>
      </form>
      <Link href="/">← На главную</Link>
    </div>
  );
}