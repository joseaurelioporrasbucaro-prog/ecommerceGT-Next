"use client";

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Modal from 'react-responsive-modal';
import { toast } from 'react-toastify';
import ThemeChanger from '@/components/home/ThemeChanger';
import Breadcrumbs from '@/utils/Breadcrumbs';
import { ApiError } from '@/utils/Api';
import { useMyPublications } from '@/hooks/api/useMyPublications';
import { useDeletePublication } from '@/hooks/api/useDeletePublication';
import { useCloseSale } from '@/hooks/api/useCloseSale';
import { useSearchUsers } from '@/hooks/api/useSearchUsers';
import { useMyCampaigns } from '@/hooks/api/useCampaigns'; // Fase 10.3
import { useAuth } from '@/utils/AuthContext';
import { getBackendUrl } from '@/utils/backendUrl';
import { getImageVariant } from '@/utils/imageVariants';
// Fase 22 — URL canónica = slug. Para acciones (edit) sigue usándose pub_id
// porque son endpoints autenticados que toman ID interno.
import { publicationPath } from '@/utils/publicationUrl';
import type { MyPublicationItem, UserSearchResult, Campaign } from '@/types/api';
import { CARD_PLACEHOLDER, formatPrice } from './publicationUtils';

const PUBSTA_SOLD = 3;
const PUBSTA_DRAFT = 1;
const PUBSTA_VOID = 4;
const PUBSTA_ACTIVE = 2;

interface PublicationRowImageProps {
  src: string | null | undefined;
  alt: string;
}

/**
 * Imagen de la fila de "Mis publicaciones". 3 niveles de fallback:
 *  1. Variante optimizada `_card` (Fase 5.4) — la primera elección.
 *  2. Original — si la variante no existe (publicaciones viejas).
 *  3. Placeholder estático — si ni el original existe.
 */
const PublicationRowImage: React.FC<PublicationRowImageProps> = ({ src, alt }) => {
  const [stage, setStage] = useState<'variant' | 'original' | 'placeholder'>('variant');

  let resolvedSrc: string;
  if (!src || stage === 'placeholder') {
    resolvedSrc = CARD_PLACEHOLDER;
  } else if (stage === 'original') {
    resolvedSrc = getBackendUrl(src);
  } else {
    resolvedSrc = getBackendUrl(getImageVariant(src, 'card'));
  }
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
        // Bajar un escalón en la cadena de fallback.
        setStage((prev) =>
          prev === 'variant' ? 'original' : prev === 'original' ? 'placeholder' : 'placeholder',
        );
      }}
    />
  );
};

