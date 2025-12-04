'use client';

import { useState, FormEvent, ChangeEvent, useEffect } from 'react';

interface Developer {
  first_name: string;
  last_name: string;
  github_profile: string | null;
}

interface User {
  id: string;
  email: string;
  nickname: string;
  role: string;
  avatar_url: string | null;
  developer: Developer | null;
}

interface ProfileTabProps {
  user: User;
  onProfileUpdate?: (updatedUser: User) => void;
}

interface DeveloperFormData {
  first_name: string;
  last_name: string;
  github_profile: string;
}

export default function ProfileTab({ user, onProfileUpdate }: ProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 🔥 Ключевое: надёжная проверка статуса разработчика
  const isDeveloper = user.developer !== null && 
                     user.developer !== undefined &&
                     typeof user.developer === 'object' &&
                     user.developer.first_name != null &&
                     user.developer.last_name != null;

  const [showDeveloperForm, setShowDeveloperForm] = useState(false);

  // Форма редактирования профиля
  const [profileFormData, setProfileFormData] = useState({
    nickname: user.nickname || '',
    email: user.email || '',
    avatar_url: user.avatar_url || '',
  });

  // Форма "стать разработчиком"
  const [devFormData, setDevFormData] = useState<DeveloperFormData>({
    first_name: '',
    last_name: '',
    github_profile: '',
  });

  // Сброс при смене режима
  useEffect(() => {
    if (!isEditing && !showDeveloperForm) {
      setError(null);
      setSuccess(null);
      setDevFormData({ first_name: '', last_name: '', github_profile: '' });
    }
  }, [isEditing, showDeveloperForm]);

  // Синхронизация при обновлении user
  useEffect(() => {
    setProfileFormData({
      nickname: user.nickname || '',
      email: user.email || '',
      avatar_url: user.avatar_url || '',
    });
  }, [user]);

  // === Обычное редактирование профиля ===
  const handleEditProfile = () => setIsEditing(true);
  
  const handleCancelEdit = () => {
    setProfileFormData({
      nickname: user.nickname || '',
      email: user.email || '',
      avatar_url: user.avatar_url || '',
    });
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const handleProfileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setProfileFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const validateProfileForm = (): string | null => {
    if (!profileFormData.nickname.trim()) return 'Никнейм обязателен';
    if (!profileFormData.email.trim()) return 'Email обязателен';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileFormData.email.trim())) {
      return 'Некорректный email';
    }
    return null;
  };

  const handleProfileSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const err = validateProfileForm();
    if (err) {
      setError(err);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Токен не найден');

      const payload = {
        nickname: profileFormData.nickname.trim(),
        email: profileFormData.email.trim().toLowerCase(),
        avatar_url: profileFormData.avatar_url.trim() || null,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY}/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      let data: any = null;
      const ct = res.headers.get('content-type');
      if (ct?.includes('application/json')) data = await res.json();

      if (!res.ok) {
        const msg = data?.detail || data?.message || `Ошибка ${res.status}`;
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
          return;
        }
        throw new Error(msg);
      }

      const updatedUser: User = {
        ...user,
        nickname: data.nickname ?? user.nickname,
        email: data.email ?? user.email,
        avatar_url: data.avatar_url ?? user.avatar_url,
        developer: data.developer ?? user.developer,
      };

      setSuccess('Профиль обновлён');
      onProfileUpdate?.(updatedUser);
      setIsEditing(false);

    } catch (err: any) {
      setError(err.message || 'Не удалось сохранить');
    } finally {
      setIsLoading(false);
    }
  };

  // === Стать разработчиком ===
  const handleOpenDeveloperForm = () => setShowDeveloperForm(true);
  
  const handleCancelDeveloperForm = () => {
    setShowDeveloperForm(false);
    setDevFormData({ first_name: '', last_name: '', github_profile: '' });
    setError(null);
  };

  const handleDevChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDevFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const validateDevForm = (): string | null => {
    if (!devFormData.first_name.trim()) return 'Имя обязательно';
    if (!devFormData.last_name.trim()) return 'Фамилия обязательна';
    return null;
  };

  const handleBecomeDeveloper = async () => {
    const err = validateDevForm();
    if (err) {
      setError(err);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Токен не найден');

      const payload = {
        first_name: devFormData.first_name.trim(),
        last_name: devFormData.last_name.trim(),
        github_profile: devFormData.github_profile.trim() || undefined,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY}/developers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      let data: any = null;
      const ct = res.headers.get('content-type');
      if (ct?.includes('application/json')) data = await res.json();

      if (!res.ok) {
        const msg = data?.detail || data?.message || `Ошибка ${res.status}`;
        throw new Error(msg);
      }

      // 🔥 Главное исправление: после создания — включаем редактирование
      const newDeveloper: Developer = {
        first_name: data.first_name,
        last_name: data.last_name,
        github_profile: data.github_profile,
      };

      const updatedUser: User = {
        ...user,
        developer: newDeveloper,
      };

      setSuccess('Вы успешно стали разработчиком!');
      onProfileUpdate?.(updatedUser);
      setShowDeveloperForm(false);
      setIsEditing(true); // ✅ теперь поля developer сразу видны!

    } catch (err: any) {
      setError(err.message || 'Не удалось создать профиль разработчика');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="tab-content active" id="profile-tab">
      <div className="tab-header">
        <h2 className="tab-title">Профиль</h2>
        <p className="tab-subtitle">
          {isDeveloper
            ? 'Вы зарегистрированы как разработчик'
            : 'Обычный пользователь'}
        </p>
      </div>

      {error && <div className="alert alert--error">{error}</div>}
      {success && <div className="alert alert--success">{success}</div>}

      {/* Основная форма профиля */}
      {!showDeveloperForm && (
        <form className="profile-form" onSubmit={handleProfileSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="nickname" className="form-label">Никнейм *</label>
              <input
                type="text"
                id="nickname"
                className="form-input"
                value={profileFormData.nickname}
                onChange={handleProfileChange}
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
                value={profileFormData.email}
                onChange={handleProfileChange}
                readOnly={!isEditing}
                required
              />
            </div>

            {/* 👇 Developer-поля: ТОЛЬКО если isDeveloper === true */}
            {isDeveloper && (
              <>
                <div className="form-group">
                  <label htmlFor="first_name" className="form-label">Имя *</label>
                  <input
                    type="text"
                    id="first_name"
                    className="form-input"
                    value={user.developer?.first_name || ''}
                    onChange={handleProfileChange}
                    readOnly={!isEditing}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="last_name" className="form-label">Фамилия *</label>
                  <input
                    type="text"
                    id="last_name"
                    className="form-input"
                    value={user.developer?.last_name || ''}
                    onChange={handleProfileChange}
                    readOnly={!isEditing}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="github_profile" className="form-label">GitHub</label>
                  <input
                    type="url"
                    id="github_profile"
                    className="form-input"
                    value={user.developer?.github_profile || ''}
                    onChange={handleProfileChange}
                    readOnly={!isEditing}
                    placeholder="https://github.com/ваш-профиль"
                  />
                </div>
              </>
            )}
          </div>

          <div className="form-actions">
            {isEditing ? (
              <>
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                >
                  Отменить
                </button>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Сохранение...' : 'Сохранить'}
                </button>
              </>
            ) : (
              <div className="d-flex gap-3">
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={handleEditProfile}
                >
                  Редактировать профиль
                </button>

                {!isDeveloper && (
                  <button
                    type="button"
                    className="btn btn--outline"
                    onClick={handleOpenDeveloperForm}
                  >
                    Стать разработчиком
                  </button>
                )}
              </div>
            )}
          </div>
        </form>
      )}

      {/* Форма "Стать разработчиком" */}
      {showDeveloperForm && (
        <div className="developer-form-card">
          <h3 className="form-title">Создание профиля разработчика</h3>
          <p className="form-subtitle">Заполните данные, чтобы получить доступ к возможностям разработчика.</p>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="first_name" className="form-label">Имя *</label>
              <input
                type="text"
                id="first_name"
                className="form-input"
                value={devFormData.first_name}
                onChange={handleDevChange}
                placeholder="Иван"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="last_name" className="form-label">Фамилия *</label>
              <input
                type="text"
                id="last_name"
                className="form-input"
                value={devFormData.last_name}
                onChange={handleDevChange}
                placeholder="Иванов"
                required
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="github_profile" className="form-label">GitHub (опционально)</label>
              <input
                type="url"
                id="github_profile"
                className="form-input"
                value={devFormData.github_profile}
                onChange={handleDevChange}
                placeholder="https://github.com/ваш-профиль"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={handleCancelDeveloperForm}
              disabled={isLoading}
            >
              Отмена
            </button>
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleBecomeDeveloper}
              disabled={isLoading}
            >
              {isLoading ? 'Создание...' : 'Стать разработчиком'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}