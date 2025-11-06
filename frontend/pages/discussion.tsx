"use client";

import React, { useState } from 'react';
import Link from 'next/link';

const mockDiscussion = {
  topic: 'Какой фреймворк лучше для создания AI-агентов?',
  author: 'Сергей Кузнецов',
  date: '5 ноября 2025',
  avatar: '/images/icons/ui/UserProfile.svg',
  description: 'Давайте обсудим, какой стек технологий и фреймворк лучше всего подходит для разработки современных AI-агентов. Делитесь опытом и советами!',
};

const initialComments = [
  { id: 1, author: 'Ольга', avatar: '/images/icons/ui/UserProfile.svg', text: 'Я использую FastAPI и довольна.' },
  { id: 2, author: 'Дмитрий', avatar: '/images/icons/ui/UserProfile.svg', text: 'А кто пробовал LangChain?' },
];

const DiscussionPage: React.FC = () => {
  const [comments, setComments] = useState(initialComments);
  const [commentText, setCommentText] = useState('');

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      setComments([
        ...comments,
        { id: comments.length + 1, author: 'Вы', avatar: '/images/icons/ui/UserProfile.svg', text: commentText },
      ]);
      setCommentText('');
    }
  };

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
        <div className="back-to-catalog">
          <Link href="/" className="btn btn--secondary">Назад в каталог</Link>
        </div>

        <div className="discussion-page">
          {/* Карточка обсуждения */}
          <div className="agent-card-detailed discussion-card">
            <div className="agent-header">
              <div className="agent-avatar" style={{ width: 48, height: 48, fontSize: '1.5rem' }}>
                <img src={mockDiscussion.avatar} alt="author" className="avatar-img" />
              </div>
              <div className="agent-info">
                <h2 className="agent-name">{mockDiscussion.author}</h2>
                <span className="agent-date">{mockDiscussion.date}</span>
              </div>
            </div>

            <h3 className="discussion-title">{mockDiscussion.topic}</h3>
            <p className="discussion-description">{mockDiscussion.description}</p>
          </div>

          {/* Раздел комментариев */}
          <div className="comments-section-outer">
            <h2>Ответы</h2>
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

              {/* Форма добавления комментария */}
              <h3>Оставить ответ</h3>
              <div className="comment-form">
                <textarea
                  placeholder="Напишите ваш комментарий или вопрос..."
                  rows={4}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button
                  className="btn btn--primary"
                  onClick={handleAddComment}
                  type="button"
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

export default DiscussionPage;