import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/date';

interface Article {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  content_type_id: number;
}

interface Comment {
  id: string;
  user_id: string;
  author: string;
  avatar: string;
  comment: string;
  created_at: string;
}

const ArticlePage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    const fetchArticleAndComments = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error("Токен не найден");
        }

        // 1. Получить статью
        const articleResponse = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY}/contents/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!articleResponse.ok) {
          const errorData = await articleResponse.json();
          throw new Error(errorData.detail || "Ошибка при получении статьи");
        }

        const articleData: Article = await articleResponse.json();
        setArticle(articleData);

        // 2. Получить комментарии к статье
        const commentsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY}/contents/${id}/comments`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (commentsResponse.ok) {
          const commentsData: Comment[] = await commentsResponse.json();
          setComments(commentsData);
        } else {
          console.warn("Не удалось получить комментарии:", commentsResponse.statusText);
          setComments([]);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : "Неизвестная ошибка");
      } finally {
        setLoading(false);
      }
    };

    fetchArticleAndComments();
  }, [id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!id || typeof id !== 'string') return;

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error("Токен не найден");
      }

      const newComment = {
        content_id: id,
        comment: commentText,
        rating: 5
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY}/contents/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newComment)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Ошибка при добавлении комментария");
      }

      const createdComment: Comment = await response.json();

      setComments([createdComment, ...comments]);
      setCommentText("");

    } catch (err) {
      alert(err instanceof Error ? err.message : "Неизвестная ошибка");
    }
  };

  if (loading) return <div>Загрузка статьи...</div>;
  if (error) return <div>Ошибка: {error}</div>;
  if (!article) return <div>Статья не найдена</div>;

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
        </div>
      </header>

      <main className="main-content container">
        <div className="article-page" style={{ maxWidth: 800, margin: '0 auto', background: 'var(--background-secondary, #181a20)', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.25)', padding: '2rem', color: 'var(--text-primary, #f3f3f3)' }}>
          {/* <img src={article.cover} alt="cover" style={{ width: '100%', borderRadius: 12, marginBottom: '2rem', objectFit: 'cover', maxHeight: 320, background: '#222' }} /> */}
          <h1 className="article-title" style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary, #fff)' }}>{article.title}</h1>
          <div className="article-author-block" style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
            <img src="/images/icons/ui/UserProfile.svg" alt="author" style={{ width: 48, height: 48, borderRadius: '50%', marginRight: 16, background: '#222', border: '1px solid #333' }} />
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary, #fff)' }}>{article.user_id ? `Пользователь ${article.user_id.slice(0, 8)}...` : "Unknown User"}</div>
              <div style={{ color: 'var(--text-tertiary, #aaa)', fontSize: '0.95rem' }}>{formatDate(article.created_at)}</div>
            </div>
            <button className="btn btn--primary" style={{ marginLeft: 'auto', fontWeight: 600 }} onClick={() => setLikes(likes + 1)}>
              👍 Лайк ({likes})
            </button>
          </div>
          <div className="article-content" style={{ fontSize: '1.15rem', lineHeight: 1.7, marginBottom: '2.5rem', color: 'var(--text-primary, #eaeaea)' }} dangerouslySetInnerHTML={{ __html: article.content }} />
          <section className="comments-section" style={{ marginTop: '3rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary, #fff)' }}>Комментарии</h2>
            <ul className="comments-list" style={{ listStyle: 'none', padding: 0 }}>
              {comments.map((c) => (
                <li key={c.id} className="comment" style={{ background: 'var(--background-tertiary, #23242a)', borderRadius: 8, padding: '1rem', marginBottom: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.10)', color: 'var(--text-primary, #f3f3f3)' }}>
                  <span className="comment-author" style={{ fontWeight: 600, marginRight: 8, color: 'var(--text-secondary, #b3b3b3)' }}>{c.user_id ? `Пользователь ${c.user_id.slice(0, 8)}...` : "Unknown User"}:</span> {c.comment}
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
