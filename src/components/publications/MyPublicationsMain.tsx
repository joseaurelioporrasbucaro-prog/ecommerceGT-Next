"use client";

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import ThemeChanger from '@/components/home/ThemeChanger';
import Breadcrumbs from '@/utils/Breadcrumbs';
import AccountSidebar from '@/components/account/AccountSidebar';
import { ApiError } from '@/utils/Api';
import { useMyPublications } from '@/hooks/api/useMyPublications';
import { useAuth } from '@/utils/AuthContext';
import { getBackendUrl } from '@/utils/backendUrl';
import { CARD_PLACEHOLDER, formatPrice } from './publicationUtils';

const PUBSTA_SOLD = 3;
const PUBSTA_DRAFT = 1;
const PUBSTA_VOID = 4;

function getStatusBadge(pubstaId: number): { label: string; color: string } | null {
  if (pubstaId === PUBSTA_SOLD) return { label: 'Vendida', color: '#ef4444' };
  if (pubstaId === PUBSTA_DRAFT) return { label: 'Borrador', color: '#9ca3af' };
  if (pubstaId === PUBSTA_VOID) return { label: 'Anulada', color: '#6b7280' };
  return null;
}

function getErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Error inesperado';
}

const MyPublicationsMain = () => {
  const { user } = useAuth();
  const publicationsQuery = useMyPublications(user?.id);
  const publications = publicationsQuery.data ?? [];

  return (
    <main>
      <ThemeChanger />
      <Breadcrumbs breadcrumbTitle="Mis publicaciones" breadcrumbSubTitle="Mis publicaciones" />

      <section className="artworks-area pt-80 pb-90">
        <div className="container">
          <div className="row">
            {/* Sidebar lateral con menú de cuenta */}
            <div className="col-lg-3 col-md-12 mb-30">
              <AccountSidebar />
            </div>

            {/* Contenido */}
            <div className="col-lg-9 col-md-12">
              {publicationsQuery.isLoading && (
                <div className="alert alert-info">Cargando tus publicaciones...</div>
              )}

              {publicationsQuery.error && (
                <div className="alert alert-danger">{getErrorMessage(publicationsQuery.error)}</div>
              )}

              {!publicationsQuery.isLoading && !publicationsQuery.error && publications.length === 0 && (
                <div className="alert alert-warning">
                  Todavía no tienes publicaciones creadas.
                </div>
              )}

              {!publicationsQuery.isLoading && !publicationsQuery.error && publications.length > 0 && (
                <div className="my-publications-list">
                  {publications.map((publication) => {
                    const imageSrc = publication.main_image
                      ? getBackendUrl(publication.main_image)
                      : CARD_PLACEHOLDER;
                    const badge = getStatusBadge(publication.pubsta_id);

                    return (
                      <article key={publication.pub_id} className="my-publication-row">
                        {/* Imagen — div con clases globales para que styled-jsx aplique a través del Link */}
                        <Link
                          href={`/publications/${publication.pub_id}`}
                          className="my-publication-image-link"
                        >
                          <span className="my-publication-image-frame">
                            <Image
                              src={imageSrc}
                              alt={publication.pub_title}
                              fill
                              sizes="120px"
                              style={{ objectFit: 'cover' }}
                              unoptimized={imageSrc === CARD_PLACEHOLDER}
                            />
                            {badge && (
                              <span
                                className="my-publication-badge"
                                style={{ background: badge.color }}
                              >
                                {badge.label}
                              </span>
                            )}
                          </span>
                        </Link>

                        <div className="my-publication-content">
                          <h4>
                            <Link href={`/publications/${publication.pub_id}`}>
                              {publication.pub_title}
                            </Link>
                          </h4>
                          <p>{publication.pub_description}</p>
                          <div className="my-publication-meta">
                            <span>{formatPrice(publication.pubdet_price)}</span>
                            <span>{publication.pub_address}</span>
                          </div>
                        </div>

                        <div className="my-publication-actions">
                          <Link
                            href={`/publications/${publication.pub_id}/edit`}
                            className="border-btn"
                          >
                            Editar
                          </Link>
                          <button
                            type="button"
                            className="border-btn"
                            disabled
                            title="Disponible en Fase 5"
                          >
                            Eliminar
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .my-publications-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .my-publications-list :global(.my-publication-row) {
          display: grid;
          grid-template-columns: 120px 1fr auto;
          gap: 18px;
          align-items: center;
          padding: 16px;
          border: 1px solid rgba(128, 128, 128, 0.18);
          border-radius: 12px;
          background: rgba(128, 128, 128, 0.04);
        }
        /* Wrapper interno con position:relative — recibe el estilo aunque
           el padre sea un <Link> de Next.js. */
        .my-publications-list :global(.my-publication-image-link) {
          display: block;
          width: 120px;
          height: 120px;
          flex-shrink: 0;
        }
        .my-publications-list :global(.my-publication-image-frame) {
          position: relative;
          display: block;
          width: 120px;
          height: 120px;
          overflow: hidden;
          border-radius: 8px;
          background: rgba(128, 128, 128, 0.12);
        }
        .my-publications-list :global(.my-publication-badge) {
          position: absolute;
          top: 8px;
          left: 8px;
          padding: 3px 8px;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-radius: 12px;
          z-index: 2;
        }
        .my-publications-list :global(.my-publication-content h4) {
          margin-bottom: 6px;
          font-size: 18px;
        }
        .my-publications-list :global(.my-publication-content p) {
          margin: 0 0 10px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          opacity: 0.75;
          font-size: 14px;
        }
        .my-publications-list :global(.my-publication-meta) {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          font-size: 13px;
          font-weight: 600;
          color: var(--tp-theme-1, #6c5ce7);
        }
        .my-publications-list :global(.my-publication-actions) {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }
        .my-publications-list :global(.my-publication-actions .border-btn) {
          height: 38px;
          padding: 0 14px;
          font-size: 13px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .my-publications-list :global(button.border-btn:disabled) {
          cursor: not-allowed;
          opacity: 0.55;
        }
        @media (max-width: 768px) {
          .my-publications-list :global(.my-publication-row) {
            grid-template-columns: 96px 1fr;
          }
          .my-publications-list :global(.my-publication-image-link),
          .my-publications-list :global(.my-publication-image-frame) {
            width: 96px;
            height: 96px;
          }
          .my-publications-list :global(.my-publication-actions) {
            grid-column: 1 / -1;
            justify-content: flex-start;
          }
        }
      `}</style>
    </main>
  );
};

export default MyPublicationsMain;
