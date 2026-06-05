"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

/**
 * Fase 16 — Hero de KIOSQUI para la home oficial.
 *
 * Reemplaza el HeroSectionThree del template (que mostraba imágenes NFT
 * hardcoded en inglés con "Discover Digital Artworks"). Diseño centrado
 * en bienes raíces: titular + subtítulo + barra de búsqueda + métricas
 * de confianza.
 *
 * La barra de búsqueda navega a /publications?q=<texto> — la página de
 * listado consume el query param para filtrar.
 */
const KiosquiHero: React.FC = () => {
  const t = useTranslations('home');
  const tNav = useTranslations('common.nav');
  const router = useRouter();
  const [query, setQuery] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/publications?q=${encodeURIComponent(q)}` : '/publications');
  };

  return (
    <section className="kiosqui-hero">
      <div className="container">
        <div className="kh-inner">
          <div className="kh-locale-pilot">{tNav('home')}</div>
          <h1 className="kh-title">
            {t('hero.titlePrefix')}{' '}
            <span className="kh-accent">{t('hero.titleAccent')}</span>
          </h1>
          <p className="kh-subtitle">{t('hero.subtitle')}</p>

          <form className="kh-search" onSubmit={submit} role="search">
            <i className="fas fa-search kh-search-icon" aria-hidden="true" />
            <input
              type="text"
              placeholder={t('hero.searchPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={t('hero.searchAria')}
            />
            <button type="submit" className="fill-btn kh-search-btn">
              {t('hero.search')}
            </button>
          </form>

          <div className="kh-quick-links">
            <span className="kh-quick-label">{t('hero.searchByType')}</span>
            <Link href="/publications?propertie=1" className="kh-chip">
              <i className="fas fa-home" /> {t('hero.types.houses')}
            </Link>
            <Link href="/publications?propertie=2" className="kh-chip">
              <i className="fas fa-building" /> {t('hero.types.apartments')}
            </Link>
            <Link href="/publications?propertie=3" className="kh-chip">
              <i className="fas fa-map" /> {t('hero.types.land')}
            </Link>
          </div>

          <div className="kh-trust-row">
            <div className="kh-trust">
              <i className="fas fa-shield-alt" />
              <span>{t('hero.trust.verified')}</span>
            </div>
            <div className="kh-trust">
              <i className="fas fa-cube" />
              <span>{t('hero.trust.viewer')}</span>
            </div>
            <div className="kh-trust">
              <i className="fas fa-comments" />
              <span>{t('hero.trust.messages')}</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .kiosqui-hero {
          padding: 96px 0 80px;
          background: linear-gradient(
              135deg,
              rgba(39, 133, 255, 0.06) 0%,
              rgba(39, 133, 255, 0.02) 60%,
              transparent 100%
            ),
            var(--clr-bg-bodylight, #eff1f5);
        }
        .kh-inner {
          max-width: 880px;
          margin: 0 auto;
          text-align: center;
        }
        .kh-locale-pilot {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 28px;
          margin-bottom: 16px;
          padding: 0 14px;
          border: 1px solid rgba(128, 128, 128, 0.24);
          border-radius: 999px;
          color: var(--clr-theme-1, #2785ff);
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .kh-title {
          font-size: clamp(34px, 5vw, 54px);
          font-weight: 800;
          line-height: 1.15;
          color: var(--clr-common-heading);
          margin: 0 0 18px;
        }
        .kh-accent {
          color: var(--clr-theme-1, #2785ff);
          position: relative;
          white-space: nowrap;
        }
        .kh-subtitle {
          font-size: 17px;
          line-height: 1.55;
          color: var(--clr-common-body-text);
          margin: 0 auto 36px;
          max-width: 640px;
        }
        .kh-search {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--clr-bg-white, #fff);
          border: 1px solid var(--clr-common-border, #e0e2e5);
          border-radius: 12px;
          padding: 6px 6px 6px 18px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
          max-width: 640px;
          margin: 0 auto 22px;
        }
        .kh-search-icon {
          color: var(--clr-common-body-text);
          font-size: 16px;
        }
        .kh-search input {
          flex: 1;
          border: none;
          background: transparent;
          outline: none;
          font-size: 15px;
          color: var(--clr-common-heading);
          padding: 14px 4px;
          min-width: 0;
        }
        .kh-search input::placeholder {
          color: var(--clr-common-placeholder, #b4b4b4);
        }
        .kh-search-btn {
          height: 44px !important;
          line-height: 44px !important;
          padding: 0 24px !important;
          font-size: 15px !important;
        }
        .kh-quick-links {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 44px;
        }
        .kh-quick-label {
          font-size: 13.5px;
          color: var(--clr-common-body-text);
          margin-right: 4px;
        }
        .kh-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          background: var(--clr-bg-white, #fff);
          border: 1px solid var(--clr-common-border, #e0e2e5);
          border-radius: 30px;
          font-size: 13.5px;
          font-weight: 600;
          color: var(--clr-common-heading);
          text-decoration: none;
          transition: all 0.15s;
        }
        .kh-chip:hover {
          border-color: var(--clr-theme-1, #2785ff);
          color: var(--clr-theme-1, #2785ff);
          transform: translateY(-1px);
        }
        .kh-chip :global(i) {
          font-size: 12px;
          opacity: 0.7;
        }
        .kh-trust-row {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 28px;
          padding-top: 24px;
          border-top: 1px solid var(--clr-common-border, #e0e2e5);
        }
        .kh-trust {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 13.5px;
          color: var(--clr-common-body-text);
        }
        .kh-trust :global(i) {
          font-size: 16px;
          color: var(--clr-theme-1, #2785ff);
        }
        @media (max-width: 640px) {
          .kiosqui-hero {
            padding: 70px 0 60px;
          }
          .kh-search {
            flex-direction: column;
            padding: 14px;
            gap: 12px;
          }
          .kh-search-icon {
            display: none;
          }
          .kh-search input {
            width: 100%;
            padding: 12px 14px;
            border: 1px solid var(--clr-common-border, #e0e2e5);
            border-radius: 8px;
          }
          .kh-search-btn {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
};

export default KiosquiHero;
