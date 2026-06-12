"use client";

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';
import PublicationCard from '@/components/publications/PublicationCard';
import { useSellerInfo } from '@/hooks/api/usePublications';
import { useSellerReviews } from '@/hooks/api/useSellerReviews';
import { useSellerPublications } from '@/hooks/api/useSellerPublications';
import { useToggleFollow } from '@/hooks/api/useFollow';
import { useAuth } from '@/utils/AuthContext';
import { getBackendUrl } from '@/utils/backendUrl';
import { useDateFmt } from '@/utils/datetime';
import type { PublicationListItem, SellerReview } from '@/types/api';

/** Formatea grandes cantidades estilo plantilla (1.2k, 3.4M). */
const fmtCount = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
};

// ─── Estrellas (display) ──────────────────────────────────────────────────────
const Stars = ({ value, size = 16 }: { value: number; size?: number }) => {
  const t = useTranslations('profile');
  return (
    <span className="profile-stars" aria-label={t('rating.outOfFive', { value })}>
      {[1, 2, 3, 4, 5].map((i) => (
        <i
          key={i}
          className={i <= Math.round(value) ? 'fas fa-star' : 'far fa-star'}
          style={{ fontSize: size, color: i <= Math.round(value) ? 'var(--rating)' : 'rgba(128,128,128,0.35)', marginRight: 2 }}
        />
      ))}
    </span>
  );
};

type TabKey = 'publicaciones' | 'reseñas';

interface CreatorProfileMainProps {
  id: string;
}

/**
 * Handoff #6 §1 — perfil público de vendedor: banda navy con halo lavanda +
 * card de identidad superpuesta + tabs con subrayado verde. Lógica intacta
 * (useSellerInfo/Reviews/Publications, follow, share); cambia solo el skin.
 */
