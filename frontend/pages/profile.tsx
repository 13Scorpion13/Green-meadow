import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import ProfileTab from '@/components/ProfileTab';
import ProjectsTab from '@/components/ProjectsTab';
import SettingsTab from '@/components/SettingsTab';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

interface Agent {
  id: string;
  name: string;
  slug: string;
  agent_url: string;
  description: string;
  category: null;
  price: number | null;
  avg_raiting: number | null;
  reviews_count: number | null;
  created_at: string;
  updated_at: string;
  // developer: object | null;
}

export default function ProfilePage() {
  const { user, logout, loading, updateAvatar } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [projects, setProjects] = useState<Agent[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const [uploading, setUploading] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }

    setUploading(true);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error("Токен не найден");

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY}/users/me/avatar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Ошибка загрузки аватара");
      }

      const result = await response.json();

      // ✅ Обновляем user в контексте
      // Это зависит от твоего AuthContext — ниже пример
      updateAvatar(result.avatar_url); // ← вызовем хук

      // Также можно обновить локально, если не используешь context
      // setLocalUser(prev => ({ ...prev, avatar_url: result.avatar_url }));

      alert("Аватар успешно обновлён!");

    } catch (err) {
      console.error("Ошибка загрузки аватара:", err);
      alert(err instanceof Error ? err.message : "Неизвестная ошибка");
    } finally {
      setUploading(false);
      // Сбросим input, чтобы можно было снова выбрать тот же файл
      e.target.value = '';
    }
  };

  useEffect(() => {
    if (!user) return;

    const fetchUserProjects = async () => {
      setLoadingProjects(true);
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error("Токен не найден");
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY}/agents/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
        }

        const agents: Agent[] = await response.json();
        setProjects(agents);

      } catch (err) {
        console.error("Не удалось получить проекты:", err);
        setProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchUserProjects();
  }, [user]);

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
      <Header />

      <main className="account-main">
        <div className="container account-container">
          <aside className="account-sidebar">
            <div className="user-profile-card">
              {/* 🖼️ Аватар с редактором */}
              <div className="avatar-container" style={{ position: 'relative', display: 'inline-block', width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden' }}>
                <img
                  src={user.avatar_url || "/images/icons/ui/user.png"} // ← fallback
                  alt="Аватар"
                  className="user-avatar"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                    cursor: "pointer",
                    transition: "transform 0.2s ease",
                  }}
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                />

                {/* 🖋️ Карандашик при наведении */}
                <div
                  className="avatar-edit-overlay"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity 0.2s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 -5 24 24">
                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                    <path d="M19 11c1.105 0 2-.9 2-2s-.895-2-2-2a2 2 0 00-2 2c0 1.1.895 2 2 2z" />
                  </svg>
                </div>

                {/* Скрытый input для загрузки файла */}
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleAvatarUpload}
                />
              </div>

              <div className="user-info">
                <h2 className="user-name">
                  {user.developer
                    ? `${user.developer.first_name} ${user.developer.last_name}`
                    : user.nickname
                  }
                </h2>
                <p className="user-email">{user.email}</p>
                {/* <div className="user-stats">
                  <div className="stat">
                    <span className="stat-value">{new Date().toLocaleDateString()}</span>
                    <span className="stat-label">Зарегистрирован</span>
                  </div>
                </div> */}
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
                <span>Проекты ({loadingProjects ? "Загрузка..." : projects.length})</span>
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
              <ProjectsTab projects={projects} loading={loadingProjects} />
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