"use client";

// ============================================================================
// Fase 23 — Cloudflare Turnstile widget (Aurelio 2026-06-05).
// Fase 24 hardening (2026-06-09): manejo de errores más visible + retry
// automático + timeout para detectar script no-cargado en dev.
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
// ⚠️ IMPORTANTE: si cambiás .env.local mientras `npm run dev` está corriendo,
// Next NO la relee. Hay que matar el dev server (Ctrl+C) y volver a arrancar.
//
// Diagnóstico: si el widget no aparece después de configurar las env vars y
// reiniciar el server, abrí DevTools Console — el componente loguea cada
// paso del lifecycle (script load, render, error) con prefijo [Turnstile].
// ============================================================================

import React, { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: (error?: string) => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact";
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

// Timeout para detectar que el script de Cloudflare no carga (red, ad-block,
// hostname no autorizado). Si pasa esto, mostramos un mensaje útil en dev.
const SCRIPT_LOAD_TIMEOUT_MS = 8000;

type WidgetState =
  | "idle"
  | "loading-script"
  | "rendering"
  | "ready"
  | "error-script"
  | "error-render"
  | "error-missing-sitekey";

interface TurnstileWidgetProps {
  /** Callback invocado con el token cuando el usuario completa el reto. */
  onToken: (token: string) => void;
  /** Tema visual del widget. */
  theme?: "light" | "dark" | "auto";
  className?: string;
}

const log = (...args: unknown[]) => {
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log("[Turnstile]", ...args);
  }
};

const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({
  onToken,
  theme = "auto",
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [state, setState] = useState<WidgetState>("idle");
  const [errorDetail, setErrorDetail] = useState<string>("");
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey) {
      log("sitekey vacía — NEXT_PUBLIC_TURNSTILE_SITE_KEY no llegó al cliente.");
      setState("error-missing-sitekey");
      return;
    }
    if (!containerRef.current) return;

    log("sitekey OK:", siteKey.slice(0, 12) + "...");

    let cancelled = false;
    let scriptTimer: ReturnType<typeof setTimeout> | null = null;

    const renderWidget = () => {
      if (cancelled || !containerRef.current || !window.turnstile) {
        log("renderWidget abortado — cancelled/container/turnstile no listos");
        return;
      }
      setState("rendering");
      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token) => {
            log("token recibido (len:", token.length, ")");
            onToken(token);
          },
          "error-callback": (errCode) => {
            log("error-callback:", errCode);
            setState("error-render");
            setErrorDetail(errCode || "error desconocido del widget");
            onToken("");
          },
          "expired-callback": () => {
            log("token expirado");
            onToken("");
          },
          theme,
        });
        setState("ready");
        log("widget renderizado, id:", widgetIdRef.current);
      } catch (err) {
        log("render() lanzó excepción:", err);
        setState("error-render");
        setErrorDetail(err instanceof Error ? err.message : String(err));
      }
    };

    if (window.turnstile) {
      log("script ya cargado, renderizando inmediato");
      renderWidget();
    } else {
      setState("loading-script");
      const existing = document.querySelector<HTMLScriptElement>(
        `script[src="${TURNSTILE_SCRIPT_SRC}"]`,
      );
      const onLoad = () => {
        log("script cargado");
        renderWidget();
      };
      const onError = () => {
        log("FALLÓ cargar el script (red/ad-block/CSP)");
        setState("error-script");
        setErrorDetail("no se pudo cargar challenges.cloudflare.com");
      };

      if (existing) {
        existing.addEventListener("load", onLoad, { once: true });
        existing.addEventListener("error", onError, { once: true });
      } else {
        const script = document.createElement("script");
        script.src = TURNSTILE_SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        script.addEventListener("load", onLoad, { once: true });
        script.addEventListener("error", onError, { once: true });
        document.head.appendChild(script);
      }

      // Failsafe: si pasa el timeout y aún no renderizó, asumimos que algo
      // falló en silencio (ad-block, CSP, hostname no autorizado).
      scriptTimer = setTimeout(() => {
        if (cancelled) return;
        if (state !== "ready" && state !== "rendering") {
          log("timeout esperando el script de Cloudflare");
          setState("error-script");
          setErrorDetail(
            "timeout — verificá que 'localhost' esté autorizado en Cloudflare → Turnstile → Edit Widget → Hostname Management",
          );
        }
      }, SCRIPT_LOAD_TIMEOUT_MS);
    }

    return () => {
      cancelled = true;
      if (scriptTimer) clearTimeout(scriptTimer);
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Cleanup best-effort.
        }
      }
      widgetIdRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey, theme]);

  // ────── Renderizado por estado ──────

  if (state === "error-missing-sitekey") {
    if (process.env.NODE_ENV === "development") {
      return (
        <div className={`kiosqui-turnstile-warn ${className}`}>
          ⚠️ <strong>Turnstile sin configurar.</strong> Setear{" "}
          <code>NEXT_PUBLIC_TURNSTILE_SITE_KEY</code> en <code>.env.local</code>{" "}
          y <strong>reiniciar el dev server</strong> (Ctrl+C + <code>npm run dev</code>).
          <style jsx>{`
            .kiosqui-turnstile-warn {
              background: rgba(217, 121, 65, 0.1);
              border: 1px dashed #d97941;
              border-radius: 8px;
              color: #d97941;
              font-size: 13px;
              padding: 12px 14px;
            }
            .kiosqui-turnstile-warn :global(code) {
              background: rgba(0, 0, 0, 0.2);
              border-radius: 4px;
              font-size: 12px;
              padding: 1px 5px;
            }
          `}</style>
        </div>
      );
    }
    return null;
  }

  if (state === "error-script" || state === "error-render") {
    return (
      <div className={`kiosqui-turnstile-error ${className}`}>
        <strong>⚠️ No se pudo cargar el captcha.</strong>
        {process.env.NODE_ENV === "development" && errorDetail && (
          <div className="kiosqui-turnstile-error-detail">
            <code>{errorDetail}</code>
          </div>
        )}
        <style jsx>{`
          .kiosqui-turnstile-error {
            background: rgba(220, 53, 69, 0.08);
            border: 1px solid rgba(220, 53, 69, 0.4);
            border-radius: 8px;
            color: #dc3545;
            font-size: 13px;
            padding: 12px 14px;
          }
          .kiosqui-turnstile-error-detail {
            margin-top: 6px;
            opacity: 0.8;
          }
          .kiosqui-turnstile-error :global(code) {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 4px;
            font-size: 11.5px;
            padding: 1px 5px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <div ref={containerRef} className={`kiosqui-turnstile ${className}`} />
      {(state === "loading-script" || state === "rendering") && (
        <p className="kiosqui-turnstile-loading">Cargando captcha…</p>
      )}
      <style jsx>{`
        .kiosqui-turnstile {
          min-height: 65px;
        }
        .kiosqui-turnstile-loading {
          color: rgba(128, 128, 128, 0.7);
          font-size: 12.5px;
          margin: 6px 0 0;
        }
      `}</style>
    </>
  );
};

export default TurnstileWidget;
