"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Типы данных согласно твоему API (см. ProjectsTab)
interface Agent {
  id: string; // UUID
  name: string;
  slug?: string; // если есть — используем, иначе id
  description: string;
  category?: string | null;
  price?: number | null;
  avg_raiting?: number | null; // ← опечатка в API, да — "raiting"
  reviews_count?: number | null;
  created_at: string;
  updated_at: string;
  is_recommended?: boolean;
  tags?: string[]; // ← если бэк не даёт — эмулируем
}

const HomePage: React.FC = () => {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка агентов
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY}/agents`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          // cache: 'no-store', // для SSR/ISR — можно добавить при необходимости
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: Agent[] = await response.json();
        setAgents(data);
      } catch (err: any) {
        console.error('Ошибка загрузки агентов:', err);
        setError(err.message || 'Не удалось загрузить агентов');
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  // Генерация аватара: первые 1-2 буквы имени, заглавные
  const getAvatarInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'AI';
  };

  // Генерация тегов (если API не возвращает `tags`)
  // Можно заменить на `agent.tags` позже
  const extractTags = (description: string, category?: string | null): string[] => {
    const tags: string[] = [];
    if (category && category !== 'null') tags.push(category);
    // Простая эвристика: ключевые слова из описания
    const keywords = ['React', 'Python', 'Node.js', 'OCR', 'Фитнес', 'Здоровье', 'Документы', 'Автоматизация'];
    keywords.forEach(kw => {
      if (description.toLowerCase().includes(kw.toLowerCase())) {
        tags.push(kw);
      }
    });
    return [...new Set(tags)].slice(0, 4); // уникальные, до 4 штук
  };

  const handleAgentClick = (agent: Agent) => (e: React.MouseEvent) => {
    e.preventDefault();
    const slug = agent.slug || agent.id;
    router.push(`/agent/${slug}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header — без изменений */}
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
              <Link href="/HomePage">Каталог</Link>
              <a href="#">Как работает</a>
              <a href="/articles">Статьи</a>
              <a href="/DiscussionsListPage">Сообщество</a>
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

      {/* Hero Section — без изменений */}
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
                <div className="stat-value-primary">{loading ? '---' : `${agents.length}+`}</div>
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
        {/* Categories (можно оставить статику, или загрузить /categories позже) */}
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
              {/* Добавь остальные категории по мере необходимости */}
            </div>
          </div>
        </section>

        {/* Top Agents — динамически из API */}
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

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary mx-auto"></div>
                  <p className="mt-3 text-gray-500">Загрузка агентов...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">
                <p>❌ {error}</p>
                <button
                  className="btn btn--primary mt-4"
                  onClick={() => window.location.reload()}
                >
                  Повторить
                </button>
              </div>
            ) : agents.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>Пока нет доступных агентов.</p>
              </div>
            ) : (
              <div className="agents-grid">
                {agents.map((agent) => {
                  const avatar = getAvatarInitials(agent.name);
                  const tags = extractTags(agent.description, agent.category);
                  const rating = agent.avg_raiting ?? 0;
                  const reviews = agent.reviews_count ?? 0;

                  return (
                    <a
                      key={agent.id}
                      href={`/agent/${agent.slug || agent.id}`}
                      className="ai-card gradient-border animate-fadeIn"
                      onClick={handleAgentClick(agent)}
                    >
                      {agent.is_recommended && (
                        <div className="recomended-badge">
                          <img src="/images/icons/ui/Zap.svg" alt="Zap Icon" />
                          Рекомендуем
                        </div>
                      )}
                      <div className="agent-header">
                        <div className="agent-avatar">{avatar}</div>
                        <div className="agent-info">
                          <h3 className="agent-name">{agent.name}</h3>
                          <p className="agent-category">
                            {agent.category || 'Без категории'}
                          </p>
                        </div>
                      </div>
                      <p className="agent-description">{agent.description}</p>
                      <div className="agent-tags">
                        {tags.map((tag, i) => (
                          <div key={i} className="tag">
                            {tag}
                          </div>
                        ))}
                      </div>
                      <div className="agent-stats">
                        <div className="stat">
                          <img src="/images/icons/ui/Star.svg" alt="Star Icon" />
                          <span>{rating > 0 ? rating.toFixed(1) : '—'}</span>
                          <span>({reviews})</span>
                        </div>
                        <div className="stat">
                          <img src="/images/icons/ui/Clock.svg" alt="Clock Icon" />
                          <span>—</span> {/* ← бэк не даёт время ответа — заглушка */}
                        </div>
                        <div className="stat">
                          <img src="/images/icons/ui/Users.svg" alt="Users Icon" />
                          <span>{reviews}</span>
                        </div>
                      </div>
                      <div className="agent-footer">
                        <div className="agent-price">
                          <p className="price">
                            {agent.price != null ? `₽${agent.price}` : 'Бесплатно'}
                          </p>
                          <p className="price-period"></p>
                        </div>
                        <button className="rent-button">Подробнее</button>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer — без изменений */}
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
                <li><a href="#">Как арендовать</a></li>
                <li><a href="#">Гарантии</a></li>
                <li><a href="#">Поддержка</a></li>
              </ul>
            </div>
            <div className="footer-links">
              <h3 className="footer-heading">Для разработчиков</h3>
              <ul>
                <li><a href="#">Разместить агента</a></li>
                <li><a href="#">API документация</a></li>
                <li><a href="#">Комиссии</a></li>
              </ul>
            </div>
            <div className="footer-links">
              <h3 className="footer-heading">Компания</h3>
              <ul>
                <li><a href="#">О нас</a></li>
                <li><a href="#">Блог</a></li>
                <li><a href="#">Контакты</a></li>
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