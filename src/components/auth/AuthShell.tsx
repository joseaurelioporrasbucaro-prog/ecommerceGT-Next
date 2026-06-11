"use client";
import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import KiosquiLogo from '@/components/common/KiosquiLogo';

interface AuthShellProps {
  /** Headline del panel de marca (cambia por ruta — 05-HANDOFF §2). */
  headline: string;
  children: React.ReactNode;
}

/**
 * Handoff #5 §1 — shell compartido de las 4 rutas de auth.
 *
 * Dos paneles: marca (navy SIEMPRE, con halos lavanda/verde, logo cream,
 * headline por ruta, 3 bullets de valor y pie) + formulario (fondo --bg,
 * centrado, max 400, sin card). En mobile (<860px) el panel de marca se
 * colapsa a una franja superior (logo + headline corto, sin bullets).
 *
 * Además re-skinea por CSS los formularios legacy que viven adentro
 * (.single-input-unit / .fill-btn / .note) al lenguaje kq — así los
 * componentes con Formik/Yup no se tocan.
 */
const AuthShell = ({ headline, children }: AuthShellProps) => {
  const t = useTranslations('auth.shell');
  const year = new Date().getFullYear();

  return (
    <div className="kq-auth">
      {/* Panel de marca */}
      <div className="kq-auth-brand">
        <Link href="/" className="kq-auth-logo" aria-label="Inicio">
          <KiosquiLogo height={36} variant="dark" />
        </Link>
        <div className="kq-auth-brand-body">
          <h2 className="kq-auth-headline">{headline}</h2>
          <div className="kq-auth-bullets">
            {[
              ['fa-cube', t('bullet3d')],
              ['fa-id-card', t('bulletDpi')],
              ['fa-comments', t('bulletDirect')],
            ].map(([icon, label]) => (
              <div key={icon} className="kq-auth-bullet">
                <span className="kq-auth-bullet-icon">
                  <i className={`fas ${icon}`} />
                </span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="kq-auth-foot">{t('footer', { year })}</div>
      </div>

      {/* Panel de formulario */}
      <div className="kq-auth-form">
        <div className="kq-auth-form-inner">{children}</div>
      </div>

      <style jsx>{`
        .kq-auth {
          display: grid;
          grid-template-columns: minmax(420px, 44%) 1fr;
          min-height: 100vh;
          background: var(--bg, #f8f4ee);
          color: var(--fg, #1e2d4a);
        }
        .kq-auth-brand {
          position: relative;
          background:
            radial-gradient(620px 420px at 90% -10%, rgba(181, 172, 239, 0.3), transparent 60%),
            radial-gradient(520px 380px at -10% 110%, rgba(155, 198, 74, 0.16), transparent 60%),
            var(--navy-800, #1e2d4a);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 44px 48px;
        }
        .kq-auth-brand :global(.kq-auth-logo) {
          align-self: flex-start;
          display: inline-flex;
        }
        .kq-auth-headline {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 38px;
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: var(--cream, #f8f4ee);
          margin: 0 0 26px;
          max-width: 420px;
        }
        .kq-auth-bullets {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .kq-auth-bullet {
          display: flex;
          align-items: center;
          gap: 14px;
          font-size: 14px;
          font-weight: 500;
          color: #d8dfeb;
        }
        .kq-auth-bullet-icon {
          width: 38px;
          height: 38px;
          border-radius: 14px;
          flex-shrink: 0;
          background: rgba(181, 172, 239, 0.18);
          color: var(--lav-300, #ddd8f8);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
        }
        .kq-auth-foot {
          font-size: 12px;
          color: rgba(248, 244, 238, 0.5);
        }
        .kq-auth-form {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 40px;
        }
        .kq-auth-form-inner {
          width: 100%;
          max-width: 400px;
        }

        /* ───── Re-skin de los formularios legacy (Formik intacto) ───── */
        .kq-auth :global(h1.kq-auth-title),
        .kq-auth :global(.kq-auth-form-inner h4) {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 30px;
          letter-spacing: -0.02em;
          color: var(--fg-strong, #22252a);
          margin: 0 0 8px;
        }
        .kq-auth :global(.kq-auth-sub) {
          font-size: 15px;
          color: var(--fg-muted, #5c616a);
          margin: 0 0 28px;
        }
        .kq-auth :global(.single-input-unit) {
          margin-bottom: 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .kq-auth :global(.single-input-unit label) {
          font-size: 13px;
          font-weight: 600;
          color: var(--fg-strong, #22252a);
          margin: 0;
        }
        .kq-auth :global(.single-input-unit input),
        .kq-auth :global(.single-input-unit select),
        .kq-auth :global(textarea) {
          font-family: var(--font-body);
          font-size: 15px;
          color: var(--fg-strong, #22252a);
          background: var(--surface, #fff);
          border: 1.5px solid var(--border-strong, #d4c8b6);
          border-radius: 10px;
          padding: 11px 14px;
          width: 100%;
          height: auto;
          line-height: 1.4;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .kq-auth :global(.single-input-unit input::placeholder) {
          color: var(--fg-subtle, #9aa0a8);
        }
        .kq-auth :global(.single-input-unit input:focus),
        .kq-auth :global(textarea:focus) {
          outline: none;
          border-color: var(--accent, #b5acef);
          box-shadow: var(--shadow-focus, 0 0 0 3px rgba(181, 172, 239, 0.55));
        }
        .kq-auth :global(.fill-btn) {
          width: 100%;
          height: 50px;
          font-size: 16px;
          margin-top: 6px;
        }
        .kq-auth :global(.login-btn .note),
        .kq-auth :global(.note) {
          font-size: 14px;
          color: var(--fg-muted, #5c616a);
          text-align: center;
          margin-top: 24px;
        }
        .kq-auth :global(.text-btn),
        .kq-auth :global(.note a) {
          color: var(--accent-hover, #8a7fe3);
          font-weight: 700;
          text-decoration: none;
        }
        .kq-auth :global(input[type='checkbox']) {
          width: 17px !important;
          height: 17px !important;
          accent-color: var(--green-600, #84ad3f);
        }

        @media (max-width: 860px) {
          .kq-auth {
            grid-template-columns: 1fr;
          }
          .kq-auth-brand {
            min-height: 180px;
            padding: 24px 28px;
            justify-content: flex-start;
            gap: 18px;
          }
          .kq-auth-headline {
            font-size: 24px;
            margin: 0;
          }
          .kq-auth-bullets,
          .kq-auth-foot {
            display: none;
          }
          .kq-auth-form {
            padding: 32px 22px;
          }
        }
      `}</style>
    </div>
  );
};

export default AuthShell;
