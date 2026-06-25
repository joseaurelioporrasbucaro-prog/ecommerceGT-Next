'use client';

import React from 'react';
import Link from 'next/link';

/* ============================================================
   Handoff #18 — Card de ranking de vendedores (Opción B: podio).
   SIN portada/banner. Cinta de rango + avatar con medalla (top 3) +
   badge de rango + stats con rating verde + CTA "Ver perfil".
   La misma card sirve para "Vendedores destacados" y "Mejor calificados".
   Estilos inline + clases globales kq-btn (sin styled-jsx). Dark por tokens.
   ============================================================ */

// Oro / plata / bronce — solo para la cinta + borde + badge del top 3.
const MEDAL = ['#e8b923', '#b8c0cc', '#cd8b5e'];

const fmt = (v: number | string): string => {
  const n = Number(v) || 0;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
};

export interface RankingSellerCardProps {
  rank: number;
  name: string;
  handle: string | null;
  avatarUrl: string | null;
  publications: number | string;
  followers: number | string;
  rating: number | string;
  reviews: number | string;
  profileId: number | string;
}

const RankingSellerCard = ({
  rank, name, handle, avatarUrl, publications, followers, rating, reviews, profileId,
}: RankingSellerCardProps) => {
  const top3 = rank <= 3;
  const medal = top3 ? MEDAL[rank - 1] : null;
  const hasReviews = Number(reviews) > 0 && Number(rating) > 0;
  const ratingText = hasReviews ? Number(rating).toFixed(1) : null;
  const initial = name.trim()[0]?.toUpperCase() ?? '?';
  const href = `/creator-profile/${profileId}`;

  const Stat = ({ value, label, idx }: { value: React.ReactNode; label: string; idx: number }) => (
    <div style={{ flex: 1, textAlign: 'center', padding: '14px 4px', borderLeft: idx > 0 ? '1px solid var(--border)' : undefined }}>
      <div style={{ font: 'var(--text-h4)', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--fg-strong)', lineHeight: 1 }}>{value}</div>
      <div style={{ font: 'var(--text-caption)', color: 'var(--fg-muted)', marginTop: 5 }}>{label}</div>
    </div>
  );

  return (
    <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
      <div
        style={{
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)',
          boxShadow: 'var(--shadow-sm)', overflow: 'hidden', marginBottom: 30,
        }}
      >
        {/* Cinta de rango (medalla top 3 / lavanda resto) */}
        <div style={{ height: 6, background: top3 ? (medal as string) : 'var(--lav-300)' }} aria-hidden />

        <div style={{ padding: '24px 20px 18px', textAlign: 'center', position: 'relative' }}>
          {/* Avatar centrado + badge de rango */}
          <div style={{ position: 'relative', width: 88, margin: '0 auto 14px' }}>
            <Link href={href} aria-label={name} style={{ display: 'block', width: 88, height: 88 }}>
              <div
                style={{
                  width: 88, height: 88, borderRadius: '50%', overflow: 'hidden',
                  background: 'linear-gradient(135deg,var(--navy-700),var(--navy-900))', color: 'var(--cream)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 32,
                  border: top3 ? `3px solid ${medal}` : undefined,
                }}
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  initial
                )}
              </div>
            </Link>
            <span
              style={{
                position: 'absolute', right: -6, bottom: -6, width: 34, height: 34, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                font: 'var(--text-label)', fontSize: 13, fontWeight: 700,
                border: '3px solid var(--surface)',
                background: top3 ? (medal as string) : 'var(--navy-800)', color: top3 ? '#3a2e00' : 'var(--cream)',
              }}
              aria-hidden
            >
              {top3 ? <i className="fas fa-medal" /> : `#${rank}`}
            </span>
          </div>

          <div style={{ font: 'var(--text-h4)', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--fg-strong)' }}>
            <Link href={href} style={{ color: 'inherit', textDecoration: 'none' }}>{name}</Link>
          </div>
          {handle && <div style={{ font: 'var(--text-body-sm)', color: 'var(--lav-700)', fontWeight: 600 }}>@{handle}</div>}
        </div>

        {/* Stats: Publicaciones / Seguidores / Rating (estrella verde, — si no hay reseñas) */}
        <div style={{ display: 'flex', borderTop: '1px solid var(--border)' }}>
          <Stat value={fmt(publications)} label="Publicaciones" idx={0} />
          <Stat value={fmt(followers)} label="Seguidores" idx={1} />
          <Stat
            idx={2}
            label="Rating"
            value={
              ratingText ? (
                <span>
                  {ratingText}
                  <i className="fas fa-star" style={{ color: 'var(--green-600)', fontSize: 13, marginLeft: 3 }} aria-hidden />
                </span>
              ) : (
                <span style={{ color: 'var(--fg-subtle)' }}>—</span>
              )
            }
          />
        </div>

        {/* CTA: verde (top 3) / outline (resto) */}
        <div style={{ padding: 16 }}>
          <Link
            href={href}
            className={`kq-btn ${top3 ? 'kq-btn--action' : 'kq-btn--outline'}`}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Ver perfil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RankingSellerCard;
