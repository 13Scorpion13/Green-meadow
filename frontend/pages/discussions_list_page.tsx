"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const DiscussionsListPage: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"all" | "active" | "unanswered" | "my" | "member">("all");
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
          user_id: item.user_id,
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

        const placeholders = [
         {
           id: 'stub-1',
           title: 'Заглушка: Как начать работу с модулем?',
           excerpt: 'Краткое описание: инструкция по началу работы и настройки модуля...',
           user_id: 'stub_user_1',
           avatar: "/images/icons/ui/UserProfile.svg",
           date: '1 ноября 2025',
           replies: 2,
           likes: 5,
         },
         {
           id: 'stub-2',
           title: 'Заглушка: Проблема с загрузкой данных',
           excerpt: 'Краткое описание: возможные причины ошибки при загрузке контавыавыавыавыавыавппппппппппппппппппппппппппппппппппппппппппппппппппппппппппппппппппппппппппппппппппппппппппппппппппппппппппппппппппыаента...',
           user_id: 'stub_user_2',
           avatar: "/images/icons/ui/UserProfile.svg",
           date: '28 октября 2025',
           replies: 0,
           likes: 0,
         },
         {
           id: 'stub-3',
           title: 'Заглушка: Проблема с загрузкой данных',
           excerpt: 'Краткое описание: возможные причины ошибки при загрузке контента...',
           user_id: 'stub_user_2',
           avatar: "/images/icons/ui/UserProfile.svg",
           date: '28 октября 2025',
           replies: 0,
           likes: 0,
         },
         {
           id: 'stub-4',
           title: 'Заглушка: Проблема с загрузкой данных',
           excerpt: 'Краткое описание: возможные причины ошибки при загрузке контента...',
           user_id: 'stub_user_2',
           avatar: "/images/icons/ui/UserProfile.svg",
           date: '28 октября 2025',
           replies: 0,
           likes: 0,
         },
         {
           id: 'stub-5',
           title: 'Заглушка: Проблема с загрузкой данных',
           excerpt: 'Краткое описание: возможные причины ошибки при загрузке контента...',
           user_id: 'stub_user_2',
           avatar: "/images/icons/ui/UserProfile.svg",
           date: '28 октября 2025',
           replies: 0,
           likes: 0,
         },
        ];
        const combined = [...placeholders, ...formattedData];

        setDiscussions(combined);
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
    if (activeTab == "my") return d.replies === 0; //новые табы
    if (activeTab == "member") return d.replies === 0; //новые табы
    return true;
  });
  console.log(filteredDiscussions)

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
    <div className="min-h-screen discussions-page-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto"></div>
        <p className="mt-4 text-lg">Загрузка обсуждений...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen discussions-page-background flex items-center justify-center">
      <div className="text-center text-red-500">
        <p>❌ Ошибка загрузки: {error}</p>
        <button className="btn btn--primary mt-4" onClick={() => window.location.reload()}>
          Попробовать снова
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen discussions-page-background">
      <Header />

      <main className="main-content container">
        <div className="discussions-header">
          <div className="back-to-catalog">
            <Link href="/community" className="btn btn--secondary">
              Назад в сообщество
            </Link>
          </div>
          <div className="discussions-title-bar">
            <h1 className="page-title">Обсуждения ({`${discussions.length}`})</h1>
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
          <button className={`tab-button ${activeTab === "my" ? "active" : ""}`} onClick={() => setActiveTab("my")}>
            Мои обсуждения
          </button>
          <button className={`tab-button ${activeTab === "member" ? "active" : ""}`} onClick={() => setActiveTab("member")}>
            Участник
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
                        {/* {d.userId === user?.id 
                          ? (user?.nickname || "Вы") 
                          : "Пользователь"} */}
                        {`Пользователь ${d.user_id.slice(0, 8)}...`}
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
                <a className="read-more-link" onClick={handleCardClick(d.id)}>
                  Читать далее →
                </a>
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
                <button type="button" className="btn btn--simple" onClick={handleCloseModal}>Отмена</button>
                <button type="submit" className="btn btn--primary" disabled={!title.trim() || !description.trim()}>
                  Опубликовать обсуждение
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default DiscussionsListPage;