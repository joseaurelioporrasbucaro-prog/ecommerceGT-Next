"use client";

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import Modal from 'react-responsive-modal';
import { toast } from 'react-toastify';
import ThemeChanger from '@/components/home/ThemeChanger';
import Breadcrumbs from '@/utils/Breadcrumbs';
import { ApiError } from '@/utils/Api';
import { useMyPublications } from '@/hooks/api/useMyPublications';
import { useDeletePublication } from '@/hooks/api/useDeletePublication';
import { useAuth } from '@/utils/AuthContext';
import { getBackendUrl } from '@/utils/backendUrl';
import type { MyPublicationItem } from '@/types/api';
import { CARD_PLACEHOLDER, formatPrice } from './publicationUtils';

const PUBSTA_SOLD = 3;
const PUBSTA_DRAFT = 1;
const PUBSTA_VOID = 4;

interface PublicationRowImageProps {
  src: string | null | undefined;
  alt: string;
}

/**
 * Imagen de la fila de "Mis publicaciones". Si el archivo no existe en backend
 * (404 — pasa con publicaciones viejas cuyas imágenes se borraron), cae al
 * placeholder en vez de romper next/image. Cada fila tiene su propio state.
 */
const PublicationRowImage: React.FC<PublicationRowImageProps> = ({ src, alt }) => {
  const [errored, setErrored] = useState(false);
  const resolvedSrc = src && !errored ? getBackendUrl(src) : CARD_PLACEHOLDER;
  const isPlaceholder = resolvedSrc === CARD_PLACEHOLDER;

  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      fill
      sizes="120px"
      style={{ objectFit: 'cover' }}
      unoptimized={isPlaceholder}
      onError={() => {
        if (!errored) setErrored(true);
      }}
    />
  );
};

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
  const deleteMutation = useDeletePublication(user?.id);

  const [pendingDelete, setPendingDelete] = useState<MyPublicationItem | null>(null);

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setPendingDelete(null);
    deleteMutation.mutate(target.pub_id, {
      onSuccess: () => {
        toast.success(`"${target.pub_title}" fue anulada.`);
      },
      onError: (err) => {
        const message = err instanceof ApiError ? err.message : 'No se pudo eliminar la publicación.';
        toast.error(message);
      },
    });
  };

  return (
    <main>
      <ThemeChanger />
      <Breadcrumbs breadcrumbTitle="Mis publicaciones" breadcrumbSubTitle="Mis publicaciones" />

      <section className="artworks-area pt-80 pb-90">
        <div className="container c-container-1">
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
                    const badge = getStatusBadge(publication.pubsta_id);

                    return (
                      <article key={publication.pub_id} className="my-publication-row">
                        {/* Imagen — div con clases globales para que styled-jsx aplique a través del Link */}
                        <Link
                          href={`/publications/${publication.pub_id}`}
                          className="my-publication-image-link"
                        >
                          <span className="my-publication-image-frame">
                            <PublicationRowImage
                              src={publication.main_image}
                              alt={publication.pub_title}
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
                          {(() => {
                            const isVoid = publication.pubsta_id === PUBSTA_VOID;
                            const isSold = publication.pubsta_id === PUBSTA_SOLD;
                            const isDeleting =
                              deleteMutation.isPending &&
                              deleteMutation.variables === publication.pub_id;

                            const disabled = isVoid || isSold || isDeleting;
                            const title = isSold
                              ? 'Las publicaciones vendidas no se pueden eliminar.'
                              : isVoid
                                ? 'Esta publicación ya está anulada.'
                                : undefined;

                            return (
                              <button
                                type="button"
                                className="border-btn"
                                disabled={disabled}
                                title={title}
                                onClick={() => setPendingDelete(publication)}
                              >
                                {isDeleting ? 'Eliminando…' : 'Eliminar'}
                              </button>
                            );
                          })()}
                        </div>
                      </article>
                    );
                  })}
            </div>
          )}
        </div>
      </section>

      <Modal
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        center
        classNames={{ modal: 'delete-publication-modal' }}
        styles={{
          overlay: { background: 'rgba(0, 0, 0, 0.55)' },
          modal: {
            maxWidth: 460,
            width: '90%',
            padding: '32px 28px',
            borderRadius: 14,
          },
          closeButton: { display: 'none' },
        }}
      >
        <div className="delete-modal-body">
          <div className="delete-modal-icon" aria-hidden="true">
            <i className="fas fa-exclamation-triangle" />
          </div>
          <h4 className="delete-modal-title">¿Eliminar publicación?</h4>
          <p className="delete-modal-text">
            Vas a anular <strong>&ldquo;{pendingDelete?.pub_title}&rdquo;</strong>. La publicación dejará de aparecer en el catálogo público y en favoritos de otros usuarios. Aún la podrás ver en esta lista marcada como <em>Anulada</em>.
          </p>
          <div className="delete-modal-actions">
            <button
              type="button"
              className="border-btn delete-modal-cancel"
              onClick={() => setPendingDelete(null)}
              disabled={deleteMutation.isPending}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="border-btn delete-modal-confirm"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Eliminando…' : 'Sí, eliminar'}
            </button>
          </div>
        </div>
      </Modal>

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
        :global(.delete-publication-modal) {
          background: var(--clr-bg-white, #fff) !important;
          color: var(--clr-common-heading, #181818);
          border: 1px solid var(--clr-common-border, transparent);
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
        }
        :global(.delete-modal-body) {
          text-align: center;
        }
        :global(.delete-modal-icon) {
          width: 64px;
          height: 64px;
          margin: 0 auto 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.12);
          color: #ef4444;
          font-size: 26px;
        }
        :global(.delete-modal-title) {
          margin: 0 0 12px;
          font-size: 22px;
          font-weight: 700;
        }
        :global(.delete-modal-text) {
          margin: 0 0 26px;
          font-size: 15px;
          line-height: 1.55;
          color: var(--clr-common-body-text, #5b5b5b);
        }
        :global(.delete-modal-text strong) {
          color: var(--clr-common-heading, #181818);
        }
        :global(.delete-modal-actions) {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }
        :global(.delete-modal-actions .border-btn) {
          height: 44px;
          padding: 0 22px;
          font-size: 14px;
          line-height: 42px;
          min-width: 130px;
        }
        :global(.delete-modal-confirm) {
          color: #fff;
          background: #ef4444;
          border-color: #ef4444;
        }
        :global(.delete-modal-confirm:hover) {
          background: #dc2626;
          border-color: #dc2626;
          color: #fff;
        }
        :global(.delete-modal-confirm:disabled),
        :global(.delete-modal-cancel:disabled) {
          opacity: 0.6;
          cursor: not-allowed;
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
