'use client';

import { useState, FormEvent, ChangeEvent, useEffect } from 'react';

interface Developer {
  first_name: string;
  last_name: string;
  github_profile?: string;
}

interface User {
  id: string;
  email: string;
  nickname: string;
  role: string;
  developer?: Developer;
}

interface ProfileTabProps {
  user: User;
  onProfileUpdate?: (updatedUser: User) => void;
}

interface FormData {
  username: string;
  lastName: string;
  firstName: string;
  email: string;
  github: string;
}

export default function ProfileTab({ user, onProfileUpdate }: ProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    username: user.nickname || '',
    lastName: user.developer?.last_name || '',
    firstName: user.developer?.first_name || '',
    email: user.email || '',
    github: user.developer?.github_profile || '',
  });

  // Сброс ошибок/успеха при выходе из редактирования
  useEffect(() => {
    if (!isEditing) {
      setError(null);
      setSuccess(null);
    }
  }, [isEditing]);

  // Синхронизация при обновлении user (например, после логина)
  useEffect(() => {
    setFormData({
      username: user.nickname || '',
      lastName: user.developer?.last_name || '',
      firstName: user.developer?.first_name || '',
      email: user.email || '',
      github: user.developer?.github_profile || '',
    });
  }, [user]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setFormData({
      username: user.nickname || '',
      lastName: user.developer?.last_name || '',
      firstName: user.developer?.first_name || '',
      email: user.email || '',
      github: user.developer?.github_profile || '',
    });
    setIsEditing(false);
  };

  // ✅ Главное: формируем payload для бэкенда
  const preparePayload = () => {
    // Нормализуем значения
    const email = formData.email.trim().toLowerCase();
    const nickname = formData.username.trim();
    const firstName = formData.firstName.trim();
    const lastName = formData.lastName.trim();
    const github = formData.github.trim();

    // ⚠️ Обязательные поля не должны быть пустыми
    if (!email) throw new Error('Поле "Почта" обязательно');
    if (!nickname) throw new Error('Поле "Никнейм" обязательно');

    // Формируем payload в snake_case — как ожидает бэкенд
    return {
      email,
      nickname,
      first_name: firstName || null,
      last_name: lastName || null,
      github_profile: github || null,
      // avatar_url можно добавить позже
    };
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // 1. Подготавливаем payload (с валидацией)
      const payload = preparePayload();

      // 2. Получаем токен
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Токен авторизации не найден. Пожалуйста, войдите снова.');
      }

      // 3. Отправляем PATCH с ПОЛНЫМ объектом (но через PATCH — безопаснее PUT)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY}/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // 4. Обработка ответа
      let data: any;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      }

      if (!res.ok) {
        const msg = data?.detail || data?.message || `Ошибка ${res.status}: не удалось сохранить профиль`;
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('access_token');
          setError('Сессия истекла. Пожалуйста, войдите снова.');
          setTimeout(() => (window.location.href = '/login'), 2000);
          return;
        }
        throw new Error(msg);
      }

      // 5. Успех
      const updatedUser: User = {
        ...user,
        email: data.email ?? user.email,
        nickname: data.nickname ?? user.nickname,
        developer: {
          first_name: data.first_name ?? user.developer?.first_name ?? '',
          last_name: data.last_name ?? user.developer?.last_name ?? '',
          github_profile: data.github_profile ?? user.developer?.github_profile ?? '',
        },
      };

      setSuccess('Профиль успешно обновлён!');
      if (onProfileUpdate) {
        onProfileUpdate(updatedUser);
      } else {
        // Обновляем локальное состояние
        setFormData({
          username: updatedUser.nickname,
          firstName: updatedUser.developer?.first_name || '',
          lastName: updatedUser.developer?.last_name || '',
          email: updatedUser.email,
          github: updatedUser.developer?.github_profile || '',
        });
      }

      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при сохранении профиля');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  return (
    <div className="tab-content active" id="profile-tab">
      <div className="tab-header">
        <h2 className="tab-title">Профиль</h2>
        <p className="tab-subtitle">Управление вашей персональной информацией</p>
      </div>

      {/* Уведомления */}
      {error && (
        <div className="alert alert--error" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="alert alert--success" role="alert">
          {success}
        </div>
      )}

      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="username" className="form-label">Никнейм *</label>
            <input
              type="text"
              id="username"
              className="form-input"
              value={formData.username}
              onChange={handleChange}
              placeholder="Введите ваш никнейм"
              readOnly={!isEditing}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Почта *</label>
            <input
              type="email"
              id="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="Введите вашу почту"
              readOnly={!isEditing}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="firstName" className="form-label">Имя</label>
            <input
              type="text"
              id="firstName"
              className="form-input"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Введите ваше имя"
              readOnly={!isEditing}
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName" className="form-label">Фамилия</label>
            <input
              type="text"
              id="lastName"
              className="form-input"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Введите вашу фамилию"
              readOnly={!isEditing}
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="github" className="form-label">Ссылка на GitHub</label>
            <input
              type="url"
              id="github"
              className="form-input"
              value={formData.github}
              onChange={handleChange}
              placeholder="https://github.com/ваш-профиль"
              readOnly={!isEditing}
            />
          </div>
        </div>

        <div className="form-actions">
          {isEditing ? (
            <>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={handleCancelClick}
                disabled={isLoading}
              >
                Отменить
              </button>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={isLoading}
              >
                {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleEditClick}
            >
              Редактировать профиль
            </button>
          )}
        </div>
      </form>
    </div>
  );
}