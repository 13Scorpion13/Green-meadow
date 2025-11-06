"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { DeveloperRegisterRequest } from '../types';
import Link from 'next/link';

export default function DeveloperRegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [githubProfile, setGithubProfile] = useState('');
  const [error, setError] = useState('');

  // Проверка sessionStorage только на клиенте
  useEffect(() => {
    if (typeof window !== "undefined") {
      const tmp = sessionStorage.getItem("tempUserData");
      if (!tmp) router.push("/register");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const tmp = sessionStorage.getItem("tempUserData");
    if (!tmp) return;

    const parsed = JSON.parse(tmp);

    const devData: DeveloperRegisterRequest = {
      first_name: firstName,
      last_name: lastName,
      github_profile: githubProfile
    };

    const result = await register(parsed, true, devData);

    if (result.success) {
      sessionStorage.removeItem("tempUserData");
      router.push("/profile");
    } else {
      setError(result.error || "Ошибка регистрации");
    }
  };

  return (
    <div className="auth-container">
    <div className="account-card account-card--center">
      <h1 className="account-title--big">
        Регистрация разработчика
      </h1>

        {error && <p className="form-error">{error}</p>}

        <form onSubmit={handleSubmit} className="profile-form">

          <div className="form-group">
            <label className="form-label">Имя</label>
            <input
              className="form-input"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Фамилия</label>
            <input
              className="form-input"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">GitHub профиль</label>
            <input
              className="form-input"
              value={githubProfile}
              onChange={(e) => setGithubProfile(e.target.value)}
              required
            />
          </div>

          <div className="form-actions">
            <Link href="/" className="btn">Отменить</Link>

            <button type="submit" className="btn btn--primary">
              Завершить
            </button>
          </div>
        </form>

        <p className="auth-switch">
          Нет аккаунта? <Link href="/register">Создать</Link>
        </p>
    </div>
    </div>
  );
}
