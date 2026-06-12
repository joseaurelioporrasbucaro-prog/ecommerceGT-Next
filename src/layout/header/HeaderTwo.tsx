"use client";
import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import SidebarMenuSection from "../sidebar/SidebarMenuSection";
import AccountRightSidebar from "../sidebar/AccountRightSidebar";
import NotificationBell from "@/components/notifications/NotificationBell";
import HeaderSearch from "./component/HeaderSearch";
import KiosquiLogo from "@/components/common/KiosquiLogo";
import { useAuth } from "@/utils/AuthContext";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import { Link } from "@/i18n/navigation";

/**
 * Handoff #3 §2 — header definitivo Kiosqui.
 *
 * Layout (izq → der): avatar de perfil (solo logueado, abre el drawer de
 * cuenta IZQUIERDO) · logo transparente 48px · buscador pill (reemplaza los
 * links de navegación) · idioma · theme toggle · "Iniciar sesión" ghost
 * (deslogueado) · "Publicar" verde · campana (logueado) · hamburguesa
 * (abre el drawer de navegación DERECHO).
 *
 * Regla UX: el botón de la izquierda abre el panel izquierdo; el de la
 * derecha abre el panel derecho — en todos los anchos (ya no hay rieles
 * fijos en xxl).
 */
interface HeaderTwoProps {
  /** Handoff #5 §3 — variante densa para /messages: sin buscador, logo 32px. */
  compact?: boolean;
}

