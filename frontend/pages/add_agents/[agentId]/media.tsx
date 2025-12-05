import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Link from 'next/link';

const VIDEO_MAX_SIZE = 100 * 1024 * 1024; // 100 MB
const VIDEO_MAX_DURATION = 180; // 3 minutes

const AddAgentStep3: React.FC = () => {
  const router = useRouter();
  const { agentId } = router.query;
  const { user } = useAuth();

  const [photos, setPhotos] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const dropAreaRef = useRef<HTMLDivElement>(null);
  const fileInputVideoRef = useRef<HTMLInputElement>(null);

  // Защита от прямого доступа
  useEffect(() => {
    if (typeof window !== 'undefined' && !agentId) {
      router.push('/add_agents/agent');
    }
  }, [agentId, router]);

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const url = URL.createObjectURL(file);

      video.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(url);
        resolve(video.duration);
      });

      video.addEventListener('error', () => {
        URL.revokeObjectURL(url);
        reject(new Error('Не удалось загрузить видео'));
      });

      video.src = url;
    });
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
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    setPhotos(prev => [...prev, ...imageFiles]);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const openPreview = (photo: File) => {
    if (!(photo instanceof File)) return;
    setPreviewPhoto(photo);
    document.body.style.overflow = 'hidden';
  };

  const closePreview = () => {
    setPreviewPhoto(null);
    document.body.style.overflow = '';
  };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Валидация типа
    if (file.type !== 'video/mp4' && !file.name.toLowerCase().endsWith('.mp4')) {
      alert('Поддерживаются только .mp4 видео');
      if (fileInputVideoRef.current) fileInputVideoRef.current.value = '';
      return;
    }

    // Валидация размера
    if (file.size > VIDEO_MAX_SIZE) {
      alert(`Видео слишком большое. Максимум: ${VIDEO_MAX_SIZE / (1024 * 1024)} МБ`);
      if (fileInputVideoRef.current) fileInputVideoRef.current.value = '';
      return;
    }

    // Валидация длительности
    try {
      const duration = await getVideoDuration(file);
      if (duration > VIDEO_MAX_DURATION) {
        alert(`Видео слишком длинное. Максимум: ${VIDEO_MAX_DURATION / 60} минут`);
        if (fileInputVideoRef.current) fileInputVideoRef.current.value = '';
        return;
      }
    } catch (err) {
      console.error('Ошибка проверки видео:', err);
      alert('Не удалось проверить видео. Попробуйте другой файл.');
      if (fileInputVideoRef.current) fileInputVideoRef.current.value = '';
      return;
    }

    setVideoFile(file);
  };

  const uploadFile = async (file: File, isPrimary: boolean): Promise<void> => {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('Токен не найден');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('is_primary', isPrimary.toString());

    const API_GATEWAY = process.env.NEXT_PUBLIC_API_GATEWAY;
    const url = `${API_GATEWAY}/agents/${agentId}/media/`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Ошибка загрузки файла');
    }
  };

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

    if (photos.length === 0 && !videoFile) {
      setError('Добавьте хотя бы одно фото или видео');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const uploads: Promise<void>[] = [];

      // Загрузка фото
      photos.forEach((photo, index) => {
        const isPrimary = index === 0;
        uploads.push(uploadFile(photo, isPrimary));
      });

      // Загрузка видео
      if (videoFile) {
        uploads.push(uploadFile(videoFile, false));
      }

      // Ждём все загрузки
      await Promise.all(uploads);

      // Успешно завершено
      router.push('/profile?agentCreated=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке медиа');
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
    return null; // ждём загрузки
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-4 mt-4">
          <Link href={`/agents/${agentId}/version`} className="btn btn--secondary">
            ← Назад к версии
          </Link>
        </div>

        <div className="max-w-3xl mx-auto bg-card p-6 rounded-xl shadow">
          <h1 className="text-2xl font-bold mb-6">Шаг 3: Медиафайлы</h1>

          {error && <div className="alert alert--error mb-4">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Фото */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Скриншоты (рекомендуется 3–5)
              </label>
              <div
                ref={dropAreaRef}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer bg-gray-50"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById('photoInput')?.click()}
              >
                <p className="text-gray-600">
                  Перетащите изображения сюда или&nbsp;
                  <span className="text-blue-600 underline">выберите файлы</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Поддерживаются: JPG, PNG, GIF
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

              {photos.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Выбрано: {photos.length} фото
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative w-20 h-20">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`preview ${index}`}
                          className="w-full h-full object-cover rounded border"
                          onClick={() => openPreview(photo)}
                        />
                        <button
                          type="button"
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            removePhoto(index);
                          }}
                        >
                          ×
                        </button>
                        {index === 0 && (
                          <div className="absolute top-0 left-0 bg-yellow-500 text-white text-[10px] px-1 rounded-br">
                            Главное
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Видео */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Демо-видео (опционально)
              </label>
              <input
                type="file"
                ref={fileInputVideoRef}
                accept="video/mp4"
                className="form-input w-full"
                onChange={handleVideoChange}
              />
              <p className="text-xs text-gray-500 mt-1">
                Только .mp4, макс. {VIDEO_MAX_SIZE / (1024 * 1024)} МБ, до {VIDEO_MAX_DURATION / 60} мин
              </p>

              {videoFile && (
                <div className="mt-2 p-2 bg-gray-100 rounded">
                  <p className="text-sm">Выбрано: {videoFile.name}</p>
                  <button
                    type="button"
                    className="text-red-600 text-sm mt-1"
                    onClick={() => {
                      setVideoFile(null);
                      if (fileInputVideoRef.current) fileInputVideoRef.current.value = '';
                    }}
                  >
                    Удалить
                  </button>
                </div>
              )}
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
                {loading ? 'Загрузка...' : 'Завершить создание'}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Превью фото */}
      {previewPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={closePreview}
        >
          <div className="relative max-w-3xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute -top-10 right-0 text-white text-2xl"
              onClick={closePreview}
            >
              &times;
            </button>
            <img
              src={URL.createObjectURL(previewPhoto)}
              alt="Preview"
              className="max-h-[80vh] max-w-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AddAgentStep3;