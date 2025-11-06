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
        </div>
      </header>

      <main className="main-content container">
        <div className="discussion-page" style={{ maxWidth: 600, margin: '2rem auto', background: 'var(--background-secondary, #181a20)', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.25)', padding: '2rem', color: 'var(--text-primary, #f3f3f3)' }}>
          <div className="discussion-question-card" style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', background: 'var(--background-tertiary, #23242a)', borderRadius: 12, padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.10)' }}>
            <img src={mockDiscussion.avatar} alt="author" style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 16, background: '#222', border: '1px solid #333' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-primary, #fff)' }}>{mockDiscussion.author}</div>
              <div style={{ color: 'var(--text-tertiary, #aaa)', fontSize: '0.95rem', marginBottom: 4 }}>{mockDiscussion.date}</div>
              <div className="discussion-title" style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-primary, #fff)' }}>{mockDiscussion.topic}</div>
              <div className="discussion-description" style={{ color: 'var(--text-secondary, #b3b3b3)', fontSize: '1rem' }}>{mockDiscussion.description}</div>
            </div>
          </div>
          <section className="comments-section" style={{ marginTop: '1.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary, #fff)' }}>Ответы</h2>
            <ul className="comments-list" style={{ listStyle: 'none', padding: 0 }}>
              {comments.map((c) => (
                <li key={c.id} className="comment" style={{ display: 'flex', alignItems: 'flex-start', background: 'var(--background-tertiary, #23242a)', borderRadius: 8, padding: '1rem', marginBottom: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.10)', color: 'var(--text-primary, #f3f3f3)' }}>
                  <img src={c.avatar} alt="avatar" style={{ width: 32, height: 32, borderRadius: '50%', marginRight: 12, background: '#222', border: '1px solid #333' }} />
                  <div>
                    <span className="comment-author" style={{ fontWeight: 600, marginRight: 8, color: 'var(--text-secondary, #b3b3b3)' }}>{c.author}:</span> {c.text}
                  </div>
                </li>
              ))}
            </ul>
            <form className="comment-form" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }} onSubmit={handleAddComment}>
              <img src="/images/icons/ui/UserProfile.svg" alt="avatar" style={{ width: 32, height: 32, borderRadius: '50%', background: '#222', border: '1px solid #333' }} />
              <textarea
                className="form-input"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Ваш ответ..."
                rows={2}
                required
                style={{ resize: 'vertical', borderRadius: 8, border: '1px solid #333', padding: '0.75rem', fontSize: '1rem', flex: 1, background: '#181a20', color: '#f3f3f3' }}
              />
              <button type="submit" className="btn btn--primary" style={{ minWidth: 100 }}>Ответить</button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
};

export default DiscussionPage;
