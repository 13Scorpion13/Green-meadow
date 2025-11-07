import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

const AddAgentPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [author, setAuthor] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [longDesc, setLongDesc] = useState('');
  const [tags, setTags] = useState('');
  const [installGuide, setInstallGuide] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [archiveFile, setArchiveFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputArchiveRef = useRef<HTMLInputElement>(null);
  const fileInputVideoRef = useRef<HTMLInputElement>(null);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else if (prev.length < 3) {
        return [...prev, category];
      } else {
        return prev;
      }
    });
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleArchiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/zip' && !file.name.endsWith('.zip')) {
      alert('Можно загружать только .zip архивы');
      if (fileInputArchiveRef.current) fileInputArchiveRef.current.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('archive', file);

    fetch('/upload-agent-archive', {
      method: 'POST',
      body: formData,
    })
      .then(res => (res.ok ? res.text() : Promise.reject('Ошибка загрузки')))
      .then(() => alert('Архив успешно загружен!'))
      .catch(err => alert('Ошибка: ' + err));
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'video/mp4' && !file.name.endsWith('.mp4')) {
      alert('Можно загружать только .mp4 видео');
      if (fileInputVideoRef.current) fileInputVideoRef.current.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('video', file);

    fetch('/upload-agent-video', {
      method: 'POST',
      body: formData,
    })
      .then(res => (res.ok ? res.text() : Promise.reject('Ошибка загрузки')))
      .then(() => alert('Видео успешно загружено!'))
      .catch(err => alert('Ошибка: ' + err));
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError("Требуется авторизация");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Сначала загружаем архив и видео на сервер (если нужно)
      let archiveUrl = null;
      let videoUrl = null;

      if (archiveFile) {
        const archiveFormData = new FormData();
        archiveFormData.append('file', archiveFile);

        const archiveRes = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY}/upload/archive`, {
          method: 'POST',
          body: archiveFormData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        });

        if (!archiveRes.ok) throw new Error("Ошибка загрузки архива");
        const archiveData = await archiveRes.json();
        archiveUrl = archiveData.url;
      }

      if (videoFile) {
        const videoFormData = new FormData();
        videoFormData.append('file', videoFile);

        const videoRes = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY}/upload/video`, {
          method: 'POST',
          body: videoFormData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        });

        if (!videoRes.ok) throw new Error("Ошибка загрузки видео");
        const videoData = await videoRes.json();
        videoUrl = videoData.url;
      }

      // 2. Отправляем данные агента в API Gateway
      const agentData = {
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),  // ← генерируем slug
        agent_url: demoUrl || null,
        description: shortDesc,
        requirements: installGuide,
        tags: tags.split(',').map(tag => tag.trim()),
        category_id: null,  // ← можно улучшить
        article_id: null,  // ← если агент не связан со статьёй
        price: null,  // ← или число, если цена указана
        user_id: user.id  // ← добавляем user_id (хотя API Gateway должен сам извлечь из токена)
      };

      const token = localStorage.getItem('access_token');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY}/agents/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(agentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Ошибка при создании агента");
      }

      const createdAgent = await response.json();
      alert("Агент успешно добавлен!");
      router.push('/profile'); // ← перенаправить обратно в профиль

    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  };

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   console.log('Форма отправлена');
  // };

  

  return (
    <div id="root">
      <div className="min-h-screen bg-background">
        <header className="main-header">
          <div className="container header-container">
            <div className="header-left">
              <div className="logo">
                <div className="logo-icon">
                  <img src="images/logos/Bot.svg" alt="AI Market Logo" />
                </div>
                <div>
                  <h1 className="logo-title">AI Community</h1>
                  <p className="logo-subtitle">Сообщество разработчиков</p>
                </div>
              </div>
              <nav className="main-nav">
                <a href="index.html">Каталог</a>
                <a href="#">Как работает</a>
                <a href="#">Для разработчиков</a>
                <a href="#">Сообщество</a>
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
          <div className="back-to-catalog">
            <a href="index.html" className="btn btn--secondary">
              Назад в каталог
            </a>
          </div>

          <div className="agent-details-page">
            <div className="agent-details-main">
              <h1 className="agent-name">Добавить нового агента</h1>
              <form className="agent-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="agentName">
                    Название агента
                  </label>
                  <input
                    className="form-input"
                    type="text"
                    id="agentName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Введите название"
                    required
                  />
                </div>

                {/* <div className="form-group">
                  <label className="form-label" htmlFor="agentAuthor">
                    Автор
                  </label>
                  <input
                    className="form-input"
                    type="text"
                    id="agentAuthor"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Имя или команда"
                    required
                  />
                </div> */}

                <div className="form-group">
                  <label className="form-label" htmlFor="agentDescription">
                    Краткое описание
                  </label>
                  <textarea
                    className="form-input"
                    id="agentDescription"
                    value={shortDesc}
                    onChange={(e) => setShortDesc(e.target.value)}
                    rows={3}
                    placeholder="Опишите агента"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="agentLongDescription">
                    Подробное описание
                  </label>
                  <textarea
                    className="form-input"
                    id="agentLongDescription"
                    value={longDesc}
                    onChange={(e) => setLongDesc(e.target.value)}
                    rows={6}
                    placeholder="Детальное описание возможностей, технологий и преимуществ"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="agentTags">
                    Теги
                  </label>
                  <input
                    className="form-input"
                    type="text"
                    id="agentTags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Например: React, Python, Node.js"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="agentInstallGuide">
                    Руководство по установке и запуску
                  </label>
                  <textarea
                    className="form-input"
                    id="agentInstallGuide"
                    value={installGuide}
                    onChange={(e) => setInstallGuide(e.target.value)}
                    rows={5}
                    placeholder="Инструкции для пользователей"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="agentRepo">
                    Ссылка на репозиторий
                  </label>
                  <input
                    className="form-input"
                    type="url"
                    id="agentRepo"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/your-agent"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="agentDemo">
                    Демо/Видео (URL)
                  </label>
                  <input
                    className="form-input"
                    type="url"
                    id="agentDemo"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    placeholder="Ссылка на демо или видео"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="agentArchive">
                    Загрузить архив агента (.zip)
                  </label>
                  <input
                    className="form-input"
                    type="file"
                    id="agentArchive"
                    accept=".zip"
                    onChange={(e) => setArchiveFile(e.target.files?.[0] || null)}
                    ref={fileInputArchiveRef}
                  />
                  <small>Загрузите архив с файлами агента (только .zip)</small>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="agentVideo">
                    Загрузить видео демо (.mp4)
                  </label>
                  <input
                    className="form-input"
                    type="file"
                    id="agentVideo"
                    accept="video/mp4"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    ref={fileInputVideoRef}
                  />
                  <small>Загрузите видео демо агента (только .mp4)</small>
                </div>

                <div className="form-group">
                  <button className="btn btn--primary btn--large" type="submit" disabled={loading}>
                    {loading ? "Отправка..." : "Добавить агента"}
                  </button>
                </div>

                {error && <div className="error-message">{error}</div>}
              </form>
            </div>

            <div className="agent-details-sidebar">
              <div className="sidebar-widget">
                <h3>Советы по добавлению агента</h3>
                <ul>
                  <li>Заполните все поля максимально подробно.</li>
                  <li>Добавьте актуальные теги и категории.</li>
                  <li>Укажите корректные ссылки на репозиторий и демо.</li>
                  <li>Добавьте инструкцию по установке для пользователей.</li>
                </ul>
              </div>
            </div>
          </div>
        </main>

        <footer className="main-footer">
          <div className="container footer-container">
            <div className="footer-grid">
              <div className="footer-about">
                <div className="logo">
                  <div className="logo-icon">
                    <img src="images/logos/Bot.svg" alt="AI Market Logo" />
                  </div>
                  <span className="logo-title">AI Community</span>
                </div>
                <p className="footer-about-text">Лучшая площадка для поиска ИИ-агентов</p>
              </div>
              <div className="footer-links">
                <h3 className="footer-heading">Для клиентов</h3>
                <ul>
                  <li><a href="#">Гарантии</a></li>
                  <li><a href="#">Поддержка</a></li>
                </ul>
              </div>
              <div className="footer-links">
                <h3 className="footer-heading">Для разработчиков</h3>
                <ul>
                  <li><a href="#">Разместить агента</a></li>
                  <li><a href="#">API документация</a></li>
                  <li><a href="#">Комиссии</a></li>
                </ul>
              </div>
              <div className="footer-links">
                <h3 className="footer-heading">Компания</h3>
                <ul>
                  <li><a href="#">О нас</a></li>
                  <li><a href="#">Блог</a></li>
                  <li><a href="#">Контакты</a></li>
                </ul>
              </div>
            </div>
            <div className="footer-copyright">© 2025 AI Community. Все права защищены.</div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AddAgentPage;