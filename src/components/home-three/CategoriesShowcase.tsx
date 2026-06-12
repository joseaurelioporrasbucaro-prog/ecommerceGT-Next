"use client";
import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
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
  hintKey: string;
  nameKey: string;
  /** Variante de color del icono (gradientes definidos en <style jsx>).
      Se usa una clase en vez de inline-style para que el dark mode pueda
      overridear Casa a lavanda (el navy se pierde sobre superficie oscura). */
  variant: 'casa' | 'apto' | 'terreno' | 'default';
};

const CATEGORY_META: Record<number, CategoryMeta> = {
  1: { // Casa
    icon: 'fa-home',
    hintKey: 'categories.hints.houses',
    nameKey: 'categories.names.houses',
    variant: 'casa',
  },
  2: { // Apartamento
    icon: 'fa-building',
    hintKey: 'categories.hints.apartments',
    nameKey: 'categories.names.apartments',
    variant: 'apto',
  },
  3: { // Terreno
    icon: 'fa-map',
    hintKey: 'categories.hints.land',
    nameKey: 'categories.names.land',
    variant: 'terreno',
  },
};

const CategoriesShowcase: React.FC = () => {
  const t = useTranslations('home');
  const { data, isLoading } = usePublicationCategories();
  const cats = data ?? [];

  return (
    <section className="kh-section kcs-section">
      <div className="container">
        <div className="kh-section-head">
          <h2>{t('categories.title')}</h2>
          <p>{t('categories.subtitle')}</p>
        </div>

        <div className="kcs-grid">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={`sk-${i}`} className="kcs-card kcs-skeleton" />
              ))
            : cats.slice(0, 3).map((c: PublicationCategory) => {
                const meta = CATEGORY_META[c.pubgen_id] ?? {
                  icon: 'fa-th-large',
                  hintKey: 'categories.hints.default',
                  nameKey: 'categories.names.default',
                  variant: 'default' as const,
                };
                const categoryName = CATEGORY_META[c.pubgen_id]
                  ? t(meta.nameKey)
                  : c.pubgen_description;
                return (
                  <Link
                    key={c.pubgen_id}
                    href={`/publications?propertie=${c.pubgen_id}`}
                    className="kcs-card"
                  >
                    <div className={`kcs-icon kcs-icon--${meta.variant}`}>
                      <i className={`fas ${meta.icon}`} />
                    </div>
                    <h4>{categoryName}</h4>
                    <p>{t(meta.hintKey)}</p>
                    <span className="kcs-cta">
                      {t('categories.view', { category: categoryName.toLowerCase() })}{' '}
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
        /* <Link> no recibe el hash de styled-jsx → :global scoped (AGENTS §6.5). */
        .kcs-grid :global(.kcs-card) {
          display: block;
          padding: 36px 30px;
          background: var(--clr-bg-white, #fff);
          border: 1.5px solid var(--clr-common-border, #e0e2e5);
          border-radius: 20px;
          text-decoration: none;
          color: inherit;
          transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s;
        }
        .kcs-grid :global(.kcs-card:hover) {
          transform: translateY(-4px);
          box-shadow: 0 16px 36px rgba(30, 45, 74, 0.1);
          border-color: var(--lav-500);
        }
        .kcs-grid :global(.kcs-card:hover .kcs-cta) {
          gap: 12px;
          color: var(--lav-700);
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
          width: 68px;
          height: 68px;
          border-radius: 14px;
          color: #fff;
          font-size: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 22px;
        }
        /* Gradientes de marca por categoría (antes inline-style). */
        .kcs-icon--casa {
          background: linear-gradient(135deg, var(--navy-800), var(--navy-600));
        }
        .kcs-icon--apto {
          background: linear-gradient(135deg, var(--green-600), var(--green-500));
        }
        .kcs-icon--terreno {
          background: linear-gradient(135deg, var(--lav-600), var(--lav-500));
        }
        .kcs-icon--default {
          background: linear-gradient(135deg, var(--ink-700), var(--ink-500));
        }
        /* En dark el navy de Casa se pierde sobre la superficie oscura → lavanda. */
        :global([data-theme='dark']) .kcs-icon--casa {
          background: linear-gradient(135deg, var(--lav-600), var(--lav-500));
        }
        .kcs-grid :global(.kcs-card h4) {
          margin: 0 0 8px;
          font-family: var(--font-display);
          font-size: 22px;
          font-weight: 700;
          color: var(--clr-common-heading);
        }
        .kcs-grid :global(.kcs-card p) {
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
