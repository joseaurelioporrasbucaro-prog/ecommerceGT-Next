"use client";

import Image from 'next/image';
import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useToggleFavorite } from '@/hooks/api/useFavorites';
import { getImageVariant } from '@/utils/imageVariants';
// Fase 22 — URL canónica de publicación = slug (anti-enumeración + SEO).
import { publicationPath } from '@/utils/publicationUrl';
import type { AnyPublicationListItem } from '@/types/api';
import PropertyFeatureIcon from './PropertyFeatureIcon';
import {
  CARD_IMAGE_DIMENSIONS,
  CARD_PLACEHOLDER,
  formatNumberValue,
  formatPrice,
  getCategoryFallbackIcon,
  getPublicationListAllImages,
  getPublicationListAllImagesGlb,
  getStatusBadge,
  isLandCategory,
  isPublicationListItemAuth,
} from './publicationUtils';

interface PublicationCardProps {
  publication: AnyPublicationListItem;
  /** Tag "NUEVO" naranja — primera publicación cuando se ordena por más recientes. */
  isNew?: boolean;
  /** Tag "PATROCINADO" dorado — publicaciones sponsoreadas (Fase 10). */
  isFeatured?: boolean;
  /** Fase 10.4: sobrescribe el botón "Ver propiedad" (ej. con "Enviar mensaje" en dorado). */
  ctaOverride?: {
    label: string;
    href: string;
    iconClass?: string; // ej. 'fa-paper-plane'
    gold?: boolean;
    onMouseDown?: () => void;
  };
}

