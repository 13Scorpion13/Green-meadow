"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';

// Mock-данные
const mockDiscussions = [
  {
    id: 1,
    title: "Какой фреймворк лучше для создания AI-агентов?",
    excerpt: "Давайте обсудим, какой стек технологий и фреймворк лучше всего подходит для разработки современных AI-агентов.",
    author: "Сергей Кузнецов",
    avatar: "/images/icons/ui/UserProfile.svg",
    date: "5 ноября 2025",
    replies: 7,
    likes: 12,
  },
  {
    id: 2,
    title: "Проблема с токенизацией в LangChain",
    excerpt: "При использовании CustomDocumentLoader сталкиваюсь с ошибкой при чанкировании...",
    author: "Анна В.",
    avatar: "/images/icons/ui/UserProfile.svg",
    date: "4 ноября 2025",
    replies: 3,
    likes: 5,
  },
  {
    id: 3,
    title: "Интеграция CodeMaster Pro с VS Code — нет подсветки?",
    excerpt: "У кого-то получилось настроить подсветку сгенерированного кода в редакторе?",
    author: "Дмитрий",
    avatar: "/images/icons/ui/UserProfile.svg",
    date: "3 ноября 2025",
    replies: 12,
    likes: 28,
  },
  {
    id: 4,
    title: "Кто использует агенты в продакшене? Делитесь кейсами!",
    excerpt: "Хочу понять, как другие внедряют агентов в реальные бизнес-процессы.",
    author: "Мария Л.",
    avatar: "/images/icons/ui/UserProfile.svg",
    date: "1 ноября 2025",
    replies: 5,
    likes: 9,
  },
  {
    id: 5,
    title: "Предложение: добавить поддержку WebSockets в API",
    excerpt: "Было бы удобно получать стриминг в реальном времени, а не polling.",
    author: "Олег",
    avatar: "/images/icons/ui/UserProfile.svg",
    date: "30 октября 2025",
    replies: 0,
    likes: 17,
  },
];

const DiscussionsListPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"all" | "active" | "unanswered">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  const filteredDiscussions = mockDiscussions.filter((d) => {
    if (activeTab === "unanswered") return d.replies === 0;
    if (activeTab === "active") return d.replies > 5;
    return true;
  });

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTitle("");
    setDescription("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    // 🚀 здесь будет отправка на бэкенд
    console.log("Новое обсуждение:", { title, description });

    // Имитация успешной публикации
    alert(`✅ Обсуждение создано!\n\n"${title}"\n\nОписание: ${description.substring(0, 50)}...`);
    handleCloseModal();
  };

  // Закрытие по Esc
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseModal();
    };
    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  // Закрытие по клику вне модалки
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        handleCloseModal();
      }
    };
    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isModalOpen]);

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

      <main className="main-content container">
        {/* Back + Title + Action */}
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

        {/* Tabs */}
        <div className="agent-tabs" style={{ marginBottom: "2rem" }}>
          <button
            className={`tab-button ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            Все обсуждения
          </button>
          <button
            className={`tab-button ${activeTab === "active" ? "active" : ""}`}
            onClick={() => setActiveTab("active")}
          >
            Активные
          </button>
          <button
            className={`tab-button ${activeTab === "unanswered" ? "active" : ""}`}
            onClick={() => setActiveTab("unanswered")}
          >
            Без ответов
          </button>
        </div>

        {/* List */}
        <div className="discussions-list-grid">
          {filteredDiscussions.length > 0 ? (
            filteredDiscussions.map((d) => (
              <Link href={`/discussions/${d.id}`} key={d.id} className="discussion-item-card">
                <div className="discussion-header">
                  <div className="discussion-meta">
                    <div className="discussion-author-info">
                      <img src={d.avatar} alt="Author" className="discussion-avatar" />
                      <span className="discussion-author">{d.author}</span>
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
              </Link>
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

        {/* Pagination (stub) */}
        {filteredDiscussions.length > 0 && (
          <div className="pagination">
            <button className="btn btn--outline" disabled>
              Назад
            </button>
            <span className="pagination-info">Страница 1 из 1</span>
            <button className="btn btn--outline" disabled>
              Вперёд
            </button>
          </div>
        )}
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" ref={modalRef}>
            <div className="modal-header">
              <h2 className="modal-title">Начать новое обсуждение</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="discussion-title" className="form-label">
                  Заголовок обсуждения
                </label>
                <input
                  id="discussion-title"
                  type="text"
                  className="form-input"
                  placeholder="Кратко опишите суть — например, «Проблема с токенизацией в LangChain»"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <p className="form-hint">
                  Это будет видно в ленте. Старайтесь быть конкретным — так вы получите больше ответов.
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="discussion-desc" className="form-label">
                  Подробное описание
                </label>
                <textarea
                  id="discussion-desc"
                  className="form-input"
                  rows={6}
                  placeholder="Опишите проблему, контекст, что уже пробовали, и что ожидаете от ответа…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
                <p className="form-hint">
                  Чем подробнее — тем выше шанс получить полезный ответ 👍
                </p>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={handleCloseModal}
                >
                  Отмена
                </button>
                <button type="submit" className="btn btn--primary" disabled={!title.trim() || !description.trim()}>
                  Опубликовать обсуждение
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

          <div className="footer-copyright">
            © 2025 AI Market. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DiscussionsListPage;