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

// Formatea un valor REAL cargado (sin conversión: nunca inventamos una tasa).
function buildPrice(
  rawPrice: number | string | null | undefined,
  currency: string | null | undefined,
): FormattedPrice | null {
  if (rawPrice === null || rawPrice === undefined || rawPrice === '') return null;
  const numeric = Number(rawPrice);
  if (!Number.isFinite(numeric)) return null;

  return {
    symbol: currency === 'USD' ? 'US$' : 'Q',
    amount: formatAmount(numeric),
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

// Switch animado Q ⇄ US$. Solo alterna cuando la publicación trae AMBOS valores
// REALES (Quetzales y Dólares) cargados por el dueño — nunca convertimos con una
// tasa. Si hay una sola moneda, muestra ese precio estático. Con
// prefers-reduced-motion: reduce no anima ni alterna (muestra el primero).
interface PriceSwitchProps {
  prices: FormattedPrice[];
  fallback: string;
}

const PriceSwitch: React.FC<PriceSwitchProps> = ({ prices, fallback }) => {
  const reducedMotion = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const canSwitch = prices.length > 1 && !reducedMotion;

  useEffect(() => {
    if (!canSwitch) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % prices.length), PRICE_SWITCH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [canSwitch, prices.length]);

  if (prices.length === 0) {
    return (
      <div className="pub-price-row">
        <span className="pub-price-amount">{fallback}</span>
      </div>
    );
  }

  const active = prices[index % prices.length];

  return (
    <div className="pub-price-row">
      {/* `key` re-monta el bloque para disparar la animación de entrada solo
          cuando efectivamente hay alternancia. El wrapper SIEMPRE lleva flex+gap
          (.pub-price-value) para separar símbolo y monto; .pub-price-swap solo
          agrega la animación cuando hay dos monedas. */}
      <div
        key={canSwitch ? active.symbol : 'static'}
        className={`pub-price-value${canSwitch ? ' pub-price-swap' : ''}`}
      >
        <span className="pub-price-symbol">{active.symbol}</span>
        <span className="pub-price-amount">{active.amount}</span>
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

  // Parqueos en la tarjeta, sólo "para lo que aplique":
  //   · nunca en terrenos (igual que el detalle, que ya lo esconde con !isLand),
  //   · y sólo si hay al menos uno.
  // Ese segundo filtro importa: `pubdet_parking` es varchar en la base, así que
  // llega como "", "0", null o texto viejo. Mostrar "0" en una tarjeta chica
  // ocupa lugar sin informar nada — quien no tiene parqueo no gana con leerlo.
  const parkingCount = Number(publication.parking);
  const showParking = !isLand && Number.isFinite(parkingCount) && parkingCount > 0;

  // Switch de divisa: SOLO con valores reales. El precio primario siempre va;
  // el alterno (otra moneda) solo si el backend lo provee (Fase 17 dual-divisa,
  // pendiente — ver feedback §2). Mientras tanto cada card muestra una sola
  // moneda estática (sin conversión inventada).
  const prices = useMemo(() => {
    const list: FormattedPrice[] = [];
    const primary = buildPrice(publication.price, publication.currency);
    if (primary) list.push(primary);
    const alt = buildPrice(publication.priceAlt, publication.currencyAlt);
    // Evita duplicar si por error vinieran ambos en la misma moneda.
    if (alt && alt.symbol !== primary?.symbol) list.push(alt);
    return list;
  }, [publication.price, publication.currency, publication.priceAlt, publication.currencyAlt]);

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
          <PriceSwitch prices={prices} fallback={t('card.priceConsult')} />

          <h4 className="pub-title publication-title">
            <Link href={detailsHref}>{publication.title}</Link>
          </h4>

          <div className="pub-loc">
            <i className="fas fa-map-marker-alt" aria-hidden="true"></i>
            <span>{locationLabel}</span>
          </div>

          <div className="pub-foot mt-auto">
            <div className="pub-stats">
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
                {showParking && (
                  <span title={t('features.parking')}>
                    <i className="fas fa-car" aria-hidden="true"></i>
                    {parkingCount}
                  </span>
                )}
              </>
            )}
            </div>

            {/* Handoff #14 §1 + decisión Aurelio: "Enviar mensaje" SOLO en
                pautadas de mensajes (ctaOverride) y solo en vista lista (CSS
                .pub-grid.is-rows). En grid la pautada conserva su CTA full-width
                aprobado (.pub-cta-row); en lista se reemplaza por este pill. Las
                tarjetas orgánicas no llevan botón (se entra al detalle). */}
            {ctaOverride && (
              <Link
                href={ctaOverride.href}
                className="pub-list-cta"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  ctaOverride.onMouseDown?.();
                }}
              >
                {ctaOverride.iconClass && (
                  <i className={`fas ${ctaOverride.iconClass}`} aria-hidden="true"></i>
                )}
                <span>{ctaOverride.label}</span>
              </Link>
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
