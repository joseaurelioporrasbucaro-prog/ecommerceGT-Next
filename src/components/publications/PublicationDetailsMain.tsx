"use client";

import Image from 'next/image';
import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import ThemeChanger from '@/components/home/ThemeChanger';
import { ApiError } from '@/utils/Api';
import { usePublicationDetail, useSellerInfo } from '@/hooks/api/usePublications';
import { useRegisterView } from '@/hooks/api/useRegisterView';
import { useToggleFavorite } from '@/hooks/api/useFavorites';
import { useCities, useCountries, useMunicipalities } from '@/hooks/api/useCatalogs';
import { useAuth } from '@/utils/AuthContext';
import { getBackendUrl } from '@/utils/backendUrl';
import PublicationComments from './PublicationComments';
import PublicationGallery from './PublicationGallery';
import ReportPublicationButton from './ReportPublicationButton';
import {
  formatNumberValue,
  formatPrice,
  getPublicationImagePath,
  getPublicationImagePathGlb,
  getPublicationStatusInfo,
} from './publicationUtils';
// Fase 22 — URL canónica = slug. El viewer es público así que también va con slug.
import { publicationIdentifier } from '@/utils/publicationUrl';
import type {
  City,
  Country,
  Municipality,
  PublicationAmenity,
  PublicationImage,
  PublicationImageGlb,
} from '@/types/api';

interface PublicationDetailsMainProps {
  id: string;
}

const DEFAULT_AVATAR = '/assets/img/profile/avatar.png';

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

// Tile de especificación: icono lavanda + valor display + label.
interface SpecTileProps {
  icon: string;
  value: string;
  label: string;
}

const SpecTile = ({ icon, value, label }: SpecTileProps) => (
  <div className="spec-tile">
    <i className={icon} aria-hidden="true" />
    <div className="spec-tile-body">
      <div className="spec-tile-value">{value}</div>
      <div className="spec-tile-label">{label}</div>
    </div>
  </div>
);

