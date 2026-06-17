"use client";

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Modal from 'react-responsive-modal';
import { toast } from 'react-toastify';
import PageHead from '@/components/common/PageHead';
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
 * Handoff #8 §3 — thumbnail 104×70 de la fila de OwnerRow. 3 niveles de
 * fallback: variant thumb → original → placeholder. El dim (saturate .35
 * brightness .85) para vendidas/anuladas lo aplica el padre via CSS.
 */
const PublicationRowImage: React.FC<PublicationRowImageProps> = ({ src, alt }) => {
  const [stage, setStage] = useState<'variant' | 'original' | 'placeholder'>('variant');

  let resolvedSrc: string;
  if (!src || stage === 'placeholder') {
    resolvedSrc = CARD_PLACEHOLDER;
  } else if (stage === 'original') {
    resolvedSrc = getBackendUrl(src);
  } else {
    resolvedSrc = getBackendUrl(getImageVariant(src, 'thumb'));
  }
  const isPlaceholder = resolvedSrc === CARD_PLACEHOLDER;

  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      fill
      sizes="104px"
      style={{ objectFit: 'cover' }}
      unoptimized={isPlaceholder}
      onError={() => {
        setStage((prev) =>
          prev === 'variant' ? 'original' : prev === 'original' ? 'placeholder' : 'placeholder',
        );
      }}
    />
  );
};

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

interface StatusMeta {
  label: string;
  /** Clase del dot (.dot-activa, .dot-borrador, .dot-vendida, .dot-anulada). */
  dotClass: string;
  /** Cuando true, la foto se ve desaturada (vendidas/anuladas). */
  dim: boolean;
}

function getStatusMeta(pubstaId: number, labels: { sold: string; draft: string; void: string }): StatusMeta {
  if (pubstaId === PUBSTA_SOLD) return { label: labels.sold, dotClass: 'dot-vendida', dim: true };
  if (pubstaId === PUBSTA_DRAFT) return { label: labels.draft, dotClass: 'dot-borrador', dim: false };
  if (pubstaId === PUBSTA_VOID) return { label: labels.void, dotClass: 'dot-anulada', dim: true };
  // PUBSTA_ACTIVE (2).
  return { label: 'Activa', dotClass: 'dot-activa', dim: false };
}

function formatRowDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-GT', { day: 'numeric', month: 'short', year: 'numeric' });
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
          borderRadius: '50%', background: 'rgba(155,198,74,0.18)', color: 'var(--green-700)', fontSize: 26,
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
              padding: '10px 14px', border: '2px solid var(--accent)',
              borderRadius: 10, background: 'var(--accent-soft)',
            }}>
              <span style={{ flex: 1, fontWeight: 600 }}>
                {selectedBuyer.firstName} {selectedBuyer.lastName}
                <span style={{ opacity: 0.6, fontWeight: 400, marginLeft: 6 }}>@{selectedBuyer.handle}</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedBuyer(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontSize: 16 }}
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
                  width: '100%', padding: '10px 14px', border: '1.5px solid var(--border-strong)',
                  borderRadius: 10, fontSize: 14, boxSizing: 'border-box',
                  background: 'var(--bg-elevated)', color: 'var(--fg-strong)',
                  outline: 'none',
                }}
              />
              {dropdownOpen && users.length > 0 && (
                <ul style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 10, margin: 0, padding: '4px 0', listStyle: 'none',
                  boxShadow: 'var(--shadow-md)',
                }}>
                  {users.map((u: UserSearchResult) => (
                    <li key={u.cusId}>
                      <button
                        type="button"
                        onMouseDown={() => handleSelectBuyer(u)}
                        style={{
                          width: '100%', textAlign: 'left', background: 'none', border: 'none',
                          padding: '9px 14px', cursor: 'pointer', display: 'flex',
                          alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--fg-strong)',
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
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '12px 14px', fontSize: 13, opacity: 0.65,
                  boxShadow: 'var(--shadow-md)', color: 'var(--fg-muted)',
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
              background: selectedBuyer && !closeSaleMutation.isPending ? 'var(--green-500)' : undefined,
              borderColor: selectedBuyer && !closeSaleMutation.isPending ? 'var(--green-500)' : undefined,
              color: selectedBuyer && !closeSaleMutation.isPending ? 'var(--navy-900)' : undefined,
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
      <PageHead
        overline="Mis publicaciones"
        title={t('myPublications.breadcrumbTitle')}
        sub={t('myPublications.subtitle')}
      />

      <section className="pb-90">
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
                    const statusMeta = getStatusMeta(publication.pubsta_id, {
                      sold: t('status.sold'),
                      draft: t('status.draft'),
                      void: t('status.void'),
                    });
                    const isPautada = pautadaCampaignByPub.has(Number(publication.pub_id)); // Fase 10.3
                    const isVoid = publication.pubsta_id === PUBSTA_VOID;
                    const isSold = publication.pubsta_id === PUBSTA_SOLD;
                    const isDeleting =
                      deleteMutation.isPending &&
                      deleteMutation.variables === publication.pub_id;
                    const editDisabled = isVoid || isSold;
                    const editTitle = isVoid
                      ? t('myPublications.editDisabledVoid')
                      : isSold
                        ? t('myPublications.editDisabledSold')
                        : undefined;
                    const deleteTitle = isSold
                      ? t('myPublications.deleteDisabledSold')
                      : isVoid
                        ? t('myPublications.deleteDisabledVoid')
                        : undefined;

                    return (
                      <article key={publication.pub_id} className={`owner-row ${statusMeta.dim ? 'is-dim' : ''}`}>
                        {/* Thumb 104×70 — Link envolvente con :global() interno. */}
                        <Link
                          href={publicationPath(publication)}
                          className="owner-row-thumb-link"
                          aria-label={publication.pub_title}
                        >
                          <span className={`owner-row-thumb ${statusMeta.dim ? 'is-dim' : ''}`}>
                            <PublicationRowImage
                              src={publication.main_image}
                              alt={publication.pub_title}
                            />
                          </span>
                        </Link>

                        <div className="owner-row-body">
                          <div className="owner-row-headline">
                            <h4 className="owner-row-title">
                              <Link href={publicationPath(publication)}>
                                {publication.pub_title}
                              </Link>
                            </h4>
                            <span className={`owner-row-state ${statusMeta.dotClass}`}>
                              <span className="owner-row-state-dot" />
                              {statusMeta.label}
                            </span>
                            {isPautada && (
                              <span className="owner-row-state owner-row-pautada">
                                <i className="fas fa-bolt" />
                                {t('myPublications.promoted')}
                              </span>
                            )}
                          </div>
                          <div className="owner-row-meta">
                            <span>{formatPrice(publication.pubdet_price, publication.pubdet_currency, t('card.priceConsult'))}</span>
                            <span className="owner-row-sep">·</span>
                            <span>{publication.pub_address}</span>
                            <span className="owner-row-sep">·</span>
                            <span>{formatRowDate(publication.pub_create_date)}</span>
                          </div>
                          {/* Métricas reales (backend: pub_views + conteos de
                              favoritos/comentarios). */}
                          <div className="owner-row-stats">
                            <span title={t('myPublications.metricViews')}>
                              <i className="far fa-eye" />{publication.pub_views ?? 0}
                            </span>
                            <span title={t('myPublications.metricFavorites')}>
                              <i className="far fa-heart" />{publication.favoritesCount ?? 0}
                            </span>
                            <span title={t('myPublications.metricComments')}>
                              <i className="far fa-comments" />{publication.commentsCount ?? 0}
                            </span>
                          </div>
                        </div>

                        <div className="owner-row-actions">
                          {/* Acción primaria por estado: Activa → Pautar/Ver pauta, Borrador → Publicar */}
                          {publication.pubsta_id === PUBSTA_ACTIVE && !isPautada && (
                            <Link
                              href={`/pauta?pub=${publication.pub_id}`}
                              className="owner-btn owner-btn-action"
                              title={t('myPublications.promoteTitle')}
                            >
                              <i className="fas fa-bullhorn" />
                              {t('myPublications.promote')}
                            </Link>
                          )}
                          {publication.pubsta_id === PUBSTA_ACTIVE && isPautada && (
                            <Link
                              href="/pauta"
                              className="owner-btn owner-btn-outline"
                              title={t('myPublications.campaignActiveTitle')}
                            >
                              <i className="fas fa-bolt" />
                              {t('myPublications.viewCampaign')}
                            </Link>
                          )}
                          {publication.pubsta_id === PUBSTA_DRAFT && (
                            <Link
                              href={`/publications/${publication.pub_id}/edit`}
                              className="owner-btn owner-btn-action"
                              title={t('myPublications.edit')}
                            >
                              <i className="fas fa-paper-plane" />
                              {t('myPublications.edit')}
                            </Link>
                          )}

                          {/* Secundarias outline. */}
                          {!editDisabled && publication.pubsta_id !== PUBSTA_DRAFT && (
                            <Link
                              href={`/publications/${publication.pub_id}/edit`}
                              className="owner-btn owner-btn-outline"
                            >
                              <i className="fas fa-pen" />
                              {t('myPublications.edit')}
                            </Link>
                          )}
                          {editDisabled && publication.pubsta_id !== PUBSTA_DRAFT && (
                            <button
                              type="button"
                              className="owner-btn owner-btn-outline"
                              disabled
                              title={editTitle}
                            >
                              <i className="fas fa-pen" />
                              {t('myPublications.edit')}
                            </button>
                          )}

                          {publication.pubsta_id === PUBSTA_ACTIVE && (
                            <button
                              type="button"
                              className="owner-btn owner-btn-outline"
                              onClick={() => setPendingCloseSale(publication)}
                              title={t('myPublications.closeSaleTitle')}
                            >
                              <i className="fas fa-handshake" />
                              {t('myPublications.closeSale')}
                            </button>
                          )}

                          {/* Eliminar danger outline. */}
                          <button
                            type="button"
                            className="owner-btn owner-btn-danger"
                            disabled={isVoid || isSold || isDeleting}
                            title={deleteTitle}
                            onClick={() => setPendingDelete(publication)}
                          >
                            <i className="fas fa-trash" />
                            {isDeleting ? t('myPublications.deleteLoading') : t('myPublications.delete')}
                          </button>
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
          gap: 12px;
          max-width: 980px;
          margin: 0 auto;
        }
        /* OwnerRow — fila propia del owner. styled-jsx no hashea componentes
           custom (<Link> dentro): toda regla a clases hijas va con :global(). */
        .my-publications-list :global(.owner-row) {
          display: grid;
          grid-template-columns: 104px 1fr auto;
          gap: 16px;
          align-items: center;
          padding: 14px 16px;
          border: 1px solid var(--border);
          border-radius: var(--r-md);
          background: var(--surface);
          box-shadow: var(--shadow-xs);
        }
        .my-publications-list :global(.owner-row-thumb-link) {
          display: block;
          width: 104px;
          height: 70px;
          flex-shrink: 0;
        }
        .my-publications-list :global(.owner-row-thumb) {
          position: relative;
          display: block;
          width: 104px;
          height: 70px;
          overflow: hidden;
          border-radius: var(--r-sm);
          background: var(--surface-sunk);
        }
        .my-publications-list :global(.owner-row-thumb.is-dim) {
          filter: saturate(.35) brightness(.85);
        }
        .my-publications-list :global(.owner-row-body) {
          min-width: 0;
        }
        .my-publications-list :global(.owner-row-headline) {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 3px;
          flex-wrap: wrap;
        }
        .my-publications-list :global(.owner-row-title) {
          margin: 0;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 15px;
          color: var(--fg-strong);
          line-height: 1.3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }
        .my-publications-list :global(.owner-row-title a) {
          color: inherit;
          text-decoration: none;
        }
        .my-publications-list :global(.owner-row-title a:hover) {
          color: var(--accent-hover);
        }
        /* Badge frosted de estado (handoff #8 §3). */
        .my-publications-list :global(.owner-row-state) {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 22px;
          padding: 0 10px;
          border-radius: 999px;
          background: var(--surface-sunk);
          border: 1px solid var(--border);
          font-size: 11px;
          font-weight: 700;
          color: var(--fg-muted);
          flex-shrink: 0;
        }
        .my-publications-list :global(.owner-row-state-dot) {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--green-600);
        }
        .my-publications-list :global(.owner-row-state.dot-activa .owner-row-state-dot) { background: var(--green-600); }
        .my-publications-list :global(.owner-row-state.dot-borrador .owner-row-state-dot) { background: var(--ink-400); }
        .my-publications-list :global(.owner-row-state.dot-vendida .owner-row-state-dot) { background: var(--navy-500); }
        .my-publications-list :global(.owner-row-state.dot-anulada .owner-row-state-dot) { background: var(--danger); }
        .my-publications-list :global(.owner-row-pautada) {
          background: var(--accent-soft);
          border-color: var(--lav-300);
          color: var(--lav-700);
        }
        .my-publications-list :global(.owner-row-pautada i) {
          font-size: 9px;
        }
        :global([data-theme='dark']) .my-publications-list :global(.owner-row-pautada) {
          color: var(--lav-300);
        }
        .my-publications-list :global(.owner-row-meta) {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
          font: var(--text-body-sm);
          color: var(--fg-muted);
        }
        .my-publications-list :global(.owner-row-sep) {
          color: var(--fg-subtle);
        }
        .my-publications-list :global(.owner-row-stats) {
          display: flex;
          gap: 16px;
          margin-top: 4px;
          font: var(--text-caption);
          color: var(--fg-subtle);
        }
        .my-publications-list :global(.owner-row-stats i) {
          margin-right: 5px;
          font-size: 12px;
        }
        .my-publications-list :global(.owner-row-actions) {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
          flex-wrap: wrap;
          justify-content: flex-end;
        }
        /* Botones del row (sm). */
        .my-publications-list :global(.owner-btn) {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          height: 34px;
          padding: 0 13px;
          border-radius: var(--r-pill);
          font-size: 12.5px;
          font-weight: 700;
          font-family: var(--font-display);
          text-decoration: none;
          transition: background .15s ease, border-color .15s ease, color .15s ease, transform .15s ease;
          cursor: pointer;
        }
        .my-publications-list :global(.owner-btn i) {
          font-size: 11px;
        }
        .my-publications-list :global(.owner-btn-action) {
          background: var(--green-500);
          color: var(--navy-900);
          border: 1.5px solid var(--green-500);
        }
        .my-publications-list :global(.owner-btn-action:hover) {
          background: var(--green-600);
          border-color: var(--green-600);
          transform: translateY(-1px);
        }
        .my-publications-list :global(.owner-btn-outline) {
          background: transparent;
          color: var(--fg-strong);
          border: 1.5px solid var(--border-strong);
        }
        .my-publications-list :global(.owner-btn-outline:hover) {
          background: var(--surface-sunk);
          border-color: var(--lav-500);
          color: var(--lav-700);
        }
        .my-publications-list :global(.owner-btn-danger) {
          background: transparent;
          color: var(--danger);
          border: 1.5px solid var(--danger-bg, rgba(239, 68, 68, 0.35));
        }
        .my-publications-list :global(.owner-btn-danger:hover:not(:disabled)) {
          background: rgba(239, 68, 68, 0.08);
          border-color: var(--danger);
        }
        .my-publications-list :global(.owner-btn:disabled) {
          cursor: not-allowed;
          opacity: 0.55;
          transform: none;
        }
        /* Mobile: la columna de acciones cae bajo el body. Secundarias colapsan
           tipográficamente (más chico, sin ícono) — no es un menú "⋯" real,
           reportado en feedback §2. */
        @media (max-width: 768px) {
          .my-publications-list :global(.owner-row) {
            grid-template-columns: 80px 1fr;
          }
          .my-publications-list :global(.owner-row-thumb-link),
          .my-publications-list :global(.owner-row-thumb) {
            width: 80px;
            height: 56px;
          }
          .my-publications-list :global(.owner-row-actions) {
            grid-column: 1 / -1;
            justify-content: flex-start;
            margin-top: 4px;
          }
          .my-publications-list :global(.owner-btn) {
            height: 32px;
            padding: 0 11px;
            font-size: 12px;
          }
        }
        :global(.delete-publication-modal) {
          background: var(--surface) !important;
          color: var(--fg-strong);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-lg, 0 24px 60px rgba(0, 0, 0, 0.45));
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
          color: var(--danger);
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
          color: var(--fg-muted);
        }
        :global(.delete-modal-text strong) {
          color: var(--fg-strong);
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
          background: var(--danger);
          border-color: var(--danger);
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
      `}</style>
    </main>
  );
};

export default MyPublicationsMain;
