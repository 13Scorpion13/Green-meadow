"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from 'next/router';
import { formatDate } from '@/utils/date';
import MediaCarousel from '@/components/MediaCarousel';
import Footer from "@/components/Footer";
import Header from "@/components/Header";

interface Developer {
  first_name: string;
  last_name: string;
  support_email: string;
  support_phone: string | null;
  public_contact: boolean;
  created_at: string;
  nickname: string;
}

interface Agent {
  id: string;
  name: string;
  slug: string;
  agent_url: string;
  description: string;
  requirements: string | null;
  tags: string[] | null;
  category_id: string;
  article_id: string | null;
  price: number | null;
  avg_raiting: number;
  user_id: string;
  reviews_count: number | null;
  created_at: string;
  updated_at: string;
  developer: Developer | null;
}

interface Comment {
  id: number;
  user_id: string;
  author: string;
  avatar: string;
  created_at: string;
  content: string;
}

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
}

export default function AgentDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [agent, setAgent] = useState<Agent | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [discussions, setDiscussions] = useState<ContentRead[]>([]);
  const [activeTab, setActiveTab] = useState<"description" | "guide" | "discussions">("description");

  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    const fetchAgentAndComments = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error("Токен не найден");
        }

        const agentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY}/agents/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!agentResponse.ok) {
          throw new Error(`Ошибка получения агента: ${agentResponse.status} ${agentResponse.statusText}`);
        }

        const agentData: Agent = await agentResponse.json();
        setAgent(agentData);

        const commentsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY}/agents/${id}/get_comments`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!commentsResponse.ok) {
          console.warn("Не удалось получить комментарии:", commentsResponse.statusText);
          setComments([]);
        } else {
          const commentsData: Comment[] = await commentsResponse.json();
          setComments(commentsData);

        }

        const discussionsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY}/agents/${id}/discussions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (discussionsResponse.ok) {
          const discussionsData: ContentRead[] = await discussionsResponse.json();
          setDiscussions(discussionsData);
        } else {
          console.warn("Не удалось получить обсуждения:", discussionsResponse.statusText);
          setDiscussions([]);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : "Неизвестная ошибка");
      } finally {
        setLoading(false);
      }
    };

    fetchAgentAndComments();
  }, [id]);

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    if (!id || typeof id !== 'string') return;

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error("Токен не найден");
      }

      const newComment = {
        agent_id: id,
        content: commentText,
        rating: 5
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY}/agents/${id}/comments`, {
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

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;
  if (!agent) return <div>Агент не найден</div>;

  const developerName = agent.developer
    ? `${agent.developer.nickname}`
    : "Неизвестный разработчик";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="main-content container">
        <div className="back-to-catalog">
          <Link href="/" className="btn btn--secondary">&lt; Назад в каталог</Link>
        </div>

        <div className="agent-details-page">
          <div className="agent-details-main">
            <div className="agent-card-detailed">
              <div className="agent-header">
                <div className="agent-avatar">{agent.name.charAt(0)}</div>
                <div className="agent-info">
                  <h1 className="agent-name">{agent.name}</h1>
                  <h2 className="agent-author">
                    от <Link href={`/profile/${agent.user_id}`}>{developerName}</Link>
                  </h2>
                </div>
              </div>

              <p className="agent-description">
                {agent.description}
              </p>

              <div className="agent-stats">
                <div className="stat">
                  <img src="/images/icons/ui/Star.svg" alt="Star Icon" />
                  <span>{agent.avg_raiting}</span>
                  <span>({agent.reviews_count})</span>
                </div>
                <div className="stat">
                  <img src="/images/icons/ui/Download.svg" alt="Download Icon" />
                  <span>1250 пользователей</span>
                </div>
              </div>
            </div>

            <div className="agent-tabs">
              <button
                className={`tab-button ${activeTab === "description" ? "active" : ""}`}
                onClick={() => setActiveTab("description")}
              >
                Описание
              </button>
              <button
                className={`tab-button ${activeTab === "guide" ? "active" : ""}`}
                onClick={() => setActiveTab("guide")}
              >
                Руководство
              </button>
              <button
                className={`tab-button ${activeTab === "discussions" ? "active" : ""}`}
                onClick={() => setActiveTab("discussions")}
              >
                Обсуждения
              </button>
            </div>

            <div className="tab-content">
              {activeTab === "description" && (
                <div className={`tab-pane ${activeTab === "description" ? "active" : ""}`} id="description">
                  <h2>Описание</h2>

                  {/* 🎞️ Карусель — теперь с заглушками или реальными данными */}
                  <MediaCarousel
                    media={[
                      {
                        type: "video",
                        src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                        alt: "Демонстрация работы",
                      },
                      {
                        type: "image",
                        src: "https://bipbap.ru/wp-content/uploads/2017/04/priroda_kartinki_foto_03.jpg",
                        alt: "Превью агента",
                      },
                      {
                        type: "image",
                        src: "https://img.goodfon.ru/wallpaper/big/8/4e/badfon-full-hd-cvety-priroda-vesna.webp",
                        alt: "Архитектура агента",
                      },
                    ]}
                    autoPlay={false} // можно true для автопрокрутки
                    interval={4000}
                    height="350px"
                  />

                  <p>{agent.description}</p>
                  {agent.requirements && (
                    <>
                      <h3>Требования:</h3>
                      <p>{agent.requirements}</p>
                    </>
                  )}
                </div>
              )}

              {activeTab === "guide" && (
                <div className={`tab-pane ${activeTab === "guide" ? "active" : ""}`} id="guide">
                  <h2>Руководство по установке и запуску</h2>
                  <p>Руководство будет позже</p>
                </div>
              )}

              {activeTab === "discussions" && (
                <div className={`tab-pane ${activeTab === "discussions" ? "active" : ""}`} id="discussions">
                  <h2>Обсуждения</h2>
                  <div className="discussions-list">
                    {discussions.length === 0 ? (
                      <p>Нет обсуждений</p>
                    ) : (
                      discussions.map(d => (
                        <a key={d.id} href="#" className="discussion-item">
                          {d.title || d.content.substring(0, 50) + "..."} {/* ← если title нет */}
                        </a>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="agent-details-sidebar">
            <div className="sidebar-widget">
              <button className="btn btn--primary btn--large rent-button-detailed">Скачать</button>
            </div>
            <div className="sidebar-widget">
              <h3>Категории</h3>
              <div className="agent-categories">
                <a href="#" className="category-link">Программирование</a>
              </div>
            </div>
            <div className="sidebar-widget">
              <h3>Теги</h3>
              <div className="agent-tags">
                {agent.tags && (
                  <>
                    <div className="tags-list">
                      {(Array.isArray(agent.tags) ? agent.tags : []).map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="comments-section-outer">
          <h2>Комментарии и Отзывы</h2>
          <div className="comments-section">
            <h3>Оставить комментарий</h3>
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
                Отправить комментарий
              </button>
            </div>

            <h3>Все комментарии ({comments.length})</h3>
            <div className="comments-list">
              {comments.map((c) => (
                <div className="comment-item" key={c.id}>
                  <div className="comment-header">
                    <div className="comment-author-info">
                      <img src="/images/icons/ui/UserProfile.svg" alt="User Avatar" className="comment-avatar" />
                      <a href="#" className="comment-author">{c.user_id ? `Пользователь ${c.user_id.slice(0, 8)}...` : "Unknown User"}</a>
                    </div>
                    <div className="comment-date">{formatDate(c.created_at)}</div>
                  </div>
                  <div className="comment-text">{c.content}</div>
                  <button className="reply-button">Ответить</button>
                </div>
              ))}
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
