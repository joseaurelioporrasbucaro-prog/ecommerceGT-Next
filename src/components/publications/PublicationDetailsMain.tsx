"use client";

import Link from 'next/link';
import React, { useMemo } from 'react';
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

interface PublicationDetailsMainProps {
  id: string;
}

function getErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Error inesperado';
}

const PublicationDetailsMain = ({ id }: PublicationDetailsMainProps) => {
  const publicationQuery = usePublicationDetail(id);
  const publication = publicationQuery.data;

  // Registra una vista al abrir el detalle (el backend ignora al dueño).
  useRegisterView(id);

  const galleryImages = useMemo(() => {
    if (!publication) return [];
    return publication.images
      .map((img) => getPublicationImagePath(img))
      .filter((path) => path !== '')
      .map((path) => getBackendUrl(path));
  }, [publication]);

  const galleryImagesGlb = useMemo(() => {
    if (!publication) return [];
    return publication.imagesglb
      .map((img) => getPublicationImagePathGlb(img))
      .filter((path) => path !== '')
      .map((path) => getBackendUrl(path));
  }, [publication]);
  const hasGlb = galleryImagesGlb.length > 0;

  return (
    <>
      <ThemeChanger />

      {/* Breadcrumb */}
      <section className="page-title-area">
        <div className="container">
          <div className="row wow fadeInUp">
            <div className="col-lg-12">
              <div className="page-title">
                <h2 className="breadcrumb-title mb-10">
                  {publication?.pub_title ?? 'Detalle de publicación'}
                </h2>
                <div className="breadcrumb-menu">
                  <nav className="breadcrumb-trail breadcrumbs">
                    <ul className="trail-items">
                      <li className="trail-item trail-begin"><Link href="/">Inicio</Link></li>
                      <li className="trail-item"><Link href="/publications">Publicaciones</Link></li>
                      <li className="trail-item trail-end">
                        <span>{publication?.pub_title ?? 'Detalle'}</span>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {publicationQuery.isLoading && (
        <section className="art-details-area pt-130 pb-90">
          <div className="container">
            <div className="alert alert-info">Cargando publicación...</div>
          </div>
        </section>
      )}

      {publicationQuery.error && (
        <section className="art-details-area pt-130 pb-90">
          <div className="container">
            <div className="alert alert-danger">{getErrorMessage(publicationQuery.error)}</div>
          </div>
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
                    <Link href={`/creator-profile/${publication.cus_id}`} className="action-btn action-btn-primary">
                      <i className="fas fa-cube"></i>
                      <span>Explorar 3D</span>
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
