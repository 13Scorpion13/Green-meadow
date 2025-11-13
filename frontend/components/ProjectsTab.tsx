import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';

interface Agent {
  id: string;
  name: string;
  slug: string;
  agent_url: string;
  description: string;
  category: null;
  price: number | null;
  avg_raiting: number | null;
  reviews_count: number | null;
  created_at: string;
  updated_at: string;
  // developer: object | null;
}

export default function ProjectsTab() {
  const { user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchUserProjects = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error("Токен не найден");
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY}/agents/my`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
        }

        const data: Agent[] = await response.json();
        setProjects(data);

      } catch (err) {
        setError(err instanceof Error ? err.message : "Неизвестная ошибка");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProjects();
  }, [user]);
  console.log("after fetchUserProjects")
  if (loading) {
    return <div className="loading">Загрузка проектов...</div>;
  }

  if (error) {
    return <div className="error">Ошибка: {error}</div>;
  }

  const uiProjects = projects.map(p => ({
    id: 1,
    agent_id: p.id,
    name: p.name,
    category: p.category || "Нет категории",
    status: "active" as const,
    description: p.description,
    rating: p.avg_raiting || "Нет оценки",
    reviews: p.reviews_count ?? "Нет отзывов",
    price: p.price ? `₽${p.price}` : "Бесплатно",
    avatar: p.name.substring(0, 2).toUpperCase(),
  }));

  const getStatusClass = (status: 'active' | 'rejected' | 'waiting'): string => {
    switch (status) {
      case 'active': return 'active';
      case 'rejected': return '';
      case 'waiting': return 'waiting';
      default: return '';
    }
  };

  const getStatusText = (status: 'active' | 'rejected' | 'waiting'): string => {
    switch (status) {
      case 'active': return 'Проверено';
      case 'rejected': return 'Не прошло проверку';
      case 'waiting': return 'Проверяется';
      default: return '';
    }
  };

  const handleNewProjectClick = () => {
    router.push('/add_agent'); 
  };

  const handleAgentClick = (agentId: string) => {
    router.push(`/agent/${agentId}`);
  };

  return (
    <div className="tab-content" id="projects-tab">
      <div className="tab-header">
        <h2 className="tab-title">Мои проекты</h2>
        <p className="tab-subtitle">Управление вашими ИИ-агентами на маркетплейсе</p>
        <button 
          className="btn btn--primary new-project-btn"
          onClick={handleNewProjectClick}
        >
          <div className="icon-white">+</div>
          Новый проект
        </button>
      </div>

      <div className="projects-grid">
        {uiProjects.map(project => (
          <div 
            key={project.id} 
            className={`project-card ${project.status === 'active' ? 'gradient-border' : ''}`}
            onClick={() => handleAgentClick(project.agent_id)}
            style={{ cursor: 'pointer' }}
          >
            <div className="project-header">
              <div className="project-avatar">{project.avatar}</div>
              <div className="project-info">
                <h3 className="project-name">{project.name}</h3>
                <p className="project-category">{project.category}</p>
              </div>
              <div className={`project-status ${getStatusClass(project.status)}`}>
                {getStatusText(project.status)}
              </div>
            </div>
            <p className="project-description">{project.description}</p>
            <div className="project-stats">
              <div className="stat">
                <span className="stat-value">{project.rating}</span>
                <span className="stat-label">рейтинг</span>
              </div>
              <div className="stat">
                <span className="stat-value">{project.reviews}</span>
                <span className="stat-label">Отзывов</span>
              </div>
              <div className="stat">
                <span className="stat-value">{project.price}</span>
                <span className="stat-label">Цена</span>
              </div>
            </div>
            <div className="project-actions">
              <button className="btn btn--danger">Удалить</button>
              <button className="btn btn--primary">
                {project.status === 'active' ? 'Обновить' : 'Редактировать'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}