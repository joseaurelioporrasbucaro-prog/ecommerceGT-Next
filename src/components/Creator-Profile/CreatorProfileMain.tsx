"use client";

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import ThemeChanger from '@/components/home/ThemeChanger';
import ProfileBreadCamb from './ProfileBreadCamb';
import { useSellerInfo } from '@/hooks/api/usePublications';
import { useSellerReviews } from '@/hooks/api/useSellerReviews';
import { getBackendUrl } from '@/utils/backendUrl';

// ─── Stars display helper ─────────────────────────────────────────────────────
const StarDisplay = ({ value, size = 16 }: { value: number; size?: number }) => {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <span style={{ display: 'inline-flex', gap: 2, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          style={{
            fontSize: size,
            color: i <= full ? '#f59e0b' : i === full + 1 && half ? '#f59e0b' : 'rgba(128,128,128,0.3)',
          }}
        >
          {i <= full ? '★' : i === full + 1 && half ? '⯨' : '★'}
        </span>
      ))}
    </span>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
interface CreatorProfileMainProps {
  id: string;
}

const CreatorProfileMain = ({ id }: CreatorProfileMainProps) => {
  const [activeTab, setActiveTab] = useState<'reseñas'>('reseñas');

  const sellerQuery = useSellerInfo(id);
  const reviewsQuery = useSellerReviews(id);

  const seller = sellerQuery.data;
  const reviewsData = reviewsQuery.data;

  const displayName = seller
    ? `${seller.firstName} ${seller.lastName}`
    : 'Perfil del vendedor';

  const avatarUrl = seller?.imageUrl ? getBackendUrl(seller.imageUrl) : null;

  // Skeleton fake creator for breadcrumb
  const breadcrumbCreator = { name: displayName };

  return (
    <>
      <ThemeChanger />
      <ProfileBreadCamb singleCreator={breadcrumbCreator} />

      <section className="creator-details-area pt-0 pb-90">
        {/* Cover placeholder */}
        <div
          className="creator-cover-img creator-details-cover-img pos-rel wow fadeInUp"
          style={{
            background: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)',
            height: 200,
          }}
        />

        <div className="container">
          {sellerQuery.isLoading && (
            <div className="alert alert-info mt-30">Cargando perfil...</div>
          )}
          {sellerQuery.error && (
            <div className="alert alert-danger mt-30">No se pudo cargar el perfil.</div>
          )}

          {seller && (
            <div className="row">
              {/* ── Left card ── */}
              <div className="col-xl-3 col-lg-6 col-md-8">
                <div className="creator-about mb-40 wow fadeInUp">
                  <div className="profile-img pos-rel">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt={displayName}
                        width={120}
                        height={120}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                        unoptimized
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%', height: '100%', borderRadius: '50%',
                          background: 'linear-gradient(135deg,#6c5ce7,#a29bfe)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 40, color: '#fff', fontWeight: 700,
                        }}
                      >
                        {seller.firstName?.[0]?.toUpperCase() ?? '?'}
                      </div>
                    )}
                  </div>

                  <h4 className="artist-name pos-rel">
                    {displayName}
                    <span className="profile-verification verified">
                      <i className="fas fa-check" />
                    </span>
                  </h4>

                  {seller.handle && (
                    <div className="artist-id" style={{ opacity: 0.65, marginBottom: 8 }}>
                      @{seller.handle}
                    </div>
                  )}

                  {/* Rating summary */}
                  {reviewsData && reviewsData.totalReviews > 0 && (
                    <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <StarDisplay value={reviewsData.average} size={18} />
                      <span style={{ fontWeight: 700, fontSize: 16 }}>{reviewsData.average.toFixed(1)}</span>
                      <span style={{ opacity: 0.55, fontSize: 13 }}>({reviewsData.totalReviews})</span>
                    </div>
                  )}

                  <div className="message-creator-btn" style={{ marginTop: 16 }}>
                    <Link href={`/messages`} className="fill-btn icon-left">
                      <i className="fas fa-paper-plane" />Enviar mensaje
                    </Link>
                  </div>
                </div>
              </div>

              {/* ── Right column ── */}
              <div className="col-xl-9">
                {/* Stats bar */}
                <div className="creator-info-bar mb-30 wow fadeInUp">
                  <div className="artist-meta-info creator-details-meta-info">
                    <div className="artist-meta-item artist-meta-item-border">
                      <div className="artist-meta-type">Publicaciones</div>
                      <div className="artist-created">{seller.totalPublications}</div>
                    </div>
                    <div className="artist-meta-item artist-meta-item-border">
                      <div className="artist-meta-type">Reseñas</div>
                      <div className="artist-likes">{reviewsData?.totalReviews ?? 0}</div>
                    </div>
                    <div className="artist-meta-item">
                      <div className="artist-meta-type">Calificación</div>
                      <div className="artist-follwers">
                        {reviewsData && reviewsData.totalReviews > 0
                          ? `${reviewsData.average.toFixed(1)} / 5`
                          : '—'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="creator-info-tab wow fadeInUp">
                  <div className="creator-info-tab-nav mb-30">
                    <nav>
                      <div className="nav nav-tabs" role="tablist">
                        <button
                          className={`nav-link ${activeTab === 'reseñas' ? 'active' : ''}`}
                          type="button"
                          role="tab"
                          onClick={() => setActiveTab('reseñas')}
                        >
                          <span className="profile-nav-button">
                            <span className="artist-meta-item artist-meta-item-border">
                              <span className="artist-meta-type">Reseñas</span>
                              <span className="artist-created">{reviewsData?.totalReviews ?? 0}</span>
                            </span>
                          </span>
                        </button>
                      </div>
                    </nav>
                  </div>

                  <div className="creator-info-tab-contents mb-30">
                    {/* ── Reseñas ── */}
                    {activeTab === 'reseñas' && (
                      <div className="created-items-wrapper">
                        {reviewsQuery.isLoading && (
                          <p style={{ opacity: 0.6 }}>Cargando reseñas...</p>
                        )}

                        {reviewsData && reviewsData.reviews.length === 0 && (
                          <div
                            style={{
                              padding: '40px 20px', textAlign: 'center',
                              opacity: 0.55, fontSize: 15,
                            }}
                          >
                            <i className="fas fa-star" style={{ fontSize: 32, marginBottom: 12, display: 'block', color: 'rgba(128,128,128,0.3)' }} />
                            Este vendedor todavía no tiene reseñas.
                          </div>
                        )}

                        {reviewsData && reviewsData.reviews.length > 0 && (
                          <>
                            {/* Average banner */}
                            <div
                              style={{
                                display: 'flex', alignItems: 'center', gap: 16,
                                padding: '20px 24px', borderRadius: 12, marginBottom: 24,
                                background: 'rgba(245,158,11,0.07)',
                                border: '1px solid rgba(245,158,11,0.18)',
                              }}
                            >
                              <span style={{ fontSize: 48, fontWeight: 800, color: '#f59e0b' }}>
                                {reviewsData.average.toFixed(1)}
                              </span>
                              <div>
                                <StarDisplay value={reviewsData.average} size={22} />
                                <div style={{ marginTop: 4, fontSize: 13, opacity: 0.65 }}>
                                  {reviewsData.totalReviews} reseña{reviewsData.totalReviews !== 1 ? 's' : ''}
                                </div>
                              </div>
                            </div>

                            {/* Review cards */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                              {reviewsData.reviews.map((review, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    padding: '18px 20px', borderRadius: 10,
                                    border: '1px solid rgba(128,128,128,0.15)',
                                    background: 'rgba(128,128,128,0.03)',
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                    <div
                                      style={{
                                        width: 38, height: 38, borderRadius: '50%',
                                        background: 'linear-gradient(135deg,#6c5ce7,#a29bfe)',
                                        color: '#fff', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', fontWeight: 700, fontSize: 15,
                                        flexShrink: 0,
                                      }}
                                    >
                                      {review.cus_first_name?.[0]?.toUpperCase() ?? '?'}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                                        {review.cus_first_name} {review.cus_last_name}
                                      </div>
                                      <div style={{ fontSize: 12, opacity: 0.5 }}>
                                        {new Date(review.completed_at).toLocaleDateString('es-GT', {
                                          year: 'numeric', month: 'long', day: 'numeric',
                                        })}
                                      </div>
                                    </div>
                                    <StarDisplay value={review.rating_stars} size={15} />
                                  </div>
                                  {review.rating_comment && (
                                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, opacity: 0.8 }}>
                                      {review.rating_comment}
                                    </p>
                                  )}
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
    </>
  );
};

export default CreatorProfileMain;
