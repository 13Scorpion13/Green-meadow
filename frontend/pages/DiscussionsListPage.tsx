"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const DiscussionsListPage: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"all" | "active" | "unanswered">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  // Загрузка данных
  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY}/contents/`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        const formattedData = data.map((item: any) => ({
          id: item.id,
          title: item.title || "Без заголовка",
          excerpt: item.content 
            ? `${item.content.substring(0, 150)}${item.content.length > 150 ? '...' : ''}`
            : "Нет описания",
          userId: item.user_id,
          avatar: "/images/icons/ui/UserProfile.svg",
          date: item.created_at 
            ? new Date(item.created_at).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })
            : "Сегодня",
          replies: 0,
          likes: 0,
        }));

        setDiscussions(formattedData);
      } catch (err: any) {
        setError(err.message || "Не удалось загрузить обсуждения");
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussions();
  }, []);

  const filteredDiscussions = discussions.filter((d) => {
    if (activeTab === "unanswered") return d.replies === 0;
    if (activeTab === "active") return d.replies > 5;
    return true;
  });

  // 👇 Обработчик клика по карточке — сохраняем id и переходим
  const handleCardClick = (contentId: string) => () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('selectedDiscussionId', contentId);
    }
    router.push('/discussion');
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTitle("");
    setDescription("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    alert(`✅ Обсуждение создано!\n\n"${title}"`);
    handleCloseModal();
  };

  // ... (остальные useEffect — без изменений)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseModal();
    };
    if (isModalOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        handleCloseModal();
      }
    };
    if (isModalOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isModalOpen]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto"></div>
        <p className="mt-4 text-lg">Загрузка обсуждений...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center text-red-500">
        <p>❌ Ошибка загрузки: {error}</p>
        <button className="btn btn--primary mt-4" onClick={() => window.location.reload()}>
          Попробовать снова
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
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
              <Link href="/HomePage">Каталог</Link>
              <a href="#">Как работает</a>
              <a href="/articles">Статьи</a>
              <a href="/DiscussionsListPage">Сообщество</a>
            </nav>
          </div>

          <div className="header-right">
            <button className="icon-button" id="user-profile-button">
              <img src="/images/icons/ui/UserProfile.svg" alt="User Profile" />
            </button>
            <button className="btn btn--primary login-button">Выйти</button>
            <button className="menu-button">
              <img src="/images/icons/ui/Menu.svg" alt="Menu" />
            </button>
          </div>
        </div>
      </header>

      <main className="main-content container">
        <div className="discussions-header">
          <div className="back-to-catalog">
            <Link href="/community" className="btn btn--secondary">
              Назад в сообщество
            </Link>
          </div>
          <div className="discussions-title-bar">
            <h1 className="page-title">Обсуждения</h1>
            <button className="btn btn--primary" onClick={handleOpenModal}>
              + Начать обсуждение
            </button>
          </div>
        </div>

        <div className="agent-tabs" style={{ marginBottom: "2rem" }}>
          <button className={`tab-button ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>
            Все обсуждения
          </button>
          <button className={`tab-button ${activeTab === "active" ? "active" : ""}`} onClick={() => setActiveTab("active")}>
            Активные
          </button>
          <button className={`tab-button ${activeTab === "unanswered" ? "active" : ""}`} onClick={() => setActiveTab("unanswered")}>
            Без ответов
          </button>
        </div>

        <div className="discussions-list-grid">
          {filteredDiscussions.length > 0 ? (
            filteredDiscussions.map((d) => (
              // 👇 Заменили Link на div + onClick
              <div 
                key={d.id} 
                className="discussion-item-card"
                onClick={handleCardClick(d.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="discussion-header">
                  <div className="discussion-meta">
                    <div className="discussion-author-info">
                      <img src={d.avatar} alt="Author" className="discussion-avatar" />
                      <span className="discussion-author">
                        {d.userId === user?.id 
                          ? (user?.nickname || "Вы") 
                          : "Пользователь"}
                      </span>
                    </div>
                    <span className="discussion-date">{d.date}</span>
                  </div>
                  <div className="discussion-stats">
                    <span className="stat-badge">
                      <img src="/images/icons/ui/ChatBubble.svg" alt="Replies" className="stat-icon invert-white" />
                      {d.replies}
                    </span>
                    <span className="stat-badge">
                      <img src="/images/icons/ui/ThumbUp.svg" alt="Likes" className="stat-icon invert-white" />
                      {d.likes}
                    </span>
                  </div>
                </div>
                <h3 className="discussion-title">{d.title}</h3>
                <p className="discussion-excerpt">{d.excerpt}</p>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <h3>Обсуждений пока нет</h3>
              <p>Будьте первым, кто задаст вопрос или начнёт дискуссию!</p>
              <button className="btn btn--primary" onClick={handleOpenModal}>
                Начать обсуждение
              </button>
            </div>
          )}
        </div>

        {filteredDiscussions.length > 0 && (
          <div className="pagination">
            <button className="btn btn--outline" disabled>Назад</button>
            <span className="pagination-info">Страница 1 из 1</span>
            <button className="btn btn--outline" disabled>Вперёд</button>
          </div>
        )}
      </main>

      {/* Modal — без изменений */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" ref={modalRef}>
            <div className="modal-header">
              <h2 className="modal-title">Начать новое обсуждение</h2>
              <button className="modal-close" onClick={handleCloseModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="discussion-title" className="form-label">Заголовок обсуждения</label>
                <input
                  id="discussion-title"
                  type="text"
                  className="form-input"
                  placeholder="Кратко опишите суть..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="discussion-desc" className="form-label">Подробное описание</label>
                <textarea
                  id="discussion-desc"
                  className="form-input"
                  rows={6}
                  placeholder="Опишите проблему..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn--outline" onClick={handleCloseModal}>Отмена</button>
                <button type="submit" className="btn btn--primary" disabled={!title.trim() || !description.trim()}>
                  Опубликовать обсуждение
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="main-footer">
        <div className="container footer-container">
          <div className="footer-grid">
            <div className="footer-about">
              <div className="logo">
                <div className="logo-icon">
                  <img src="/images/logos/Bot.svg" alt="AI Market Logo" />
                </div>
                <span className="logo-title">AI Community</span>
              </div>
              <p className="footer-about-text">Лучшая площадка для поиска ИИ-агентов</p>
            </div>
            {/* другие блоки footer — без изменений */}
            <div className="footer-links">
              <h3 className="footer-heading">Для клиентов</h3>
              <ul>
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
          <div className="footer-copyright">© 2025 AI Community. Все права защищены.</div>
        </div>
      </footer>
    </div>
  );
};

export default DiscussionsListPage;