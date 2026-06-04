"use client";
import React from 'react';
import Link from 'next/link';
import { usePublicationCategories } from '@/hooks/api/useCatalogs';
import type { PublicationCategory } from '@/types/api';

/**
 * Fase 16 — vitrina de las 3 grandes categorías de propiedades.
 *
 * Consume `usePublicationCategories()` para evitar hardcodear los IDs
 * (aunque sabemos que son 1=Casa, 2=Apartamento, 3=Terreno, dejamos
 * que el endpoint sea la fuente de verdad).
 *
 * Renderizamos cada categoría como una card grande con icono,
 * descripción corta y CTA que linkea al listado filtrado.
 */
type CategoryMeta = {
  icon: string;
  hint: string;
  gradient: string;
};

const CATEGORY_META: Record<number, CategoryMeta> = {
  1: { // Casa
    icon: 'fa-home',
    hint: 'Casas con jardín, dúplex y residencias en colonias seguras.',
    gradient: 'linear-gradient(135deg, #2785ff 0%, #5fa1ff 100%)',
  },
  2: { // Apartamento
    icon: 'fa-building',
    hint: 'Apartamentos amueblados, lofts y penthouses en zonas urbanas.',
    gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
  },
  3: { // Terreno
    icon: 'fa-map',
    hint: 'Terrenos urbanos, agrícolas y lotes para inversión.',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
  },
};

const CategoriesShowcase: React.FC = () => {
  const { data, isLoading } = usePublicationCategories();
  const cats = data ?? [];

  return (
    <section className="kh-section kcs-section">
      <div className="container">
        <div className="kh-section-head">
          <h2>Explorá por tipo de propiedad</h2>
          <p>Filtrá rápido el catálogo según lo que estás buscando.</p>
        </div>

        <div className="kcs-grid">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={`sk-${i}`} className="kcs-card kcs-skeleton" />
              ))
            : cats.slice(0, 3).map((c: PublicationCategory) => {
                const meta = CATEGORY_META[c.pubgen_id] ?? {
                  icon: 'fa-th-large',
                  hint: '',
                  gradient: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
                };
                return (
                  <Link
                    key={c.pubgen_id}
                    href={`/publications?propertie=${c.pubgen_id}`}
                    className="kcs-card"
                  >
                    <div
                      className="kcs-icon"
                      style={{ background: meta.gradient }}
                    >
                      <i className={`fas ${meta.icon}`} />
                    </div>
                    <h4>{c.pubgen_description}</h4>
                    <p>{meta.hint}</p>
                    <span className="kcs-cta">
                      Ver {c.pubgen_description.toLowerCase()}{' '}
                      <i className="fas fa-arrow-right" />
                    </span>
                  </Link>
                );
              })}
        </div>
      </div>

      <style jsx>{`
        .kcs-section {
          padding: 70px 0;
          background: var(--clr-bg-gray, #f9f9f9);
        }
        /* Fix 2026-06-02: con auto-fit el grid se estiraba a ancho completo
           y cada card podía verse desproporcionadamente larga. Constrain el
           ancho máximo y centramos el bloque, manteniendo el responsive. */
        .kcs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 320px));
          gap: 22px;
          justify-content: center;
          max-width: 1100px;
          margin: 0 auto;
        }
        .kcs-card {
          display: block;
          padding: 32px 26px;
          background: var(--clr-bg-white, #fff);
          border: 1px solid var(--clr-common-border, #e0e2e5);
          border-radius: 14px;
          text-decoration: none;
          color: inherit;
          transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s;
        }
        .kcs-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
          border-color: var(--clr-theme-1, #2785ff);
        }
        .kcs-card:hover .kcs-cta {
          gap: 12px;
          color: var(--clr-theme-1, #2785ff);
        }
        .kcs-skeleton {
          min-height: 240px;
          background: linear-gradient(
            90deg,
            rgba(128, 128, 128, 0.08) 25%,
            rgba(128, 128, 128, 0.14) 50%,
            rgba(128, 128, 128, 0.08) 75%
          );
          background-size: 200% 100%;
          animation: kcs-shimmer 1.4s infinite;
        }
        @keyframes kcs-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .kcs-icon {
          width: 64px;
          height: 64px;
          border-radius: 14px;
          color: #fff;
          font-size: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }
        .kcs-card h4 {
          margin: 0 0 8px;
          font-size: 22px;
          font-weight: 700;
          color: var(--clr-common-heading);
        }
        .kcs-card p {
          margin: 0 0 18px;
          font-size: 14px;
          line-height: 1.5;
          color: var(--clr-common-body-text);
        }
        .kcs-cta {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 14px;
          font-weight: 700;
          color: var(--clr-common-heading);
          transition: gap 0.18s, color 0.18s;
        }
        .kcs-cta :global(i) {
          font-size: 12px;
        }
      `}</style>
    </section>
  );
};

export default CategoriesShowcase;