const CreatorProfileMain = ({ id }: CreatorProfileMainProps) => {
  const t = useTranslations('profile');
  const dateFmt = useDateFmt();
  const [activeTab, setActiveTab] = useState<TabKey>('publicaciones');

  const { user } = useAuth();
  const sellerQuery = useSellerInfo(id);
  const reviewsQuery = useSellerReviews(id);
  const pubsQuery = useSellerPublications(id);
  const followMutation = useToggleFollow(Number(id));

  const seller = sellerQuery.data;
  const reviews = reviewsQuery.data;
  const publications = pubsQuery.data ?? [];

  const displayName = seller ? `${seller.firstName} ${seller.lastName}`.trim() : t('seller.fallback');
  const avatarUrl = seller?.imageUrl ? getBackendUrl(seller.imageUrl) : null;
  const initials = seller
    ? `${seller.firstName?.[0] ?? ''}${seller.lastName?.[0] ?? ''}`.toUpperCase() || '?'
    : '?';
  const average = reviews?.average ?? 0;
  const totalReviews = reviews?.totalReviews ?? 0;
  const joinDate = seller?.joinDate ? dateFmt.monthYear(seller.joinDate, '') : null;
  // No mostrar el botón Seguir en el perfil propio.
  const isOwnProfile = user != null && String(user.id) === String(id);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) {
        await navigator.share({ title: displayName, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success(t('seller.shareCopied'));
      }
    } catch {
      /* el usuario canceló el share nativo — sin acción */
    }
  };

  const handleToggleFollow = () => {
    if (followMutation.isPending) return; // evita clicks rápidos en bucle
    const currentlyFollowing = seller?.isFollowing ?? false;
    followMutation.mutate(currentlyFollowing, {
      onSuccess: (data) => {
        // Usa la verdad del servidor (data.following), no un valor capturado.
        toast.success(
          data.following
            ? t('seller.followingNow', { name: displayName })
            : t('seller.unfollowedNow', { name: displayName }),
        );
      },
      onError: (err) => {
        if (err.message && !err.message.includes('iniciar sesión')) {
          toast.error(t('seller.followError'));
        }
      },
    });
  };

  return (
    <>
      {/* Banda navy con halo lavanda (reemplaza el cover del template). */}
      <div className="kq-profile-band" aria-hidden />

      <section className="kq-profile-area pb-90">
        <div className="container">
          {sellerQuery.isLoading && <div className="alert alert-info mt-30">{t('seller.loadingProfile')}</div>}
          {sellerQuery.error && <div className="alert alert-danger mt-30">{t('seller.loadError')}</div>}

          {seller && (
            <>
              {/* ── Card de identidad superpuesta sobre la banda ── */}
              <div className="kq-id-card">
                <div className="kq-id-avatar-wrap">
                  <div className="kq-id-avatar">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt={displayName}
                        width={184}
                        height={184}
                        sizes="92px"
                        quality={90}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span aria-hidden>{initials}</span>
                    )}
                  </div>
                  {seller.verified && (
                    <span className="kq-id-check" title={t('seller.verifiedAccount')}>
                      <i className="fas fa-check" />
                    </span>
                  )}
                </div>

                <div className="kq-id-body">
                  <div className="kq-id-name-row">
                    <h1 className="kq-id-name">{displayName}</h1>
                    {seller.verified && (
                      <span className="kq-id-dpi">
                        <i className="fas fa-id-card" /> Verificado con DPI
                      </span>
                    )}
                  </div>
                  {seller.handle && <div className="kq-id-handle">@{seller.handle}</div>}

                  {/* Badge de empresa (funcionalidad existente). */}
                  {seller.companyName && seller.busId && (
                    <Link href={`/empresa/${seller.busId}`} className="kq-id-company">
                      <i className="fas fa-check-circle" />
                      <span>{seller.companyName}</span>
                    </Link>
                  )}

                  {joinDate && (
                    <p className="kq-id-join">
                      <i className="far fa-calendar-alt" /> {t('seller.joined', { date: joinDate })}
                    </p>
                  )}

                  <div className="kq-id-stats">
                    <div className="kq-id-stat">
                      <span className="kq-id-stat-num">{seller.totalPublications}</span>
                      <span className="kq-id-stat-label">{t('stats.publications')}</span>
                    </div>
                    <div className="kq-id-stat">
                      <span className="kq-id-stat-num">{fmtCount(seller.totalViews)}</span>
                      <span className="kq-id-stat-label">{t('stats.views')}</span>
                    </div>
                    <div className="kq-id-stat">
                      <span className="kq-id-stat-num">{fmtCount(seller.followers)}</span>
                      <span className="kq-id-stat-label">{t('stats.followers')}</span>
                    </div>
                    {totalReviews > 0 && (
                      <div className="kq-id-stat">
                        <span className="kq-id-stat-num kq-id-stat-rating">
                          <i className="fas fa-star" /> {average.toFixed(1)}
                        </span>
                        <span className="kq-id-stat-label">
                          {t('seller.reviewCount', { count: totalReviews })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="kq-id-actions">
                  <Link href="/messages" className="fill-btn kq-id-message">
                    <i className="fas fa-paper-plane" /> {t('seller.sendMessage')}
                  </Link>
                  {!isOwnProfile && (
                    <button
                      type="button"
                      className={`fill-btn-outline kq-id-follow ${seller.isFollowing ? 'is-following' : ''}`}
                      onClick={handleToggleFollow}
                      disabled={followMutation.isPending}
                    >
                      {seller.isFollowing ? `✓ ${t('seller.following')}` : t('seller.follow')}
                    </button>
                  )}
                  <button
                    type="button"
                    className="kq-id-share"
                    onClick={handleShare}
                    title={t('seller.share')}
                    aria-label={t('seller.share')}
                  >
                    <i className="fas fa-share-alt" />
                  </button>
                </div>
              </div>

              {/* ── Tabs: subrayado verde ── */}
              <div className="kq-profile-tabs" role="tablist">
                <button
                  className={`kq-profile-tab ${activeTab === 'publicaciones' ? 'is-active' : ''}`}
                  type="button"
                  role="tab"
                  onClick={() => setActiveTab('publicaciones')}
                >
                  {t('stats.publications')} ({seller.totalPublications})
                </button>
                <button
                  className={`kq-profile-tab ${activeTab === 'reseñas' ? 'is-active' : ''}`}
                  type="button"
                  role="tab"
                  onClick={() => setActiveTab('reseñas')}
                >
                  {t('stats.reviews')} ({totalReviews})
                </button>
              </div>

              <div className="kq-profile-content">
                {/* ── Tab Publicaciones ── */}
                {activeTab === 'publicaciones' && (
                  <div className="created-items-wrapper">
                    {pubsQuery.isLoading && <p style={{ opacity: 0.6 }}>{t('seller.loadingPublications')}</p>}
                    {!pubsQuery.isLoading && publications.length === 0 && (
                      <div className="profile-empty">
                        <i className="fal fa-folder-open" />
                        <p>{t('seller.noPublications')}</p>
                      </div>
                    )}
                    {publications.length > 0 && (
                      <div className="row">
                        {publications.map((pub: PublicationListItem) => (
                          <PublicationCard key={pub.id} publication={pub} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Tab Reseñas ── */}
                {activeTab === 'reseñas' && (
                  <div className="created-items-wrapper">
                    {reviewsQuery.isLoading && <p style={{ opacity: 0.6 }}>{t('seller.loadingReviews')}</p>}

                    {!reviewsQuery.isLoading && totalReviews === 0 && (
                      <div className="profile-empty">
                        <i className="fal fa-star" />
                        <p>{t('seller.noReviews')}</p>
                      </div>
                    )}

                    {totalReviews > 0 && reviews && (
                      <>
                        <div className="reviews-summary">
                          <div className="reviews-summary-score">{average.toFixed(1)}</div>
                          <div>
                            <Stars value={average} size={20} />
                            <div className="reviews-summary-count">
                              {t('seller.reviewCount', { count: totalReviews })}
                            </div>
                          </div>
                        </div>

                        <div className="reviews-list">
                          {reviews.reviews.map((rev: SellerReview, idx: number) => (
                            <div key={idx} className="review-card">
                              <div className="review-head">
                                <span className="review-avatar" aria-hidden>
                                  {rev.cus_first_name?.[0]?.toUpperCase() ?? '?'}
                                </span>
                                <div className="review-meta">
                                  <div className="review-author">
                                    {rev.cus_first_name} {rev.cus_last_name}
                                  </div>
                                  <div className="review-date">
                                    {dateFmt.medium(rev.completed_at)}
                                  </div>
                                </div>
                                <Stars value={rev.rating_stars} size={14} />
                              </div>
                              {rev.rating_comment && <p className="review-comment">{rev.rating_comment}</p>}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      <style jsx>{`
        /* ── Banda navy (handoff #6 §1.2) ── */
        .kq-profile-band {
          height: 128px;
          background:
            radial-gradient(560px 320px at 88% -20%, rgba(181, 172, 239, 0.28), transparent 60%),
            var(--navy-800, #1e2d4a);
        }
        /* ── Card de identidad superpuesta ── */
        .kq-id-card {
          position: relative;
          margin-top: -64px;
          background: var(--surface, #fff);
          border: 1px solid var(--border, #e6ddcf);
          border-radius: 20px;
          box-shadow: var(--shadow-md, 0 8px 24px rgba(30, 45, 74, 0.1));
          padding: 26px 30px;
          display: flex;
          gap: 24px;
          align-items: flex-start;
          flex-wrap: wrap;
        }
        .kq-id-avatar-wrap {
          position: relative;
          flex-shrink: 0;
        }
        .kq-id-avatar {
          width: 92px;
          height: 92px;
          border-radius: 999px;
          overflow: hidden;
          background: linear-gradient(135deg, var(--navy-700, #283a5c), var(--navy-900, #161f33));
          color: var(--cream, #f8f4ee);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 30px;
        }
        .kq-id-check {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 28px;
          height: 28px;
          border-radius: 999px;
          background: var(--green-500, #9bc64a);
          color: var(--navy-900, #161f33);
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid var(--surface, #fff);
        }
        .kq-id-body {
          flex: 1;
          min-width: 240px;
        }
        .kq-id-name-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .kq-id-name {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 26px;
          letter-spacing: -0.01em;
          color: var(--fg-strong, #22252a);
          margin: 0;
        }
        .kq-id-dpi {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 999px;
          background: var(--green-100, #eef6df);
          color: var(--green-800, #5c7c28);
          font-size: 12px;
          font-weight: 700;
        }
        :global([data-theme='dark']) .kq-id-dpi {
          background: rgba(155, 198, 74, 0.18);
          color: var(--green-400, #b0d56e);
        }
        .kq-id-handle {
          color: var(--accent-hover, #8a7fe3);
          font-weight: 700;
          font-size: 14px;
          margin: 2px 0 6px;
        }
        .kq-id-card :global(.kq-id-company) {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 14px;
          border-radius: 999px;
          border: 1px solid var(--lav-300, #ddd8f8);
          background: var(--accent-soft, #ebe8fb);
          color: var(--fg-strong, #22252a);
          font-weight: 600;
          font-size: 13px;
          text-decoration: none;
          margin-bottom: 6px;
          transition: background 0.2s;
        }
        .kq-id-card :global(.kq-id-company i) {
          color: var(--lav-700, #6d62cf);
        }
        .kq-id-join {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 13px;
          color: var(--fg-subtle, #9aa0a8);
          margin: 4px 0 14px;
        }
        .kq-id-stats {
          display: flex;
          gap: 34px;
          flex-wrap: wrap;
        }
        .kq-id-stat {
          display: flex;
          flex-direction: column;
        }
        .kq-id-stat-num {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 24px;
          color: var(--fg-strong, #22252a);
          line-height: 1.2;
        }
        .kq-id-stat-rating :global(i) {
          color: var(--rating, #84ad3f);
          font-size: 18px;
        }
        .kq-id-stat-label {
          font-size: 12.5px;
          color: var(--fg-muted, #5c616a);
        }
        .kq-id-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: stretch;
          min-width: 190px;
        }
        .kq-id-card :global(.kq-id-message) {
          height: 46px;
          font-size: 14px;
          gap: 8px;
        }
        .kq-id-card :global(.kq-id-follow) {
          height: 46px;
          font-size: 14px;
        }
        .kq-id-card :global(.kq-id-follow.is-following) {
          border-color: var(--lav-500, #b5acef);
          background: var(--accent-soft, #ebe8fb);
          color: var(--lav-700, #6d62cf);
        }
        .kq-id-share {
          height: 40px;
          border-radius: 999px;
          border: 1.5px solid var(--border-strong, #d4c8b6);
          background: var(--surface, #fff);
          color: var(--fg-strong);
          cursor: pointer;
          font-size: 15px;
          transition: all 0.15s;
        }
        .kq-id-share:hover {
          border-color: var(--lav-500);
          color: var(--lav-700);
        }
        /* ── Tabs con subrayado verde ── */
        .kq-profile-tabs {
          display: flex;
          gap: 28px;
          margin: 34px 0 26px;
          border-bottom: 1px solid var(--border, #e6ddcf);
        }
        .kq-profile-tab {
          font-family: var(--font-display);
          font-size: 14px;
          font-weight: 600;
          color: var(--fg-subtle, #9aa0a8);
          background: transparent;
          border: none;
          border-bottom: 2.5px solid transparent;
          padding: 10px 2px 12px;
          cursor: pointer;
          transition: color 0.15s, border-color 0.15s;
        }
        .kq-profile-tab.is-active {
          color: var(--fg-strong, #22252a);
          border-bottom-color: var(--green-500, #9bc64a);
        }
        .profile-empty {
          padding: 50px 20px;
          text-align: center;
          opacity: 0.6;
        }
        .profile-empty :global(i) {
          font-size: 36px;
          display: block;
          margin-bottom: 14px;
          color: var(--lav-700, #6d62cf);
        }
        .reviews-summary {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 22px 26px;
          border-radius: 14px;
          margin-bottom: 26px;
          background: var(--green-100, #eef6df);
          border: 1px solid var(--green-300, #c8e297);
        }
        :global([data-theme='dark']) .reviews-summary {
          background: rgba(155, 198, 74, 0.12);
          border-color: rgba(155, 198, 74, 0.25);
        }
        .reviews-summary-score {
          font-family: var(--font-display);
          font-size: 48px;
          font-weight: 800;
          color: var(--rating);
          line-height: 1;
        }
        .reviews-summary-count {
          margin-top: 4px;
          font-size: 13px;
          color: var(--fg-muted, #5c616a);
        }
        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .review-card {
          padding: 18px 20px;
          border-radius: 14px;
          border: 1px solid var(--border, #e6ddcf);
          background: var(--surface, #fff);
        }
        .review-head {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }
        .review-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--navy-700, #283a5c), var(--navy-900, #161f33));
          color: var(--cream, #f8f4ee);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 15px;
          flex-shrink: 0;
        }
        .review-meta {
          flex: 1;
          min-width: 0;
        }
        .review-author {
          font-weight: 600;
          font-size: 14px;
          color: var(--fg-strong, #22252a);
        }
        .review-date {
          font-size: 12px;
          color: var(--fg-subtle, #9aa0a8);
        }
        .review-comment {
          margin: 0;
          font-size: 14px;
          line-height: 1.55;
          color: var(--fg-muted, #5c616a);
        }
        @media (max-width: 767px) {
          .kq-id-card {
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 22px 18px;
          }
          .kq-id-name-row,
          .kq-id-join {
            justify-content: center;
          }
          .kq-id-stats {
            justify-content: center;
            gap: 24px;
          }
          .kq-id-actions {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
};

export default CreatorProfileMain;
