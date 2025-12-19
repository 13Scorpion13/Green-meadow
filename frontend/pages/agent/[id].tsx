"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from 'next/router';
import { formatDate } from '@/utils/date';
import { MediaItem } from '@/types/index';
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
  const [media, setMedia] = useState<MediaItem[]>([]);
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

        const mediaResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_GATEWAY}/agents/${id}/media/signed`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        let mediaList: MediaItem[] = [];

        if (mediaResponse.ok) {
          const signedMedia = await mediaResponse.json();
          mediaList = signedMedia.map((item: any) => ({
            type: item.type,
            src: item.url,
            alt: item.type === 'image' ? 'Скриншот' : 'Демо-видео'
          }));
          mediaList.sort((a, b) => {
            if (a.type === 'video' && b.type !== 'video') return -1;
            if (a.type !== 'video' && b.type === 'video') return 1;
            return 0;
          });
        } else {
          console.warn("Не удалось загрузить медиа");
        }

        setMedia(mediaList);

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
          console.log(commentsData);
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
          <Link href="/" className="btn btn--secondary">Назад в каталог</Link>
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

              {/* <p className="agent-description">
                {agent.description}
              </p> */}

              <div className="agent-stats">
                <div className="stat">
                  <img src="/images/icons/ui/Star.svg" alt="Star Icon" />
                  <span>5.0</span>
                  <span>(2)</span>
                </div>
                <div className="stat">
                  <img src="/images/icons/ui/Download.svg" alt="Download Icon" />
                  <span>2 пользователя</span>
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

                  {/* 🎞️ Карусель — не трогаем */}
                  <MediaCarousel
                    media={media}
                    autoPlay={false}
                    interval={4000}
                    height="350px"
                  />

                  {/* 🔽 ЗАМЕНА: вместо <p>{agent.description}</p> → полное описание проекта */}
                  <div className="agent-full-description prose max-w-none">
                    <h3>📁 Агент-архивариус<br /><em>Интеллектуальный поисковик по внутренним документам компании</em></h3>

                    <p><strong>Агент-архивариус</strong> — это программный агент, построенный на основе современных методов обработки естественного языка (NLP) и векторного поиска, предназначенный для автоматической индексации, хранения и семантического поиска по внутренним корпоративным документам.</p>

                    <p>Он решает ключевую проблему устаревших систем хранения: сотрудники тратят часы (а иногда и дни) на поиск нужных документов в десятках папок, архивах и почтовых переписках. Агент делает <strong>корпоративную память доступной в один клик</strong>.</p>

                    <h4>🔍 Основные функции</h4>
                    <ul>
                      <li><strong>📄 Автоматическая индексация</strong> документов в форматах: <code>.pdf</code>, <code>.docx</code>, <code>.xlsx</code>, <code>.pptx</code>, <code>.txt</code>, <code>.rtf</code>, <code>.odt</code>, <code>.html</code>, <code>.xml</code>, <code>.json</code></li>
                      <li><strong>🔎 Семантический поиск по естественному языку</strong>:<br />
                        <em>&quot;Найди все приказы об отпусках за 2023 год&quot;</em><br />
                        <em>&quot;Какие у нас условия с поставщиком X в договоре от 2022 года?&quot;</em><br />
                        <em>&quot;Кто утверждал бюджет на 2024?&quot;</em></li>
                      <li><strong>📁 Поддержка иерархической структуры файлов</strong> (отражение путей, метаданных: дата, автор, тип)</li>
                      <li><strong>🏷️ Автоматическая классификация</strong> по типам (приказ, договор, протокол, регламент)</li>
                      <li><strong>📊 Фильтрация</strong> по дате, автору, типу, сущностям (ФИО, организации, номера)</li>
                      <li><strong>📤 Экспорт результатов</strong>: PDF / CSV / JSON</li>
                    </ul>

                    <h4>💡 Бизнес-ценность</h4>
                    <table className="border-collapse border border-gray-300 w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-3 py-2">Преимущество</th>
                          <th className="border border-gray-300 px-3 py-2">Описание</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 px-3 py-2 font-medium">⏱️ Экономия времени</td>
                          <td className="border border-gray-300 px-3 py-2">Сокращение времени поиска с часов до секунд</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-3 py-2 font-medium">🧠 Корпоративная память</td>
                          <td className="border border-gray-300 px-3 py-2">Знания остаются даже при уходе сотрудников</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-3 py-2 font-medium">📉 Снижение рисков</td>
                          <td className="border border-gray-300 px-3 py-2">Быстрый доступ к действующим регламентам и обязательствам</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-3 py-2 font-medium">📈 Поддержка решений</td>
                          <td className="border border-gray-300 px-3 py-2">Анализ истории приказов и изменений в политике</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-3 py-2 font-medium">🔐 Контроль и аудит</td>
                          <td className="border border-gray-300 px-3 py-2">Полная прослеживаемость запросов</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Требования (если есть) — оставляем как fallback */}
                  {agent.requirements && (
                    <>
                      <h3>Требования:</h3>
                      {/* <p>{agent.requirements}</p> */}
                      <h3>⚙️ Технические требования</h3>
                      <table className="border-collapse border border-gray-300 w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-300 px-3 py-2">Компонент</th>
                            <th className="border border-gray-300 px-3 py-2">Минимум</th>
                            <th className="border border-gray-300 px-3 py-2">Рекомендуется</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-gray-300 px-3 py-2">ОС</td>
                            <td className="border border-gray-300 px-3 py-2">Ubuntu 20.04+, Win10/11 (WSL2), macOS 12+</td>
                            <td className="border border-gray-300 px-3 py-2">Ubuntu 22.04 LTS</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 px-3 py-2">CPU</td>
                            <td className="border border-gray-300 px-3 py-2">4 ядра</td>
                            <td className="border border-gray-300 px-3 py-2">8+ ядер</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 px-3 py-2">RAM</td>
                            <td className="border border-gray-300 px-3 py-2">8 ГБ</td>
                            <td className="border border-gray-300 px-3 py-2">16–32 ГБ</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 px-3 py-2">Диск</td>
                            <td className="border border-gray-300 px-3 py-2">50 ГБ (HDD)</td>
                            <td className="border border-gray-300 px-3 py-2">SSD, 200+ ГБ</td>
                          </tr>
                        </tbody>
                      </table>
                    </>
                  )}
                </div>
              )}

              {activeTab === "guide" && (
                <div className={`tab-pane ${activeTab === "guide" ? "active" : ""}`} id="guide">
                  <h2>Руководство по установке и запуску</h2>

                  {/* 🔽 ЗАМЕНА: вместо <p>Руководство будет позже</p> → подробное руководство */}
                  <div className="installation-guide prose max-w-none">
                    <p>Агент разработан на <strong>Python 3.10+</strong>. Ниже — пошаговая инструкция для развертывания локально.</p>



                    <h3>📦 Зависимости (Python)</h3>
                    <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-sm">
                      {`# Обработка документов
