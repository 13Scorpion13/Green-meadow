"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const HomePage: React.FC = () => {
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);

  // Эмуляция клика по агенту (например, CodeMaster Pro)
  const handleAgentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDisclaimerOpen(true);
  };

  const handleContinue = () => {
    setIsDisclaimerOpen(false);
    // Здесь можно редиректнуть: router.push('/agent-details')
    alert('Переход на страницу агента (временно)');
  };

  const handleCancel = () => {
    setIsDisclaimerOpen(false);
  };

  // Опционально: имитация анимации при монтировании (например, fade-in)
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="main-header">
        <div className="container header-container">
          <div className="header-left">
            <div className="logo">
              <div className="logo-icon">
                <img src="/images/logos/Bot.svg" alt="AI Market Logo" />
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
              <img src="/images/icons/ui/ShoppingCart.svg" alt="Shopping Cart" />
            </button>
            <button className="icon-button" id="user-profile-button">
              <img src="/images/icons/ui/UserProfile.svg" alt="User Profile" />
            </button>
            <button className="btn btn--primary login-button">Войти/Зарегистрироваться</button>
            <button className="menu-button">
              <img src="/images/icons/ui/Menu.svg" alt="Menu" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-gradient"></div>
          <div className="hero-grid"></div>

          <div className="hero-particles">
            <div className="particle particle-1"></div>
            <div className="particle particle-2"></div>
            <div className="particle particle-3"></div>
            <div className="particle particle-4"></div>
            <div className="particle particle-5"></div>
            <div className="particle particle-6"></div>
          </div>

          <div className="hero-orbs">
            <div className="orb orb-1"></div>
            <div className="orb orb-2"></div>
            <div className="orb orb-3"></div>
          </div>

          <div className="hero-glow glow-1"></div>
          <div className="hero-glow glow-2"></div>
          <div className="hero-stars">
            <div className="star star-1"></div>
            <div className="star star-2"></div>
            <div className="star star-3"></div>
            <div className="star star-4"></div>
            <div className="star star-5"></div>
            <div className="star star-6"></div>
          </div>
          <div className="hero-waves"></div>
          <div className="hero-data-points">
            <div className="data-point data-point-1"></div>
            <div className="data-point data-point-2"></div>
            <div className="data-point data-point-3"></div>
            <div className="data-point data-point-4"></div>
            <div className="data-point data-point-5"></div>
            <div className="data-point data-point-6"></div>
          </div>
          <div className="hero-connections">
            <div className="connection connection-1"></div>
            <div className="connection connection-2"></div>
            <div className="connection connection-3"></div>
          </div>
        </div>

        <div className="hero-glow-1">
          <img src="/images/illustrations/Bot.svg" alt="Bot Icon" />
        </div>
        <div className="hero-glow-2">
          <img src="/images/icons/categories/CPU.svg" alt="CPU Icon" />
        </div>
        <div className="hero-glow-3">
          <img src="/images/illustrations/Sparkles.svg" alt="Sparkles Icon" />
        </div>

        <div className="container hero-container-inner">
          <div className="hero-content">
            <h1 className="hero-title">
              Арендуйте <span className="text-gradient">ИИ-агентов</span>
              <br />
              для ваших задач
            </h1>
            <p className="hero-subtitle">
              Найдите идеального ИИ-агента для автоматизации бизнеса, творчества и повседневных задач
            </p>

            <div className="search-container">
              <div className="search-card">
                <div className="search-inner">
                  <div className="search-input-container">
                    <img src="/images/icons/ui/Search.svg" alt="Search Icon" />
                    <input className="search-input" placeholder="Найти ИИ-агента..." />
                  </div>
                  <button className="search-button">
                    <img src="/images/icons/ui/Search.svg" alt="Search Icon" />
                    Поиск
                  </button>
                </div>
              </div>
            </div>

            <div className="stats-container">
              <div className="stat-card">
                <div className="stat-value-primary">1000+</div>
                <div className="stat-label">ИИ-агентов</div>
              </div>
              <div className="stat-card">
                <div className="stat-value-cyan">50+</div>
                <div className="stat-label">Категорий</div>
              </div>
              <div className="stat-card">
                <div className="stat-value-purple">10к+</div>
                <div className="stat-label">Пользователей</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="main-content">
        {/* Categories */}
        <section className="categories-section">
          <div className="container">
            <h2 className="section-title">
              Категории <span className="text-gradient">ИИ-агентов</span>
            </h2>
            <div className="categories-grid">
              <button className="category-button active">
                <img src="/images/icons/categories/AllCategories.svg" alt="All Categories" />
                <span>Все</span>
              </button>
              <button className="category-button">
                <img src="/images/icons/categories/Programming.svg" alt="Programming" />
                <span>Программирование</span>
              </button>
              {/* Можно добавить остальные категории по шаблону */}
            </div>
          </div>
        </section>

        {/* Top Agents */}
        <section className="top-ai-agents-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">
                Топ <span className="text-gradient">ИИ-агентов</span>
              </h2>
              <p className="section-subtitle">
                Самые популярные и эффективные ИИ-агенты, проверенные тысячами пользователей
              </p>
            </div>

            <div className="agents-grid">
              {/* CodeMaster Pro */}
              <a
                href="#"
                className="ai-card gradient-border animate-fadeIn"
                onClick={handleAgentClick}
              >
                <div className="recomended-badge">
                  <img src="/images/icons/ui/Zap.svg" alt="Zap Icon" />
                  Рекомендуем
                </div>
                <div className="agent-header">
                  <div className="agent-avatar">C</div>
                  <div className="agent-info">
                    <h3 className="agent-name">CodeMaster Pro</h3>
                    <p className="agent-category">Программирование</p>
                  </div>
                </div>
                <p className="agent-description">
                  Профессиональный ИИ-разработчик, специализирующийся на React, Node.js и Python. Создает
                  качественный код с тестами и документацией.
                </p>
                <div className="agent-tags">
                  <div className="tag">React</div>
                  <div className="tag">Python</div>
                  <div className="tag">Node.js</div>
                </div>
                <div className="agent-stats">
                  <div className="stat">
                    <img src="/images/icons/ui/Star.svg" alt="Star Icon" />
                    <span>4.9</span>
                    <span>(234)</span>
                  </div>
                  <div className="stat">
                    <img src="/images/icons/ui/Clock.svg" alt="Clock Icon" />
                    <span>5 мин</span>
                  </div>
                  <div className="stat">
                    <img src="/images/icons/ui/Users.svg" alt="Users Icon" />
                    <span>1250</span>
                  </div>
                </div>
                <div className="agent-footer">
                  <div className="agent-price">
                    <p className="price"> </p>
                    <p className="price-period"> </p>
                  </div>
                  <button className="rent-button">Подробнее</button>
                </div>
              </a>

              {/* AI Archivist */}
              <a href="/ai-archivist-details.html" className="ai-card gradient-border animate-fadeIn">
                <div className="agent-header">
                  <div className="agent-avatar">A</div>
                  <div className="agent-info">
                    <h3 className="agent-name">AI Archivist</h3>
                    <p className="agent-category">Документооборот</p>
                  </div>
                </div>
                <p className="agent-description">
                  Интеллектуальный агент для автоматизации работы с документами: классификация, извлечение
                  данных, поиск и архивирование.
                </p>
                <div className="agent-tags">
                  <div className="tag">Документы</div>
                  <div className="tag">OCR</div>
                  <div className="tag">Поиск</div>
                  <div className="tag">Автоматизация</div>
                </div>
                <div className="agent-stats">
                  <div className="stat">
                    <img src="/images/icons/ui/Star.svg" alt="Star Icon" />
                    <span>4.7</span>
                    <span>(180)</span>
                  </div>
                  <div className="stat">
                    <img src="/images/icons/ui/Clock.svg" alt="Clock Icon" />
                    <span>10 мин</span>
                  </div>
                  <div className="stat">
                    <img src="/images/icons/ui/Users.svg" alt="Users Icon" />
                    <span>800</span>
                  </div>
                </div>
                <div className="agent-footer">
                  <div className="agent-price">
                    <p className="price"> </p>
                    <p className="price-period"> </p>
                  </div>
                  <button className="rent-button">Подробнее</button>
                </div>
              </a>

              {/* Fitness AI */}
              <a href="/fitness-ai-details.html" className="ai-card gradient-border animate-fadeIn">
                <div className="agent-header">
                  <div className="agent-avatar">F</div>
                  <div className="agent-info">
                    <h3 className="agent-name">Fitness AI</h3>
                    <p className="agent-category">Здоровье и Фитнес</p>
                  </div>
                </div>
                <p className="agent-description">
                  Персональный ИИ-тренер, который разрабатывает индивидуальные программы тренировок и питания,
                  отслеживает прогресс и дает рекомендации.
                </p>
                <div className="agent-tags">
                  <div className="tag">Фитнес</div>
                  <div className="tag">Здоровье</div>
                  <div className="tag">Тренировки</div>
                  <div className="tag">Питание</div>
                </div>
                <div className="agent-stats">
                  <div className="stat">
                    <img src="/images/icons/ui/Star.svg" alt="Star Icon" />
                    <span>4.8</span>
                    <span>(310)</span>
                  </div>
                  <div className="stat">
                    <img src="/images/icons/ui/Clock.svg" alt="Clock Icon" />
                    <span>3 мин</span>
                  </div>
                  <div className="stat">
                    <img src="/images/icons/ui/Users.svg" alt="Users Icon" />
                    <span>1500</span>
                  </div>
                </div>
                <div className="agent-footer">
                  <div className="agent-price">
                    <p className="price"> </p>
                    <p className="price-period"> </p>
                  </div>
                  <button className="rent-button">Подробнее</button>
                </div>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="main-footer">
        <div className="container footer-container">
          <div className="footer-grid">
            <div className="footer-about">
              <div className="logo">
                <div className="logo-icon">
                  <img src="/images/logos/Bot.svg" alt="AI Market Logo" />
                </div>
                <span className="logo-title">AI Market</span>
              </div>
              <p className="footer-about-text">Лучший маркетплейс для аренды ИИ-агентов</p>
            </div>
            <div className="footer-links">
              <h3 className="footer-heading">Для клиентов</h3>
              <ul>
                <li>
                  <a href="#">Как арендовать</a>
                </li>
                <li>
                  <a href="#">Гарантии</a>
                </li>
                <li>
                  <a href="#">Поддержка</a>
                </li>
              </ul>
            </div>
            <div className="footer-links">
              <h3 className="footer-heading">Для разработчиков</h3>
              <ul>
                <li>
                  <a href="#">Разместить агента</a>
                </li>
                <li>
                  <a href="#">API документация</a>
                </li>
                <li>
                  <a href="#">Комиссии</a>
                </li>
              </ul>
            </div>
            <div className="footer-links">
              <h3 className="footer-heading">Компания</h3>
              <ul>
                <li>
                  <a href="#">О нас</a>
                </li>
                <li>
                  <a href="#">Блог</a>
                </li>
                <li>
                  <a href="#">Контакты</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-copyright">© 2025 AI Market. Все права защищены.</div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;