function getStatusBadge(
  pubstaId: number,
  labels: { sold: string; draft: string; void: string },
): { label: string; color: string } | null {
  if (pubstaId === PUBSTA_SOLD) return { label: labels.sold, color: '#ef4444' };
  if (pubstaId === PUBSTA_DRAFT) return { label: labels.draft, color: '#9ca3af' };
  if (pubstaId === PUBSTA_VOID) return { label: labels.void, color: '#6b7280' };
  return null;
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

// ─── Sub-componente: modal de "Cerrar venta" ──────────────────────────────────
interface CloseSaleModalProps {
  publication: MyPublicationItem | null;
  onClose: () => void;
}

const CloseSaleModal = ({ publication, onClose }: CloseSaleModalProps) => {
  const t = useTranslations('publications');
  const [buyerQuery, setBuyerQuery] = useState('');
  const [selectedBuyer, setSelectedBuyer] = useState<UserSearchResult | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const closeSaleMutation = useCloseSale();
  const searchQuery = useSearchUsers(buyerQuery);

  const users = searchQuery.data?.users ?? [];

  const handleSelectBuyer = (user: UserSearchResult) => {
    setSelectedBuyer(user);
    setBuyerQuery('');
    setDropdownOpen(false);
  };

  const handleConfirm = () => {
    if (!publication || !selectedBuyer) return;
    closeSaleMutation.mutate(
      { pub_id: publication.pub_id, buyer_id: selectedBuyer.cusId },
      {
        onSuccess: () => {
          toast.success(t('myPublications.closeSaleSuccess'));
          onClose();
        },
        onError: (err) => {
          toast.error(err instanceof ApiError ? err.message : t('myPublications.closeSaleError'));
        },
      },
    );
  };

  return (
    <Modal
      open={publication !== null}
      onClose={onClose}
      center
      classNames={{ modal: 'close-sale-modal' }}
      styles={{
        overlay: { background: 'rgba(0,0,0,0.55)' },
        modal: { maxWidth: 480, width: '90%', padding: '32px 28px', borderRadius: 14 },
        closeButton: { display: 'none' },
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 64, height: 64, margin: '0 auto 18px', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          borderRadius: '50%', background: 'rgba(34,197,94,0.12)', color: '#16a34a', fontSize: 26,
        }}>
          <i className="fas fa-handshake" />
        </div>
        <h4 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700 }}>{t('myPublications.closeSale')}</h4>
        <p style={{ margin: '0 0 20px', fontSize: 15, opacity: 0.75, lineHeight: 1.5 }}>
          {t('myPublications.closeSaleDescription', { title: publication?.pub_title ?? '' })}
        </p>

        {/* Búsqueda de comprador */}
        <div style={{ position: 'relative', marginBottom: 20, textAlign: 'left' }}>
          {selectedBuyer ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', border: '2px solid var(--tp-theme-1,#6c5ce7)',
              borderRadius: 8, background: 'rgba(108,92,231,0.06)',
            }}>
              <span style={{ flex: 1, fontWeight: 600 }}>
                {selectedBuyer.firstName} {selectedBuyer.lastName}
                <span style={{ opacity: 0.6, fontWeight: 400, marginLeft: 6 }}>@{selectedBuyer.handle}</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedBuyer(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 16 }}
                title={t('myPublications.changeBuyer')}
              >
                <i className="fas fa-times" />
              </button>
            </div>
          ) : (
            <>
              <input
                type="text"
                placeholder={t('myPublications.searchBuyerPlaceholder')}
                value={buyerQuery}
                onChange={(e) => { setBuyerQuery(e.target.value); setDropdownOpen(true); }}
                onFocus={() => setDropdownOpen(true)}
                onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
                style={{
                  width: '100%', padding: '10px 14px', border: '1px solid rgba(128,128,128,0.3)',
                  borderRadius: 8, fontSize: 14, boxSizing: 'border-box',
                  background: 'var(--clr-bg-white,#fff)', color: 'inherit',
                  outline: 'none',
                }}
              />
              {dropdownOpen && users.length > 0 && (
                <ul style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                  background: 'var(--clr-bg-white,#fff)', border: '1px solid rgba(128,128,128,0.2)',
                  borderRadius: 8, margin: 0, padding: '4px 0', listStyle: 'none',
                  boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
                }}>
                  {users.map((u: UserSearchResult) => (
                    <li key={u.cusId}>
                      <button
                        type="button"
                        onMouseDown={() => handleSelectBuyer(u)}
                        style={{
                          width: '100%', textAlign: 'left', background: 'none', border: 'none',
                          padding: '9px 14px', cursor: 'pointer', display: 'flex',
                          alignItems: 'center', gap: 10, fontSize: 14,
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>{u.firstName} {u.lastName}</span>
                        <span style={{ opacity: 0.55 }}>@{u.handle}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {dropdownOpen && buyerQuery.length >= 2 && users.length === 0 && !searchQuery.isLoading && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0,
                  background: 'var(--clr-bg-white,#fff)', border: '1px solid rgba(128,128,128,0.2)',
                  borderRadius: 8, padding: '12px 14px', fontSize: 13, opacity: 0.65,
                  boxShadow: '0 6px 24px rgba(0,0,0,0.1)',
                }}>
                  {t('myPublications.noUsersFound')}
                </div>
              )}
            </>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="border-btn"
            onClick={onClose}
            disabled={closeSaleMutation.isPending}
            style={{ height: 44, padding: '0 22px', fontSize: 14, minWidth: 120 }}
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            className="border-btn"
            onClick={handleConfirm}
            disabled={!selectedBuyer || closeSaleMutation.isPending}
            style={{
              height: 44, padding: '0 22px', fontSize: 14, minWidth: 150,
              background: selectedBuyer && !closeSaleMutation.isPending ? '#16a34a' : undefined,
              borderColor: selectedBuyer && !closeSaleMutation.isPending ? '#16a34a' : undefined,
              color: selectedBuyer && !closeSaleMutation.isPending ? '#fff' : undefined,
              cursor: !selectedBuyer || closeSaleMutation.isPending ? 'not-allowed' : 'pointer',
              opacity: !selectedBuyer || closeSaleMutation.isPending ? 0.6 : 1,
            }}
          >
            {closeSaleMutation.isPending ? t('myPublications.closeSaleLoading') : t('myPublications.closeSaleConfirm')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ─── Componente principal ──────────────────────────────────────────────────────
const MyPublicationsMain = () => {
  const t = useTranslations('publications');
  const { user } = useAuth();
  const publicationsQuery = useMyPublications(user?.id);
  const publications = publicationsQuery.data ?? [];
  const deleteMutation = useDeletePublication(user?.id);
  // Fase 10.3: pub_ids con campaña activa/pausada (mismo criterio que el lock
  // del backend) para mostrar tag "Pautada" + botón "Ver pauta".
  const campaignsQuery = useMyCampaigns();
  const pautadaCampaignByPub = React.useMemo(() => {
    const map = new Map<number, number>(); // pub_id → camp_id
    (campaignsQuery.data ?? []).forEach((c: Campaign) => {
      if (c.camp_status === 'active' || c.camp_status === 'paused') {
        map.set(Number(c.pub_id), Number(c.camp_id));
      }
    });
    return map;
  }, [campaignsQuery.data]);

  const [pendingDelete, setPendingDelete] = useState<MyPublicationItem | null>(null);
  const [pendingCloseSale, setPendingCloseSale] = useState<MyPublicationItem | null>(null);

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setPendingDelete(null);
    deleteMutation.mutate(target.pub_id, {
      onSuccess: () => {
        toast.success(t('myPublications.deleteSuccess', { title: target.pub_title }));
      },
      onError: (err) => {
        const message = err instanceof ApiError ? err.message : t('myPublications.deleteError');
        toast.error(message);
      },
    });
  };

  return (
    <main>
      <ThemeChanger />
      <Breadcrumbs breadcrumbTitle={t('myPublications.breadcrumbTitle')} breadcrumbSubTitle={t('myPublications.breadcrumbTitle')} />

      <section className="artworks-area pt-80 pb-90">
        <div className="container c-container-1">
          {publicationsQuery.isLoading && (
            <div className="alert alert-info">{t('myPublications.loading')}</div>
          )}

          {publicationsQuery.error && (
            <div className="alert alert-danger">{getErrorMessage(publicationsQuery.error, t('common.unexpectedError'))}</div>
          )}

          {!publicationsQuery.isLoading && !publicationsQuery.error && publications.length === 0 && (
            <div className="alert alert-warning">
              {t('myPublications.empty')}
            </div>
          )}

          {!publicationsQuery.isLoading && !publicationsQuery.error && publications.length > 0 && (
            <div className="my-publications-list">
                  {publications.map((publication: MyPublicationItem) => {
                    const badge = getStatusBadge(publication.pubsta_id, {
                      sold: t('status.sold'),
                      draft: t('status.draft'),
                      void: t('status.void'),
                    });
                    const isPautada = pautadaCampaignByPub.has(Number(publication.pub_id)); // Fase 10.3

                    return (
                      <article key={publication.pub_id} className="my-publication-row">
                        {/* Imagen — div con clases globales para que styled-jsx aplique a través del Link */}
                        <Link
                          href={publicationPath(publication)}
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
                            {isPautada && !badge && (
                              <span className="my-publication-badge pautada-badge">
                                <i className="fas fa-bolt" /> {t('myPublications.promoted')}
                              </span>
                            )}
                          </span>
                        </Link>

                        <div className="my-publication-content">
                          <h4>
                            <Link href={publicationPath(publication)}>
                              {publication.pub_title}
                            </Link>
                          </h4>
                          <p>{publication.pub_description}</p>
                          <div className="my-publication-meta">
                            <span>{formatPrice(publication.pubdet_price, publication.pubdet_currency, t('card.priceConsult'))}</span>
                            <span>{publication.pub_address}</span>
                          </div>
                        </div>

                        <div className="my-publication-actions">
                          {/* Fase 10.3 — botón Pautar (publicaciones activas no pautadas) */}
                          {publication.pubsta_id === PUBSTA_ACTIVE && !isPautada && (
                            <Link
                              href={`/pauta?pub=${publication.pub_id}`}
                              className="border-btn pautar-btn"
                              title={t('myPublications.promoteTitle')}
                            >
                              <i className="fas fa-bolt" style={{ marginRight: 6 }} />
                              {t('myPublications.promote')}
                            </Link>
                          )}
                          {publication.pubsta_id === PUBSTA_ACTIVE && isPautada && (
                            <Link
                              href="/pauta"
                              className="border-btn pautar-btn active"
                              title={t('myPublications.campaignActiveTitle')}
                            >
                              <i className="fas fa-bolt" style={{ marginRight: 6 }} />
                              {t('myPublications.viewCampaign')}
                            </Link>
                          )}
                          {/* Botón "Cerrar venta" — solo publicaciones activas */}
                          {publication.pubsta_id === PUBSTA_ACTIVE && (
                            <button
                              type="button"
                              className="border-btn close-sale-btn"
                              onClick={() => setPendingCloseSale(publication)}
                              title={t('myPublications.closeSaleTitle')}
                            >
                              <i className="fas fa-handshake" style={{ marginRight: 6 }} />
                              {t('myPublications.closeSale')}
                            </button>
                          )}
                          {(() => {
                            const isVoid = publication.pubsta_id === PUBSTA_VOID;
                            const isSold = publication.pubsta_id === PUBSTA_SOLD;
                            const editDisabled = isVoid || isSold;
                            const editTitle = isVoid
                              ? t('myPublications.editDisabledVoid')
                              : isSold
                                ? t('myPublications.editDisabledSold')
                                : undefined;

                            return editDisabled ? (
                              <button
                                type="button"
                                className="border-btn"
                                disabled
                                title={editTitle}
                              >
                                {t('myPublications.edit')}
                              </button>
                            ) : (
                              <Link
                                href={`/publications/${publication.pub_id}/edit`}
                                className="border-btn"
                              >
                                {t('myPublications.edit')}
                              </Link>
                            );
                          })()}
                          {(() => {
                            const isVoid = publication.pubsta_id === PUBSTA_VOID;
                            const isSold = publication.pubsta_id === PUBSTA_SOLD;
                            const isDeleting =
                              deleteMutation.isPending &&
                              deleteMutation.variables === publication.pub_id;

                            const disabled = isVoid || isSold || isDeleting;
                            const title = isSold
                              ? t('myPublications.deleteDisabledSold')
                              : isVoid
                                ? t('myPublications.deleteDisabledVoid')
                                : undefined;

                            return (
                              <button
                                type="button"
                                className="border-btn"
                                disabled={disabled}
                                title={title}
                                onClick={() => setPendingDelete(publication)}
                              >
                                {isDeleting ? t('myPublications.deleteLoading') : t('myPublications.delete')}
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

      {/* Modal: cerrar venta */}
      <CloseSaleModal
        publication={pendingCloseSale}
        onClose={() => setPendingCloseSale(null)}
      />

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
          <h4 className="delete-modal-title">{t('myPublications.deleteTitle')}</h4>
          <p className="delete-modal-text">
            {t('myPublications.deleteDescription', { title: pendingDelete?.pub_title ?? '' })}
          </p>
          <div className="delete-modal-actions">
            <button
              type="button"
              className="border-btn delete-modal-cancel"
              onClick={() => setPendingDelete(null)}
              disabled={deleteMutation.isPending}
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              className="border-btn delete-modal-confirm"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? t('myPublications.deleteLoading') : t('myPublications.deleteConfirm')}
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
        .my-publications-list :global(.close-sale-btn) {
          background: #16a34a;
          border-color: #16a34a;
          color: #fff;
        }
        .my-publications-list :global(.close-sale-btn:hover) {
          background: #15803d;
          border-color: #15803d;
          color: #fff;
        }
        /* Fase 10.3 — botón Pautar */
        .my-publications-list :global(.pautar-btn) {
          background: var(--clr-theme-1, #6c5ce7);
          border-color: var(--clr-theme-1, #6c5ce7);
          color: #fff;
        }
        .my-publications-list :global(.pautar-btn:hover) {
          background: #5a4dd1;
          border-color: #5a4dd1;
          color: #fff;
        }
        .my-publications-list :global(.pautar-btn.active) {
          background: #f59e0b;
          border-color: #f59e0b;
        }
        .my-publications-list :global(.pautar-btn.active:hover) {
          background: #d97706;
          border-color: #d97706;
        }
        .my-publications-list :global(.pautada-badge) {
          background: linear-gradient(135deg, #f59e0b, #f97316);
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .my-publications-list :global(.pautada-badge i) {
          font-size: 9px;
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
