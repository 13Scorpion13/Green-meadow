import { useState, FormEvent, ChangeEvent, useEffect } from 'react';

// Добавьте интерфейсы для типов
interface Developer {
  first_name: string;
  last_name: string;
  // middle_name?: string;
  github_profile?: string;
}

interface User {
  id: string;
  email: string;
  nickname: string;
  role: string;
  // phone?: string;
  developer?: Developer;
}

interface ProfileTabProps {
  user: User;
}

interface FormData {
  username: string;
  lastName: string;
  firstName: string;
  // middleName: string;
  // phone: string;
  email: string;
  github: string;
}

export default function ProfileTab({ user }: ProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    username: user.nickname || '',
    lastName: user.developer?.last_name || '',
    firstName: user.developer?.first_name || '',
    // middleName: user.developer?.middle_name || '',
    // phone: user.phone || '',
    email: user.email || '',
    github: user.developer?.github_profile || ''
  });

  // Синхронизация formData при изменении `user` (например, при загрузке новых данных)
  useEffect(() => {
    setFormData({
      username: user.nickname || '',
      lastName: user.developer?.last_name || '',
      firstName: user.developer?.first_name || '',
      email: user.email || '',
      github: user.developer?.github_profile || ''
    });
  }, [user]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    // Восстанавливаем исходные данные из `user`
    setFormData({
      username: user.nickname || '',
      lastName: user.developer?.last_name || '',
      firstName: user.developer?.first_name || '',
      email: user.email || '',
      github: user.developer?.github_profile || ''
    });
    setIsEditing(false);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Здесь будет логика обновления профиля
    console.log('Update profile:', formData);
    setIsEditing(false); // можно выйти из режима редактирования после сохранения
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  return (
    <div className="tab-content active" id="profile-tab">
      <div className="tab-header">
        <h2 className="tab-title">Профиль</h2>
        <p className="tab-subtitle">Управление вашей персональной информацией</p>
      </div>

      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="username" className="form-label">Никнейм</label>
            <input 
              type="text" 
              id="username" 
              className="form-input" 
              value={formData.username}
              onChange={handleChange}
              placeholder="Введите ваш никнейм"
              readOnly={!isEditing}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Почта</label>
            <input 
              type="email" 
              id="email" 
              className="form-input" 
              value={formData.email}
              onChange={handleChange}
              placeholder="Введите вашу почту"
              readOnly={!isEditing}
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

          {/* GitHub */}
          <div className="form-group full-width">
            <label htmlFor="github" className="form-label">Ссылка на GitHub</label>
            <input 
              type="url" 
              id="github" 
              className="form-input" 
              value={formData.github}
              onChange={handleChange}
              placeholder="Введите ссылку на ваш GitHub"
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
              >
                Отменить
              </button>
              <button type="submit" className="btn btn--primary">
                Сохранить изменения
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