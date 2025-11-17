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
  interval?: number;
  height?: string | number;
}

export default function MediaCarousel({
  media,
  autoPlay = false,
  interval = 5000,
  height = "400px",
}: MediaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!media || media.length === 0) return null;

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

  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      nextSlide();
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval]);

  return (
    <div className="media-carousel" style={{ margin: "1.5rem 0", position: "relative" }}>
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
          position: "relative",
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

      {media.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="carousel-arrow carousel-arrow--prev"
            style={{
              position: "absolute",
              top: "40%",
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
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="carousel-arrow carousel-arrow--next"
            style={{
              position: "absolute",
              top: "40%",
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
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
            </svg>
          </button>
        </>
      )}

      {/* Миниатюры (Thumbnails) — как в Steam */}
      {media.length > 1 && (
        <div
          className="carousel-thumbnails"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            marginTop: "12px",
            flexWrap: "wrap",
            padding: "8px 0",
            overflowX: "auto",
            maxWidth: "100%",
            scrollbarWidth: "thin",
            scrollbarColor: "#ccc #f0f0f0",
          }}
        >
          {media.map((item, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              style={{
                width: "100px",
                height: "60px",
                borderRadius: "6px",
                overflow: "hidden",
                border: currentIndex === index ? "2px solid #4a90e2" : "2px solid transparent",
                cursor: "pointer",
                position: "relative",
                transition: "border 0.2s ease",
                flexShrink: 0,
              }}
              aria-label={`Перейти к слайду ${index + 1}`}
            >
              {item.type === "image" ? (
                <img
                  src={item.src}
                  alt={item.alt || `Миниатюра ${index + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "12px",
                  }}
                >
                  ▶️
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}