import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/date';

interface ContentBase {
  content_type_id: number;
  user_id: string; // UUID
  title: string | null;
  content: string;
  agent_id: string | null; // UUID
}

interface ContentRead extends ContentBase {
  id: string; // UUID
  created_at: string; // ISO 8601
  updated_at: string;
  tags?: string[];
}



const ArticlesPage = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<ContentRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error("Токен не найден");
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY}/contents/`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Ошибка при получении статей");
        }

        const data: ContentRead[] = await response.json();
        setArticles(data);

      } catch (err) {
        setError(err instanceof Error ? err.message : "Неизвестная ошибка");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) return <div>Загрузка статей...</div>;
  if (error) return <div>Ошибка: {error}</div>;

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
                <img src="images/icons/ui/UserProfile.svg" alt="User Profile" />
              </button>
              <button className="menu-button">
                <img src="images/icons/ui/Menu.svg" alt="Menu" />
              </button>
            </div>
        </div>
      </header>

      <main className="main-content container">
        <div className="articles-list-page" style={{ maxWidth: 800, margin: '0 auto', padding: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem', color: 'var(--text-primary, #fff)' }}>
            Статьи
          </h1>

          <div className="search-bar" style={{ marginBottom: '2rem' }}>
            <input
                type="text"
                placeholder="Поиск статей..."
                style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 8,
                border: '1px solid #333',
                background: '#181a20',
                color: '#f3f3f3',
                fontSize: '1rem'
                }}
                // onChange={(e) => setSearchQuery(e.target.value)}  // ← можно добавить позже
                // value={searchQuery}
            />
            </div>

          {articles.length === 0 ? (
            <p style={{ color: 'var(--text-secondary, #aaa)' }}>Нет статей</p>
          ) : (
            <div className="articles-grid" style={{ display: 'grid', gridGap: '2rem' }}>
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/article/${article.id}`}
                  passHref
                >
                  <div
                    className="article-card"
                    style={{
                      background: 'var(--background-secondary, #181a20)',
                      borderRadius: 12,
                      padding: '1.5rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      color: 'var(--text-primary, #f3f3f3)',
                      textDecoration: 'none',
                      transition: 'transform 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                  >
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary, #fff)' }}>
                      {article.title}
                    </h2>
                    <p style={{ fontSize: '1rem', color: 'var(--text-secondary, #ccc)', marginBottom: '0.5rem' }}>
                      Автор: {article.user_id ? `Пользователь ${article.user_id.slice(0, 8)}...` : "Unknown User"}
                    </p>
                    <p style={{ color: 'var(--text-tertiary, #aaa)', fontSize: '0.9rem' }}>
                      {formatDate(article.created_at)}
                    </p>

                    {article.tags && article.tags.length > 0 && (
                    <div className="tags-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', margin: '0.75rem 0' }}>
                        {article.tags.map((tag, idx) => (
                            <span
                            key={idx}
                            className="tag-chip"
                            style={{
                                background: 'var(--background-tertiary, #2a2c35)',
                                color: 'var(--text-secondary, #bbb)',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: '0.85rem',
                                fontWeight: 500
                            }}
                            >
                            {tag}
                            </span>
                        ))}
                        </div>
                    )}

                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary, #ddd)' }}>
                      {article.content.substring(0, 150)}...
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ArticlesPage;