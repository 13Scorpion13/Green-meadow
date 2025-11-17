// src/components/MediaCarousel.tsx
"use client";

import { useState, useEffect } from "react";

export interface MediaItem {
  type: "image" | "video";
  src: string;
  alt?: string;
}

interface MediaCarouselProps {
  media: MediaItem[];
  autoPlay?: boolean;
  interval?: number; // ms, default 5000
  height?: string | number; // например "400px" или 300
}

export default function MediaCarousel({
  media,
  autoPlay = false,
  interval = 5000,
  height = "400px",
}: MediaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Защита от пустого массива
  if (!media || media.length === 0) {
    return null;
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const currentSlide = media[currentIndex];

  // Автопрокрутка (опционально)
  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      nextSlide();
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, currentIndex]);

  return (
    <div className="media-carousel" style={{ margin: "1.5rem 0", position: "relative" }}>
      {/* Слайд */}
      <div
        className="carousel-slide"
        style={{
          width: "100%",
          height,
          overflow: "hidden",
          borderRadius: "8px",
          backgroundColor: "#f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {currentSlide.type === "image" ? (
          <img
            src={currentSlide.src}
            alt={currentSlide.alt || "Медиа"}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <video
            src={currentSlide.src}
            controls
            preload="metadata"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              backgroundColor: "#000",
            }}
          >
            Ваш браузер не поддерживает видео.
          </video>
        )}
      </div>

      {/* Стрелки */}
      {media.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="carousel-arrow carousel-arrow--prev"
            style={{
              position: "absolute",
              top: "50%",
              left: "10px",
              transform: "translateY(-50%)",
              background: "rgba(0,0,0,0.5)",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              zIndex: 10,
            }}
            aria-label="Предыдущий слайд"
          >
            ‹
          </button>
          <button
            onClick={nextSlide}
            className="carousel-arrow carousel-arrow--next"
            style={{
              position: "absolute",
              top: "50%",
              right: "10px",
              transform: "translateY(-50%)",
              background: "rgba(0,0,0,0.5)",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              zIndex: 10,
            }}
            aria-label="Следующий слайд"
          >
            ›
          </button>
        </>
      )}

      {/* Индикаторы (только если >1 слайд) */}
      {media.length > 1 && (
        <div
          className="carousel-dots"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            marginTop: "12px",
          }}
        >
          {media.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: idx === currentIndex ? "#4a90e2" : "#ccc",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
              aria-label={`Перейти к слайду ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}