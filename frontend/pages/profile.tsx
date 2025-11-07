import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useState } from 'react';
import ProfileTab from '../components/ProfileTab';
import ProjectsTab from '../components/ProjectsTab';
import SettingsTab from '../components/SettingsTab';
import Footer from '../components/Footer';

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
      <header className="main-header">
        <div className="container header-container">
          <div className="header-left">
            <div className="logo">
              <div className="logo-icon">
                <img src="/images/logos/Bot.svg" alt="AI Market Logo" className="icon-white" />
              </div>
              <div>
                <h1 className="logo-title">AI Community</h1>
                <p className="logo-subtitle">Сообщество разработчиков</p>
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
              <img src="/images/icons/ui/UserProfile.svg" alt="User Profile"/>
            </button>
            <button className="btn btn--primary login-button" onClick={handleLogout}>
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="account-main">
        <div className="container account-container">
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
                  {/* <div className="stat">
                    <span className="stat-value">2</span>
                    <span className="stat-label">проекта</span>
                  </div> */}
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

          <div className="account-content">
            {activeTab === 'profile' && (
              <ProfileTab user={user} />
            )}

            {activeTab === 'projects' && (
              <ProjectsTab />
            )}

            {activeTab === 'settings' && (
              <SettingsTab />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}