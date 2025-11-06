interface Project {
  id: number;
  name: string;
  category: string;
  status: 'active' | 'rejected' | 'waiting';
  description: string;
  rating: number;
  downloads: number;
  price: string;
  avatar: string;
}

export default function ProjectsTab() {
  const projects: Project[] = [
    {
      id: 1,
      name: "CodeMaster Pro",
      category: "Программирование",
      status: "rejected",
      description: "Профессиональный ИИ-разработчик, специализирующийся на React, Node.js и Python.",
      rating: 4.1,
      downloads: 250,
      price: "₽1800",
      avatar: "CM"
    },
    {
      id: 2,
      name: "AI Archivist",
      category: "Документооборот",
      status: "active",
      description: "Агент-архивариус и поисковик по внутренним документам.",
      rating: 4.9,
      downloads: 890,
      price: "Бесплатно",
      avatar: "AAR"
    },
    {
      id: 3,
      name: "Fitness AI",
      category: "Спорт",
      status: "waiting",
      description: "Описание",
      rating: 5.0,
      downloads: 1250,
      price: "Бесплатно",
      avatar: "FIT"
    }
  ];

  const getStatusClass = (status: Project['status']): string => {
    switch (status) {
      case 'active': return 'active';
      case 'rejected': return '';
      case 'waiting': return 'waiting';
      default: return '';
    }
  };

  const getStatusText = (status: Project['status']): string => {
    switch (status) {
      case 'active': return 'Проверено';
      case 'rejected': return 'Не прошло проверку';
      case 'waiting': return 'Проверяется';
      default: return '';
    }
  };

  return (
    <div className="tab-content" id="projects-tab">
      <div className="tab-header">
        <h2 className="tab-title">Мои проекты</h2>
        <p className="tab-subtitle">Управление вашими ИИ-агентами на маркетплейсе</p>
        <button className="btn btn--primary new-project-btn">
          <div className="icon-white">+</div>
          Новый проект
        </button>
      </div>

      <div className="projects-grid">
        {projects.map(project => (
          <div 
            key={project.id} 
            className={`project-card ${project.status === 'active' ? 'gradient-border' : ''}`}
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
                <span className="stat-value">{project.downloads}</span>
                <span className="stat-label">Скачиваний</span>
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