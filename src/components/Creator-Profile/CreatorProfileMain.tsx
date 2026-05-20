"use client";

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import ThemeChanger from '@/components/home/ThemeChanger';
import ProfileBreadCamb from './ProfileBreadCamb';
import PublicationCard from '@/components/publications/PublicationCard';
import { useSellerInfo } from '@/hooks/api/usePublications';
import { useSellerReviews } from '@/hooks/api/useSellerReviews';
import { useSellerPublications } from '@/hooks/api/useSellerPublications';
import { useToggleFollow } from '@/hooks/api/useFollow';
import { useAuth } from '@/utils/AuthContext';
import { getBackendUrl } from '@/utils/backendUrl';
import coverImg from '../../../public/assets/img/profile/profile-cover/profile-cover-big-1.jpg';

/** Formatea grandes cantidades estilo plantilla (1.2k, 3.4M). */
const fmtCount = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
};

const fmtJoinDate = (iso: string | null): string | null => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('es-GT', { month: 'long', year: 'numeric' });
};

// ─── Estrellas (display) ──────────────────────────────────────────────────────
const Stars = ({ value, size = 16 }: { value: number; size?: number }) => (
  <span className="profile-stars" aria-label={`${value} de 5`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <i
        key={i}
        className={i <= Math.round(value) ? 'fas fa-star' : 'far fa-star'}
        style={{ fontSize: size, color: i <= Math.round(value) ? '#f59e0b' : 'rgba(128,128,128,0.35)', marginRight: 2 }}
      />
    ))}
  </span>
);

type TabKey = 'publicaciones' | 'reseñas';

interface CreatorProfileMainProps {
  id: string;
}

