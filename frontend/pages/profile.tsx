import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useState } from 'react';
import ProfileTab from '../components/ProfileTab'; // Добавьте эту строку
import ProjectsTab from '../components/ProjectsTab'; // Добавьте эту строку
import SettingsTab from '../components/SettingsTab'; // Добавьте эту строку
import Footer from '../components/Footer'; // Добавьте эту строку

export default function ProfilePage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');

  if (loading) return <div className="loading">Загрузка...</div>;

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="main-header">
        <div className="container header-container">
          <div className="header-left">
            <div className="logo">
              <div className="logo-icon">
                {/* Замените на ваш логотип */}
                <div className="icon-white">🤖</div>
              </div>
              <div>
                <h1 className="logo-title">AI Market</h1>
                <p className="logo-subtitle">Маркетплейс агентов</p>
              </div>
            </div>
            <nav className="main-nav">
              <Link href="/">Каталог</Link>
              <a href="#">Как работает</a>
              <a href="#">Для разработчиков</a>
              <a href="#">Сообщество</a>
            </nav>
          </div>
          <div className="header-right">
            <button className="icon-button">
              {/* Иконка корзины */}
              <div>🛒</div>
            </button>
            <button className="icon-button">
              {/* Иконка профиля */}
              <div>👤</div>
            </button>
            <button className="btn btn--primary login-button" onClick={handleLogout}>
              Выйти
            </button>
            <button className="menu-button">
              <div>☰</div>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="account-main">
        <div className="container account-container">
          {/* Sidebar */}
          <aside className="account-sidebar">
            <div className="user-profile-card">
              <div className="user-avatar">
                <div className="icon-white">👤</div>
              </div>
              <div className="user-info">
                <h2 className="user-name">
                  {user.developer 
                    ? `${user.developer.first_name} ${user.developer.last_name}`
                    : user.nickname
                  }
                </h2>
                <p className="user-email">{user.email}</p>
                <div className="user-stats">
                  <div className="stat">
                    <span className="stat-value">{new Date().toLocaleDateString()}</span>
                    <span className="stat-label">Зарегистрирован</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">2</span>
                    <span className="stat-label">проекта</span>
                  </div>
                </div>
              </div>
            </div>

            <nav className="account-nav">
              <button 
                className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <div className="icon-white">👤</div>
                <span>Профиль</span>
              </button>
              <button 
                className={`nav-item ${activeTab === 'projects' ? 'active' : ''}`}
                onClick={() => setActiveTab('projects')}
              >
                <div className="icon-white">📁</div>
                <span>Проекты</span>
              </button>
              <button 
                className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <div className="icon-white">⚙️</div>
                <span>Настройки</span>
              </button>
            </nav>
          </aside>

          {/* Content Area */}
          <div className="account-content">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <ProfileTab user={user} />
            )}

            {/* Projects Tab */}
            {activeTab === 'projects' && (
              <ProjectsTab />
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <SettingsTab />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}