const HeaderTwo = ({ compact = false }: HeaderTwoProps) => {
  const { setTheme, resolvedTheme } = useTheme();
  const { user } = useAuth();

  const [menuOpen1, setMenuOpen1] = useState(false); // drawer derecho: navegación
  const [menuOpen2, setMenuOpen2] = useState(false); // drawer izquierdo: cuenta

  // Cierre con Esc + scroll lock del body mientras un drawer esté abierto.
  useEffect(() => {
    const anyOpen = menuOpen1 || menuOpen2;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen1(false);
        setMenuOpen2(false);
      }
    };
    if (anyOpen) {
      document.addEventListener("keydown", onKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [menuOpen1, menuOpen2]);

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "K"
    : "";

  return (
    <>
      <header className="header2">
        <div className="kq-nav">
          <div className="container">
            <div className="kq-nav-inner">
              {/* Avatar (solo logueado) — abre "Mi cuenta" desde la IZQUIERDA */}
              {user && (
                <button
                  type="button"
                  className="kq-profile-btn"
                  onClick={() => setMenuOpen2(!menuOpen2)}
                  aria-label="Mi cuenta"
                  title="Mi cuenta"
                >
                  {initials}
                </button>
              )}

              <Link href="/" className="kq-nav-logo" aria-label="Inicio">
                <KiosquiLogo height={compact ? 32 : 40} />
              </Link>

              {/* Buscador pill — reemplaza los links de navegación */}
              {!compact && (
                <HeaderSearch
                  className="kq-nav-search d-none d-md-block"
                  placeholder="Buscar por zona, ciudad, colonia…"
                />
              )}

              <div className="kq-nav-cta">
                <LanguageSwitcher className="header-lang d-none d-sm-inline-flex" />

                {/* Theme toggle — ambos íconos en DOM; CSS muestra uno por tema
                    (evita mismatch de hidratación con resolvedTheme). */}
                <button
                  type="button"
                  className="kq-icon-btn kq-theme-toggle"
                  onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                  aria-label="Cambiar tema"
                >
                  <i className="fas fa-moon" />
                  <i className="fas fa-sun" />
                </button>

                {!user && (
                  <Link className="kq-ghost-btn d-none d-sm-inline-flex" href="/login">
                    Iniciar sesión
                  </Link>
                )}

                <Link
                  className="fill-btn fill-btn-sm kq-publish-btn d-none d-sm-inline-flex"
                  href={user ? "/upload" : "/login?from=/upload"}
                >
                  <i className="fas fa-plus" aria-hidden="true" />
                  Publicar
                </Link>

                {user && <NotificationBell />}

                {/* Hamburguesa — abre la navegación desde la DERECHA */}
                <button
                  type="button"
                  className="kq-icon-btn kq-hamburger"
                  onClick={() => setMenuOpen1(!menuOpen1)}
                  aria-label="Abrir menú"
                >
                  <i className="fas fa-bars" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Drawer DERECHO — navegación */}
      <SidebarMenuSection menuOpen1={menuOpen1} setMenuOpen1={setMenuOpen1} />
      <div
        onClick={() => setMenuOpen1(false)}
        className={
          menuOpen1 ? "offcanvas-overlay overlay-open" : "offcanvas-overlay"
        }
      ></div>

      {/* Drawer IZQUIERDO — Mi cuenta (solo logueado; el avatar es su único
          disparador, ver 03-HANDOFF.md §2). */}
      {user && (
        <>
          <AccountRightSidebar menuOpen2={menuOpen2} setMenuOpen2={setMenuOpen2} />
          <div
            onClick={() => setMenuOpen2(false)}
            className={
              menuOpen2 ? "offcanvas-overlay overlay-open" : "offcanvas-overlay"
            }
          ></div>
        </>
      )}

      <style jsx>{`
        .kq-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(255, 253, 249, 0.85);
          -webkit-backdrop-filter: blur(14px);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid var(--border, #e6ddcf);
        }
        :global([data-theme="dark"]) .kq-nav {
          background: rgba(19, 26, 45, 0.85);
        }
        .kq-nav-inner {
          display: flex;
          align-items: center;
          gap: 20px;
          height: 84px;
        }
        .kq-nav :global(.kq-nav-logo) {
          display: inline-flex;
          align-items: center;
          flex-shrink: 0;
        }
        .kq-profile-btn {
          width: 40px;
          height: 40px;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          flex-shrink: 0;
          background: linear-gradient(135deg, var(--navy-700), var(--navy-900));
          color: var(--cream, #f8f4ee);
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 0 0 rgba(181, 172, 239, 0.5);
          transition: box-shadow 0.15s, transform 0.1s;
        }
        :global([data-theme="dark"]) .kq-profile-btn {
          background: linear-gradient(135deg, var(--lav-500), var(--lav-700));
          color: var(--navy-900);
        }
        .kq-profile-btn:hover {
          box-shadow: 0 0 0 3px rgba(181, 172, 239, 0.45);
        }
        .kq-profile-btn:active {
          transform: scale(0.96);
        }
        /* Buscador pill (estiliza el HeaderSearch existente sin tocar su lógica) */
        .kq-nav :global(.kq-nav-search) {
          flex: 1;
          max-width: 440px;
          margin-left: 6px;
        }
        .kq-nav :global(.kq-nav-search form.header-search) {
          display: flex;
          align-items: center;
          gap: 10px;
          height: 44px;
          padding: 0 18px;
          background: var(--surface, #fff);
          border: 1.5px solid var(--border-strong, #d4c8b6);
          border-radius: 999px;
          transition: border-color 0.15s, box-shadow 0.15s;
          /* El template posiciona el botón-lupa absoluto y se traslapa con el
             input — acá vuelve al flujo y pasa a la IZQUIERDA (como landing). */
          position: relative;
        }
        .kq-nav :global(.kq-nav-search form.header-search:focus-within) {
          border-color: var(--accent, #b5acef);
          box-shadow: var(--shadow-focus, 0 0 0 3px rgba(181, 172, 239, 0.55));
        }
        .kq-nav :global(.kq-nav-search form.header-search input) {
          flex: 1;
          min-width: 0;
          border: none;
          background: transparent;
          outline: none;
          font-size: 14px;
          color: var(--fg-strong);
          padding: 0;
          height: auto;
        }
        .kq-nav :global(.kq-nav-search form.header-search input::placeholder) {
          color: var(--fg-subtle, #9aa0a8);
        }
        .kq-nav :global(.kq-nav-search form.header-search button) {
          order: -1;
          position: static !important;
          top: auto;
          right: auto;
          transform: none;
          width: auto;
          height: auto;
          border: none;
          background: transparent;
          color: var(--fg-subtle, #9aa0a8);
          font-size: 14px;
          padding: 0;
          line-height: 1;
          cursor: pointer;
          flex-shrink: 0;
        }
        .kq-nav-cta {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .kq-icon-btn {
          width: 40px;
          height: 40px;
          border-radius: 999px;
          border: 1.5px solid var(--border-strong, #d4c8b6);
          background: var(--surface, #fff);
          color: var(--fg-strong);
          cursor: pointer;
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          transition: all 0.15s;
        }
        .kq-icon-btn:hover {
          border-color: var(--lav-500);
          color: var(--lav-700);
        }
        :global([data-theme="dark"]) .kq-icon-btn:hover {
          color: var(--lav-400);
        }
        /* Theme toggle: un ícono por tema, sin JS de hidratación */
        .kq-theme-toggle :global(.fa-sun) {
          display: none;
        }
        :global([data-theme="dark"]) .kq-theme-toggle :global(.fa-moon) {
          display: none;
        }
        :global([data-theme="dark"]) .kq-theme-toggle :global(.fa-sun) {
          display: inline-block;
        }
        /* <Link> no recibe el hash de styled-jsx → :global scoped (AGENTS §6.5). */
        .kq-nav-cta :global(.kq-ghost-btn) {
          display: inline-flex;
          align-items: center;
          padding: 0 16px;
          height: 40px;
          border-radius: 999px;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 13.5px;
          color: var(--fg-strong);
          text-decoration: none;
          transition: background 0.15s;
          white-space: nowrap;
        }
        .kq-nav-cta :global(.kq-ghost-btn:hover) {
          background: var(--surface-sunk, #f1ebe1);
          color: var(--fg-strong);
        }
        .kq-nav :global(.kq-publish-btn) {
          height: 40px;
          padding: 0 18px;
          font-size: 13.5px;
          gap: 7px;
          white-space: nowrap;
        }
        .kq-nav :global(.kq-publish-btn i) {
          font-size: 12px;
        }
        @media (max-width: 991px) {
          .kq-nav-inner {
            height: 60px;
            gap: 12px;
          }
          .kq-nav :global(.kq-nav-logo img) {
            height: 30px !important;
          }
        }
      `}</style>
    </>
  );
};

export default HeaderTwo;
