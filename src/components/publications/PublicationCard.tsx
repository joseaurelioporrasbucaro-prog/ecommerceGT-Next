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
import {
  CARD_PLACEHOLDER,
  formatNumberValue,
  formatPrice,
  getPublicationListAllImages,
  getStatusBadge,
  isLandCategory,
  PUBSTA_DRAFT,
  PUBSTA_SOLD,
  PUBSTA_VOID,
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
  // Handoff #4 §1.4 — clase de estado para el punto de color del frosted.
  const statusClass =
    publication.pubstaId === PUBSTA_SOLD ? 'st-vendida'
    : publication.pubstaId === PUBSTA_DRAFT ? 'st-borrador'
    : publication.pubstaId === PUBSTA_VOID ? 'st-anulada'
    : '';

  // Solo municipio (town). Si no hay, fallback a city.
  const locationLabel = publication.town || publication.city || t('card.noLocation');

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

  const detailsHref = publicationPath(publication);
  const priceLabel = formatPrice(publication.price, publication.currency, t('card.priceConsult'));
  const sizeLabel =
    publication.sizee !== null && publication.sizee !== undefined
      ? `${formatNumberValue(publication.sizee, '-')} m²`
      : '-';

  return (
    <div className="col-xl-4 col-lg-6 col-md-6 col-sm-12 d-flex">
      <article className={`pub-card publication-card mb-30 ${isFeatured ? 'is-featured' : ''}`}>
        <div
          className={`pub-photo publication-card-image ${hasMultiple ? 'has-multiple' : 'single-image'}`}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Stack vertical de badges: pueden mostrarse varios a la vez. */}
          <div className="publication-badges">
            {statusBadge && (
              <div className={`publication-status-badge ${statusClass}`}>
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

          <button
            type="button"
            className={`pub-fav publication-like-btn ${isFavorite ? 'is-fav is-active' : ''}`}
            title={isFavorite ? t('favorite.remove') : t('favorite.add')}
            aria-label={isFavorite ? t('favorite.remove') : t('favorite.add')}
            onClick={handleToggleFavorite}
            disabled={toggleFavoriteMutation.isPending}
          >
            <i className={isFavorite ? 'fas fa-heart' : 'far fa-heart'}></i>
          </button>

          <Link href={detailsHref} className="pub-photo-link" aria-label={publication.title}>
            {currentImage === CARD_PLACEHOLDER ? (
              <i className="fas fa-camera pub-camera-fallback" aria-hidden="true"></i>
            ) : (
              <Image
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                className="publication-image pub-image"
                src={currentImage}
                alt={publication.title}
                onError={handleImageError}
              />
            )}
          </Link>

          {hasMultiple && imageStage !== 'placeholder' && (
            <div className="publication-image-indicators">
              {allImages.map((_, idx) => (
                <span key={idx} className={`indicator ${idx === hoverIndex ? 'active' : ''}`} />
              ))}
            </div>
          )}
        </div>

        <div className="pub-body">
          <div className="pub-row1">
            <span className="pub-price">{priceLabel}</span>
            <span className="pub-type">{publication.category}</span>
          </div>

          <h4 className="pub-title publication-title">
            <Link href={detailsHref}>{publication.title}</Link>
          </h4>

          <div className="pub-loc">
            <i className="fas fa-map-marker-alt" aria-hidden="true"></i>
            <span>{locationLabel}</span>
          </div>

          {ctaOverride && (
            <div className="pub-cta-row">
              <Link
                href={ctaOverride.href}
                className={`publication-view-btn${ctaOverride.gold ? ' publication-view-btn-gold' : ''}`}
                onMouseDown={ctaOverride.onMouseDown}
              >
                {ctaOverride.iconClass && <i className={`fas ${ctaOverride.iconClass}`} aria-hidden="true" />}
                {ctaOverride.label}
              </Link>
            </div>
          )}

          <div className="pub-stats mt-auto">
            {isLand ? (
              <span title={t('features.size')}>
                <i className="fas fa-vector-square" aria-hidden="true"></i>
                {sizeLabel}
              </span>
            ) : (
              <>
                <span title={t('features.rooms')}>
                  <i className="fas fa-bed" aria-hidden="true"></i>
                  {formatNumberValue(publication.rooms, '-')}
                </span>
                <span title={t('features.bathrooms')}>
                  <i className="fas fa-bath" aria-hidden="true"></i>
                  {formatNumberValue(publication.bathrooms, '-')}
                </span>
                <span title={t('features.size')}>
                  <i className="fas fa-vector-square" aria-hidden="true"></i>
                  {sizeLabel}
                </span>
              </>
            )}
          </div>
        </div>
      </article>
    </div>
  );
};

export default PublicationCard;
