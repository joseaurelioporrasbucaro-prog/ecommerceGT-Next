"use client";

import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getImageVariant } from '@/utils/imageVariants';
import {
  DETAIL_PLACEHOLDER,
  THUMB_IMAGE_DIMENSIONS,
  THUMB_PLACEHOLDER,
} from './publicationUtils';

interface PublicationGalleryProps {
  images: string[];
  alt: string;
}

/**
 * Galería estilo Facebook/Realtor:
 * - Imagen principal con `object-fit: contain` (no recorta, no deforma).
 * - Fondo oscuro detrás de la imagen para llenar el aspect ratio fijo.
 * - Funciona igual para fotos verticales y horizontales.
 * - Flechas y thumbnails para navegar.
 */
const PublicationGallery = ({ images, alt }: PublicationGalleryProps) => {
  const t = useTranslations('publications');
  const list = images.length > 0 ? images : [DETAIL_PLACEHOLDER];
  const [activeIndex, setActiveIndex] = useState(0);
  // Cadena de fallback para la imagen principal: variante _detail → original → placeholder.
  const [mainStage, setMainStage] = useState<'variant' | 'original' | 'placeholder'>('variant');

  // Si cambia la lista (después de un fetch), volvemos al primero
  useEffect(() => {
    setActiveIndex(0);
    setMainStage('variant');
  }, [images]);

  const baseImage = list[activeIndex];
  const activeImage =
    mainStage === 'placeholder' || baseImage === DETAIL_PLACEHOLDER
      ? DETAIL_PLACEHOLDER
      : mainStage === 'variant'
        ? getImageVariant(baseImage, 'detail')
        : baseImage;
  const total = list.length;
  const hasMultiple = total > 1;

  const goPrev = () => setActiveIndex((i) => (i === 0 ? total - 1 : i - 1));
  const goNext = () => setActiveIndex((i) => (i === total - 1 ? 0 : i + 1));

  return (
    <div className="publication-gallery wow fadeInUp">
      {/* Visor principal */}
      <div className="gallery-main">
        <Image
          fill
          sizes="(max-width: 992px) 100vw, 80vw"
          style={{ objectFit: 'contain' }}
          src={activeImage}
          alt={alt}
          onError={() =>
            setMainStage((prev) => (prev === 'variant' ? 'original' : 'placeholder'))
          }
          unoptimized={activeImage === DETAIL_PLACEHOLDER}
          priority
        />

        {hasMultiple && (
          <>
            <button
              type="button"
              className="gallery-arrow gallery-arrow-prev"
              onClick={goPrev}
              aria-label={t('gallery.previous')}
            >
              <i className="fal fa-angle-left"></i>
            </button>
            <button
              type="button"
              className="gallery-arrow gallery-arrow-next"
              onClick={goNext}
              aria-label={t('gallery.next')}
            >
              <i className="fal fa-angle-right"></i>
            </button>
            <div className="gallery-counter">
              {activeIndex + 1} / {total}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {hasMultiple && (
        <div className="gallery-thumbs">
          {list.map((img, idx) => (
            <ThumbnailButton
              key={`${img}-${idx}`}
              image={img}
              isActive={idx === activeIndex}
              onClick={() => {
                setActiveIndex(idx);
                setMainStage('variant');
              }}
              alt={alt}
              ariaLabel={t('gallery.viewImage')}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        .publication-gallery {
          width: 100%;
        }
        .gallery-main {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          background: linear-gradient(135deg, #0e0d1a, #1a1828);
          border-radius: 16px;
          overflow: hidden;
        }
        @media (max-width: 768px) {
          .gallery-main {
            aspect-ratio: 4 / 3;
          }
        }
        .gallery-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.55);
          color: #fff;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          font-size: 20px;
          transition: all 0.2s;
          backdrop-filter: blur(8px);
          z-index: 2;
        }
        .gallery-arrow:hover {
          background: rgba(0, 0, 0, 0.85);
          transform: translateY(-50%) scale(1.08);
        }
        .gallery-arrow-prev { left: 18px; }
        .gallery-arrow-next { right: 18px; }

        .gallery-counter {
          position: absolute;
          bottom: 18px;
          right: 18px;
          padding: 6px 12px;
          background: rgba(0, 0, 0, 0.6);
          color: #fff;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 600;
          backdrop-filter: blur(8px);
          z-index: 2;
        }

        .gallery-thumbs {
          display: flex;
          gap: 10px;
          margin-top: 16px;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: thin;
        }
        .gallery-thumbs::-webkit-scrollbar { height: 6px; }
        .gallery-thumbs::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
};

// Thumbnail individual
interface ThumbnailButtonProps {
  image: string;
  isActive: boolean;
  alt: string;
  ariaLabel: string;
  onClick: () => void;
}

const ThumbnailButton = ({ image, isActive, alt, ariaLabel, onClick }: ThumbnailButtonProps) => {
  // Cadena de fallback: variante _thumb → original → placeholder.
  const [stage, setStage] = useState<'variant' | 'original' | 'placeholder'>('variant');
  const src =
    stage === 'placeholder' || image === THUMB_PLACEHOLDER
      ? THUMB_PLACEHOLDER
      : stage === 'variant'
        ? getImageVariant(image, 'thumb')
        : image;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`gallery-thumb ${isActive ? 'is-active' : ''}`}
    >
      <Image
        fill
        sizes="120px"
        style={{ objectFit: 'cover' }}
        src={src}
        alt={alt}
        onError={() =>
          setStage((prev) => (prev === 'variant' ? 'original' : 'placeholder'))
        }
        unoptimized={src === THUMB_PLACEHOLDER}
      />
      <style jsx>{`
        .gallery-thumb {
          position: relative;
          flex-shrink: 0;
          width: 120px;
          aspect-ratio: ${THUMB_IMAGE_DIMENSIONS.width} / ${THUMB_IMAGE_DIMENSIONS.height};
          background: #0e0d1a;
          border: 2px solid transparent;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          padding: 0;
          opacity: 0.55;
          transition: all 0.2s;
        }
        .gallery-thumb:hover {
          opacity: 0.85;
        }
        .gallery-thumb.is-active {
          opacity: 1;
          border-color: var(--tp-theme-1, #6c5ce7);
        }
      `}</style>
    </button>
  );
};

export default PublicationGallery;
