"use client";

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useToggleFavorite } from '@/hooks/api/useFavorites';
import { useCities, useCountries, useMunicipalities } from '@/hooks/api/useCatalogs';
import { useSellerInfo } from '@/hooks/api/usePublications';
import { useAuth } from '@/utils/AuthContext';
import type { PublicationDetail, Country, City, Municipality } from '@/types/api';
import { getBackendUrl } from '@/utils/backendUrl';
import PropertyFeatureIcon from './PropertyFeatureIcon';
import { formatNumberValue, formatPrice, getPublicationStatusInfo } from './publicationUtils';
// Fase 22 — slug en `from=` para que el login redirija a la URL canónica.
import { publicationIdentifier } from '@/utils/publicationUrl';

interface PublicationContentProps {
  publication: PublicationDetail;
}

const DEFAULT_AVATAR = '/assets/img/profile/avatar.png';

const PublicationContent = ({ publication }: PublicationContentProps) => {
  const t = useTranslations('publications');
  const { user } = useAuth();
  const countriesQuery = useCountries();
  const citiesQuery = useCities(publication.cou_id);
  const municipalitiesQuery = useMunicipalities(publication.cit_id);
  const sellerQuery = useSellerInfo(publication.cus_id);
  const toggleFavoriteMutation = useToggleFavorite(publication.pub_id);

  // El vendedor no se contacta a sí mismo. Si no hay sesión, redirigimos
  // a /login con `from` para que tras autenticarse vuelva a esta página.
  const isOwnPublication = user?.id === publication.cus_id;
  const contactHref = !user
    ? `/login?from=/publications/${publicationIdentifier(publication)}`
    : `/messages?pub=${publication.pub_id}&with=${publication.cus_id}`;

  const seller = sellerQuery.data;
  const sellerName = seller ? `${seller.firstName} ${seller.lastName}` : publication.user;
  const sellerHandle = seller?.handle ? `@${seller.handle}` : t('detail.sellerFallback');
  const sellerImage = seller?.imageUrl ? getBackendUrl(seller.imageUrl) : DEFAULT_AVATAR;
  const [avatarErrored, setAvatarErrored] = useState(false);

  const countryName = countriesQuery.data?.find((c: Country) => c.country === publication.cou_id)?.description;
  const cityName = citiesQuery.data?.find((c: City) => c.city === publication.cit_id)?.description;
  const municipalityName = municipalitiesQuery.data?.find((m: Municipality) => m.municipality === publication.tow_id)?.description;

  const favoritesCount = publication.favoritesCount;
  const statusInfo = getPublicationStatusInfo(publication.pubsta_id, {
    sold: t('status.sold'),
    soldSub: t('status.soldSub'),
    void: t('status.void'),
    voidSub: t('status.voidSub'),
    draft: t('status.draft'),
    draftSub: t('status.draftSub'),
    available: t('status.available'),
    availableSub: t('status.availableSub'),
  });
  const favoriteLabel = publication.isFavorite ? t('favorite.remove') : t('favorite.add');
  const notSpecified = t('common.notSpecified');

  return (
    <section className="art-details-area pt-50 pb-0">
      <div className="container">
        <div className="art-details-content wow fadeInUp">
          {/* ───────── Vendedor ───────── */}
          <div className="created-by">{t('detail.publishedBy')}</div>
          <div className="seller-row">
            <div className="seller-avatar">
              <Link href={`/creator-profile/${publication.cus_id}`}>
                <Image
                  src={avatarErrored ? DEFAULT_AVATAR : sellerImage}
                  alt={sellerName}
                  width={64}
                  height={64}
                  onError={() => setAvatarErrored(true)}
                  unoptimized={avatarErrored}
                />
              </Link>
              <span className="seller-verified" aria-label={t('detail.sellerVerified')}>
                <i className="fas fa-check"></i>
              </span>
            </div>
            <div className="seller-info">
              <h4 className="seller-name">
                <Link href={`/creator-profile/${publication.cus_id}`}>{sellerName}</Link>
              </h4>
              <div className="seller-handle">
                <Link href={`/creator-profile/${publication.cus_id}`}>{sellerHandle}</Link>
              </div>
            </div>
          </div>

          {/* Divisor */}
          <div className="content-divider" />

          {/* ───────── Título y descripción ───────── */}
          <h2 className="publication-detail-title">{publication.pub_title}</h2>
          <p className="publication-detail-description">{publication.pub_description}</p>

          <div className="content-divider" />

          {/* ───────── Precio / Vistas / Estado ───────── */}
          <div className="meta-grid">
            <div className="meta-cell">
              <div className="meta-label">{t('card.price')}</div>
              <div className="meta-value meta-price">
                {formatPrice(publication.pubdet_price, publication.pubdet_currency, t('card.priceConsult'))}
              </div>
              <div className="meta-sublabel">
                {publication.pubdet_currency === 'USD' ? t('detail.currencyUsd') : t('detail.currencyGtq')}
              </div>
            </div>
            <div className="meta-cell">
              <div className="meta-label">{t('detail.views')}</div>
              <div className="meta-value">{formatNumberValue(publication.pub_views, '0')}</div>
              <div className="meta-sublabel">{t('detail.interest')}</div>
            </div>
            <div className="meta-cell">
              <div className="meta-label">{t('detail.status')}</div>
              <div className="meta-value" style={{ color: statusInfo.color }}>
                {statusInfo.label}
              </div>
              <div className="meta-sublabel">{statusInfo.sublabel}</div>
            </div>
          </div>

          {/* ───────── Acciones ───────── */}
          <div className="action-row">
            <Link href={`/creator-profile/${publication.cus_id}`} className="action-btn action-btn-primary">
              <i className="fal fa-user"></i>
              <span>{t('detail.viewSeller')}</span>
            </Link>
            <button
              type="button"
              className={`action-btn action-btn-secondary ${publication.isFavorite ? 'is-favorite' : ''}`}
              title={favoriteLabel}
              aria-label={favoriteLabel}
              onClick={() => toggleFavoriteMutation.mutate()}
              disabled={toggleFavoriteMutation.isPending}
            >
              <i className={publication.isFavorite ? 'fas fa-heart' : 'far fa-heart'}></i>
              <span className="favorites-count">{favoritesCount}</span>
            </button>
            {isOwnPublication ? (
              <button
                type="button"
                className="action-btn action-btn-secondary"
                disabled
                title={t('detail.contactOwnerTitle')}
                aria-label={t('detail.contactOwnerAria')}
              >
                <i className="flaticon-chatting"></i>
                <span>{t('detail.contact')}</span>
              </button>
            ) : (
              <Link
                href={contactHref}
                className="action-btn action-btn-secondary"
                title={user ? t('detail.contactSellerTitle') : t('detail.contactLoginTitle')}
                aria-label={t('detail.contactSellerTitle')}
              >
                <i className="flaticon-chatting"></i>
                <span>{t('detail.contact')}</span>
              </Link>
            )}
          </div>

          {/* ───────── Tabs ───────── */}
          <div className="art-details-information mt-40">
            <div className="art-information-tab-nav mb-20">
              <nav>
                <div className="nav nav-tabs" id="nav-tab" role="tablist">
                  <button
                    className="nav-link active"
                    id="nav-info-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#tab-info"
                    type="button"
                    role="tab"
                    aria-selected="true"
                  >
                    <span className="profile-nav-button">{t('detail.info')}</span>
                  </button>
                  <button
                    className="nav-link"
                    id="nav-details-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#tab-details"
                    type="button"
                    role="tab"
                    aria-selected="false"
                  >
                    <span className="profile-nav-button">{t('detail.features')}</span>
                  </button>
                </div>
              </nav>
            </div>
            <div className="art-information-tab-contents mb-0">
              <div className="tab-content" id="nav-tabContent">
                <div className="tab-pane fade active show" id="tab-info" role="tabpanel" aria-labelledby="nav-info-tab">
                  <div className="info-list">
                    <InfoRow icon="address" label={t('features.address')} value={publication.pub_address} fallback={notSpecified} />
                    <InfoRow icon="country" label={t('features.country')} value={countryName} fallback={notSpecified} />
                    <InfoRow icon="state" label={t('features.state')} value={cityName} fallback={notSpecified} />
                    <InfoRow icon="town" label={t('features.municipality')} value={municipalityName} fallback={notSpecified} />
                  </div>
                </div>
                <div className="tab-pane fade" id="tab-details" role="tabpanel" aria-labelledby="nav-details-tab">
                  <div className="info-list">
                    <InfoRow icon="rooms" label={t('features.rooms')} value={formatNumberValue(publication.pubdet_rooms, notSpecified)} fallback={notSpecified} />
                    <InfoRow icon="bathrooms" label={t('features.bathrooms')} value={formatNumberValue(publication.pubdet_bathrooms, notSpecified)} fallback={notSpecified} />
                    <InfoRow icon="parking" label={t('features.parking')} value={formatNumberValue(publication.pubdet_parking, notSpecified)} fallback={notSpecified} />
                    {/* Fase 19.5: la etiqueta de "Nivel" cambia según el tipo.
                        Apto = nivel del edificio. Casa = niveles totales. */}
                    <InfoRow
                      icon="level"
                      label={Number(publication.pubgen_id) === 1 ? t('features.levels') : t('features.level')}
                      value={formatNumberValue(publication.pubdet_level, notSpecified)}
                      fallback={notSpecified}
                    />
                    <InfoRow
                      icon="size"
                      label={t('features.size')}
                      value={publication.pubdet_size ? `${publication.pubdet_size} m²` : notSpecified}
                      fallback={notSpecified}
                    />
                    {/* Fase 19.5 — frente y fondo, solo si son terreno y los tienen. */}
                    {publication.pubdet_frente != null && (
                      <InfoRow
                        icon="size"
                        label={t('features.width')}
                        value={`${publication.pubdet_frente} m`}
                        fallback={notSpecified}
                      />
                    )}
                    {publication.pubdet_fondo != null && (
                      <InfoRow
                        icon="size"
                        label={t('features.depth')}
                        value={`${publication.pubdet_fondo} m`}
                        fallback={notSpecified}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Fase 19.5 — sección de amenidades. Solo se muestra si la
                  publicación tiene alguna marcada. */}
              {publication.amenities && publication.amenities.length > 0 && (
                <div className="amenities-section">
                  <h4 className="amenities-title">
                    <i className="fas fa-star" /> {t('features.amenities')}
                  </h4>
                  <div className="amenities-grid">
                    {publication.amenities.map((a) => (
                      <div key={a.id} className="amenity-chip">
                        {a.icon && <i className={`fas ${a.icon}`} />}
                        <span>{a.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* ──────────────── Vendedor ──────────────── */
        .created-by {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--fg-subtle);
          margin-bottom: 10px;
        }
        .seller-row {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 12px;
        }
        .seller-avatar {
          position: relative;
          flex-shrink: 0;
        }
        .seller-avatar :global(img) {
          width: 64px !important;
          height: 64px !important;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid var(--lav-400);
        }
        .seller-verified {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 22px;
          height: 22px;
          background: var(--green-500);
          color: var(--navy-900);
          font-size: 10px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--surface);
        }
        .seller-info { min-width: 0; }
        .seller-name {
          font-family: var(--font-display);
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 4px;
          color: var(--fg-strong);
        }
        .seller-name :global(a) {
          color: var(--fg-strong);
          text-decoration: none;
        }
        .seller-handle {
          font-size: 14px;
        }
        .seller-handle :global(a) {
          color: var(--lav-700);
          text-decoration: none;
        }
        :global([data-theme='dark']) .seller-handle :global(a) {
          color: var(--lav-400);
        }

        /* Separador neutral: visible en light y dark mode */
        .content-divider {
          height: 1px;
          background: var(--border);
          margin: 28px 0;
        }

        /* ──────────────── Título y descripción ──────────────── */
        .publication-detail-title {
          font-family: var(--font-display);
          font-size: 36px;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 16px;
          color: var(--fg-strong);
        }
        .publication-detail-description {
          font-size: 15px;
          line-height: 1.7;
          color: var(--fg-muted);
          margin: 0;
        }

        /* ──────────────── Meta grid ──────────────── */
        .meta-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
        }
        @media (max-width: 768px) {
          .meta-grid { grid-template-columns: 1fr; gap: 18px; }
        }
        .meta-cell {
          padding: 0 28px;
          border-right: 1px solid var(--border);
          text-align: center;
        }
        .meta-cell:first-child { padding-left: 0; }
        .meta-cell:last-child {
          border-right: none;
          padding-right: 0;
        }
        @media (max-width: 768px) {
          .meta-cell {
            border-right: none;
            padding: 0;
            text-align: left;
          }
        }
        .meta-label {
          font-size: 12px;
          color: var(--fg-subtle);
          margin-bottom: 6px;
        }
        .meta-value {
          font-family: var(--font-display);
          font-size: 26px;
          font-weight: 700;
          color: var(--fg-strong);
        }
        .meta-price { color: var(--fg-strong); }

        /* ──────────────── Fase 19.5 — Amenidades ──────────────── */
        .amenities-section {
          margin-top: 26px;
          padding-top: 22px;
          border-top: 1px solid var(--border);
        }
        .amenities-title {
          display: flex;
          align-items: center;
          gap: 9px;
          font-family: var(--font-display);
          font-size: 17px;
          font-weight: 700;
          margin: 0 0 14px;
          color: var(--fg-strong);
        }
        .amenities-title :global(i) {
          color: var(--rating);
          font-size: 15px;
        }
        .amenities-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .amenity-chip {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 14px;
          background: var(--surface-sunk);
          border: 1px solid var(--border);
          border-radius: var(--r-pill);
          font-size: 13px;
          font-weight: 600;
          color: var(--fg-strong);
        }
        .amenity-chip :global(i) {
          color: var(--lav-700);
          font-size: 13px;
        }
        :global([data-theme='dark']) .amenity-chip :global(i) {
          color: var(--lav-400);
        }
        .meta-sublabel {
          font-size: 12px;
          color: var(--fg-subtle);
          margin-top: 4px;
        }

        /* ──────────────── Acciones — los 3 botones alineados ────────────────
           Usamos :global() porque styled-jsx no scope clases en <Link> de Next.
           Sin :global el botón "Ver vendedor" pierde estilos y queda como texto plano. */
        .action-row {
          display: flex;
          gap: 12px;
          margin-top: 36px;
          margin-bottom: 36px;
          flex-wrap: wrap;
          align-items: stretch;
        }
        .action-row :global(.action-btn) {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 0 24px;
          height: 48px;             /* misma altura para los 3 */
          min-width: 150px;
          border-radius: var(--r-pill);
          font-weight: 600;
          font-size: 14px;
          line-height: 1;
          cursor: pointer;
          border: 1.5px solid var(--border-strong);  /* border en todos */
          background: transparent;
          color: var(--fg-strong);
          text-decoration: none !important;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .action-row :global(.action-btn i) {
          font-size: 16px;
          line-height: 1;
          display: inline-flex;
          align-items: center;
        }
        /* Primary: navy filled (consistencia con la card) */
        .action-row :global(.action-btn-primary) {
          background: var(--navy-800) !important;
          border-color: var(--navy-800) !important;
          color: var(--cream) !important;
        }
        .action-row :global(.action-btn-primary:hover) {
          background: var(--navy-700) !important;
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }
        /* Secondary: outline neutro → hover lavanda */
        .action-row :global(.action-btn-secondary:hover) {
          border-color: var(--lav-500);
          color: var(--lav-700);
        }
        .action-row :global(.action-btn-secondary.is-favorite) {
          border-color: var(--danger);
          color: var(--danger);
        }
        .action-row :global(.action-btn:disabled) {
          cursor: wait;
          opacity: 0.75;
        }
        .action-row :global(.favorites-count) {
          font-size: 14px;
          font-weight: 700;
        }

        /* ──────────────── Tabs Bootstrap ──────────────── */
        .art-information-tab-nav :global(.nav-link) {
          color: var(--fg-muted);
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          font-weight: 600;
          transition: color 0.2s, border-color 0.2s;
        }
        .art-information-tab-nav :global(.nav-link:hover) {
          color: var(--lav-700);
        }
        .art-information-tab-nav :global(.nav-link.active) {
          color: var(--lav-700);
          border-bottom-color: var(--lav-500);
        }
        :global([data-theme='dark']) .art-information-tab-nav :global(.nav-link:hover),
        :global([data-theme='dark']) .art-information-tab-nav :global(.nav-link.active) {
          color: var(--lav-400);
        }

        /* ──────────────── Info list ──────────────── */
        .info-list {
          display: flex;
          flex-direction: column;
        }
        .info-list :global(.info-row) {
          display: grid;
          grid-template-columns: 200px 20px 1fr;
          align-items: center;
          gap: 12px;
          padding: 14px 0;
          border-bottom: 1px solid var(--border);
        }
        .info-list :global(.info-row:last-child) { border-bottom: none; }
        .info-list :global(.info-row-label) {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--fg-muted);
          font-size: 14px;
        }
        .info-list :global(.info-row-separator) {
          color: var(--fg-subtle);
          text-align: center;
        }
        .info-list :global(.info-row-value) {
          font-weight: 600;
          font-size: 14px;
          color: var(--fg-strong);
        }
        /* Mobile: icono+label izquierda, valor derecha (sin saltos de línea) */
        @media (max-width: 768px) {
          .info-list :global(.info-row) {
            grid-template-columns: 1fr auto;
            gap: 12px;
            padding: 12px 0;
          }
          .info-list :global(.info-row-separator) { display: none; }
          .info-list :global(.info-row-value) {
            text-align: right;
          }
        }
        /* Acciones en mobile: ocupan todo el ancho */
        @media (max-width: 480px) {
          .action-row :global(.action-btn) {
            flex: 1 1 calc(50% - 6px);
            min-width: 0;
            padding: 0 12px;
          }
        }
      `}</style>
    </section>
  );
};

// ============================================================================
// Helper: fila de info con icono + label + valor (alineados en grid)
// ============================================================================

interface InfoRowProps {
  icon: 'address' | 'country' | 'state' | 'town' | 'rooms' | 'bathrooms' | 'parking' | 'level' | 'size';
  label: string;
  value: string | null | undefined;
  fallback: string;
}

const InfoRow = ({ icon, label, value, fallback }: InfoRowProps) => (
  <div className="info-row">
    <span className="info-row-label">
      <PropertyFeatureIcon feature={icon} size={16} />
      {label}
    </span>
    <span className="info-row-separator">:</span>
    <span className="info-row-value">{value ?? fallback}</span>
  </div>
);

export default PublicationContent;
