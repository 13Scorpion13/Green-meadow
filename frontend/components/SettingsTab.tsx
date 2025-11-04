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

  const handleToggle = (setting: SettingKey) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handlePasswordSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Логика смены пароля
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
            </div>
            
            <form className="password-form" onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label htmlFor="currentPassword" className="form-label">Текущий пароль</label>
                <input 
                  type="password" 
                  id="currentPassword" 
                  className="form-input" 
                  placeholder="Введите текущий пароль"
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword" className="form-label">Новый пароль</label>
                <input 
                  type="password" 
                  id="newPassword" 
                  className="form-input" 
                  placeholder="Введите новый пароль"
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Подтвердите пароль</label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  className="form-input" 
                  placeholder="Повторите новый пароль"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn--primary">Сохранить пароль</button>
              </div>
            </form>

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
          <h3 className="section-title">Действия с аккаунтом</h3>
          <div className="settings-grid">
            <div className="setting-item">
              <div className="setting-info">
                <h4 className="setting-title danger">Удаление аккаунта</h4>
                <p className="setting-description danger">Безвозвратно удалить аккаунт и все данные</p>
              </div>
              <button className="btn btn--danger">Удалить аккаунт</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}