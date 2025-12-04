'use client';

import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import type { User, Developer } from '@/types'; // ← импорт из глобальных типов

interface ProfileTabProps {
  user: User;
  onProfileUpdate?: (updatedUser: User) => void;
}

// Форма для "стать разработчиком"
interface DeveloperFormData {
  first_name: string;
  last_name: string;
  github_profile: string; // локально — string, преобразуем при отправке
}

export default function ProfileTab({ user, onProfileUpdate }: ProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 🔍 Проверка: является ли пользователь разработчиком
  const isDeveloper = user.developer !== null;

  const [showDeveloperForm, setShowDeveloperForm] = useState(false);

  // Данные основного профиля (ник, email, аватар)
  const [profileFormData, setProfileFormData] = useState({
    nickname: user.nickname,
    email: user.email,
    avatar_url: user.avatar_url ?? '',
  });

  // Данные формы "стать разработчиком"
  const [devFormData, setDevFormData] = useState<DeveloperFormData>({
    first_name: '',
    last_name: '',
    github_profile: '',
  });

  // Сброс ошибок/успеха при смене режима
  useEffect(() => {
    if (!isEditing && !showDeveloperForm) {
      setError(null);
      setSuccess(null);
      setDevFormData({ first_name: '', last_name: '', github_profile: '' });
    }
  }, [isEditing, showDeveloperForm]);

  // Синхронизация profileFormData при изменении user (например, после обновления)
  useEffect(() => {
    setProfileFormData({
      nickname: user.nickname,
      email: user.email,
      avatar_url: user.avatar_url ?? '',
    });
  }, [user]);

  // === Основное редактирование профиля ===
  const handleEditProfile = () => setIsEditing(true);

  const handleCancelEdit = () => {
    setProfileFormData({
      nickname: user.nickname,
      email: user.email,
      avatar_url: user.avatar_url ?? '',
    });
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const handleProfileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProfileFormData((prev) => ({
      ...prev,
      [id]: value,
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

      // Подготавливаем payload:
      // — avatar_url: null, если пустая строка
      // — developer: если редактируем и developer есть — можно обновлять его поля
      //   (⚠️ сейчас API /users/me/PATCH не принимает developer — уточни у бэка!)
      const payload: Partial<User> = {
        nickname: profileFormData.nickname.trim(),
        email: profileFormData.email.trim().toLowerCase(),
        avatar_url: profileFormData.avatar_url.trim() || null,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY}/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      let data: any;
      const ct = res.headers.get('content-type');
      if (ct?.includes('application/json')) {
        data = await res.json();
      }

      if (!res.ok) {
        const msg = data?.detail || data?.message || `Ошибка ${res.status}`;
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
          return;
        }
        throw new Error(msg);
      }

      // Обновляем user на основе ответа
      const updatedUser: User = {
        ...user,
        nickname: data.nickname ?? user.nickname,
        email: data.email ?? user.email,
        avatar_url: data.avatar_url ?? user.avatar_url,
        developer: data.developer ?? user.developer, // ← если API возвращает developer
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
    const { id, value } = e.target;
    setDevFormData((prev) => ({
      ...prev,
      [id]: value,
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

      // Важно: если github_profile пуст — передаём `null` или `undefined`,
      // в зависимости от ожиданий бэка. У тебя в глобальном Developer — `?: string`,
      // значит, лучше `undefined` (чтобы поле вообще не попало в JSON).
      const github =
        devFormData.github_profile.trim() === ''
          ? undefined
          : devFormData.github_profile.trim();

      const payload = {
        first_name: devFormData.first_name.trim(),
        last_name: devFormData.last_name.trim(),
        github_profile: github, // → undefined → поле исчезнет из JSON
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY}/developers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data?.detail || data?.message || `Ошибка ${res.status}`;
        throw new Error(msg);
      }

      // Создаём корректный Developer-объект:
      // Обрати внимание: `user_id` и `created_at` обязательны в глобальном Developer!
      // — если API их не возвращает — это проблема. Допустим, бэк их возвращает.
      const newDeveloper: Developer = {
        user_id: data.user_id ?? user.id,
        first_name: data.first_name,
        last_name: data.last_name,
        github_profile: data.github_profile ?? undefined, // ← string | undefined
        created_at: data.created_at ?? new Date().toISOString(),
        // suppor_phone — может отсутствовать
      };

      const updatedUser: User = {
        ...user,
        developer: newDeveloper,
      };

      setSuccess('Вы успешно стали разработчиком!');
      onProfileUpdate?.(updatedUser);
      setShowDeveloperForm(false);
      setIsEditing(true); // сразу включаем редактирование
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
          {isDeveloper ? 'Вы зарегистрированы как разработчик' : 'Обычный пользователь'}
        </p>
      </div>

      {error && <div className="alert alert--error">{error}</div>}
      {success && <div className="alert alert--success">{success}</div>}

      {/* Основная форма профиля */}
      {!showDeveloperForm && (
        <form className="profile-form" onSubmit={handleProfileSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="nickname" className="form-label">
                Никнейм *
              </label>
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
              <label htmlFor="email" className="form-label">
                Почта *
              </label>
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

            {/* Поля разработчика — только если developer !== null */}
            {isDeveloper && (
              <>
                <div className="form-group">
                  <label htmlFor="first_name" className="form-label">
                    Имя *
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    className="form-input"
                    value={user.developer?.first_name} // безопасно, т.к. проверили isDeveloper
                    readOnly={!isEditing}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="last_name" className="form-label">
                    Фамилия *
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    className="form-input"
                    value={user.developer?.last_name}
                    readOnly={!isEditing}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="github_profile" className="form-label">
                    GitHub
                  </label>
                  <input
                    type="url"
                    id="github_profile"
                    className="form-input"
                    value={user.developer?.github_profile ?? ''} // ← undefined → ''
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
                <button type="submit" className="btn btn--primary" disabled={isLoading}>
                  {isLoading ? 'Сохранение...' : 'Сохранить'}
                </button>
              </>
            ) : (
              <div className="d-flex gap-3">
                <button type="button" className="btn btn--primary" onClick={handleEditProfile}>
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
          <p className="form-subtitle">
            Заполните данные, чтобы получить доступ к возможностям разработчика.
          </p>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="first_name" className="form-label">
                Имя *
              </label>
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
              <label htmlFor="last_name" className="form-label">
                Фамилия *
              </label>
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
              <label htmlFor="github_profile" className="form-label">
                GitHub (опционально)
              </label>
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