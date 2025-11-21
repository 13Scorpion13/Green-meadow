import { useState, FormEvent, useRef } from 'react';

interface Settings {
  twoFactorAuth: boolean;
  emailNotifications: boolean;
  feedbackNotifications: boolean;
}

type SettingKey = keyof Settings;

export default function SettingsTab() {
  const [settings, setSettings] = useState<Settings>({
    twoFactorAuth: false,
    emailNotifications: true,
    feedbackNotifications: true
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Состояния для валидации и отправки
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const currentPasswordRef = useRef<HTMLInputElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const handlePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Сброс предыдущих сообщений
    setError(null);
    setSuccess(null);

    // Получаем значения
    const currentPassword = currentPasswordRef.current?.value.trim() || '';
    const newPassword = newPasswordRef.current?.value.trim() || '';
    const confirmPassword = confirmPasswordRef.current?.value.trim() || '';

    // 🔐 Клиентская валидация
    if (newPassword.length < 8) {
      setError('Новый пароль должен содержать не менее 8 символов');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Новые пароли не совпадают');
      return;
    }

    if (newPassword === currentPassword) {
      setError('Новый пароль должен отличаться от текущего');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error("Токен не найден");
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY}/users/change-password`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          old_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Обрабатываем ошибки от бэкенда
        if (response.status === 400) {
          setError(data.detail || 'Неверный текущий пароль или новый пароль совпадает со старым');
        } else if (response.status === 401) {
          setError('Необходима авторизация');
        } else if (response.status === 404) {
          setError('Пользователь не найден');
        } else {
          setError(data.detail || `Ошибка: ${response.status}`);
        }
      } else {
        // Успех!
        setSuccess('Пароль успешно обновлён!');
        // Можно очистить форму или скрыть её через задержку
        setTimeout(() => {
          setShowPasswordForm(false);
        }, 2000);
      }
    } catch (err) {
      console.error('Network error:', err);
      setError('Не удалось подключиться к серверу. Проверьте соединение.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = (setting: SettingKey) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  return (
    <div className="tab-content" id="settings-tab">
      <div className="tab-header">
        <h2 className="tab-title">Настройки аккаунта</h2>
        <p className="tab-subtitle">Управление настройками безопасности и уведомлений</p>
      </div>

      <div className="settings-sections">
        {/* Security Section */}
        <section className="settings-section">
          <h3 className="section-title">Безопасность</h3>
          <div className="settings-grid">
            <div className="setting-item">
              <div className="setting-info">
                <h4 className="setting-title">Смена пароля</h4>
                <p className="setting-description">Обновите ваш пароль для защиты аккаунта</p>
              </div>
              {!showPasswordForm ? (
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => setShowPasswordForm(true)}
                >
                  Изменить пароль
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn--danger"
                  onClick={() => setShowPasswordForm(false)}
                >
                  Отмена
                </button>
              )}
            </div>

            {showPasswordForm && (
              <form className="password-form" onSubmit={handlePasswordSubmit}>
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

                <div className="form-group">
                  <label htmlFor="currentPassword" className="form-label">Текущий пароль</label>
                  <input
                    ref={currentPasswordRef}
                    type="password"
                    id="currentPassword"
                    className="form-input"
                    placeholder="Введите текущий пароль"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="newPassword" className="form-label">Новый пароль</label>
                  <input
                    ref={newPasswordRef}
                    type="password"
                    id="newPassword"
                    className="form-input"
                    placeholder="Введите новый пароль (мин. 8 символов)"
                    required
                    minLength={8}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">Подтвердите пароль</label>
                  <input
                    ref={confirmPasswordRef}
                    type="password"
                    id="confirmPassword"
                    className="form-input"
                    placeholder="Повторите новый пароль"
                    required
                  />
                </div>
                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn--primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Обновление...' : 'Обновить пароль'}
                  </button>
                </div>
              </form>
            )}

            <div className="setting-item">
              <div className="setting-info">
                <h4 className="setting-title">Двухфакторная аутентификация</h4>
                <p className="setting-description">Дополнительная защита вашего аккаунта</p>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={settings.twoFactorAuth}
                  onChange={() => handleToggle('twoFactorAuth')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="settings-section">
          <h3 className="section-title">Уведомления</h3>
          <div className="settings-grid">
            <div className="setting-item">
              <div className="setting-info">
                <h4 className="setting-title">Email уведомления</h4>
                <p className="setting-description">Получать уведомления на почту</p>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4 className="setting-title">Уведомления о отзывах</h4>
                <p className="setting-description">Когда пользователи оставляют отзывы</p>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={settings.feedbackNotifications}
                  onChange={() => handleToggle('feedbackNotifications')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </section>

        {/* Account Actions */}
        <section className="settings-section">
          <h3 className="section-title">Удаление аккаунта</h3>
          <div className="settings-grid">
            <div className="setting-item">
              <div className="setting-info">
                <h4 className="setting-description danger">Вы можете безвозвратно удалить свой аккаунт. Это действие нельзя отменить.</h4>
              </div>
              <button className="btn btn--danger">Удалить аккаунт</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}