const PublicationDetailsMain = ({ id }: PublicationDetailsMainProps) => {
  const t = useTranslations('publications');
  const { user } = useAuth();
  const publicationQuery = usePublicationDetail(id);
  const publication = publicationQuery.data;

  // Registra una vista al abrir el detalle (el backend ignora al dueño).
  useRegisterView(id);

  const galleryImages = useMemo(() => {
    if (!publication) return [];
    return publication.images
      .map((img: PublicationImage) => getPublicationImagePath(img))
      .filter((path: string) => path !== '')
      .map((path: string) => getBackendUrl(path));
  }, [publication]);

  const galleryImagesGlb = useMemo(() => {
    if (!publication?.imagesglb) return [];
    return publication.imagesglb
      .map((img: PublicationImageGlb) => getPublicationImagePathGlb(img))
      .filter((path: string) => path !== '')
      .map((path: string) => getBackendUrl(path));
  }, [publication]);
  const hasGlb = galleryImagesGlb.length > 0;

  // ── Datos del vendedor / catálogo de ubicación (antes en PublicationContent) ──
  const countriesQuery = useCountries();
  const citiesQuery = useCities(publication?.cou_id ?? null);
  const municipalitiesQuery = useMunicipalities(publication?.cit_id ?? null);
  const sellerQuery = useSellerInfo(publication?.cus_id ?? null);
  const toggleFavoriteMutation = useToggleFavorite(publication?.pub_id ?? 0);

  const [avatarErrored, setAvatarErrored] = useState(false);

  // Fase 24 (2026-06-10): si no está cargando, no hay error explícito y no
  // hay datos, igual mostramos un error controlado en vez de dejar la página
  // vacía (que hacía que el footer flotara hasta arriba). Cubre el edge case
  // de query deshabilitada / data nula.
  const showControlledError =
    !publicationQuery.isLoading && (publicationQuery.error || !publication);

  // El vendedor no se contacta a sí mismo. Si no hay sesión, redirigimos
  // a /login con `from` para que tras autenticarse vuelva a esta página.
  const isOwnPublication = !!publication && user?.id === publication.cus_id;
  const contactHref = publication
    ? !user
      ? `/login?from=/publications/${publicationIdentifier(publication)}`
      : `/messages?pub=${publication.pub_id}&with=${publication.cus_id}`
    : '/login';

  const seller = sellerQuery.data;
  const sellerName = seller
    ? `${seller.firstName} ${seller.lastName}`
    : publication?.user ?? '';
  const sellerImage = seller?.imageUrl ? getBackendUrl(seller.imageUrl) : DEFAULT_AVATAR;
  const sellerVerified = !!seller?.verified;

  const countryName = countriesQuery.data?.find(
    (c: Country) => c.country === publication?.cou_id,
  )?.description;
  const cityName = citiesQuery.data?.find(
    (c: City) => c.city === publication?.cit_id,
  )?.description;
  const municipalityName = municipalitiesQuery.data?.find(
    (m: Municipality) => m.municipality === publication?.tow_id,
  )?.description;

  const locationLabel = [municipalityName, cityName, countryName]
    .filter(Boolean)
    .join(', ');

  const notSpecified = t('common.notSpecified');
  const isRent = publication ? Number(publication.pubtra_id) === 2 : false;
  const transactionLabel = isRent ? t('detail.forRent') : t('detail.forSale');

  const priceText = publication
    ? formatPrice(publication.pubdet_price, publication.pubdet_currency, t('card.priceConsult'))
    : '';
  const currencyLabel = publication
    ? publication.pubdet_currency === 'USD'
      ? t('detail.currencyUsd')
      : t('detail.currencyGtq')
    : '';

  const statusInfo = publication
    ? getPublicationStatusInfo(publication.pubsta_id, {
        sold: t('status.sold'),
        soldSub: t('status.soldSub'),
        void: t('status.void'),
        voidSub: t('status.voidSub'),
        draft: t('status.draft'),
        draftSub: t('status.draftSub'),
        available: t('status.available'),
        availableSub: t('status.availableSub'),
      })
    : null;

  const favoriteLabel = publication?.isFavorite ? t('favorite.remove') : t('favorite.add');
  const viewerHref = publication
    ? `/publications/${publicationIdentifier(publication)}/viewer`
    : '#';

  // Chip "Premium · Ver modelo 3D" reutilizado en la card y la barra móvil.
  const Premium3dButton = ({ variant }: { variant: 'card' | 'bar' }) =>
    hasGlb ? (
      <Link href={viewerHref} className={`view-3d-btn view-3d-btn--${variant}`}>
        <i className="fas fa-cube" aria-hidden="true" />
        <span>{variant === 'card' ? t('detail.view3d') : t('detail.short3d')}</span>
        <span className="view-3d-premium">
          <i className="fas fa-crown" aria-hidden="true" />
          {variant === 'card' && <span>{t('detail.premium')}</span>}
        </span>
      </Link>
    ) : null;

  return (
    <>
      <ThemeChanger />

      {publicationQuery.isLoading && (
        <section className="art-details-area pt-130 pb-90 kiosqui-detail-state">
          <div className="container">
            <div className="alert alert-info">{t('detail.loadingPublication')}</div>
          </div>
        </section>
      )}

      {showControlledError && (
        <section className="art-details-area pt-130 pb-90 kiosqui-detail-state">
          <div className="container">
            <div className="kiosqui-detail-error">
              <i className="fas fa-exclamation-triangle" aria-hidden="true" />
              <h3>{getErrorMessage(publicationQuery.error, t('common.unexpectedError'))}</h3>
              <p>La publicación que buscás puede haberse retirado o no existir.</p>
              <Link href="/publications" className="kiosqui-detail-error-btn">
                <i className="fas fa-arrow-left" aria-hidden="true" />
                {t('listing.breadcrumbTitle')}
              </Link>
            </div>
          </div>
        </section>
      )}

      {publication && (
        <>
          <section className="detail-shell pt-50 pb-30">
            <div className="container">
              {/* ───────── Galería protagonista ───────── */}
              <PublicationGallery images={galleryImages} alt={publication.pub_title} />

              {/* ───────── Layout 2 columnas: contenido + card sticky ───────── */}
              <div className="detail-grid">
                {/* Columna principal */}
                <div className="detail-main">
                  {/* Badges → H1 → ubicación.
                      `PublicationDetail` no trae flag de destacado/pauta (solo lo
                      tiene el item de listado), así que el único badge con dato real
                      es el tipo de transacción (Venta/Renta, por `pubtra_id`). */}
                  <div className="detail-badges">
                    <span className="badge-type">{transactionLabel}</span>
                  </div>

                  <h1 className="detail-title">{publication.pub_title}</h1>

                  <div className="detail-location">
                    <i className="fas fa-map-marker-alt" aria-hidden="true" />
                    <span>{locationLabel || publication.pub_address || notSpecified}</span>
                  </div>

                  {/* Specs: 4 tiles */}
                  <div className="spec-grid">
                    <SpecTile
                      icon="fas fa-bed"
                      value={formatNumberValue(publication.pubdet_rooms, notSpecified)}
                      label={t('features.rooms')}
                    />
                    <SpecTile
                      icon="fas fa-bath"
                      value={formatNumberValue(publication.pubdet_bathrooms, notSpecified)}
                      label={t('features.bathrooms')}
                    />
                    <SpecTile
                      icon="fas fa-vector-square"
                      value={publication.pubdet_size ? `${publication.pubdet_size} m²` : notSpecified}
                      label={t('features.size')}
                    />
                    <SpecTile
                      icon="fas fa-car"
                      value={formatNumberValue(publication.pubdet_parking, notSpecified)}
                      label={t('features.parking')}
                    />
                  </div>

                  {/* Descripción */}
                  <h2 className="detail-section-title">{t('detail.descriptionTitle')}</h2>
                  <p className="detail-description">{publication.pub_description}</p>

                  {/* Amenidades */}
                  {publication.amenities && publication.amenities.length > 0 && (
                    <>
                      <h2 className="detail-section-title">{t('features.amenities')}</h2>
                      <div className="amenities-grid">
                        {publication.amenities.map((a: PublicationAmenity) => (
                          <span key={a.id} className="amenity-chip">
                            <i className="fas fa-check" aria-hidden="true" />
                            {a.icon && <i className={`fas ${a.icon} amenity-chip-glyph`} aria-hidden="true" />}
                            <span>{a.name}</span>
                          </span>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Mapa embebido */}
                  <h2 className="detail-section-title">{t('features.address')}</h2>
                  <div className="detail-map">
                    <i className="fas fa-map-marker-alt" aria-hidden="true" />
                    <span>{publication.pub_address || locationLabel || notSpecified}</span>
                  </div>
                </div>

                {/* ───────── Card de vendedor STICKY ───────── */}
                <aside className="detail-aside">
                  <div className="seller-card">
                    {/* Precio */}
                    <div className="seller-price">{priceText}</div>
                    <div className="seller-price-sub">
                      {currencyLabel} · {transactionLabel}
                    </div>

                    {/* Vendedor */}
                    <div className="seller-row">
                      <Link href={`/creator-profile/${publication.cus_id}`} className="seller-avatar">
                        <Image
                          src={avatarErrored ? DEFAULT_AVATAR : sellerImage}
                          alt={sellerName}
                          width={48}
                          height={48}
                          onError={() => setAvatarErrored(true)}
                          unoptimized={avatarErrored}
                        />
                      </Link>
                      <div className="seller-meta">
                        <div className="seller-name">
                          <Link href={`/creator-profile/${publication.cus_id}`}>{sellerName}</Link>
                          {sellerVerified && (
                            <i
                              className="fas fa-check-circle seller-verified"
                              aria-label={t('detail.sellerVerified')}
                            />
                          )}
                        </div>
                        <div className="seller-rating">
                          <i className="fas fa-star" aria-hidden="true" />
                          <span>
                            {seller
                              ? t('detail.sellerPublications', { count: seller.totalPublications })
                              : t('detail.sellerVerified')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* CTA: Enviar mensaje (verde) */}
                    {isOwnPublication ? (
                      <button
                        type="button"
                        className="msg-btn"
                        disabled
                        title={t('detail.contactOwnerTitle')}
                        aria-label={t('detail.contactOwnerAria')}
                      >
                        <i className="fas fa-comment-dots" aria-hidden="true" />
                        <span>{t('card.sendMessage')}</span>
                      </button>
                    ) : (
                      <Link
                        href={contactHref}
                        className="msg-btn"
                        title={user ? t('detail.contactSellerTitle') : t('detail.contactLoginTitle')}
                        aria-label={t('detail.contactSellerTitle')}
                      >
                        <i className="fas fa-comment-dots" aria-hidden="true" />
                        <span>{t('card.sendMessage')}</span>
                      </Link>
                    )}

                    {/* Ver modelo 3D PREMIUM (debajo del mensaje, solo si hasGlb) */}
                    <Premium3dButton variant="card" />

                    {/* Guardar / Compartir ghost */}
                    <div className="seller-secondary">
                      <button
                        type="button"
                        className={`ghost-btn ${publication.isFavorite ? 'is-favorite' : ''}`}
                        title={favoriteLabel}
                        aria-label={favoriteLabel}
                        onClick={() => toggleFavoriteMutation.mutate()}
                        disabled={toggleFavoriteMutation.isPending}
                      >
                        <i
                          className={publication.isFavorite ? 'fas fa-heart' : 'far fa-heart'}
                          aria-hidden="true"
                        />
                        <span>{t('favorite.add')}</span>
                      </button>
                      <Link
                        href={`/creator-profile/${publication.cus_id}`}
                        className="ghost-btn"
                      >
                        <i className="fas fa-user" aria-hidden="true" />
                        <span>{t('detail.viewSeller')}</span>
                      </Link>
                    </div>

                    {/* Estado (vendida / anulada / disponible) */}
                    {statusInfo && (
                      <div className="seller-status" style={{ color: statusInfo.color }}>
                        {statusInfo.label}
                      </div>
                    )}
                  </div>

                  {/* Denunciar (Fase 8.4) */}
                  <div className="report-wrap">
                    <ReportPublicationButton pubId={publication.pub_id} />
                  </div>
                </aside>
              </div>
            </div>
          </section>

          {/* ───────── Comentarios ───────── */}
          <PublicationComments pubId={publication.pub_id} pubstaId={publication.pubsta_id} />

          {/* Espaciador: en móvil la barra fija no debe tapar el último contenido. */}
          <div className="mobile-bar-spacer" aria-hidden="true" />

          {/* ───────── Barra sticky inferior (móvil) ───────── */}
          <div className="mobile-bar">
            <div className="mobile-bar-price">
              <div className="mobile-bar-amount">{priceText}</div>
              <div className="mobile-bar-sub">
                {currencyLabel} · {transactionLabel}
              </div>
            </div>
            <Premium3dButton variant="bar" />
            {isOwnPublication ? (
              <button type="button" className="msg-btn msg-btn--bar" disabled>
                <i className="fas fa-comment-dots" aria-hidden="true" />
                <span>{t('card.sendMessage')}</span>
              </button>
            ) : (
              <Link href={contactHref} className="msg-btn msg-btn--bar">
                <i className="fas fa-comment-dots" aria-hidden="true" />
                <span>{t('card.sendMessage')}</span>
              </Link>
            )}
          </div>
        </>
      )}

      <style jsx>{`
        /* ──────────────── Estados controlados (Fase 24) ──────────────── */
        :global(.kiosqui-detail-state) {
          min-height: 60vh;
        }
        .kiosqui-detail-error {
          align-items: center;
          display: flex;
          flex-direction: column;
          gap: 12px;
          text-align: center;
          padding: 40px 20px;
        }
        .kiosqui-detail-error i {
          color: var(--lav-600);
          font-size: 42px;
        }
        .kiosqui-detail-error h3 {
          margin: 8px 0 0;
          color: var(--fg-strong);
          font-family: var(--font-display);
        }
        .kiosqui-detail-error p {
          margin: 0;
          color: var(--fg-muted);
        }
        .kiosqui-detail-error :global(.kiosqui-detail-error-btn) {
          align-items: center;
          background: var(--navy-800);
          border-radius: var(--r-pill);
          color: var(--cream);
          display: inline-flex;
          gap: 8px;
          margin-top: 10px;
          padding: 11px 22px;
          font-weight: 600;
          text-decoration: none !important;
          transition: all 0.2s;
        }
        .kiosqui-detail-error :global(.kiosqui-detail-error-btn:hover) {
          background: var(--navy-700);
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }

        /* ──────────────── Layout ──────────────── */
        .detail-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 38px;
          align-items: start;
          margin-top: 30px;
        }
        @media (max-width: 992px) {
          .detail-grid {
            grid-template-columns: 1fr;
            gap: 28px;
          }
        }
        .detail-main {
          min-width: 0;
        }

        /* ──────────────── Badges → título → ubicación ──────────────── */
        .detail-badges {
          display: flex;
          gap: 9px;
          margin-bottom: 14px;
          flex-wrap: wrap;
        }
        .badge-type {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 13px;
          border-radius: var(--r-pill);
          font-family: var(--font-display);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.01em;
          line-height: 1;
          background: var(--accent-soft);
          color: var(--lav-700);
        }
        :global([data-theme='dark']) .badge-type {
          color: var(--lav-300);
        }
        .detail-title {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 34px;
          line-height: 1.18;
          letter-spacing: -0.02em;
          color: var(--fg-strong);
          margin: 0 0 10px;
        }
        @media (max-width: 768px) {
          .detail-title {
            font-size: 27px;
          }
        }
        .detail-location {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--fg-muted);
          font-size: 15px;
          margin-bottom: 26px;
        }
        .detail-location i {
          color: var(--lav-700);
          font-size: 15px;
        }
        :global([data-theme='dark']) .detail-location i {
          color: var(--lav-400);
        }

        /* ──────────────── Specs (4 tiles) ──────────────── */
        .spec-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 34px;
        }
        @media (max-width: 768px) {
          .spec-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .spec-tile {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 15px 16px;
          background: var(--surface-sunk);
          border: 1px solid var(--border);
          border-radius: var(--r-md);
        }
        .spec-tile i {
          color: var(--lav-700);
          font-size: 20px;
          width: 22px;
          text-align: center;
          flex-shrink: 0;
        }
        :global([data-theme='dark']) .spec-tile i {
          color: var(--lav-400);
        }
        .spec-tile-body {
          min-width: 0;
        }
        .spec-tile-value {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 19px;
          line-height: 1.1;
          color: var(--fg-strong);
        }
        .spec-tile-label {
          font-size: 12px;
          color: var(--fg-muted);
          margin-top: 2px;
        }

        /* ──────────────── Descripción / secciones ──────────────── */
        .detail-section-title {
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 21px;
          color: var(--fg-strong);
          margin: 0 0 12px;
        }
        .detail-description {
          font-size: 15px;
          line-height: 1.7;
          color: var(--fg-muted);
          margin: 0 0 30px;
          white-space: pre-line;
        }

        /* ──────────────── Amenidades ──────────────── */
        .amenities-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 30px;
        }
        .amenity-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 14px;
          border-radius: var(--r-sm);
          background: var(--surface-sunk);
          border: 1px solid var(--border);
          font-size: 14px;
          font-weight: 500;
          color: var(--fg-strong);
        }
        .amenity-chip i {
          color: var(--green-600);
          font-size: 12px;
        }
        .amenity-chip .amenity-chip-glyph {
          color: var(--lav-700);
        }
        :global([data-theme='dark']) .amenity-chip .amenity-chip-glyph {
          color: var(--lav-400);
        }

        /* ──────────────── Mapa embebido ──────────────── */
        .detail-map {
          height: 240px;
          border-radius: var(--r-lg);
          overflow: hidden;
          position: relative;
          background: linear-gradient(135deg, var(--navy-700), var(--navy-900));
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: var(--cream);
          text-align: center;
          padding: 20px;
          margin-bottom: 10px;
        }
        .detail-map i {
          font-size: 36px;
          opacity: 0.85;
        }
        .detail-map span {
          font-size: 14px;
          opacity: 0.85;
          max-width: 80%;
        }

        /* ──────────────── Card vendedor sticky ──────────────── */
        .detail-aside {
          position: sticky;
          top: 90px;
        }
        @media (max-width: 992px) {
          .detail-aside {
            position: static;
          }
        }
        .seller-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--r-lg);
          box-shadow: var(--shadow-md);
          padding: 24px;
        }
        .seller-price {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 30px;
          letter-spacing: -0.02em;
          color: var(--fg-strong);
          line-height: 1.1;
        }
        .seller-price-sub {
          font-size: 13px;
          color: var(--fg-subtle);
          margin-top: 4px;
          margin-bottom: 20px;
        }
        .seller-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 0;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          margin-bottom: 18px;
        }
        .seller-row :global(.seller-avatar) {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          display: block;
          border: 2px solid var(--lav-400);
        }
        .seller-row :global(.seller-avatar img) {
          width: 48px !important;
          height: 48px !important;
          object-fit: cover;
        }
        .seller-meta {
          flex: 1;
          min-width: 0;
        }
        .seller-name {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 15px;
          color: var(--fg-strong);
        }
        .seller-name :global(a) {
          color: var(--fg-strong);
          text-decoration: none;
        }
        .seller-name :global(a:hover) {
          color: var(--lav-700);
        }
        .seller-verified {
          color: var(--green-600);
          font-size: 13px;
        }
        .seller-rating {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: var(--fg-muted);
          margin-top: 3px;
        }
        .seller-rating i {
          color: var(--rating);
          font-size: 11px;
        }

        /* ── Botón "Enviar mensaje" verde ──
           .msg-btn se usa en button nativo Y en Link de Next; styled-jsx no
           hashea la clase del Link, así que va con :global() (matchea ambos). */
        :global(.msg-btn) {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          height: 50px;
          border: none;
          border-radius: var(--r-pill);
          background: var(--green-600);
          color: #fff;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          text-decoration: none !important;
          transition: all 0.2s;
        }
        :global(.msg-btn:hover) {
          background: var(--green-700);
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }
        :global(.msg-btn:disabled) {
          background: var(--surface-sunk);
          color: var(--fg-subtle);
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        :global(.msg-btn i) {
          font-size: 16px;
        }

        /* ── Botón "Ver modelo 3D" PREMIUM (siempre <Link> → :global) ── */
        :global(.view-3d-btn) {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          width: 100%;
          height: 50px;
          margin-top: 12px;
          border-radius: var(--r-pill);
          border: 1.5px solid var(--lav-500);
          background: linear-gradient(135deg, var(--lav-500), var(--lav-700));
          color: #fff;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          text-decoration: none !important;
          box-shadow: 0 10px 30px rgba(109, 98, 207, 0.6), 0 0 0 3px var(--lav-200);
          transition: all 0.2s;
        }
        :global(.view-3d-btn:hover) {
          transform: translateY(-1px);
          box-shadow: 0 12px 34px rgba(109, 98, 207, 0.7), 0 0 0 3px var(--lav-300);
        }
        :global(.view-3d-btn i) {
          font-size: 16px;
        }
        :global(.view-3d-premium) {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          margin-left: 2px;
          padding: 4px 10px;
          border-radius: var(--r-pill);
          background: rgba(255, 255, 255, 0.22);
          font-size: 12px;
          font-weight: 800;
        }
        :global(.view-3d-premium i) {
          font-size: 11px;
          color: #ffd86b;
        }

        /* ── Guardar / Ver vendedor ghost ── */
        .seller-secondary {
          display: flex;
          gap: 10px;
          margin-top: 14px;
        }
        .seller-secondary :global(.ghost-btn) {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          height: 42px;
          border-radius: var(--r-pill);
          border: 1.5px solid var(--border-strong);
          background: transparent;
          color: var(--fg-strong);
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          text-decoration: none !important;
          transition: all 0.2s;
        }
        .seller-secondary :global(.ghost-btn:hover) {
          border-color: var(--lav-500);
          color: var(--lav-700);
        }
        .seller-secondary :global(.ghost-btn.is-favorite) {
          border-color: var(--danger);
          color: var(--danger);
        }
        .seller-secondary :global(.ghost-btn:disabled) {
          cursor: wait;
          opacity: 0.7;
        }
        :global([data-theme='dark']) .seller-secondary :global(.ghost-btn:hover) {
          color: var(--lav-300);
        }
        .seller-status {
          margin-top: 16px;
          text-align: center;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 14px;
        }

        .report-wrap {
          display: flex;
          justify-content: flex-end;
          margin-top: 16px;
        }

        /* ──────────────── Barra sticky inferior (móvil) ──────────────── */
        .mobile-bar {
          display: none;
        }
        .mobile-bar-spacer {
          display: none;
        }
        @media (max-width: 768px) {
          .mobile-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 40;
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            border-top: 1px solid var(--border);
            background: var(--bg-elevated);
            box-shadow: 0 -4px 18px rgba(17, 24, 42, 0.12);
          }
          .mobile-bar-price {
            flex: 1;
            min-width: 0;
          }
          .mobile-bar-amount {
            font-family: var(--font-display);
            font-weight: 700;
            font-size: 18px;
            color: var(--fg-strong);
            line-height: 1.1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .mobile-bar-sub {
            font-size: 11px;
            color: var(--fg-subtle);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .mobile-bar :global(.view-3d-btn--bar) {
            width: auto;
            height: 44px;
            margin-top: 0;
            padding: 0 14px;
            flex-shrink: 0;
            font-size: 13px;
          }
          .mobile-bar :global(.view-3d-btn--bar span:not(.view-3d-premium)) {
            display: inline;
          }
          .mobile-bar :global(.msg-btn--bar) {
            width: auto;
            height: 44px;
            padding: 0 18px;
            flex-shrink: 0;
            font-size: 14px;
          }
          /* Aire para que la barra fija no tape el último contenido. */
          .mobile-bar-spacer {
            display: block;
            height: 76px;
          }
        }
      `}</style>
    </>
  );
};

export default PublicationDetailsMain;