python-docx==1.1.2
PyPDF2==3.0.1
unstructured[all-docs]==0.15.4
pdfplumber==0.11.0

# NLP и поиск
sentence-transformers==3.0.1
faiss-cpu==1.8.0
spacy==3.7.4
ru_core_news_lg (модель для русского)

# Веб / API
fastapi==0.111.0
uvicorn==0.29.0

# Прочее
pandas numpy tqdm python-dotenv`}
                    </pre>

                    <h3>🛠️ Установка и запуск</h3>

                    <h4>1. Подготовка окружения</h4>
                    <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-sm">
                      {`git clone https://github.com/your-org/archivist-agent.git
cd archivist-agent
python -m venv venv
source venv/bin/activate   # Linux/macOS
pip install -r requirements.txt`}
                    </pre>

                    <h4>2. Настройка (<code>.env</code>)</h4>
                    <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-sm">
                      {`DOCUMENTS_ROOT="/path/to/company/docs"
INDEX_PATH="./data/faiss_index.bin"
METADATA_DB="./data/metadata.db"
EMBEDDING_MODEL="intfloat/multilingual-e5-small"
HOST="0.0.0.0"
PORT=8000`}
                    </pre>

                    <h4>3. Индексация документов</h4>
                    <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-sm">
                      {`python -m scripts.index_documents --rebuild`}
                    </pre>

                    <h4>4. Запуск API</h4>
                    <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-sm">
                      {`uvicorn app.main:app --host 0.0.0.0 --port 8000`}
                    </pre>
                    <p>API будет доступен по: <code>http://localhost:8000/docs</code> (Swagger UI)</p>

                    <h4>5. (Опционально) systemd-сервис</h4>
                    <p>Создайте <code>/etc/systemd/system/archivist.service</code> и активируйте автозапуск:</p>
                    <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-sm">
                      {`sudo systemctl enable archivist
sudo systemctl start archivist`}
                    </pre>

                    <p>✅ Готово! Теперь вы можете искать документы простым языком — мгновенно и без копания в папках.</p>
                  </div>
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
            <a
              href={`http://localhost:8003/versions/archive/${id}/project-path`}
              download
              onClick={(e) => {
                if (!id) {
                  e.preventDefault();
                  alert("Скачка временно недоступна");
                }
              }}>
              <div className="sidebar-widget">
                <button className="btn btn--primary btn--large rent-button-detailed">Скачать</button>
              </div>
            </a>
            <div className="sidebar-widget">
              <h3>Категории</h3>
              <div className="agent-categories">
                <a href="#" className="category-link">Документ</a>
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
                      <a href="#" className="comment-author">{c.author ? `Пользователь ${c.user_id.slice(0, 8)}...` : "Unknown User"}</a>
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