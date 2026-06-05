"use client";
import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/utils/AuthContext';

/**
 * Fase 16 — banner CTA al final de la home.
 *
 * Mensaje cambia según si hay sesión:
 * - Sin sesión → "Registrate gratis y publicá tu primera propiedad".
 * - Con sesión → "Publicá una propiedad" + secundario "Ver mis publicaciones".
 *
 * El CTA secundario lleva a /pricing-plan para conocer planes pagos.
 */
const HomeCTA: React.FC = () => {
  const t = useTranslations('home');
  const { user } = useAuth();
  const isLoggedIn = Boolean(user);

  return (
    <section className="kh-section hcta-section">
      <div className="container">
        <div className="hcta-card">
          <div className="hcta-content">
            <h2>
              {isLoggedIn
                ? t('cta.loggedTitle')
                : t('cta.guestTitle')}
            </h2>
            <p>
              {isLoggedIn
                ? t('cta.loggedText')
                : t('cta.guestText')}
            </p>
            <div className="hcta-actions">
              {isLoggedIn ? (
                <>
                  <Link href="/upload" className="hcta-primary">
                    <i className="fas fa-plus" /> {t('cta.publish')}
                  </Link>
                  <Link href="/my-publications" className="hcta-secondary">
                    {t('cta.myPublications')}
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/register" className="hcta-primary">
                    {t('cta.createAccount')}
                  </Link>
                  <Link href="/pricing-plan" className="hcta-secondary">
                    {t('cta.viewPlans')}
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hcta-decor" aria-hidden="true">
            <i className="fas fa-home" />
          </div>
        </div>
      </div>

      <style jsx>{`
        .hcta-section {
          padding: 70px 0 90px;
        }
        .hcta-card {
          position: relative;
          overflow: hidden;
          padding: 48px 44px;
          border-radius: 28px;
          background: var(--navy-800);
          color: var(--cream);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
        }
        /* Halos radiales lavanda/verde dentro del banner (como la referencia). */
        .hcta-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(
              circle at 100% 0%,
              rgba(181, 172, 239, 0.3),
              transparent 50%
            ),
            radial-gradient(
              circle at 0% 100%,
              rgba(155, 198, 74, 0.18),
              transparent 50%
            );
          pointer-events: none;
        }
        .hcta-content {
          position: relative;
          z-index: 1;
          flex: 1;
          min-width: 0;
        }
        .hcta-card :global(h2) {
          margin: 0 0 12px;
          font-family: var(--font-display);
          font-size: clamp(24px, 3.5vw, 34px);
          font-weight: 800;
          line-height: 1.2;
          color: var(--cream) !important;
        }
        /* Fix 2026-06-02: el texto del párrafo se veía oscuro porque el
           template define color del body con --clr-common-body-text (gris
           oscuro) y eso ganaba sobre la herencia del card. Forzamos crema/
           blanco con !important para que destaque sobre el gradiente azul.
           Nota: no usar backticks adentro del comentario — cierran el
           template literal de styled-jsx. */
        .hcta-card :global(p) {
          margin: 0 0 24px;
          font-size: 16px;
          color: rgba(255, 255, 255, 0.95) !important;
          max-width: 580px;
          line-height: 1.55;
        }
        .hcta-actions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          align-items: center;
        }
        /* Botón ya NO usa .fill-btn — lo construimos desde cero acá para que
           el gradiente azul→morado del template no se cuele. Selector con
           :global porque .hcta-primary lo aplica un componente Link de
           Next.js (rendea como anchor), y styled-jsx no scope-a hijos así. */
        /* Primario verde de marca con texto navy (no blanco/azul). */
        .hcta-card :global(.hcta-primary) {
          display: inline-flex;
          align-items: center;
          height: 52px;
          padding: 0 30px;
          border-radius: 999px;
          background: var(--green-500);
          color: var(--navy-900);
          font-family: var(--font-display);
          font-size: 15px;
          font-weight: 700;
          text-decoration: none;
          transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
        }
        .hcta-card :global(.hcta-primary):hover {
          background: var(--green-400);
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(155, 198, 74, 0.35);
          color: var(--navy-900);
        }
        .hcta-card :global(.hcta-primary i) {
          margin-right: 7px;
        }
        .hcta-card :global(.hcta-secondary) {
          font-size: 14px;
          font-weight: 600;
          color: var(--lav-300) !important;
          text-decoration: underline;
          padding: 12px 4px;
        }
        .hcta-card :global(.hcta-secondary):hover {
          color: var(--cream) !important;
        }
        .hcta-decor {
          position: relative;
          z-index: 1;
          flex-shrink: 0;
          font-size: 180px;
          line-height: 1;
          color: rgba(181, 172, 239, 0.18);
        }
        @media (max-width: 768px) {
          .hcta-card {
            padding: 36px 26px;
          }
          .hcta-decor {
            display: none;
          }
        }
      `}</style>
    </section>
  );
};

export default HomeCTA;
