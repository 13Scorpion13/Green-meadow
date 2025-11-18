// src/components/Header.tsx
"use client";

import Link from 'next/link';
import { useAuth } from '../context/AuthContext'; // ← путь может отличаться — смотри ниже!
import { useRouter } from 'next/navigation'; // ⚠️ важно: next/navigation для App Router

export default function Header() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/'); // или router.push('/login')
  };

  // Пока идёт загрузка — показываем "Войти/Зарегистрироваться" (нейтрально)
  // Или можно skeleton, но для шапки это редко нужно
  if (loading) {
    return (
      <header className="main-header">
        <div className="container header-container">
          <div className="header-left">
            <div className="logo">
              <div className="logo-icon">
                <img src="/images/logos/Bot.svg" alt="AI Market Logo" />
              </div>
              <div>
                <h1 className="logo-title">AI Community</h1>
                <p className="logo-subtitle">Сообщество разработчиков</p>
              </div>
            </div>
            <nav className="main-nav">
              <Link href="/">Каталог</Link>
              <a href="#">Как работает</a>
              <a href="/articles">Статьи</a>
              <a href="/discussions_list_page">Сообщество</a>
            </nav>
          </div>

          <div className="header-right">
            <button className="icon-button" disabled>
              <img src="/images/icons/ui/UserProfile.svg" alt="User Profile" />
            </button>
            <span className="btn btn--primary login-button" style={{ opacity: 0.6 }}>Загрузка...</span>
            <button className="menu-button" disabled>
              <img src="/images/icons/ui/Menu.svg" alt="Menu" />
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="main-header">
      <div className="container header-container">
        <div className="header-left">
          <div className="logo">
            <div className="logo-icon">
              <img src="/images/logos/Bot.svg" alt="AI Market Logo" />
            </div>
            <div>
              <h1 className="logo-title">AI Community</h1>
              <p className="logo-subtitle">Сообщество разработчиков</p>
            </div>
          </div>
          <nav className="main-nav">
            <Link href="/">Каталог</Link>
            <a href="#">Как работает</a>
            <a href="/articles">Статьи</a>
            <a href="/discussions_list_page">Сообщество</a>
          </nav>
        </div>

        <div className="header-right">

          {user ? (
            <Link href="/profile" className="icon-button" id="user-profile-button">
              <img src="/images/icons/ui/UserProfile.svg" alt="User Profile" />
            </Link>
          ) : (
            <button className="icon-button" id="user-profile-button" disabled>
              <img src="/images/icons/ui/UserProfile.svg" alt="User Profile" />
            </button>
          )}

          {user ? (
            <button
              className="btn btn--primary login-button"
              onClick={handleLogout}
            >
              Выйти
            </button>
          ) : (
            <Link href="/login" className="btn btn--primary login-button">
              Войти/Зарегистрироваться
            </Link>
          )}

          <button className="menu-button">
            <img src="/images/icons/ui/Menu.svg" alt="Menu" />
          </button>
        </div>
      </div>
    </header>
  );
}