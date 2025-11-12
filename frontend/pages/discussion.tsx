"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface Comment {
  id: number;
  author: string;
  avatar: string;
  text: string;
  created_at?: string; // необязательное поле
}

interface Discussion {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
}

const DiscussionPage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const contentId = typeof window !== 'undefined'
    ? sessionStorage.getItem('selectedDiscussionId') || ''
    : '';

  // Защита от прямого захода без ID
  useEffect(() => {
    if (!contentId) {
      router.push('/community/discussions');
      return;
    }
  }, [contentId, router]);

  // Загрузка данных — ТОЛЬКО GET
  useEffect(() => {
    if (!contentId) return;

    const fetchData = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // 1. Получаем обсуждение
        const discussionRes = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY}/contents/${contentId}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (!discussionRes.ok) throw new Error(`HTTP ${discussionRes.status}`);
        const discussionData: Discussion = await discussionRes.json();

        // Форматируем дату
        const formattedDate = discussionData.created_at
          ? new Date(discussionData.created_at).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })
          : 'Сегодня';

        setDiscussion({ ...discussionData, created_at: formattedDate });

        // 2. Получаем комментарии
        const commentsRes = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY}/contents/${contentId}/comments`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (!commentsRes.ok) throw new Error(`HTTP ${commentsRes.status}`);
        const rawComments: any[] = await commentsRes.json();

        const formattedComments = rawComments.map((c, idx) => ({
          id: c.id || idx + 1,
          author: c.user_id === user?.id
            ? (user?.nickname || 'Вы')
            : (c.author_nickname || 'Пользователь'),
          avatar: c.author_avatar || '/images/icons/ui/UserProfile.svg',
          text: c.content || c.text || '',
        }));

        setComments(formattedComments);
      } catch (err: any) {
        setError(err.message || 'Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [contentId, user]);

  // Локальное добавление комментария — БЕЗ отправки на сервер
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim() && discussion) {
      setComments([
        ...comments,
        {
          id: comments.length + 1,
          author: user?.nickname || 'Вы',
          avatar: '/images/icons/ui/UserProfile.svg',
          text: commentText,
        },
      ]);
      setCommentText('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-red-500">
          <p>❌ {error}</p>
          <button className="btn btn--primary mt-4" onClick={() => window.location.reload()}>
            Повторить
          </button>
        </div>
      </div>
    );
  }

  if (!discussion) return null;

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
              <Link href="/">Каталог</Link>
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
        <div className="back-to-catalog">
          <Link href="/community/discussions" className="btn btn--secondary">
            Назад к обсуждениям
          </Link>
        </div>

        <div className="discussion-page">
          <div className="agent-card-detailed discussion-card">
            <div className="agent-header">
              <div className="agent-avatar" style={{ width: 48, height: 48 }}>
                <img src="/images/icons/ui/UserProfile.svg" alt="author" className="avatar-img" />
              </div>
              <div className="agent-info">
                <h2 className="agent-name">
                  {discussion.user_id === user?.id
                    ? (user?.nickname || 'Вы')
                    : 'Пользователь'}
                </h2>
                <span className="agent-date">{discussion.created_at}</span>
              </div>
            </div>

            <h3 className="discussion-title">{discussion.title}</h3>
            <p className="discussion-description">{discussion.content}</p>
          </div>

          <div className="comments-section-outer">
            <h2>Ответы ({comments.length})</h2>
            <div className="comments-section">
              <div className="comments-list">
                {comments.map((c) => (
                  <div key={c.id} className="comment-item">
                    <div className="comment-header">
                      <div className="comment-author-info">
                        <img src={c.avatar} alt="User Avatar" className="comment-avatar" />
                        <span className="comment-author">{c.author}:</span>
                      </div>
                      <div className="comment-date">недавно</div>
                    </div>
                    <div className="comment-text">{c.text}</div>
                    <button className="reply-button">Ответить</button>
                  </div>
                ))}
              </div>

              <h3>Оставить ответ</h3>
              <div className="comment-form">
                <textarea
                  placeholder="Напишите ваш комментарий..."
                  rows={4}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button
                  className="btn btn--primary"
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                >
                  Отправить ответ
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

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
            {/* остальное без изменений */}
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

export default DiscussionPage;