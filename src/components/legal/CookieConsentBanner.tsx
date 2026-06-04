"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'kiosqui_cookie_consent_v1';

/**
 * Fase 12 — banner de consentimiento de cookies.
 *
 * Decisiones de diseño:
 * - Aparece UNA vez por navegador; la aceptación se guarda en localStorage
 *   bajo `kiosqui_cookie_consent_v1`. Si en el futuro cambia materialmente
 *   nuestra política de cookies, subir el sufijo a _v2 reaparece el banner.
 * - Visible al inicio en TODAS las páginas excepto el visor 3D fullscreen
 *   (donde competiría por foco con los controles del modelo).
 * - No bloquea la navegación — es informativo. Cumplir solo con "ePrivacy
 *   strict" (donde el banner bloquea hasta aceptar) requeriría rediseñar
 *   cookies de sesión y analítica; queda pendiente cuando integremos
 *   herramientas que disparen cookies de terceros realmente intrusivas.
 * - Inicialmente NO renderiza nada (SSR-safe + evita hydration mismatch),
 *   luego comprueba localStorage en useEffect.
 */
const CookieConsentBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      // Ocultar en el visor 3D — la ruta tiene patrón /publications/:id/viewer.
      if (typeof window !== 'undefined') {
        const path =
          window.location.pathname.replace(/^\/(es|en)(?=\/|$)/, '') || '/';
        if (/^\/publications\/[^/]+\/viewer/.test(path)) return;
      }
      const accepted = localStorage.getItem(STORAGE_KEY);
      if (!accepted) setVisible(true);
    } catch {
      // localStorage puede no estar disponible (modo privado de algunos
      // browsers). En ese caso no mostramos el banner para no incomodar.
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {
      // ignore — el usuario ya vio el aviso, la falta de persistencia solo
      // hará que reaparezca en otra visita.
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="ccb-wrapper" role="dialog" aria-label="Aviso de cookies">
      <div className="ccb-card">
        <div className="ccb-icon" aria-hidden="true">
          <i className="fas fa-cookie-bite" />
        </div>
        <div className="ccb-text">
          <p className="ccb-title">Esta web usa cookies</p>
          <p className="ccb-body">
            Usamos cookies para mantener tu sesión, recordar tus
            preferencias y mejorar la plataforma. Al continuar navegando
            aceptás nuestro uso de cookies. Más detalles en nuestra{' '}
            <Link href="/privacidad">Política de Privacidad</Link>.
          </p>
        </div>
        <button
          type="button"
          className="ccb-accept fill-btn"
          onClick={accept}
        >
          Aceptar
        </button>
      </div>

      <style jsx>{`
        .ccb-wrapper {
          position: fixed;
          bottom: 14px;
          left: 14px;
          right: 14px;
          z-index: 10000;
          pointer-events: none;
          display: flex;
          justify-content: center;
        }
        .ccb-card {
          pointer-events: auto;
          max-width: 920px;
          width: 100%;
          background: var(--clr-bg-white, #ffffff);
          color: var(--clr-common-body-text);
          border: 1px solid var(--clr-common-border, #e0e2e5);
          border-radius: 12px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.18);
          padding: 14px 18px;
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .ccb-icon {
          flex-shrink: 0;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(39, 133, 255, 0.12);
          color: var(--clr-theme-1, #2785ff);
          font-size: 20px;
        }
        .ccb-text {
          flex: 1;
          min-width: 0;
        }
        .ccb-title {
          margin: 0 0 2px;
          font-size: 14px;
          font-weight: 700;
          color: var(--clr-common-heading);
        }
        .ccb-body {
          margin: 0;
          font-size: 13px;
          line-height: 1.5;
          opacity: 0.9;
        }
        .ccb-body :global(a) {
          color: var(--clr-theme-1, #2785ff);
          font-weight: 600;
        }
        .ccb-accept {
          flex-shrink: 0;
          height: 40px !important;
          line-height: 40px !important;
          padding: 0 22px !important;
          font-size: 14px !important;
        }
        @media (max-width: 640px) {
          .ccb-card {
            flex-direction: column;
            align-items: stretch;
            text-align: center;
          }
          .ccb-icon {
            margin: 0 auto;
          }
          .ccb-accept {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default CookieConsentBanner;
