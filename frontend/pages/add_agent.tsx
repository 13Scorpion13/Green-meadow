import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

const VIDEO_MAX_SIZE = 100 * 1024 * 1024;
const VIDEO_MAX_DURATION = 180;

const AddAgentPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
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

  const [photos, setPhotos] = useState<File[]>([]);
  const [previewPhoto, setPreviewPhoto] = useState<File | null>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [videoError, setVideoError] = useState<string | null>(null);

  const fileInputArchiveRef = useRef<HTMLInputElement>(null);
  const fileInputVideoRef = useRef<HTMLInputElement>(null);

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const url = URL.createObjectURL(file);

      video.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(url);
        resolve(video.duration);
      });

      video.addEventListener('error', (e) => {
        URL.revokeObjectURL(url);
        reject(new Error('Не удалось загрузить видео для проверки'));
      });

      video.src = url;
    });
  };

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

  useEffect(() => {
    if (previewPhoto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [previewPhoto]);

  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePreview();
      }
    };

    if (previewPhoto) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [previewPhoto]);

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

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setVideoError(null);
    
    if (!file) return;

    if (file.type !== 'video/mp4' && !file.name.endsWith('.mp4')) {
      setVideoError('Можно загружать только .mp4 видео');
      if (fileInputVideoRef.current) fileInputVideoRef.current.value = '';
      return;
    }

    if (file.size > VIDEO_MAX_SIZE) {
      setVideoError(`Файл слишком большой. Максимальный размер: ${VIDEO_MAX_SIZE / (1024 * 1024)}MB`);
      if (fileInputVideoRef.current) fileInputVideoRef.current.value = '';
      return;
    }

    try {
      const duration = await getVideoDuration(file);
      if (duration > VIDEO_MAX_DURATION) {
        setVideoError(`Видео слишком длинное. Максимальная продолжительность: ${VIDEO_MAX_DURATION / 60} минут`);
        if (fileInputVideoRef.current) fileInputVideoRef.current.value = '';
        return;
      }
    } catch (error) {
      console.error('Ошибка проверки длительности видео:', error);
      setVideoError('Не удалось проверить длительность видео. Попробуйте другой файл.');
      if (fileInputVideoRef.current) fileInputVideoRef.current.value = '';
      return;
    }

    setVideoFile(file);
    setVideoError(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    );

    if (files.length > 0) {
      setPhotos(prev => [...prev, ...files]);
    }
  };

  const handlePhotoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    console.log('[DEBUG] Выбранные файлы:', files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    console.log('[DEBUG] Отфильтровано:', imageFiles);
    setPhotos(prev => [...prev, ...imageFiles]);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const openPreview = (photo: File) => {
    console.log('[DEBUG] Тип:', typeof photo);
    console.log('[DEBUG] Это File?', photo instanceof File);
    console.log('[DEBUG] Имя:', photo?.name);
    console.log('[DEBUG] Размер:', photo?.size);
    console.log('[DEBUG] Тип MIME:', photo?.type);

    if (!(photo instanceof File)) {
      console.error('❌ Это НЕ File!', photo);
      return;
    }

    setPreviewPhoto(photo);
  };

  const closePreview = () => {
    setPreviewPhoto(null);
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

      const agentData = {
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        agent_url: demoUrl || null,
        description: shortDesc,
        requirements: installGuide,
        tags: tags.split(',').map(tag => tag.trim()),
        category_id: null,
        article_id: null,
        price: null,
        user_id: user.id
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
      router.push('/profile');

    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
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
                    onChange={handleVideoChange}
                    ref={fileInputVideoRef}
                  />
                  <small style={{ color: 'var(--text-tertiary)', display: 'block', marginTop: '0.5rem' }}>
                    Максимальный размер: {VIDEO_MAX_SIZE / (1024 * 1024)}MB, 
                    максимальная длительность: {VIDEO_MAX_DURATION / 60} минут
                    {videoFile && ` (Текущий файл: ${videoFile.name})`}
                  </small>
                  
                  {videoError && (
                    <div style={{ 
                      color: 'red', 
                      fontSize: '0.875rem', 
                      marginTop: '0.5rem',
                      padding: '0.5rem',
                      backgroundColor: '#ffe6e6',
                      borderRadius: '4px'
                    }}>
                      {videoError}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Фотографии (необязательно)</label>
                  <div
                    ref={dropAreaRef}
                    className="form-input"
                    style={{
                      borderStyle: 'dashed',
                      borderWidth: '2px',
                      borderColor: '#d1d5db',
                      borderRadius: '8px',
                      padding: '24px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: '#fafafa',
                    }}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('photoInput')?.click()}
                  >
                    <div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="icon"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        style={{ width: '32px', height: '32px', margin: '0 auto 12px', color: '#6b7280' }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                      <p style={{ color: '#4b5563', fontSize: '1rem', marginBottom: '4px' }}>
                        Перетащите изображения сюда или кликните для выбора
                      </p>
                      <p className="text-sm" style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                        Поддерживаются: JPG, PNG, GIF и др.
                      </p>
                    </div>
                    <input
                      id="photoInput"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoInputChange}
                    />
                  </div>

                  {photos.length > 0 && (
                    <div style={{ marginTop: '16px' }}>
                      <p className="text-sm" style={{ color: '#6b7280', marginBottom: '8px' }}>
                        Выбрано изображений: {photos.length}
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {photos.map((photo, index) => (
                          <div
                            key={index}
                            draggable
                            onDragStart={() => setDragIndex(index)}
                            onDragOver={(e) => {
                              e.preventDefault();
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              if (dragIndex === null || dragIndex === index) return;

                              setPhotos(prev => {
                                const newPhotos = [...prev];
                                const [moved] = newPhotos.splice(dragIndex, 1);
                                newPhotos.splice(index, 0, moved);
                                return newPhotos;
                              });
                              setDragIndex(null);
                            }}
                            style={{
                              position: 'relative',
                              width: '64px',
                              height: '64px',
                              cursor: 'grab',
                            }}
                          >
                            <img
                              src={URL.createObjectURL(photo)}
                              alt={`preview ${index}`}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '6px',
                                border: '1px solid #e5e7eb',
                                cursor: 'pointer',
                              }}
                              onClick={() => openPreview(photo)}
                            />
                            <button
                              type="button"
                              className="btn btn--cancel"
                              style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                width: '20px',
                                height: '20px',
                                padding: '0',
                                minWidth: 'auto',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#000000',
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                removePhoto(index);
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                fill="currentColor"
                                viewBox="0 0 16 16"
                                style={{ flexShrink: 0 }}
                              >
                                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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

        {previewPhoto && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0, 0, 0, 0.95)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '20px',
              boxSizing: 'border-box'
            }}
            onClick={closePreview}
          >
            <div
              style={{
                position: 'relative',
                maxWidth: '95vw',
                maxHeight: '95vh',
                backgroundColor: '#fff',
                borderRadius: '12px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0, 0, 0, 0.7)',
                  borderRadius: '0.375rem',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  zIndex: 10,
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}
                onClick={closePreview}
                aria-label="Закрыть"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                </svg>
              </button>

              <img
                src={URL.createObjectURL(previewPhoto)}
                alt="Предпросмотр"
                style={{
                  display: 'block',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  padding: '40px'
                }}
              />
            </div>
          </div>
        )}

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