"use client";

import Image from 'next/image';
import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import type { AnyPublicationListItem } from '@/types/api';
import PropertyFeatureIcon from './PropertyFeatureIcon';
import {
  CARD_IMAGE_DIMENSIONS,
  CARD_PLACEHOLDER,
  formatNumberValue,
  formatPrice,
  getCategoryFallbackIcon,
  getPublicationListAllImages,
  isLandCategory,
  isPublicationListItemAuth,
} from './publicationUtils';

interface PublicationCardProps {
  publication: AnyPublicationListItem;
  /** Tag "NUEVO" naranja — primera publicación cuando se ordena por más recientes. */
  isNew?: boolean;
  /** Tag "DESTACADA" verde — publicaciones sponsoreadas (Fase futura: backend `pub_featured`). */
  isFeatured?: boolean;
}

const PublicationCard = ({ publication, isNew = false, isFeatured = false }: PublicationCardProps) => {
  const allImages = useMemo(() => getPublicationListAllImages(publication), [publication]);
  const hasMultiple = allImages.length > 1;

  const [hoverIndex, setHoverIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const currentImage = imageError
    ? CARD_PLACEHOLDER
    : (allImages[hoverIndex] ?? CARD_PLACEHOLDER);

  const isFavorite = isPublicationListItemAuth(publication) && publication.isFavorite;
  const isLand = isLandCategory(publication.category);

  // Solo municipio (town). Si no hay, fallback a city.
  const locationLabel = publication.town || publication.city || 'Sin ubicación';

  const categoryFallback = getCategoryFallbackIcon(publication.category);

  // Hover gallery
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hasMultiple) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const segment = rect.width / allImages.length;
    const idx = Math.min(Math.floor(x / segment), allImages.length - 1);
    setHoverIndex(idx);
  };

  const handleMouseLeave = () => setHoverIndex(0);
  const handleImageError = () => { if (!imageError) setImageError(true); };

  return (
    <div className="col-xl-4 col-lg-6 col-md-6 col-sm-12 d-flex">
      <div className="art-item-single mb-30 publication-card">
        <div className="art-item-wraper h-100">
          <div className="art-item-inner h-100 d-flex flex-column">
            {/* ───────── Imagen cuadrada con hover gallery ───────── */}
            <div
              className={`art-item-img publication-card-image ${hasMultiple ? 'has-multiple' : 'single-image'}`}
              style={{
                position: 'relative',
                aspectRatio: `${CARD_IMAGE_DIMENSIONS.width} / ${CARD_IMAGE_DIMENSIONS.height}`,
                overflow: 'hidden',
              }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {/* Stack vertical de badges: si la pub es ambas, las dos se muestran. */}
              <div className="publication-badges">
                {isFeatured && (
                  <div className="publication-featured-badge">
                    <i className="fas fa-bolt"></i>
                    Destacada
                  </div>
                )}
                {isNew && (
                  <div className="publication-new-badge">
                    <i className="fas fa-star"></i>
                    Nuevo
                  </div>
                )}
              </div>

              <Link
                href={`/publications/${publication.id}`}
                style={{ position: 'absolute', inset: 0, display: 'block' }}
              >
                <Image
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                  className="publication-image"
                  style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }}
                  src={currentImage}
                  alt={publication.title}
                  onError={handleImageError}
                  unoptimized={currentImage === CARD_PLACEHOLDER}
                />
              </Link>

              {hasMultiple && !imageError && (
                <div className="publication-image-indicators">
                  {allImages.map((_, idx) => (
                    <span key={idx} className={`indicator ${idx === hoverIndex ? 'active' : ''}`} />
                  ))}
                </div>
              )}
            </div>

            {/* ───────── Contenido ───────── */}
            <div className="art-item-content pos-rel d-flex flex-column flex-grow-1">
              {/* Ubicación + Corazón */}
              <div className="publication-top-row">
                <div className="publication-location">
                  <PropertyFeatureIcon feature="location" size={14} />
                  <span className="ms-2">{locationLabel}</span>
                </div>
                <button
                  type="button"
                  className={`publication-like-btn ${isFavorite ? 'is-active' : ''}`}
                  title={isFavorite ? 'Favorito' : 'Guardar (Fase 4)'}
                  aria-label="Guardar como favorito"
                >
                  <i className={isFavorite ? 'fas fa-heart' : 'far fa-heart'}></i>
                </button>
              </div>

              <h4 className="art-name publication-title">
                <Link href={`/publications/${publication.id}`}>{publication.title}</Link>
              </h4>

              {/* Precio + botón Ver propiedad */}
              <div className="publication-price-row">
                <div className="publication-price-block">
                  <div className="art-meta-type">Precio</div>
                  <div className="art-price">{formatPrice(publication.price)}</div>
                </div>
                <Link
                  href={`/publications/${publication.id}`}
                  className="publication-view-btn"
                >
                  Ver propiedad
                </Link>
              </div>

              {/* Stats: features + icono de categoría a la derecha */}
              <div className="publication-stats mt-auto">
                <div className="publication-stats-features">
                  {isLand ? (
                    <div className="publication-stat-item" title="Tamaño">
                      <PropertyFeatureIcon feature="size" size={18} />
                      <span>
                        {publication.sizee !== null && publication.sizee !== undefined
                          ? `${publication.sizee} m²`
                          : '-'}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="publication-stat-item" title="Habitaciones">
                        <PropertyFeatureIcon feature="rooms" size={18} />
                        <span>{formatNumberValue(publication.rooms, '-')}</span>
                      </div>
                      <div className="publication-stat-item" title="Baños">
                        <PropertyFeatureIcon feature="bathrooms" size={18} />
                        <span>{formatNumberValue(publication.bathrooms, '-')}</span>
                      </div>
                      <div className="publication-stat-item" title="Parqueos">
                        <PropertyFeatureIcon feature="parking" size={18} />
                        <span>{formatNumberValue(publication.parking, '-')}</span>
                      </div>
                    </>
                  )}
                </div>
                <div
                  className="publication-category-pill"
                  title={publication.category}
                >
                  <i className={`fal ${categoryFallback}`}></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .publication-card {
            width: 100%;
            display: flex;
            flex-direction: column;
          }
          .publication-card :global(.art-item-wraper) {
            display: flex;
            flex-direction: column;
            height: 100%;
          }

          /* ──────────────── Imagen ──────────────── */
          .publication-card :global(.publication-card-image) {
            cursor: pointer;
          }
          .publication-card :global(.single-image:hover .publication-image) {
            transform: scale(1.06);
          }

          /* ──────────────── Stack de badges (Nuevo + Destacada) ──────────────── */
          .publication-card :global(.publication-badges) {
            position: absolute;
            top: 14px;
            left: 14px;
            display: flex;
            flex-direction: column;
            gap: 6px;
            z-index: 3;
            align-items: flex-start;
          }
          .publication-card :global(.publication-featured-badge),
          .publication-card :global(.publication-new-badge) {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 5px 12px;
            color: #fff;
            font-size: 12px;
            font-weight: 700;
            border-radius: 20px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .publication-card :global(.publication-featured-badge) {
            background: linear-gradient(135deg, #2ed573, #22b964);
            box-shadow: 0 4px 12px rgba(46, 213, 115, 0.4);
          }
          .publication-card :global(.publication-new-badge) {
            background: linear-gradient(135deg, #ff7e3d, #ff5e3a);
            box-shadow: 0 4px 12px rgba(255, 94, 58, 0.4);
          }

          /* ──────────────── Indicadores de gallery ──────────────── */
          .publication-card :global(.publication-image-indicators) {
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 4px;
            z-index: 2;
            opacity: 0;
            transition: opacity 0.2s;
            pointer-events: none;
          }
          .publication-card :global(.publication-card-image:hover .publication-image-indicators) {
            opacity: 1;
          }
          .publication-card :global(.publication-image-indicators .indicator) {
            display: block;
            width: 22px;
            height: 3px;
            background: rgba(255, 255, 255, 0.4);
            border-radius: 2px;
          }
          .publication-card :global(.publication-image-indicators .indicator.active) {
            background: #fff;
          }

          /* ──────────────── Top row: ubicación + corazón ──────────────── */
          .publication-card :global(.publication-top-row) {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
          }
          .publication-card :global(.publication-location) {
            display: flex;
            align-items: center;
            font-size: 13px;
            opacity: 0.75;
            min-width: 0;
            flex: 1;
          }
          .publication-card :global(.publication-location span) {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .publication-card :global(.publication-like-btn) {
            background: transparent;
            border: 1px solid rgba(128, 128, 128, 0.3);
            color: inherit;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s;
            flex-shrink: 0;
            margin-left: 8px;
          }
          .publication-card :global(.publication-like-btn:hover) {
            border-color: #ff4757;
            color: #ff4757;
          }
          .publication-card :global(.publication-like-btn.is-active) {
            color: #ff4757;
            border-color: #ff4757;
          }

          /* ──────────────── Título ──────────────── */
          .publication-card :global(.publication-title) {
            min-height: 2.7em;
            line-height: 1.35;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            margin-bottom: 16px;
          }

          /* ──────────────── Precio + botón ──────────────── */
          .publication-card :global(.publication-price-row) {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
          }
          .publication-card :global(.publication-price-block .art-meta-type) {
            font-size: 11px;
            opacity: 0.6;
            margin-bottom: 2px;
          }
          .publication-card :global(.publication-price-block .art-price) {
            font-size: 18px;
            font-weight: 700;
            color: var(--tp-theme-1, #6c5ce7);
          }
          .publication-card :global(.publication-view-btn) {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 9px 18px;
            background: var(--tp-theme-1, #6c5ce7);
            color: #fff !important;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            text-decoration: none;
            white-space: nowrap;
            transition: all 0.2s;
          }
          .publication-card :global(.publication-view-btn:hover) {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(108, 92, 231, 0.3);
          }

          /* ──────────────── Stats + icono categoría ──────────────── */
          .publication-card :global(.publication-stats) {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0 0;
            border-top: 1px solid rgba(128, 128, 128, 0.25);
            gap: 12px;
          }
          .publication-card :global(.publication-stats-features) {
            display: flex;
            gap: 16px;
          }
          .publication-card :global(.publication-stat-item) {
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 14px;
            opacity: 0.85;
          }
          .publication-card :global(.publication-stat-item span) {
            font-weight: 500;
          }
          .publication-card :global(.publication-category-pill) {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: rgba(108, 92, 231, 0.15);
            color: var(--tp-theme-1, #6c5ce7);
            font-size: 16px;
            flex-shrink: 0;
          }
        `}</style>
      </div>
    </div>
  );
};

export default PublicationCard;
