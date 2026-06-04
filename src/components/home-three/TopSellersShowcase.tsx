"use client";
import React from 'react';
import Link from 'next/link';
import { useTopSellers } from '@/hooks/api/useTopSellers';
import type { TopSellerRow } from '@/types/api';
import { resolveAvatarSrc } from '@/utils/avatarUtils';
import { getBackendUrl } from '@/utils/backendUrl';

/**
 * Fase 16 — Top vendedores con datos reales.
 *
 * Consume `GET /top-sellers?limit=8` (Fase 9). El endpoint ya devuelve
 * score real (combinación de rating, reviews, followers, totalviews,
 * totalpubs) ordenado descendente. Renderizamos 8 con avatar, handle y
 * total de publicaciones.
 *
 * Si no hay sellers (instancia recién creada), no renderizamos la
 * sección — devuelve null. Evita mostrar una "Top Sellers" vacía.
 */
const TopSellersShowcase: React.FC = () => {
  const { data, isLoading } = useTopSellers(8);
  const sellers = data ?? [];

  // En primera carga mostramos skeleton; si llegó vacío al final, ocultamos.
  if (!isLoading && sellers.length === 0) return null;

  return (
    <section className="kh-section kts-section">
      <div className="container">
        <div className="kh-section-head">
          <h2>Vendedores destacados</h2>
          <p>Los propietarios y agentes más activos de la plataforma.</p>
        </div>

        <div className="kts-grid">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={`sk-${i}`} className="kts-card kts-skeleton" />
              ))
            : sellers.map((s: TopSellerRow) => {
                const fullName = [s.firstname, s.lastname]
                  .filter(Boolean)
                  .join(' ')
                  .trim();
                const displayName = fullName || s.handle || 'Vendedor';
                const avatarSrc = resolveAvatarSrc(
                  s.imagenu,
                  fullName || (s.handle ?? null),
                  128,
                  getBackendUrl,
                );
                const totalPubs = Number(s.totalpubs) || 0;
                const rating = Number(s.avgrating) || 0;
                const reviews = Number(s.numreviews) || 0;

                const href = s.handle ? `/${s.handle}` : `/creator-profile?id=${s.id}`;

                return (
                  <Link key={s.id} href={href} className="kts-card">
                    <div className="kts-avatar-wrap">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={avatarSrc} alt={displayName} className="kts-avatar" />
                      {s.verified && (
                        <span className="kts-verified" title="Verificado">
                          <i className="fas fa-check" />
                        </span>
                      )}
                    </div>
                    <div className="kts-info">
                      <p className="kts-name">{displayName}</p>
                      {s.handle && <p className="kts-handle">@{s.handle}</p>}
                      <p className="kts-meta">
                        {totalPubs} {totalPubs === 1 ? 'publicación' : 'publicaciones'}
                        {reviews > 0 && (
                          <>
                            {' · '}
                            <i className="fas fa-star" style={{ color: '#f59e0b' }} />{' '}
                            {rating.toFixed(1)}
                          </>
                        )}
                      </p>
                    </div>
                  </Link>
                );
              })}
        </div>
      </div>

      <style jsx>{`
        .kts-section { padding: 70px 0; }
        /* Fix 2026-06-02: mismo tratamiento que CategoriesShowcase — limitamos
           el ancho del grid y lo centramos para que las cards no se estiren
           desproporcionadamente cuando hay pocos sellers. */
        .kts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 260px));
          gap: 18px;
          justify-content: center;
          max-width: 1100px;
          margin: 0 auto;
        }
        .kts-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px;
          background: var(--clr-bg-white, #fff);
          border: 1px solid var(--clr-common-border, #e0e2e5);
          border-radius: 12px;
          text-decoration: none;
          color: inherit;
          transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
        }
        .kts-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
          border-color: var(--clr-theme-1, #2785ff);
        }
        .kts-skeleton {
          min-height: 86px;
          background: linear-gradient(
            90deg,
            rgba(128, 128, 128, 0.08) 25%,
            rgba(128, 128, 128, 0.14) 50%,
            rgba(128, 128, 128, 0.08) 75%
          );
          background-size: 200% 100%;
          animation: kts-shimmer 1.4s infinite;
        }
        @keyframes kts-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .kts-avatar-wrap { position: relative; flex-shrink: 0; }
        .kts-avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          object-fit: cover;
          background: var(--clr-bg-gray, #f9f9f9);
        }
        .kts-verified {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--clr-theme-1, #2785ff);
          color: #fff;
          font-size: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--clr-bg-white, #fff);
        }
        .kts-info { min-width: 0; flex: 1; }
        .kts-name {
          margin: 0;
          font-size: 14.5px;
          font-weight: 700;
          color: var(--clr-common-heading);
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .kts-handle {
          margin: 1px 0 4px;
          font-size: 12.5px;
          color: var(--clr-theme-1, #2785ff);
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .kts-meta {
          margin: 0;
          font-size: 12px;
          color: var(--clr-common-body-text);
        }
      `}</style>
    </section>
  );
};

export default TopSellersShowcase;
