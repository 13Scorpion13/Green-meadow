"use client";

import React, { useState } from 'react';
import Link from 'next/link';

const mockArticle = {
  title: 'Как создать AI-агента для автоматизации задач',
  author: 'Иван Петров',
  date: '5 ноября 2025',
  avatar: '/images/icons/ui/UserProfile.svg',
  cover: '/images/illustrations/article-cover.jpg',
  content: `
    <p>В этой статье я расскажу, как создать собственного AI-агента для автоматизации рутинных задач. Мы рассмотрим основные этапы разработки, выбор технологий и лучшие практики.</p>
    <h2>1. Постановка задачи</h2>
    <p>Определите, какие задачи должен решать ваш агент. Чётко сформулируйте цели: например, парсинг данных, генерация отчётов, ответы на частые вопросы пользователей или помощь в код-ревью.</p>
    <blockquote>
      Хорошая постановка задачи — 50% успеха. Не пытайтесь «сделать всё сразу» — начните с узкой, но полезной функции.
    </blockquote>
    <h2>2. Выбор инструментов</h2>
    <p>Для начала можно использовать Python и популярные библиотеки:</p>
    <ul>
      <li><strong>LangChain</strong> — оркестрация LLM и инструментов</li>
      <li><strong>LLamaIndex</strong> — индексация и поиск в документах</li>
      <li><strong>FastAPI</strong> — для backend-API</li>
      <li><strong>React + Next.js</strong> — для интерфейса (если нужен UI)</li>
    </ul>
    <h3>Пример инициализации агента:</h3>
    <pre><code>from langchain.agents import AgentExecutor, create_react_agent
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o")
agent = create_react_agent(tools, prompt, llm)</code></pre>
    <h2>3. Реализация</h2>
    <p>Создайте прототип, протестируйте и оптимизируйте его:</p>
    <ol>
      <li>Напишите минимальное ядро агента.</li>
      <li>Добавьте обработку ошибок и логирование.</li>
      <li>Интегрируйте с вашими данными (базы, API, документы).</li>
      <li>Протестируйте на реальных сценариях.</li>
    </ol>
    <h2>4. Итоги</h2>
    <p>AI-агенты помогают экономить время и ресурсы. Даже простые агенты могут брать на себя до 30% рутинной работы разработчика.</p>
  `,
};

const initialComments = [
  { id: 1, author: 'Мария', avatar: '/images/icons/ui/UserProfile.svg', text: 'Спасибо за статью! Очень полезно.' },
  { id: 2, author: 'Алексей', avatar: '/images/icons/ui/UserProfile.svg', text: 'А какие библиотеки лучше использовать для NLP?' },
];

const ArticlePage: React.FC = () => {
  const [comments, setComments] = useState(initialComments);
  const [commentText, setCommentText] = useState('');
  const [likes, setLikes] = useState(12);
  const [liked, setLiked] = useState(false);

  const handleAddComment = () => {
    if (commentText.trim()) {
      setComments([
        { id: Date.now(), author: 'Вы', avatar: '/images/icons/ui/UserProfile.svg', text: commentText },
        ...comments,
      ]);
      setCommentText('');
    }
  };

  const handleLike = () => {
    if (!liked) {
      setLikes(likes + 1);
      setLiked(true);
    }
  };

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
        {/* Back button */}
        <div className="back-to-catalog">
          <Link href="/community" className="btn btn--secondary">
            Назад в сообщество
          </Link>
        </div>

        {/* Article container */}
        <article className="article-page">
          {/* Article cover */}
          <div className="article-cover">
            <img
              src={mockArticle.cover}
              alt="Обложка статьи"
              className="article-cover-img"
            />
          </div>

          {/* Article title + meta */}
          <div className="article-meta">
            <h1 className="article-title">{mockArticle.title}</h1>
            <div className="article-author-bar">
              <div className="author-info">
                <img src={mockArticle.avatar} alt="Автор" className="author-avatar" />
                <div>
                  <span className="author-name">{mockArticle.author}</span>
                  <span className="article-date">{mockArticle.date}</span>
                </div>
              </div>
              <div className="article-actions">
                <button
                  className={`btn btn--outline ${liked ? 'btn--liked' : ''}`}
                  onClick={handleLike}
                >
                  👍 {likes}
                </button>
                <button className="btn btn--outline">
                  <img
                    src="/images/icons/ui/Share.svg"
                    alt="Поделиться"
                    className="icon-sm"
                  />
                  Поделиться
                </button>
              </div>
            </div>
          </div>

          {/* Article body */}
          <div
            className="article-content rich-text"
            dangerouslySetInnerHTML={{ __html: mockArticle.content }}
          />

          {/* Tags */}
          <div className="article-tags">
            <span>Теги:</span>
            <div className="tag">AI-агенты</div>
            <div className="tag">Разработка</div>
            <div className="tag">Автоматизация</div>
          </div>

          {/* Comments */}
          <div className="comments-section-outer">
            <h2>Комментарии ({comments.length})</h2>
            <div className="comments-section">
              <h3>Оставить комментарий</h3>
              <div className="comment-form">
                <textarea
                  placeholder="Поделитесь своим мнением..."
                  rows={4}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button
                  className="btn btn--primary"
                  onClick={handleAddComment}
                  type="button"
                >
                  Отправить
                </button>
              </div>

              <h3>Обсуждение</h3>
              <div className="comments-list">
                {comments.map((c) => (
                  <div key={c.id} className="comment-item">
                    <div className="comment-header">
                      <div className="comment-author-info">
                        <img src={c.avatar} alt="User Avatar" className="comment-avatar" />
                        <span className="comment-author">{c.author}</span>
                      </div>
                      <div className="comment-date">недавно</div>
                    </div>
                    <div className="comment-text">{c.text}</div>
                    <button className="reply-button">Ответить</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </article>
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

export default ArticlePage;