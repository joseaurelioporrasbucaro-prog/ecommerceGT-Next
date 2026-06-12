"use client";

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useToggleFavorite } from '@/hooks/api/useFavorites';
import { getImageVariant } from '@/utils/imageVariants';
// Fase 22 — URL canónica de publicación = slug (anti-enumeración + SEO).
import { publicationPath } from '@/utils/publicationUrl';
import type { AnyPublicationListItem } from '@/types/api';
import {
  CARD_PLACEHOLDER,
  formatNumberValue,
  getPublicationListAllImages,
  getStatusBadge,
  isLandCategory,
  PUBSTA_DRAFT,
  PUBSTA_SOLD,
  PUBSTA_VOID,
  isPublicationListItemAuth,
} from './publicationUtils';

// Handoff #8 §2 — tipo de cambio temporal. Cuando el backend exponga la tasa
// (config o endpoint), reemplazar por la lectura real (queda como gap en el
// feedback doc §2). 7.8 GTQ/USD es el orden de magnitud.
// TODO(currency-rate): leer del backend cuando exista.
const GTQ_TO_USD_RATE = 7.8;
const PRICE_SWITCH_INTERVAL_MS = 3200;

interface PublicationCardProps {
  publication: AnyPublicationListItem;
  /** Badge "Nuevo" sobre la foto — primera publicación cuando se ordena por más recientes. */
  isNew?: boolean;
  /** Pauta/Destacado: lavanda glow + ring lavanda en la card. */
  isFeatured?: boolean;
  /** Handoff #8 [CARD-4] — la card está dentro de una sección "Patrocinado"/"Destacado"
   * que ya rotula el contexto. Suprime el badge para no duplicar la etiqueta;
   * conserva el ring lavanda de `is-featured`. */
  inSponsoredSection?: boolean;
  /** Fase 10.4 (re-skin Handoff #8 [CARD-3]): sobrescribe el CTA al final del
   * cuerpo. Ya no acepta `gold` — el botón es siempre verde sólido del sistema. */
  ctaOverride?: {
    label: string;
    href: string;
    iconClass?: string; // ej. 'fa-comments'
    onMouseDown?: () => void;
  };
}

interface FormattedPrice {
  symbol: string;
  amount: string;
}

function formatAmount(value: number): string {
  if (!Number.isFinite(value)) return '';
  const fixed = value.toFixed(2);
  const [integerPart, decimalPart] = fixed.split('.');
  const integerFormatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decimalPart === '00' ? integerFormatted : `${integerFormatted}.${decimalPart}`;
}

