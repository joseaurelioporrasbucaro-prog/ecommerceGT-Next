"use client";

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import ThemeChanger from '@/components/home/ThemeChanger';
import Breadcrumbs from '@/utils/Breadcrumbs';
import { ApiError } from '@/utils/Api';
import { useMyPublications } from '@/hooks/api/useMyPublications';
import { useAuth } from '@/utils/AuthContext';
import { getBackendUrl } from '@/utils/backendUrl';
import { CARD_PLACEHOLDER, formatPrice } from './publicationUtils';

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

      <section className="artworks-area pt-130 pb-90">
        <div className="container">
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

                return (
                  <article key={publication.pub_id} className="my-publication-row">
                    <Link href={`/publications/${publication.pub_id}`} className="my-publication-image">
                      <Image
                        src={imageSrc}
                        alt={publication.pub_title}
                        fill
                        sizes="120px"
                        style={{ objectFit: 'cover' }}
                        unoptimized={imageSrc === CARD_PLACEHOLDER}
                      />
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
                      <Link href={`/publications/${publication.pub_id}/edit`} className="border-btn">
                        Editar
                      </Link>
                      <button type="button" className="border-btn" disabled title="Disponible en Fase 5">
                        Eliminar
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <style jsx>{`
        .my-publications-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .my-publication-row {
          display: grid;
          grid-template-columns: 120px 1fr auto;
          gap: 18px;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid rgba(128, 128, 128, 0.2);
        }
        .my-publication-image {
          position: relative;
          width: 120px;
          height: 120px;
          overflow: hidden;
          border-radius: 8px;
          background: rgba(128, 128, 128, 0.12);
        }
        .my-publication-content h4 {
          margin-bottom: 8px;
          font-size: 20px;
        }
        .my-publication-content p {
          margin: 0 0 10px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          opacity: 0.75;
        }
        .my-publication-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          font-size: 14px;
          font-weight: 600;
        }
        .my-publication-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }
        .my-publication-actions :global(.border-btn) {
          height: 42px;
          padding: 0 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .my-publication-actions :global(button.border-btn:disabled) {
          cursor: not-allowed;
          opacity: 0.55;
        }
        @media (max-width: 768px) {
          .my-publication-row {
            grid-template-columns: 96px 1fr;
          }
          .my-publication-image {
            width: 96px;
            height: 96px;
          }
          .my-publication-actions {
            grid-column: 1 / -1;
            justify-content: flex-start;
          }
        }
      `}</style>
    </main>
  );
};

export default MyPublicationsMain;
