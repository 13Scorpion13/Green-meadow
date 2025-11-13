import { useState, FormEvent, ChangeEvent } from 'react';

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
  const [formData, setFormData] = useState<FormData>({
    username: user.nickname || '',
    lastName: user.developer?.last_name || '',
    firstName: user.developer?.first_name || '',
    // middleName: user.developer?.middle_name || '',
    // phone: user.phone || '',
    email: user.email || '',
    github: user.developer?.github_profile || ''
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Здесь будет логика обновления профиля
    console.log('Update profile:', formData);
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
            />
          </div>

          {/* <div className="form-group">
            <label htmlFor="middleName" className="form-label">Отчество</label>
            <input 
              type="text" 
              id="middleName" 
              className="form-input" 
              value={formData.middleName}
              onChange={handleChange}
              placeholder="Введите ваше отчество"
            />
          </div> */}

          {/* <div className="form-group">
            <label htmlFor="phone" className="form-label">Номер телефона</label>
            <input 
              type="tel" 
              id="phone" 
              className="form-input" 
              value={formData.phone}
              onChange={handleChange}
              placeholder="Введите ваш номер телефона"
            />
          </div> */}

          <div className="form-group full-width">
            <label htmlFor="github" className="form-label">Ссылка на GitHub</label>
            <input 
              type="url" 
              id="github" 
              className="form-input" 
              value={formData.github}
              onChange={handleChange}
              placeholder="Введите ссылку на ваш GitHub"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn--secondary">
            Отменить
          </button>
          <button type="submit" className="btn btn--primary">
            Сохранить изменения
          </button>
        </div>
      </form>
    </div>
  );
}