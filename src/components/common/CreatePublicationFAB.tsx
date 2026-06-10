"use client";

// Fase 22 — Floating Action Button "Crear publicación" (Aurelio 2026-06-05).
//
// Patrón estándar de marketplaces (MercadoLibre, OLX, Airbnb host):
// botón redondo flotante bottom-right, siempre visible al hacer scroll,
// que lleva al flujo de publicar.
//
// Reglas de visibilidad:
//   - Solo se muestra si el usuario está logueado (gating por useAuth).
//   - Se oculta cuando ya estás en /upload (sería redundante).
//   - Se oculta en /messages porque ese layout no tiene chrome (TOP_NAV_PAGES).
//   - Se oculta en el visor 3D (FULLSCREEN_PATTERNS) — tapa controles.
//   - Se oculta en auth pages (login/register/forgot/verify).
//
// Z-index 1040: debajo de Toastify (1080) y modales (1050) pero arriba del
// CookieConsentBanner (1030) y el chrome del header (auto).
//
// Accesibilidad: aria-label en español/inglés según locale activo,
// tooltip via title nativo (se ve en hover de mouse).

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/utils/AuthContext";
import { stripLocalePath } from "@/utils/stripLocalePath";

// Rutas donde el FAB se oculta — replican las reglas de DefaultWrapper para
// no exponerse en pantallas inmersivas o flujos de autenticación.
const HIDDEN_EXACT_PREFIXES = [
  "/upload",
  "/messages",
  "/login",
  "/register",
  "/forgot",
  "/verify",
];

const HIDDEN_PATTERNS: RegExp[] = [
  /^\/publications\/[^/]+\/viewer/, // visor 3D fullscreen
];

const CreatePublicationFAB: React.FC = () => {
  const t = useTranslations("common.actions");
  const { user, loading } = useAuth();
  const pathname = stripLocalePath(usePathname()) ?? "/";

  // Mientras el auth resuelve, no parpadeamos el FAB (evita flash al hidratar).
  if (loading) return null;
  if (!user) return null;

  const isHiddenPrefix = HIDDEN_EXACT_PREFIXES.some((p) =>
    pathname.startsWith(p),
  );
  const isHiddenPattern = HIDDEN_PATTERNS.some((re) => re.test(pathname));
  if (isHiddenPrefix || isHiddenPattern) return null;

  // Fallback al label español si la clave todavía no está en messages/.
  let label = "Crear publicación";
  try {
    label = t("createPublication");
  } catch {
    label = "Crear publicación";
  }

  return (
    <>
      <Link
        href="/upload"
        className="kiosqui-fab"
        aria-label={label}
        title={label}
      >
        <i className="fas fa-plus" aria-hidden="true" />
      </Link>

      <style jsx>{`
        .kiosqui-fab {
          align-items: center;
          background: var(--clr-theme-1, #2785ff);
          border-radius: 50%;
          bottom: 24px;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.22),
            0 2px 4px rgba(0, 0, 0, 0.18);
          color: #fff !important;
          display: inline-flex;
          font-size: 22px;
          height: 56px;
          justify-content: center;
          position: fixed;
          right: 24px;
          text-decoration: none;
          transition: transform 0.18s ease, box-shadow 0.18s ease,
            background 0.18s ease;
          width: 56px;
          z-index: 1040;
        }
        .kiosqui-fab:hover {
          background: var(--clr-theme-1-hover, var(--clr-theme-1, #1f6ee0));
          box-shadow: 0 8px 22px rgba(0, 0, 0, 0.28),
            0 3px 6px rgba(0, 0, 0, 0.2);
          color: #fff !important;
          transform: translateY(-2px);
        }
        .kiosqui-fab:focus-visible {
          outline: 3px solid rgba(255, 255, 255, 0.65);
          outline-offset: 2px;
        }
        /* En mobile pegamos un poco más arriba para no chocar con el bottom-bar
           del navegador en iOS Safari. */
        @media (max-width: 575px) {
          .kiosqui-fab {
            bottom: 80px;
            height: 52px;
            right: 18px;
            width: 52px;
          }
        }
      `}</style>
    </>
  );
};

export default CreatePublicationFAB;
