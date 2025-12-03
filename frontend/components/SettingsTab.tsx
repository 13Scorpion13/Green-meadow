import { useState, FormEvent } from 'react';

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

  const [showPasswordForm, setShowPasswordForm] = useState(false); // Управление видимостью формы

  const handleToggle = (setting: SettingKey) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handlePasswordSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Логика смены пароля
    console.log('Пароль отправлен на смену');
    setShowPasswordForm(false); // После отправки можно скрыть форму
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
                <div className="form-group">
                  <label htmlFor="currentPassword" className="form-label">Текущий пароль</label>
                  <input 
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
                    type="password" 
                    id="newPassword" 
                    className="form-input" 
                    placeholder="Введите новый пароль"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">Подтвердите пароль</label>
                  <input 
                    type="password" 
                    id="confirmPassword" 
                    className="form-input" 
                    placeholder="Повторите новый пароль"
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn--primary">Обновить пароль</button>
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

        {/* Danger Zone */}
        <div className="danger-zone">
          <h3 className="danger-zone-title">Удаление аккаунта</h3>
          <div className="setting-item">
            <div className="setting-info">
              <h4 className="setting-title">После удаления учетная запись не подлежит восстановлению.</h4>
              <p className="setting-description">
                Все данные, связанные с вашим аккаунтом, будут безвозвратно утеряны. Вы уверены?
              </p>
            </div>
            <button className="btn btn--danger">Удалить свой аккаунт</button>
          </div>
        </div>
      </div>
    </div>
  );
}