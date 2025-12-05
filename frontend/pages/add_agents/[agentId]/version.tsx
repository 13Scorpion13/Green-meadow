import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Link from 'next/link';

const AddAgentStep2: React.FC = () => {
  const router = useRouter();
  const { agentId } = router.query;
  const { user } = useAuth();

  const [version, setVersion] = useState('1.0.0');
  const [changelog, setChangelog] = useState('');
  const [status, setStatus] = useState<'stable' | 'latest' | 'published'>('stable');
  const [projectPath, setProjectPath] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Защита: ждём, пока agentId загрузится
  useEffect(() => {
    if (typeof window !== 'undefined' && !agentId) {
      router.push('/add_agents/agent');
    }
  }, [agentId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('Требуется авторизация');
      return;
    }

    if (!agentId || typeof agentId !== 'string') {
      setError('Неверный ID агента');
      return;
    }

    if (!version.trim()) {
      setError('Укажите номер версии');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Токен не найден');

      const versionData = {
        version: version.trim(),
        changelog: changelog.trim() || null,
        status,
        project_path: projectPath.trim() || null,
        agent_id: agentId
      };

      const API_GATEWAY = process.env.NEXT_PUBLIC_API_GATEWAY;

      const response = await fetch(`${API_GATEWAY}/agents/${agentId}/versions/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(versionData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Ошибка при создании версии');
      }

      router.push(`/add_agents/${agentId}/media`);
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
            <p className="text-lg">Пожалуйста, войдите в аккаунт.</p>
            <Link href="/login" className="btn btn--primary mt-4 inline-block">
              Войти
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!agentId) {
    return null; // ждём загрузки query
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-4 mt-4">
          <Link href={`/agents/${agentId}`} className="btn btn--secondary">
            ← Назад к агенту
          </Link>
        </div>

        <div className="max-w-3xl mx-auto bg-card p-6 rounded-xl shadow">
          <h1 className="text-2xl font-bold mb-6">Шаг 2: Добавить версию</h1>

          {error && <div className="alert alert--error mb-4">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Номер версии */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Номер версии *
              </label>
              <input
                type="text"
                className="form-input w-full"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="1.0.0"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Используйте семантическое версионирование (например: 1.0.0, 2.1.3)
              </p>
            </div>

            {/* Статус */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Статус *
              </label>
              <select
                className="form-input w-full"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as any)
                }
                required
              >
                <option value="stable">Стабильная</option>
                <option value="latest">Последняя</option>
                <option value="published">Опубликовано</option>
              </select>
            </div>

            {/* Список изменений */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Список изменений (changelog)
              </label>
              <textarea
                className="form-input w-full"
                rows={5}
                value={changelog}
                onChange={(e) => setChangelog(e.target.value)}
                placeholder="Что нового в этой версии? Исправленные баги, новые функции и т.д."
              />
            </div>

            {/* Путь к проекту */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">
                Ссылка на проект (опционально)
              </label>
              <input
                type="url"
                className="form-input w-full"
                value={projectPath}
                onChange={(e) => setProjectPath(e.target.value)}
                placeholder="https://github.com/user/repo или другая ссылка"
              />
            </div>

            <div className="flex gap-4 mt-4">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => router.back()}
              >
                Назад
              </button>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={loading}
              >
                {loading ? 'Создание...' : 'Далее: Медиа'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddAgentStep2;