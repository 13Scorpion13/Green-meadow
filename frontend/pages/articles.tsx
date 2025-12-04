import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/utils/date';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
  image_url?: string; // Добавлено: URL изображения для карточки
}



const ArticlesPage = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<ContentRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);


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

        const placeholders: ContentRead[] = [
         {
            id: 'stub-1',
            content_type_id: 1,
            user_id: 'stub_user_1',
            title: 'Как выбрать идеального ИИ-агента для вашего бизнеса?',
            content: 'Подробное руководство по выбору ИИ-агента, который максимально соответствует потребностям вашей компании.',
            agent_id: null,
            created_at: '2025-11-01T00:00:00Z',
            updated_at: '2025-11-01T00:00:00Z',
            tags: ['гайды', 'выбор'],
            image_url: '/images/illustrations/robot.jpeg',
         },
         {
            id: 'stub-2',
            content_type_id: 1,
            user_id: 'stub_user_2',
            title: 'ТОП-10 ИИ-агентов для автоматизации маркетинга',
            content: 'Обзор лучших искусственных интеллектов для повышения эффективности маркетинговых кампаний.',
            agent_id: null,
            created_at: '2025-10-28T00:00:00Z',
            updated_at: '2025-10-28T00:00:00Z',
            tags: ['обзоры', 'маркетинг'],
            image_url: '/images/illustrations/comp_marketing.jpeg',
         },
         {
            id: 'stub-3',
            content_type_id: 1,
            user_id: 'stub_user_3',
            title: 'Безопасность при работе с ИИ-агентами',
            content: 'Важные аспекты защиты данных и конфиденциальности при использовании AI-технологий.',
            agent_id: null,
            created_at: '2025-10-25T00:00:00Z',
            updated_at: '2025-10-25T00:00:00Z',
            tags: ['безопасность', 'гайды'],
            image_url: '/images/illustrations/security_comp.jpeg',
         },
         {
            id: 'stub-4',
            content_type_id: 1,
            user_id: 'stub_user_4',
            title: 'Будущее ИИ-агентов: тренды 2025 года',
            content: 'Анализ перспективных направлений развития искусственного интеллекта и автоматизации.',
            agent_id: null,
            created_at: '2025-10-20T00:00:00Z',
            updated_at: '2025-10-20T00:00:00Z',
            tags: ['тренды', 'будущее'],
            image_url: '/images/illustrations/future_earth.jpeg',
         },
        ];

        const combined = [...placeholders, ...data];

        setArticles(combined);

      } catch (err) {
        setError(err instanceof Error ? err.message : "Неизвестная ошибка");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const allTags = articles.reduce((acc, article) => {
    if (article.tags) {
      article.tags.forEach(tag => {
        if (!acc.includes(tag)) {
          acc.push(tag);
        }
      });
    }
    return acc;
  }, [] as string[]);

  // Применяем фильтрацию и сортировку
  const filteredArticles = articles
    .filter(article => {
      // Фильтр по поисковому запросу
      const matchesSearch = article.title
        ? article.title.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      // Фильтр по тегам (мультивыбор)
      const matchesTags = selectedTags.length === 0
        ? true // Если теги не выбраны, показываем все статьи
        : (article.tags && selectedTags.some(tag => article.tags?.includes(tag)));
        // Если выбраны теги, статья должна содержать хотя бы один из выбранных тегов

      return matchesSearch && matchesTags;
    })
    .sort((a, b) => {
      // Сортировка по дате
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  if (loading) return <div>Загрузка статей...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div className="min-h-screen bg-background articles-page-body">
      <Header />

      {/* Hero Section */}
      <section className="articles-hero">
        <div className="articles-page-container">
          <h1>Статьи о <span className="hero-text-gradient">ИИ-агентах</span></h1>
          <p>Полезные материалы, гайды и кейсы по работе с искусственным интеллектом</p>
        </div>
      </section>

      {/* Main Content */}
      <main className="articles-main">
        <div className="articles-page-container">

          {/* Панель управления (поиск и фильтры) */}
          <div className="articles-controls-bar">
            <div className="controls-top-row">
              {/* Search Bar with Icon */}
              <div className="search-bar-articles"> {/* Исправлено название класса */}
                <input
                  type="text"
                  placeholder="Поиск статей по названию..." // Исправлена опечатка и уточнен текст
                  className="search-input-articles" /* Исправлено название класса */
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <img
                    src="/images/icons/ui/Search.svg"
                    alt="Search"
                    className="search-icon-articles" /* Исправлено название класса */
                />
              </div>
              {/* Sort Button */}
              <button
                className="sort-button"
                onClick={() => setSortOrder(prev => (prev === 'newest' ? 'oldest' : 'newest'))}
              >
                Сортировка: {sortOrder === 'newest' ? 'Сначала новые' : 'Сначала старые'}
              </button>
            </div>

            {/* Tags Filter */}
            <div className="tags-filter-list">
              <button
                className={`tag-filter-button ${selectedTags.length === 0 ? 'active' : ''}`}
                onClick={() => setSelectedTags([])}
              >
                Все теги
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  className={`tag-filter-button ${selectedTags.includes(tag) ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedTags(prev =>
                      prev.includes(tag)
                        ? prev.filter(t => t !== tag)
                        : [...prev, tag]
                    );
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Сетка статей */}
          {filteredArticles.length === 0 ? (
            <p className="empty-articles-message">Нет статей, соответствующих вашему запросу.</p>
          ) : (
            <div className="articles-grid">
              {filteredArticles.map((article) => (
                <Link key={article.id} href={`/article/${article.id}`} passHref>
                  <div className="ai-card">
                    {/* Image Placeholder */}
                    {article.image_url && (
                        <div className="ai-card-image-wrapper">
                            <img
                                src={article.image_url}
                                alt={article.title || "Article Image"}
                                className="ai-card-image"
                            />
                            {article.tags && article.tags[0] && ( // Отображаем первый тег как категорию
                                <div className="ai-card-category-tag">
                                    {article.tags[0]}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="ai-card-content">
                      <h3 className="ai-card-title">{article.title}</h3>

                      {/* Теги в карточке */}
                      {article.tags && article.tags.length > 0 && (
                        <div className="tags-list-card">
                          {article.tags.map((tag) => (
                            <span key={tag} className="tag-chip">{tag}</span>
                          ))}
                        </div>
                      )}

                      <p className="ai-card-excerpt">{article.content.substring(0, 150)}...</p>
                    </div>
                    <div className="ai-card-footer">
                      <span className="ai-card-author">{`Пользователь ${article.user_id.slice(0, 8)}...`}</span>
                      <span className="ai-card-date">{formatDate(article.created_at)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ArticlesPage;