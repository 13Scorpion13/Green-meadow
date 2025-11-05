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
    <p>Определите, какие задачи должен решать ваш агент.</p>
    <h2>2. Выбор инструментов</h2>
    <p>Для начала можно использовать Python и популярные библиотеки машинного обучения.</p>
    <h2>3. Реализация</h2>
    <p>Создайте прототип, протестируйте и оптимизируйте его.</p>
    <h2>4. Итоги</h2>
    <p>AI-агенты помогают экономить время и ресурсы.</p>
  `,
};

const initialComments = [
  { id: 1, author: 'Мария', text: 'Спасибо за статью! Очень полезно.' },
  { id: 2, author: 'Алексей', text: 'А какие библиотеки лучше использовать для NLP?' },
];

const ArticlePage: React.FC = () => {
  const [comments, setComments] = useState(initialComments);
  const [commentText, setCommentText] = useState('');
  const [likes, setLikes] = useState(12);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      setComments([
        ...comments,
        { id: comments.length + 1, author: 'Вы', text: commentText },
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
        </div>
      </header>

      <main className="main-content container">
        <div className="article-page" style={{ maxWidth: 800, margin: '0 auto', background: 'var(--background-secondary, #181a20)', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.25)', padding: '2rem', color: 'var(--text-primary, #f3f3f3)' }}>
          <img src={mockArticle.cover} alt="cover" style={{ width: '100%', borderRadius: 12, marginBottom: '2rem', objectFit: 'cover', maxHeight: 320, background: '#222' }} />
          <h1 className="article-title" style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary, #fff)' }}>{mockArticle.title}</h1>
          <div className="article-author-block" style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
            <img src={mockArticle.avatar} alt="author" style={{ width: 48, height: 48, borderRadius: '50%', marginRight: 16, background: '#222', border: '1px solid #333' }} />
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary, #fff)' }}>{mockArticle.author}</div>
              <div style={{ color: 'var(--text-tertiary, #aaa)', fontSize: '0.95rem' }}>{mockArticle.date}</div>
            </div>
            <button className="btn btn--primary" style={{ marginLeft: 'auto', fontWeight: 600 }} onClick={() => setLikes(likes + 1)}>
              👍 Лайк ({likes})
            </button>
          </div>
          <div className="article-content" style={{ fontSize: '1.15rem', lineHeight: 1.7, marginBottom: '2.5rem', color: 'var(--text-primary, #eaeaea)' }} dangerouslySetInnerHTML={{ __html: mockArticle.content }} />
          <section className="comments-section" style={{ marginTop: '3rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary, #fff)' }}>Комментарии</h2>
            <ul className="comments-list" style={{ listStyle: 'none', padding: 0 }}>
              {comments.map((c) => (
                <li key={c.id} className="comment" style={{ background: 'var(--background-tertiary, #23242a)', borderRadius: 8, padding: '1rem', marginBottom: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.10)', color: 'var(--text-primary, #f3f3f3)' }}>
                  <span className="comment-author" style={{ fontWeight: 600, marginRight: 8, color: 'var(--text-secondary, #b3b3b3)' }}>{c.author}:</span> {c.text}
                </li>
              ))}
            </ul>
            <form className="comment-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} onSubmit={handleAddComment}>
              <textarea
                className="form-input"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Оставьте комментарий..."
                rows={3}
                required
                style={{ resize: 'vertical', borderRadius: 8, border: '1px solid #333', padding: '0.75rem', fontSize: '1rem', background: '#181a20', color: '#f3f3f3' }}
              />
              <button type="submit" className="btn btn--primary" style={{ alignSelf: 'flex-end', minWidth: 120 }}>Отправить</button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ArticlePage;
