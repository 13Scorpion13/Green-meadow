import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Link from 'next/link';
import ProgressBar from '@/components/ProgressBar';

const AddAgentStep1: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();

  // Поля формы
  const [name, setName] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [longDesc, setLongDesc] = useState('');
  const [tags, setTags] = useState('');
  const [installGuide, setInstallGuide] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    'Программирование',
    'Аналитика',
    'Дизайн',
    'Маркетинг',
    'Образование',
    'Здоровье',
    'Финансы',
    'Развлечения',
    'Другое',
  ];

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else if (prev.length < 3) {
        return [...prev, category];
      }
      return prev;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('Требуется авторизация');
      return;
    }

    if (!name.trim()) {
      setError('Введите название агента');
      return;
    }

    if (!shortDesc.trim()) {
      setError('Введите краткое описание');
      return;
    }

    if (selectedCategories.length === 0) {
      setError('Выберите хотя бы одну категорию');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Токен не найден');

      // Генерируем slug
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // убираем спецсимволы
        .replace(/\s+/g, '-')          // пробелы → дефисы
        .replace(/-+/g, '-')           // несколько дефисов → один
        .replace(/^-+|-+$/g, '');      // убираем дефисы по краям

      const agentData = {
        name: name.trim(),
        slug,
        agent_url: repoUrl || null,
        description: shortDesc.trim(),
        requirements: installGuide.trim() || null,
        tags: tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0),
        category_id: null, // если категории не UUID, а строки — уточните
        article_id: null, // или отдельный эндпоинт для репозиториев
        price: null,
        user_id: user.id
      };

      const API_GATEWAY = process.env.NEXT_PUBLIC_API_GATEWAY;

      const response = await fetch(`${API_GATEWAY}/agents/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(agentData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Ошибка при создании агента');
      }

      const createdAgent = await response.json();
      router.push(`/add_agents/${createdAgent.id}/version`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12">
          <div className="text-center">
            <p className="text-lg">Пожалуйста, войдите в аккаунт для добавления агента.</p>
            <Link href="/login" className="btn btn--primary mt-4 inline-block">
              Войти
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-6">
          <Link href="/" className="btn btn--secondary">
            ← Назад в каталог
          </Link>
        </div>

        <div className="max-w-3xl mx-auto bg-card p-6 rounded-xl shadow">
          <h1 className="text-2xl font-bold mb-6">Шаг 1: Основная информация</h1>

          {error && <div className="alert alert--error mb-4">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Название */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Название агента *</label>
              <input
                type="text"
                className="form-input w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Например: AI Copywriter"
                required
              />
            </div>

            {/* Краткое описание */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Краткое описание *</label>
              <textarea
                className="form-input w-full"
                rows={3}
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                placeholder="Один-два предложения о том, что делает агент"
                required
              />
            </div>

            {/* Подробное описание */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Подробное описание</label>
              <textarea
                className="form-input w-full"
                rows={4}
                value={longDesc}
                onChange={(e) => setLongDesc(e.target.value)}
                placeholder="Расскажите подробнее о возможностях, технологиях, преимуществах"
              />
            </div>

            {/* Теги */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Теги (через запятую)
              </label>
              <input
                type="text"
                className="form-input w-full"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="react, python, automation"
              />
            </div>

            {/* Категории */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Категории * (выберите до 3)
              </label>
              <div className="relative">
                <button
                  type="button"
                  className="form-input w-full text-left pr-10"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {selectedCategories.length > 0
                    ? selectedCategories.join(', ')
                    : 'Выберите категории'}
                </button>
                <div className="absolute right-3 top-3 pointer-events-none">▼</div>

                {isDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-auto">
                    {categories.map((cat) => (
                      <label key={cat} className="flex items-center px-3 py-2 hover:bg-gray-100">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat)}
                          onChange={() => toggleCategory(cat)}
                          className="mr-2"
                        />
                        {cat}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Руководство по установке */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Руководство по установке и запуску
              </label>
              <textarea
                className="form-input w-full"
                rows={4}
                value={installGuide}
                onChange={(e) => setInstallGuide(e.target.value)}
                placeholder="Как установить и запустить агента?"
              />
            </div>

            {/* Ссылка на репозиторий */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Ссылка на репозиторий
              </label>
              <input
                type="url"
                className="form-input w-full"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/your/repo"
              />
            </div>

            {/* Демо URL */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">
                Ссылка на демо (опционально)
              </label>
              <input
                type="url"
                className="form-input w-full"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="https://huggingface.co/spaces/..."
              />
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => router.push('/')}
              >
                Отмена
              </button>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={loading}
              >
                {loading ? 'Создание...' : 'Далее: Версия'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddAgentStep1;