const PublicationCard = ({ publication, isNew = false, isFeatured = false, ctaOverride }: PublicationCardProps) => {
  const t = useTranslations('publications');
  const allImages = useMemo(() => getPublicationListAllImages(publication), [publication]);
  const hasMultiple = allImages.length > 1;

  const allImagesGlb = useMemo(() => getPublicationListAllImagesGlb(publication), [publication]);
  const hasGlb = allImagesGlb.length > 0;

  const [hoverIndex, setHoverIndex] = useState(0);
  // Cadena de fallback: variante optimizada → original → placeholder estático.
  const [imageStage, setImageStage] = useState<'variant' | 'original' | 'placeholder'>('variant');
  const toggleFavoriteMutation = useToggleFavorite(publication.id);

  const currentImage = useMemo(() => {
    if (imageStage === 'placeholder' || allImages.length === 0) return CARD_PLACEHOLDER;
    const original = allImages[hoverIndex] ?? CARD_PLACEHOLDER;
    if (original === CARD_PLACEHOLDER) return CARD_PLACEHOLDER;
    return imageStage === 'variant' ? getImageVariant(original, 'card') : original;
  }, [imageStage, allImages, hoverIndex]);

  const isFavorite = isPublicationListItemAuth(publication) && publication.isFavorite;
  const isLand = isLandCategory(publication.category);
  const statusBadge = getStatusBadge(publication.pubstaId, {
    sold: t('status.sold'),
    draft: t('status.draft'),
    void: t('status.void'),
  });

  // Solo municipio (town). Si no hay, fallback a city.
  const locationLabel = publication.town || publication.city || t('card.noLocation');

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
  const handleImageError = () => {
    setImageStage((prev) =>
      prev === 'variant' ? 'original' : 'placeholder',
    );
  };
  const handleToggleFavorite = () => {
    toggleFavoriteMutation.mutate();
  };

  return (
    <div className="col-xl-4 col-lg-6 col-md-6 col-sm-12 d-flex">
      <div className={`art-item-single mb-30 publication-card ${isFeatured ? 'is-featured' : ''}`}>
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
              {/* Stack vertical de badges: pueden mostrarse varios a la vez. */}
              <div className="publication-badges">
                {statusBadge && (
                  <div
                    className="publication-status-badge"
                    style={{ '--status-dot': statusBadge.color } as React.CSSProperties}
                  >
                    {statusBadge.label}
                  </div>
                )}
                {isFeatured && (
                  <div className="publication-featured-badge">
                    <i className="fas fa-star"></i>
                    {t('card.featured')}
                  </div>
                )}
                {isNew && !statusBadge && (
                  <div className="publication-new-badge">
                    <i className="fas fa-star"></i>
                    {t('card.new')}
                  </div>
                )}
              </div>

              <Link
                href={publicationPath(publication)}
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

              {hasMultiple && imageStage !== 'placeholder' && (
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
                  title={isFavorite ? t('favorite.remove') : t('favorite.add')}
                  aria-label={isFavorite ? t('favorite.remove') : t('favorite.add')}
                  onClick={handleToggleFavorite}
                  disabled={toggleFavoriteMutation.isPending}
                >
                  <i className={isFavorite ? 'fas fa-heart' : 'far fa-heart'}></i>
                </button>
              </div>

              <h4 className="art-name publication-title">
                <Link href={publicationPath(publication)}>{publication.title}</Link>
              </h4>

              {/* Precio + botón Ver propiedad */}
              <div className="publication-price-row">
                <div className="publication-price-block">
                  <div className="art-meta-type">{t('card.price')}</div>
                  <div className="art-price">{formatPrice(publication.price, publication.currency, t('card.priceConsult'))}</div>
                </div>
                {ctaOverride ? (
                  <Link
                    href={ctaOverride.href}
                    className={`publication-view-btn${ctaOverride.gold ? ' publication-view-btn-gold' : ''}`}
                    onMouseDown={ctaOverride.onMouseDown}
                  >
                    {ctaOverride.iconClass && <i className={`fas ${ctaOverride.iconClass}`} style={{ marginRight: 6 }} />}
                    {ctaOverride.label}
                  </Link>
                ) : (
                  <Link
                    href={publicationPath(publication)}
                    className="publication-view-btn"
                  >
                    {t('card.viewProperty')}
                  </Link>
                )}
              </div>

              {/* Stats: features + icono de categoría a la derecha */}
              <div className="publication-stats mt-auto">
                <div className="publication-stats-features">
                  {isLand ? (
                    <div className="publication-stat-item" title={t('features.size')}>
                      <PropertyFeatureIcon feature="size" size={18} />
                      <span>
                        {publication.sizee !== null && publication.sizee !== undefined
                          ? `${publication.sizee} m²`
                          : '-'}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="publication-stat-item" title={t('features.rooms')}>
                        <PropertyFeatureIcon feature="rooms" size={18} />
                        <span>{formatNumberValue(publication.rooms, '-')}</span>
                      </div>
                      <div className="publication-stat-item" title={t('features.bathrooms')}>
                        <PropertyFeatureIcon feature="bathrooms" size={18} />
                        <span>{formatNumberValue(publication.bathrooms, '-')}</span>
                      </div>
                      <div className="publication-stat-item" title={t('features.parking')}>
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
          /* Handoff #3 §6 — Destacado/Nuevo: gradiente lavanda con glow.
             Estados de plataforma (Vendida/Borrador/Anulada): pill "frosted"
             neutra con punto del color del estado (estilo .pub-tag de
             landing.html, reservado justo para estados neutros). */
          .publication-card :global(.publication-featured-badge),
          .publication-card :global(.publication-new-badge),
          .publication-card :global(.publication-status-badge) {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            padding: 6px 13px;
            font-size: 12px;
            font-weight: 700;
            border-radius: 999px;
            letter-spacing: 0.01em;
          }
          .publication-card :global(.publication-status-badge) {
            background: rgba(255, 255, 255, 0.82);
            -webkit-backdrop-filter: blur(10px);
            backdrop-filter: blur(10px);
            color: var(--navy-800, #1e2d4a);
            border: 1px solid rgba(255, 255, 255, 0.65);
            box-shadow: 0 2px 10px rgba(30, 45, 74, 0.14);
          }
          .publication-card :global(.publication-status-badge)::before {
            content: '';
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: var(--status-dot, var(--green-600, #84ad3f));
            flex-shrink: 0;
          }
          .publication-card :global(.publication-featured-badge),
          .publication-card :global(.publication-new-badge) {
            background: linear-gradient(135deg, var(--lav-500, #b5acef), var(--lav-600, #8a7fe3));
            color: #fff;
            border: 1px solid rgba(255, 255, 255, 0.35);
            box-shadow: 0 4px 16px rgba(109, 98, 207, 0.5),
              0 0 0 3px rgba(181, 172, 239, 0.25);
          }
          .publication-card :global(.publication-featured-badge i),
          .publication-card :global(.publication-new-badge i) {
            font-size: 11px;
            color: #fff;
          }
          :global([data-theme='dark']) .publication-card :global(.publication-featured-badge),
          :global([data-theme='dark']) .publication-card :global(.publication-new-badge) {
            background: linear-gradient(135deg, var(--lav-400, #c8c1f3), var(--lav-500, #b5acef));
            color: var(--navy-900, #161f33);
            box-shadow: 0 4px 18px rgba(181, 172, 239, 0.55),
              0 0 0 3px rgba(181, 172, 239, 0.22);
          }
          :global([data-theme='dark']) .publication-card :global(.publication-featured-badge i),
          :global([data-theme='dark']) .publication-card :global(.publication-new-badge i) {
            color: var(--navy-900, #161f33);
          }
          /* Tarjeta destacada: anillo lavanda en el contenedor visual. */
          .publication-card.is-featured :global(.art-item-wraper) {
            box-shadow: 0 0 0 1.5px var(--lav-400, #c8c1f3),
              var(--shadow-sm, 0 2px 6px rgba(30, 45, 74, 0.08));
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
          .publication-card :global(.publication-like-btn:disabled) {
            cursor: wait;
            opacity: 0.7;
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
          /* Fase 10.4: variante dorada para CTAs de campañas de mensajes. */
          .publication-card :global(.publication-view-btn-gold) {
            background: linear-gradient(135deg, #fbbf24, #d97706);
          }
          .publication-card :global(.publication-view-btn-gold:hover) {
            box-shadow: 0 6px 16px rgba(217, 119, 6, 0.4);
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
