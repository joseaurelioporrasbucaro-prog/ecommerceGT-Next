"use client";

import Link from 'next/link';
import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import ThemeChanger from '@/components/home/ThemeChanger';
import { ApiError } from '@/utils/Api';
import { usePublicationDetail } from '@/hooks/api/usePublications';
import { useRegisterView } from '@/hooks/api/useRegisterView';
import { getBackendUrl } from '@/utils/backendUrl';
import PublicationComments from './PublicationComments';
import PublicationContent from './PublicationContent';
import PublicationGallery from './PublicationGallery';
import ReportPublicationButton from './ReportPublicationButton';
import { getPublicationImagePath, getPublicationImagePathGlb } from './publicationUtils';
// Fase 22 — URL canónica = slug. El viewer es público así que también va con slug.
import { publicationIdentifier } from '@/utils/publicationUrl';
import type { PublicationImage, PublicationImageGlb } from '@/types/api';

interface PublicationDetailsMainProps {
  id: string;
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

const PublicationDetailsMain = ({ id }: PublicationDetailsMainProps) => {
  const t = useTranslations('publications');
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

  // Fase 24 (2026-06-10): si no está cargando, no hay error explícito y no
  // hay datos, igual mostramos un error controlado en vez de dejar la página
  // vacía (que hacía que el footer flotara hasta arriba). Cubre el edge case
  // de query deshabilitada / data nula.
  const showControlledError =
    !publicationQuery.isLoading && (publicationQuery.error || !publication);

  return (
    <>
      <ThemeChanger />

      {/* Fase 24: el breadcrumb inline del template se removió para alinear
          con la decisión global de no usar breadcrumbs (ocupaban mucho alto).
          El título de la publicación ya lo muestra PublicationContent. */}

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
              <p>
                La publicación que buscás puede haberse retirado o no existir.
              </p>
              <Link href="/publications" className="kiosqui-detail-error-btn">
                <i className="fas fa-arrow-left" aria-hidden="true" />
                {t('listing.breadcrumbTitle')}
              </Link>
            </div>
          </div>
          <style jsx>{`
            /* min-height generoso para que el footer NO flote hasta arriba
               cuando el contenido es solo el mensaje de error. */
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
              color: var(--clr-theme-1, #2785ff);
              font-size: 42px;
            }
            .kiosqui-detail-error h3 {
              margin: 8px 0 0;
            }
            .kiosqui-detail-error p {
              margin: 0;
              opacity: 0.7;
            }
            .kiosqui-detail-error :global(.kiosqui-detail-error-btn) {
              align-items: center;
              background: var(--clr-theme-1, #2785ff);
              border-radius: 10px;
              color: #fff;
              display: inline-flex;
              gap: 8px;
              margin-top: 10px;
              padding: 11px 22px;
              font-weight: 600;
            }
          `}</style>
        </section>
      )}

      {publication && (
        <>
          {/* ───────── Galería arriba (full-width responsive) ───────── */}
          <section className="pt-50 pb-30">
            <div className="container">
              <PublicationGallery images={galleryImages} alt={publication.pub_title} />
              {hasGlb && (
                <>
                  <div className="action-row">
                    <Link href={`/publications/${publicationIdentifier(publication)}/viewer`} className="action-btn action-btn-primary">
                      <i className="fas fa-cube"></i>
                      <span>{t('detail.explore3d')}</span>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* ───────── Info abajo ───────── */}
          <PublicationContent publication={publication} />

          {/* ───────── Denunciar (Fase 8.4) ───────── */}
          <div className="container" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <ReportPublicationButton pubId={publication.pub_id} />
          </div>

          {/* ───────── Comentarios ───────── */}
          <PublicationComments
            pubId={publication.pub_id}
            pubstaId={publication.pubsta_id}
          />
        </>
      )}
      <style jsx>{`
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
          border-radius: 10px;
          font-weight: 600;
          font-size: 14px;
          line-height: 1;
          cursor: pointer;
          border: 1.5px solid rgba(128, 128, 128, 0.35);  /* border en todos */
          background: transparent;
          color: inherit;
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
        /* Primary: filled con color tema, border del mismo color */

        .action-row :global(.action-btn-primary) {
          background: var(--tp-theme-1, #0b0b0c) !important;
          border-color: var(--tp-theme-1, #060606) !important;
          color: #C9A84C !important;

          animation: goldGlow 2s ease-in-out infinite alternate;
        }

        @keyframes goldGlow {
          from {
            text-shadow:
              0 0 4px rgba(201, 168, 76, 0.5),
              0 0 8px rgba(201, 168, 76, 0.3);
          }
          to {
            text-shadow:
              0 0 8px rgba(201, 168, 76, 0.9),
              0 0 16px rgba(201, 168, 76, 0.7),
              0 0 24px rgba(201, 168, 76, 0.5);
          }
        }

        .action-row :global(.action-btn-primary:hover) {
          transform: translateY(-2px);
          box-shadow: 0 8px 18px rgba(108, 92, 231, 0.35);
        }
        /* Secondary: solo border gris neutro */
        .action-row :global(.action-btn-secondary:hover) {
          border-color: var(--tp-theme-1, #6c5ce7);
          color: var(--tp-theme-1, #6c5ce7);
        }
        /* Acciones en mobile: ocupan todo el ancho */
        @media (max-width: 480px) {
          .action-row .action-btn {
            flex: 1 1 calc(50% - 6px);
            min-width: 0;
            padding: 0 12px;
          }
        }
      `}</style>
    </>
  );
};

export default PublicationDetailsMain;
