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
          <h1 className="kh-title">
            {t('hero.titlePrefix')}
            <br />
            {t('hero.titleMid')}{' '}
            <span className="kh-accent">{t('hero.titleAccent')}</span>{' '}
            {t('hero.titleSuffix')}
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
        /* Kiosqui: halos radiales lavanda/verde sobre el canvas (--bg
           auto-conmuta cream/oscuro). Reemplaza el gradiente azul del template. */
        .kiosqui-hero {
          padding: 96px 0 80px;
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(
              900px 480px at 85% -10%,
              rgba(181, 172, 239, 0.28),
              transparent 60%
            ),
            radial-gradient(
              700px 400px at -10% 110%,
              rgba(155, 198, 74, 0.18),
              transparent 60%
            ),
            var(--bg, #f8f4ee);
        }
        :global([data-theme='dark']) .kiosqui-hero {
          background:
            radial-gradient(
              900px 480px at 85% -10%,
              rgba(181, 172, 239, 0.18),
              transparent 60%
            ),
            radial-gradient(
              700px 400px at -10% 110%,
              rgba(155, 198, 74, 0.1),
              transparent 60%
            ),
            var(--bg, #0e1422);
        }
        .kh-inner {
          max-width: 880px;
          margin: 0 auto;
          text-align: center;
        }
        .kh-title {
          font-family: var(--font-display);
          font-size: clamp(38px, 5.6vw, 64px);
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.08;
          color: var(--clr-common-heading);
          margin: 0 0 20px;
        }
        /* Acento lavanda — solo color de texto, sin highlight de fondo
           (03-HANDOFF.md §1). */
        .kh-accent {
          color: var(--lav-700);
          white-space: nowrap;
        }
        :global([data-theme='dark']) .kh-accent {
          color: var(--lav-400);
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
          border-radius: 999px;
          padding: 7px 7px 7px 22px;
          box-shadow: 0 14px 40px rgba(30, 45, 74, 0.1);
          max-width: 660px;
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
        /* Botón verde de marca (no el gradiente azul-morado de .fill-btn). */
        .kh-search-btn {
          height: 48px !important;
          line-height: 48px !important;
          padding: 0 26px !important;
          font-size: 15px !important;
          font-family: var(--font-display);
          font-weight: 600;
          border-radius: 999px !important;
          background-image: none !important;
          background: var(--green-500) !important;
          color: var(--navy-900) !important;
        }
        .kh-search-btn:hover {
          background: var(--green-600) !important;
          color: var(--navy-900) !important;
        }
        .kh-search-btn:active {
          background: var(--green-700) !important;
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
          border-color: var(--lav-500);
          color: var(--lav-700);
          background: var(--lav-100);
          transform: translateY(-1px);
        }
        .kh-chip :global(i) {
          font-size: 12px;
          color: var(--lav-700);
          opacity: 0.85;
        }
        .kh-chip:hover :global(i) {
          opacity: 1;
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
          color: var(--green-600);
        }
        @media (max-width: 640px) {
          .kiosqui-hero {
            padding: 70px 0 60px;
          }
          .kh-search {
            flex-direction: column;
            padding: 14px;
            gap: 12px;
            border-radius: 20px;
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
