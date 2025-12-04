// src/components/Header.tsx
"use client";

import Link from 'next/link';
import { useAuth } from '../context/AuthContext'; // ← путь может отличаться — смотри ниже!
import { useRouter } from 'next/navigation'; // ⚠️ важно: next/navigation для App Router
import { useState, useEffect, useRef } from 'react';

export default function Header() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Этот хук будет закрывать меню, если кликнуть вне его
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    // Добавляем слушатель, когда компонент монтируется
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Убираем слушатель, когда компонент размонтируется
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleLogout = () => {
    if (window.confirm('Вы уверены, что хотите выйти?')) {
    logout();
    router.push('/'); // или router.push('/login')
    }
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
              {/* <a href="#">Как работает</a> */}
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

        <div className="header-right" ref={dropdownRef}>
          {user ? (
            <>
              {/* Кнопка-иконка, которая теперь открывает меню */}
              <button
                className="icon-button"
                id="user-profile-button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)} // Переключаем состояние меню
              >
                <img src="/images/icons/ui/UserProfile.svg" alt="User Profile" />
              </button>
          
              {/* Само выпадающее меню, которое появляется при isDropdownOpen === true */}
              {isDropdownOpen && (
                <div className="profile-dropdown">
                  <div className="dropdown-user-info">
                    <p className="dropdown-user-name">
                      {user.developer
                        ? `${user.developer.first_name} ${user.developer.last_name}`
                        : user.nickname}
                    </p>
                    <p className="dropdown-user-email">{user.email}</p>
                  </div>
                  <ul className="dropdown-menu">
                    <li>
                      <Link href="/profile" onClick={() => setIsDropdownOpen(false)}>
                        <div className='icon-with-text'>
                        <img src="/images/icons/ui/editProfile.svg" alt="Профиль" className="menu-item-icon" />
                        Профиль
                        </div>
                      </Link>
                    </li>
                    <li>
                      <button onClick={handleLogout}>
                      <div className='icon-with-text'>
                        <img src="/images/icons/ui/logoutProfile.svg" alt="Выйти из аккаунта" className="menu-item-icon" />
                          Выйти
                        </div>
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </>
          ) : (
            // Если пользователь не авторизован, показываем кнопку входа
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