const CreatorProfileMain = ({ id }: CreatorProfileMainProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>('publicaciones');

  const { user } = useAuth();
  const sellerQuery = useSellerInfo(id);
  const reviewsQuery = useSellerReviews(id);
  const pubsQuery = useSellerPublications(id);
  const followMutation = useToggleFollow(Number(id));

  const seller = sellerQuery.data;
  const reviews = reviewsQuery.data;
  const publications = pubsQuery.data ?? [];

  const displayName = seller ? `${seller.firstName} ${seller.lastName}`.trim() : 'Vendedor';
  const avatarUrl = seller?.imageUrl ? getBackendUrl(seller.imageUrl) : null;
  const average = reviews?.average ?? 0;
  const totalReviews = reviews?.totalReviews ?? 0;
  const joinDate = fmtJoinDate(seller?.joinDate ?? null);
  // No mostrar el botón Seguir en el perfil propio.
  const isOwnProfile = user != null && String(user.id) === String(id);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) {
        await navigator.share({ title: displayName, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Enlace del perfil copiado al portapapeles.');
      }
    } catch {
      /* el usuario canceló el share nativo — sin acción */
    }
  };

  const handleToggleFollow = () => {
    followMutation.mutate(undefined, {
      onError: (err) => {
        if (err.message && !err.message.includes('iniciar sesión')) {
          toast.error('No se pudo actualizar el seguimiento.');
        }
      },
    });
  };

  return (
    <>
      <ThemeChanger />
      <ProfileBreadCamb singleCreator={{ name: displayName }} />

      <section className="creator-details-area pt-0 pb-90">
        {/* Cover (estructura del template) */}
        <div className="creator-cover-img creator-details-cover-img pos-rel wow fadeInUp">
          <Image src={coverImg} alt="cover" />
        </div>

        <div className="container">
          {sellerQuery.isLoading && <div className="alert alert-info mt-30">Cargando perfil...</div>}
          {sellerQuery.error && <div className="alert alert-danger mt-30">No se pudo cargar el perfil del vendedor.</div>}

          {seller && (
            <div className="row">
              {/* ── Columna izquierda: tarjeta del creador (template) ── */}
              <div className="col-xl-3 col-lg-6 col-md-8">
                <div className="creator-about mb-40 wow fadeInUp">
                  <div className="profile-img pos-rel">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt={displayName}
                        width={120}
                        height={120}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        unoptimized
                      />
                    ) : (
                      <span className="profile-initials" aria-hidden>
                        {seller.firstName?.[0]?.toUpperCase() ?? '?'}
                      </span>
                    )}
                  </div>

                  <h4 className="artist-name pos-rel">
                    {displayName}
                    <span className="profile-verification verified">
                      <i className="fas fa-check" />
                    </span>
                  </h4>

                  {seller.handle && <div className="artist-id">@{seller.handle}</div>}

                  {totalReviews > 0 && (
                    <div className="profile-rating-line">
                      <Stars value={average} size={15} />
                      <span className="profile-rating-num">{average.toFixed(1)}</span>
                      <span className="profile-rating-count">({totalReviews})</span>
                    </div>
                  )}

                  {/* Ubicación + antigüedad (estructura de lista del template) */}
                  {(seller.address || joinDate) && (
                    <ul className="profile-detail-list">
                      {seller.address && (
                        <li>
                          <i className="fas fa-map-marker-alt" />
                          {seller.address}
                        </li>
                      )}
                      {joinDate && (
                        <li>
                          <i className="flaticon-calendar" />
                          Se unió en {joinDate}
                        </li>
                      )}
                    </ul>
                  )}

                  <div className="message-creator-btn">
                    <Link href="/messages" className="fill-btn icon-left">
                      <i className="fas fa-paper-plane" />Enviar mensaje
                    </Link>
                  </div>
                </div>
              </div>

              {/* ── Columna derecha: stats + tabs (template) ── */}
              <div className="col-xl-9">
                <div className="creator-info-bar mb-30 wow fadeInUp">
                  <div className="artist-meta-info creator-details-meta-info">
                    <div className="artist-meta-item artist-meta-item-border">
                      <div className="artist-meta-type">Publicaciones</div>
                      <div className="artist-created">{seller.totalPublications}</div>
                    </div>
                    <div className="artist-meta-item artist-meta-item-border">
                      <div className="artist-meta-type">Likes</div>
                      <div className="artist-likes">{fmtCount(seller.likes)}</div>
                    </div>
                    <div className="artist-meta-item artist-meta-item-border">
                      <div className="artist-meta-type">Seguidores</div>
                      <div className="artist-follwers">{fmtCount(seller.followers)}</div>
                    </div>
                    <div className="artist-meta-item">
                      <div className="artist-meta-type">Siguiendo</div>
                      <div className="artist-followed">{fmtCount(seller.following)}</div>
                    </div>
                  </div>

                  {/* Acciones: seguir + compartir (estructura del template) */}
                  <div className="creator-details-action">
                    {!isOwnProfile && (
                      <div className="artist-follow-btn">
                        <button
                          type="button"
                          className={`follow-artist ${seller.isFollowing ? 'is-following' : ''}`}
                          onClick={handleToggleFollow}
                          disabled={followMutation.isPending}
                        >
                          {seller.isFollowing ? 'Siguiendo' : 'Seguir'}
                        </button>
                      </div>
                    )}
                    <button
                      type="button"
                      className="creator-share-btn"
                      onClick={handleShare}
                      title="Compartir perfil"
                      aria-label="Compartir perfil"
                    >
                      <i className="flaticon-share" />
                    </button>
                  </div>
                </div>

                <div className="creator-info-tab wow fadeInUp">
                  <div className="creator-info-tab-nav mb-30">
                    <nav>
                      <div className="nav nav-tabs" role="tablist">
                        <button
                          className={`nav-link ${activeTab === 'publicaciones' ? 'active' : ''}`}
                          type="button"
                          role="tab"
                          onClick={() => setActiveTab('publicaciones')}
                        >
                          <span className="profile-nav-button">
                            <span className="artist-meta-item artist-meta-item-border">
                              <span className="artist-meta-type">Publicaciones</span>
                              <span className="artist-created">{seller.totalPublications}</span>
                            </span>
                          </span>
                        </button>
                        <button
                          className={`nav-link ${activeTab === 'reseñas' ? 'active' : ''}`}
                          type="button"
                          role="tab"
                          onClick={() => setActiveTab('reseñas')}
                        >
                          <span className="profile-nav-button">
                            <span className="artist-meta-item">
                              <span className="artist-meta-type">Reseñas</span>
                              <span className="artist-created">{totalReviews}</span>
                            </span>
                          </span>
                        </button>
                      </div>
                    </nav>
                  </div>

                  <div className="creator-info-tab-contents mb-30">
                    {/* ── Tab Publicaciones ── */}
                    {activeTab === 'publicaciones' && (
                      <div className="created-items-wrapper">
                        {pubsQuery.isLoading && <p style={{ opacity: 0.6 }}>Cargando publicaciones...</p>}
                        {!pubsQuery.isLoading && publications.length === 0 && (
                          <div className="profile-empty">
                            <i className="fal fa-folder-open" />
                            <p>Este vendedor todavía no tiene publicaciones activas.</p>
                          </div>
                        )}
                        {publications.length > 0 && (
                          <div className="row">
                            {publications.map((pub) => (
                              <PublicationCard key={pub.id} publication={pub} />
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── Tab Reseñas ── */}
                    {activeTab === 'reseñas' && (
                      <div className="created-items-wrapper">
                        {reviewsQuery.isLoading && <p style={{ opacity: 0.6 }}>Cargando reseñas...</p>}

                        {!reviewsQuery.isLoading && totalReviews === 0 && (
                          <div className="profile-empty">
                            <i className="fal fa-star" />
                            <p>Este vendedor todavía no tiene reseñas.</p>
                          </div>
                        )}

                        {totalReviews > 0 && reviews && (
                          <>
                            <div className="reviews-summary">
                              <div className="reviews-summary-score">{average.toFixed(1)}</div>
                              <div>
                                <Stars value={average} size={20} />
                                <div className="reviews-summary-count">
                                  {totalReviews} reseña{totalReviews !== 1 ? 's' : ''}
                                </div>
                              </div>
                            </div>

                            <div className="reviews-list">
                              {reviews.reviews.map((rev, idx) => (
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
                                        {new Date(rev.completed_at).toLocaleDateString('es-GT', {
                                          year: 'numeric', month: 'long', day: 'numeric',
                                        })}
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
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <style jsx>{`
        .creator-about :global(.profile-initials) {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          font-size: 40px;
          font-weight: 700;
          color: #fff;
          background: linear-gradient(135deg, #6c5ce7, #a29bfe);
          border-radius: 50%;
        }
        .profile-rating-line {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 6px 0 18px;
        }
        .profile-rating-num {
          font-weight: 700;
          font-size: 16px;
        }
        .profile-rating-count {
          opacity: 0.55;
          font-size: 13px;
        }
        .profile-detail-list {
          list-style: none;
          padding: 0;
          margin: 4px 0 20px;
          text-align: left;
        }
        .profile-detail-list li {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 14px;
          opacity: 0.8;
          margin-bottom: 8px;
        }
        .profile-detail-list :global(i) {
          color: var(--tp-theme-1, #6c5ce7);
          width: 16px;
          text-align: center;
          flex-shrink: 0;
        }
        /* Acciones (seguir + compartir) — alinea con la barra de stats del template */
        .creator-info-bar :global(.creator-details-action) {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .creator-info-bar :global(.follow-artist.is-following) {
          background-image: none;
          background-color: rgba(108, 92, 231, 0.12);
          color: var(--tp-theme-1, #6c5ce7);
          padding-left: 27px;
        }
        .creator-info-bar :global(.follow-artist:disabled) {
          opacity: 0.6;
          cursor: wait;
        }
        .creator-info-bar :global(.creator-share-btn) {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid rgba(128, 128, 128, 0.3);
          background: transparent;
          color: inherit;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.2s;
        }
        .creator-info-bar :global(.creator-share-btn:hover) {
          border-color: var(--tp-theme-1, #6c5ce7);
          color: var(--tp-theme-1, #6c5ce7);
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
          color: var(--tp-theme-1, #6c5ce7);
        }
        .reviews-summary {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 22px 26px;
          border-radius: 12px;
          margin-bottom: 26px;
          background: rgba(245, 158, 11, 0.07);
          border: 1px solid rgba(245, 158, 11, 0.18);
        }
        .reviews-summary-score {
          font-size: 48px;
          font-weight: 800;
          color: #f59e0b;
          line-height: 1;
        }
        .reviews-summary-count {
          margin-top: 4px;
          font-size: 13px;
          opacity: 0.65;
        }
        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .review-card {
          padding: 18px 20px;
          border-radius: 10px;
          border: 1px solid rgba(128, 128, 128, 0.15);
          background: rgba(128, 128, 128, 0.03);
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
          background: linear-gradient(135deg, #6c5ce7, #a29bfe);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
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
        }
        .review-date {
          font-size: 12px;
          opacity: 0.5;
        }
        .review-comment {
          margin: 0;
          font-size: 14px;
          line-height: 1.55;
          opacity: 0.8;
        }
      `}</style>
    </>
  );
};

export default CreatorProfileMain;
