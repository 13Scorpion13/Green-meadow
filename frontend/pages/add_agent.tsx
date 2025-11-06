import React, { useState, useEffect, useRef } from 'react';

const AddAgentPage: React.FC = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Форма отправлена');
  };

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
                  <h1 className="logo-title">AI Market</h1>
                  <p className="logo-subtitle">Маркетплейс агентов</p>
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
              <button className="icon-button">
                <img src="images/icons/ui/ShoppingCart.svg" alt="Shopping Cart" />
              </button>
              <button className="icon-button" id="user-profile-button">
                <img src="images/icons/ui/UserProfile.svg" alt="User Profile" />
              </button>
              <button className="btn btn--primary login-button">
                Войти/Зарегистрироваться
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
              <form className="agent-form" autoComplete="off" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="agentName">
                    Название агента
                  </label>
                  <input
                    className="form-input"
                    type="text"
                    id="agentName"
                    name="agentName"
                    placeholder="Введите название"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="agentAuthor">
                    Автор
                  </label>
                  <input
                    className="form-input"
                    type="text"
                    id="agentAuthor"
                    name="agentAuthor"
                    placeholder="Имя или команда"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="agentDescription">
                    Краткое описание
                  </label>
                  <textarea
                    className="form-input"
                    id="agentDescription"
                    name="agentDescription"
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
                    name="agentLongDescription"
                    rows={6}
                    placeholder="Детальное описание возможностей, технологий и преимуществ"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="agentCategories">
                    Категории
                  </label>
                  <div className="dropdown-multiselect" id="dropdownCategories" ref={dropdownRef}>
                    <button
                      type="button"
                      className="dropdown-btn form-input"
                      id="dropdownBtn"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <span id="dropdownSelected">
                        {selectedCategories.length > 0 ? selectedCategories.join(', ') : 'Выберите категории'}
                      </span>
                      <span className="dropdown-arrow">▼</span>
                    </button>
                    <div className="dropdown-list" id="dropdownList" style={{ display: isDropdownOpen ? 'block' : 'none' }}>
                      {categories.map(category => (
                        <label key={category} className="dropdown-option">
                          <input
                            type="checkbox"
                            value={category}
                            checked={selectedCategories.includes(category)}
                            onChange={() => toggleCategory(category)}
                          />
                          {category}
                        </label>
                      ))}
                    </div>
                    <input
                      type="hidden"
                      name="agentCategories"
                      id="agentCategoriesHidden"
                      value={selectedCategories.join(', ')}
                      required
                    />
                  </div>
                  <small style={{ color: 'var(--text-tertiary)', display: 'block', marginTop: '0.5rem' }}>
                    Выберите до 3 категорий
                  </small>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="agentTags">
                    Теги
                  </label>
                  <input
                    className="form-input"
                    type="text"
                    id="agentTags"
                    name="agentTags"
                    placeholder="Например: React, Python, Node.js"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="agentInstallGuide">
                    Руководство по установке и запуску
                  </label>
                  <textarea
                    className="form-input"
                    id="agentInstallGuide"
                    name="agentInstallGuide"
                    rows={5}
                    placeholder="Инструкции для пользователей"
                    required
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
                    name="agentRepo"
                    placeholder="https://github.com/your-agent  "
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
                    name="agentDemo"
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
                    name="agentArchive"
                    accept=".zip"
                    required
                    onChange={handleArchiveChange}
                    ref={fileInputArchiveRef}
                  />
                  <small style={{ color: 'var(--text-tertiary)', display: 'block', marginTop: '0.5rem' }}>
                    Загрузите архив с файлами агента (только .zip)
                  </small>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="agentVideo">
                    Загрузить видео демо (.mp4)
                  </label>
                  <input
                    className="form-input"
                    type="file"
                    id="agentVideo"
                    name="agentVideo"
                    accept="video/mp4"
                    required
                    onChange={handleVideoChange}
                    ref={fileInputVideoRef}
                  />
                  <small style={{ color: 'var(--text-tertiary)', display: 'block', marginTop: '0.5rem' }}>
                    Загрузите видео демо агента (только .mp4)
                  </small>
                </div>

                <div className="form-group">
                  <button className="btn btn--primary btn--large" type="submit">
                    Добавить агента
                  </button>
                </div>
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
                  <span className="logo-title">AI Market</span>
                </div>
                <p className="footer-about-text">Лучший маркетплейс для аренды ИИ-агентов</p>
              </div>
              <div className="footer-links">
                <h3 className="footer-heading">Для клиентов</h3>
                <ul>
                  <li><a href="#">Как арендовать</a></li>
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
            <div className="footer-copyright">© 2025 AI Market. Все права защищены.</div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AddAgentPage;