function buildPrice(
  rawPrice: number | string | null | undefined,
  currency: string | null | undefined,
  target: 'GTQ' | 'USD',
): FormattedPrice | null {
  if (rawPrice === null || rawPrice === undefined || rawPrice === '') return null;
  const numeric = Number(rawPrice);
  if (!Number.isFinite(numeric)) return null;

  const sourceIsUsd = currency === 'USD';
  let amount = numeric;
  if (sourceIsUsd && target === 'GTQ') amount = numeric * GTQ_TO_USD_RATE;
  if (!sourceIsUsd && target === 'USD') amount = numeric / GTQ_TO_USD_RATE;

  return {
    symbol: target === 'USD' ? 'US$' : 'Q',
    amount: formatAmount(amount),
  };
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

// Switch animado Q ⇄ US$. Con prefers-reduced-motion: reduce muestra solo la
// moneda nativa (sin animar, sin alternar).
interface PriceSwitchProps {
  price: number | string | null | undefined;
  currency: string | null | undefined;
  fallback: string;
}

const PriceSwitch: React.FC<PriceSwitchProps> = ({ price, currency, fallback }) => {
  const reducedMotion = usePrefersReducedMotion();
  const [showUsd, setShowUsd] = useState(false);

  useEffect(() => {
    if (reducedMotion) return;
    const id = setInterval(() => setShowUsd((v) => !v), PRICE_SWITCH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [reducedMotion]);

  const nativeIsUsd = currency === 'USD';
  const target: 'GTQ' | 'USD' = reducedMotion
    ? (nativeIsUsd ? 'USD' : 'GTQ')
    : (showUsd ? 'USD' : 'GTQ');

  const formatted = buildPrice(price, currency, target);
  if (!formatted) {
    return (
      <div className="pub-price-row">
        <span className="pub-price-amount">{fallback}</span>
      </div>
    );
  }

  return (
    <div className="pub-price-row">
      <div key={target} className="pub-price-swap">
        <span className="pub-price-symbol">{formatted.symbol}</span>
        <span className="pub-price-amount">{formatted.amount}</span>
      </div>
    </div>
  );
};

const PublicationCard = ({
  publication,
  isNew = false,
  isFeatured = false,
  inSponsoredSection = false,
  ctaOverride,
}: PublicationCardProps) => {
  const t = useTranslations('publications');
  const allImages = useMemo(() => getPublicationListAllImages(publication), [publication]);
  const hasMultiple = allImages.length > 1;

  const [hoverIndex, setHoverIndex] = useState(0);
  // Cadena de fallback: variant detail (1600×900 → cover 3:2) → original → placeholder.
  const [imageStage, setImageStage] = useState<'variant' | 'original' | 'placeholder'>('variant');
  const toggleFavoriteMutation = useToggleFavorite(publication.id);

  const currentImage = useMemo(() => {
    if (imageStage === 'placeholder' || allImages.length === 0) return CARD_PLACEHOLDER;
    const original = allImages[hoverIndex] ?? CARD_PLACEHOLDER;
    if (original === CARD_PLACEHOLDER) return CARD_PLACEHOLDER;
    // Handoff #8 §1 — fallback sin backend: usar variant `detail` (16:9) y
    // recortar con object-fit:cover al box 3:2 de .pub-photo.
    return imageStage === 'variant' ? getImageVariant(original, 'detail') : original;
  }, [imageStage, allImages, hoverIndex]);

  const isFavorite = isPublicationListItemAuth(publication) && publication.isFavorite;
  const isLand = isLandCategory(publication.category);
  const statusBadge = getStatusBadge(publication.pubstaId, {
    sold: t('status.sold'),
    draft: t('status.draft'),
    void: t('status.void'),
  });
  const statusClass =
    publication.pubstaId === PUBSTA_SOLD ? 'st-vendida'
    : publication.pubstaId === PUBSTA_DRAFT ? 'st-borrador'
    : publication.pubstaId === PUBSTA_VOID ? 'st-anulada'
    : '';

  const locationLabel = publication.town || publication.city || t('card.noLocation');

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
    setImageStage((prev) => (prev === 'variant' ? 'original' : 'placeholder'));
  };
  const handleToggleFavorite = () => {
    toggleFavoriteMutation.mutate();
  };

  const detailsHref = publicationPath(publication);
  const sizeLabel =
    publication.sizee !== null && publication.sizee !== undefined
      ? `${formatNumberValue(publication.sizee, '-')} m²`
      : '-';

  // Handoff #8 §1 [CARD-4] — el badge no se renderiza dentro de la sección
  // que ya rotula "Destacado/Patrocinado" (el ring lavanda sigue presente).
  const showFeaturedBadge = isFeatured && !inSponsoredSection;
  const showNewBadge = isNew && !statusBadge && !showFeaturedBadge;

  return (
    <div className="col-xl-4 col-lg-6 col-md-6 col-sm-12 d-flex">
      <article className={`pub-card publication-card mb-30 ${isFeatured ? 'is-featured' : ''}`}>
        <div
          className={`pub-photo publication-card-image ${hasMultiple ? 'has-multiple' : 'single-image'}`}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div className="publication-badges">
            {statusBadge && (
              <div className={`publication-status-badge ${statusClass}`}>
                {statusBadge.label}
              </div>
            )}
            {showFeaturedBadge && (
              <div className="publication-featured-badge">
                <i className="fas fa-star"></i>
                {t('card.featured')}
              </div>
            )}
            {showNewBadge && (
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
          <PriceSwitch
            price={publication.price}
            currency={publication.currency}
            fallback={t('card.priceConsult')}
          />

          <h4 className="pub-title publication-title">
            <Link href={detailsHref}>{publication.title}</Link>
          </h4>

          <div className="pub-loc">
            <i className="fas fa-map-marker-alt" aria-hidden="true"></i>
            <span>{locationLabel}</span>
          </div>

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

          {ctaOverride && (
            <div className="pub-cta-row">
              <Link
                href={ctaOverride.href}
                className="publication-view-btn"
                onMouseDown={ctaOverride.onMouseDown}
              >
                {ctaOverride.iconClass && <i className={`fas ${ctaOverride.iconClass}`} aria-hidden="true" />}
                {ctaOverride.label}
              </Link>
            </div>
          )}
        </div>
      </article>
    </div>
  );
};

export default PublicationCard;
