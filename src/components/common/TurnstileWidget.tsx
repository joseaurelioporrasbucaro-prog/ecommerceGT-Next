"use client";

// ============================================================================
// Fase 23 — Cloudflare Turnstile widget (Aurelio 2026-06-05).
//
// Cloudflare Turnstile = captcha sin trackers, gratis, drop-in para forms
// públicos sensibles a bots (Contacto). Reemplaza el flujo "reCAPTCHA v3"
// que tiene cookies/tracking de Google.
//
// Setup:
//   1. Crear sitio en https://dash.cloudflare.com → Turnstile → Add site.
//   2. Setear ENV en frontend:  NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4xxxxxxx
//   3. Setear ENV en backend:   TURNSTILE_SECRET_KEY=0x4xxxxxxx
//   4. Para dev sin Cloudflare: usar la sitekey de testing "always pass":
//        1x00000000000000000000AA  (frontend)
//        1x0000000000000000000000000000000AA (backend)
//
// Render: el widget carga su propio script externo on-demand. Si la sitekey
// falta, el componente NO renderea (failsafe en dev sin config).
// ============================================================================

import React, { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
          size?: 'normal' | 'compact';
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface TurnstileWidgetProps {
  /** Callback invocado con el token cuando el usuario completa el reto. */
  onToken: (token: string) => void;
  /** Tema visual del widget. */
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
}

const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({
  onToken,
  theme = 'auto',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey) return; // Sin sitekey configurada → no renderear nada.
    if (!containerRef.current) return;

    let cancelled = false;

    const renderWidget = () => {
      if (cancelled || !containerRef.current || !window.turnstile) return;
      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: onToken,
          'error-callback': () => onToken(''),
          'expired-callback': () => onToken(''),
          theme,
        });
      } catch (err) {
        // Si Turnstile ya está montado en este container (por StrictMode
        // doble-render) ignoramos el error — el widget existente sirve igual.
        // No espameamos el console del user.
      }
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      const existing = document.querySelector<HTMLScriptElement>(
        `script[src="${TURNSTILE_SCRIPT_SRC}"]`,
      );
      if (existing) {
        existing.addEventListener("load", renderWidget, { once: true });
      } else {
        const script = document.createElement("script");
        script.src = TURNSTILE_SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        script.addEventListener("load", renderWidget, { once: true });
        document.head.appendChild(script);
      }
    }

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Cleanup best-effort.
        }
      }
      widgetIdRef.current = null;
    };
  }, [siteKey, onToken, theme]);

  if (!siteKey) {
    // En dev sin sitekey configurada mostramos un placeholder claro para
    // que sea obvio que el captcha no está activo (no falla silencioso).
    if (process.env.NODE_ENV === 'development') {
      return (
        <div
          className={`kiosqui-turnstile-placeholder ${className}`}
          style={{
            padding: '10px 14px',
            border: '1px dashed #d97941',
            borderRadius: 8,
            color: '#d97941',
            fontSize: 13,
          }}
        >
          ⚠️ Turnstile sin configurar. Setear{' '}
          <code>NEXT_PUBLIC_TURNSTILE_SITE_KEY</code> en <code>.env.local</code>.
        </div>
      );
    }
    return null;
  }

  return <div ref={containerRef} className={`kiosqui-turnstile ${className}`} />;
};

export default TurnstileWidget;
