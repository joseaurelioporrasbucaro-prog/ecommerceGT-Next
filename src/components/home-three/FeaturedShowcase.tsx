"use client";
import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import FeaturedPublicationsSection from '@/components/publications/FeaturedPublicationsSection';
import { useFeaturedPublications } from '@/hooks/api/useCampaigns';

/**
 * Fase 16 — vitrina de publicaciones destacadas en la home.
 *
 * Reusa FeaturedPublicationsSection (Fase 10) que ya hace toda la lógica
 * de fetch + render + tracking de impresiones/clicks. Solo lo envolvemos
 * en un header + CTA "Ver todas".
 *
 * Si no hay campañas activas pagas, la sección NO se renderiza (el hijo
 * devuelve null). Eso evita un header solo con "no hay datos".
 */
const FeaturedShowcase: React.FC = () => {
  const t = useTranslations('home');
  const { data } = useFeaturedPublications(6);
  const hasItems = (data?.length ?? 0) > 0;

  if (!hasItems) return null;

  return (
    <section className="kh-section fsc-section">
      <div className="container">
        <div className="kh-section-head fsc-head">
          <div>
            <h2>{t('featured.title')}</h2>
            <p>{t('featured.subtitle')}</p>
          </div>
          <Link href="/publications" className="fsc-link">
            {t('featured.viewAll')} <i className="fas fa-arrow-right" />
          </Link>
        </div>
        {/* El componente ya muestra su propio título "⚡ Destacados".
            Para evitar duplicación lo neutralizamos por CSS. */}
        <div className="fsc-embed">
          <FeaturedPublicationsSection limit={6} />
        </div>
      </div>

      <style jsx>{`
        .fsc-section {
          padding: 70px 0;
          background: var(--clr-bg-gray, #f9f9f9);
        }
        .fsc-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }
        .fsc-link {
          font-size: 14px;
          font-weight: 700;
          color: var(--lav-700);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          transition: gap 0.15s, color 0.15s;
        }
        :global([data-theme='dark']) .fsc-link { color: var(--lav-400); }
        .fsc-link:hover { gap: 11px; color: var(--lav-600); }
        .fsc-link :global(i) { font-size: 12px; }
        /* Oculto el título interno de FeaturedPublicationsSection — ya
           pusimos el nuestro arriba. */
        .fsc-embed :global(.featured-title) { display: none; }
      `}</style>
    </section>
  );
};

export default FeaturedShowcase;
