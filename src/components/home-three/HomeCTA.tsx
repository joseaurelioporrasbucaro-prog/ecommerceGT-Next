"use client";
import React from 'react';
import Link from 'next/link';
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
  const { user } = useAuth();
  const isLoggedIn = Boolean(user);

  return (
    <section className="kh-section hcta-section">
      <div className="container">
        <div className="hcta-card">
          <div className="hcta-content">
            <h2>
              {isLoggedIn
                ? '¿Listo para sumar otra publicación?'
                : '¿Tenés una propiedad para vender o rentar?'}
            </h2>
            <p>
              {isLoggedIn
                ? 'Publicá rápido desde tu panel y empezá a recibir mensajes hoy mismo.'
                : 'Registrate gratis, verificá tu identidad y publicá tu primera propiedad en menos de 5 minutos.'}
            </p>
            <div className="hcta-actions">
              {isLoggedIn ? (
                <>
                  <Link href="/upload" className="hcta-primary">
                    <i className="fas fa-plus" /> Publicar propiedad
                  </Link>
                  <Link href="/my-publications" className="hcta-secondary">
                    Ver mis publicaciones
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/register" className="hcta-primary">
                    Crear cuenta gratis
                  </Link>
                  <Link href="/pricing-plan" className="hcta-secondary">
                    Ver planes
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
          border-radius: 20px;
          background: linear-gradient(
            135deg,
            var(--clr-theme-1, #2785ff) 0%,
            #1d6fe8 100%
          );
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
        }
        .hcta-content {
          position: relative;
          z-index: 1;
          flex: 1;
          min-width: 0;
        }
        .hcta-card :global(h2) {
          margin: 0 0 12px;
          font-size: clamp(24px, 3.5vw, 34px);
          font-weight: 800;
          line-height: 1.2;
          color: #fff !important;
        }
        /* Fix 2026-06-02: el texto del párrafo se veía oscuro porque el
           template define `body { color: var(--clr-common-body-text) }` (gris
           oscuro) y eso ganaba sobre la herencia del card. Forzamos crema/
           blanco con !important para que destaque sobre el gradiente azul. */
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
           :global porque .hcta-primary lo aplica un componente <Link> de
           Next.js, y styled-jsx no scope-a elementos hijos directamente. */
        .hcta-card :global(.hcta-primary) {
          display: inline-flex;
          align-items: center;
          height: 50px;
          padding: 0 28px;
          border-radius: 5px;
          background: #fff;
          color: var(--clr-theme-1, #2785ff);
          font-size: 15px;
          font-weight: 700;
          text-decoration: none;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
        }
        .hcta-card :global(.hcta-primary):hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.22);
          color: var(--clr-theme-1, #2785ff);
        }
        .hcta-card :global(.hcta-primary i) {
          margin-right: 7px;
        }
        .hcta-card :global(.hcta-secondary) {
          font-size: 14px;
          font-weight: 600;
          color: #fff !important;
          text-decoration: underline;
          padding: 12px 4px;
        }
        .hcta-card :global(.hcta-secondary):hover {
          opacity: 0.85;
          color: #fff !important;
        }
        .hcta-decor {
          flex-shrink: 0;
          font-size: 180px;
          opacity: 0.12;
          line-height: 1;
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
