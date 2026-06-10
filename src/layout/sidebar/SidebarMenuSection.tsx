"use client";
import React from "react";
import Link from "next/link";
import profile6 from "../../../public/assets/img/profile/profile6.jpg";
import profile7 from "../../../public/assets/img/profile/profile7.jpg";
import profile8 from "../../../public/assets/img/profile/profile8.jpg";
import profile9 from "../../../public/assets/img/profile/profile9.jpg";
import Image from "next/image";
// Fase 22 — Menú limpio (lista plana, sin acordeón). Handoff #3 §3 — re-skin
// Kiosqui: drawer derecho con head (logo + X), ítems con ícono FA, "Pauta"
// visible solo con sesión, top vendedores y CTA card lavanda al fondo.
import { mobileMenu } from "@/data/menu-data";
import { useTranslations } from "next-intl";
import { useTopSellers } from "@/hooks/api/useTopSellers";
import type { TopSellerRow } from "@/types/api";
import { getBackendUrl } from "@/utils/backendUrl";
import { usePathname } from "next/navigation";
import { useAuth } from "@/utils/AuthContext";
import { stripLocalePath } from "@/utils/stripLocalePath";
import KiosquiLogo from "@/components/common/KiosquiLogo";

// Imágenes de respaldo cuando el vendedor no tiene avatar.
const FALLBACK_AVATARS = [profile6, profile7, profile8, profile9];

// Fase 8.5 — navegación de soporte (reemplaza el Top Seller en rutas /soporte).
const SUPPORT_LINKS = [
  { href: "/soporte/tickets-admin", label: "Tickets", icon: "fas fa-ticket-alt" },
  { href: "/soporte/verificaciones", label: "Verificaciones", icon: "fas fa-shield-alt" },
  { href: "/soporte/denuncias", label: "Denuncias", icon: "fas fa-flag" },
  { href: "/soporte/usuarios", label: "Usuarios", icon: "fas fa-users-cog" },
  { href: "/soporte/tickets", label: "Mis tickets", icon: "fas fa-inbox" },
];

// Mapa id → clave de traducción del namespace `common.nav`.
// Si la clave no existe, cae al `label` literal del menu-data.
const TRANSLATION_KEY_BY_ID: Record<number, string> = {
  1: "home",
  2: "publications",
  3: "sellers",
  4: "ranking",
  5: "ads",
  6: "plans",
  7: "contact",
};

// Handoff #3 §3 — íconos FA por ítem (20px, columna fija).
const ICON_BY_ID: Record<number, string> = {
  1: "fas fa-home",
  2: "fas fa-building",
  3: "fas fa-users",
  4: "fas fa-trophy",
  5: "fas fa-bullhorn",
  6: "fas fa-gem",
  7: "fas fa-headset",
};

interface propsType {
  menuOpen1: boolean;
  setMenuOpen1: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarMenuSection = ({ setMenuOpen1, menuOpen1 }: propsType) => {
  const tNav = useTranslations("common.nav");
  const tActions = useTranslations("common.actions");
  // Fase 9 — ranking real de vendedores (reemplaza la lista demo hardcodeada).
  const { data: topSellers } = useTopSellers(10);
  // Fase 8.5 — en rutas de soporte, el widget muestra el menú de soporte.
  const pathname = stripLocalePath(usePathname());
  const { user } = useAuth();
  const inSupport = pathname?.startsWith('/soporte') ?? false;
  const isSupportUser = user?.role === 'support' || user?.role === 'admin';
  const showSupportNav = inSupport && isSupportUser;

  const closeSidebar = () => setMenuOpen1(false);

  // Handoff #3 §3 — "Pauta" SOLO con sesión (un usuario deslogueado no debe
  // verla). Se inyecta acá y no en menu-data para que MobileMenu (HeaderOne)
  // no la muestre sin gate de auth. Va después de Ranking (id 4).
  const navItems = mobileMenu.flatMap((item) =>
    item.id === 4 && user
      ? [item, { id: 5, label: "Pauta", subMenu: false, href: "/pauta" }]
      : [item],
  );

  return (
    <div>
      <div className="fix">
        <div
          className={
            menuOpen1 ? "menu2-side-bar-wrapper open" : "menu2-side-bar-wrapper"
          }
        >
          <div className="menu2-side-bar">
            <div className="side-info-content kq-drawer-content">
              {/* Head: logo transparente 38px + cerrar */}
              <div className="kq-drawer-head mb-25">
                <Link href="/" onClick={closeSidebar} aria-label="Inicio">
                  <KiosquiLogo height={38} />
                </Link>
                <button
                  type="button"
                  className="kq-drawer-close"
                  onClick={closeSidebar}
                  aria-label="Cerrar menú"
                >
                  <i className="fas fa-times" />
                </button>
              </div>

              <nav className="kq-drawer-nav mb-30">
                {navItems.map((menuItem) => {
                  const tKey = TRANSLATION_KEY_BY_ID[menuItem.id];
                  let label = menuItem.label;
                  if (tKey) {
                    try {
                      label = tNav(tKey);
                    } catch {
                      // Fallback al label literal si la clave no existe en este locale.
                    }
                  }
                  const isActive =
                    menuItem.href === "/"
                      ? pathname === "/"
                      : pathname?.startsWith(menuItem.href) ?? false;
                  return (
                    <Link
                      key={menuItem.id}
                      href={menuItem.href}
                      onClick={closeSidebar}
                      className={`kq-drawer-link ${isActive ? "is-active" : ""}`}
                    >
                      <i className={ICON_BY_ID[menuItem.id] ?? "fas fa-circle"} />
                      {label}
                    </Link>
                  );
                })}
              </nav>

              {showSupportNav && (
                <div className="kq-drawer-section mb-30">
                  <h5 className="kq-drawer-section-title">Soporte</h5>
                  {SUPPORT_LINKS.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={closeSidebar}
                      className={`kq-drawer-link ${pathname === l.href ? "is-active" : ""}`}
                    >
                      <i className={l.icon} />
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}

              {!showSupportNav && (
                <div className="kq-drawer-section mb-30">
                  <h5 className="kq-drawer-section-title">Top vendedores</h5>
                  <div className="kq-drawer-sellers">
                    {(topSellers ?? []).map((s: TopSellerRow, i: number) => {
                      const name = `${s.firstname ?? ""} ${s.lastname ?? ""}`.trim() || "Vendedor";
                      const avatar = s.imagenu ? getBackendUrl(s.imagenu) : null;
                      return (
                        <Link
                          href={`/creator-profile/${s.id}`}
                          className="kq-drawer-seller"
                          key={s.id}
                          onClick={closeSidebar}
                        >
                          <span className="kq-seller-av">
                            {avatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={avatar} alt={name} />
                            ) : (
                              <Image src={FALLBACK_AVATARS[i % FALLBACK_AVATARS.length]} alt={name} />
                            )}
                          </span>
                          <span className="kq-seller-info">
                            <span className="kq-seller-name">{name}</span>
                            {s.handle && <span className="kq-seller-handle">@{s.handle}</span>}
                          </span>
                          {s.verified && (
                            <span className="kq-seller-check" title="Verificado">
                              <i className="fas fa-check" />
                            </span>
                          )}
                        </Link>
                      );
                    })}
                    {(!topSellers || topSellers.length === 0) && (
                      <p className="kq-sellers-empty">Aún no hay vendedores destacados.</p>
                    )}
                  </div>
                </div>
              )}

              {/* CTA card lavanda — Fase 22/24: el contenido cambia según auth. */}
              <div className="kq-drawer-cta">
                <span className="kq-drawer-cta-icon">
                  <i className="fas fa-home" />
                </span>
                <span className="kq-drawer-cta-text">
                  {user
                    ? "Publicá tu propiedad en minutos"
                    : "Sumate y publicá tu propiedad"}
                </span>
                {user ? (
                  <Link className="fill-btn kq-drawer-cta-btn" href="/upload" onClick={closeSidebar}>
                    {tActions("createPublication")}
                  </Link>
                ) : (
                  <Link
                    className="fill-btn kq-drawer-cta-btn"
                    href="/login?from=/upload"
                    onClick={closeSidebar}
                  >
                    Iniciar sesión
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="offcanvas-overlay" onClick={closeSidebar}></div>
      <div className="offcanvas-overlay-white"></div>

      <style jsx>{`
        .kq-drawer-content {
          display: flex;
          flex-direction: column;
          min-height: calc(100vh - 44px);
        }
        .kq-drawer-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .kq-drawer-close {
          width: 36px;
          height: 36px;
          border-radius: 999px;
          border: 1.5px solid var(--border-strong, #d4c8b6);
          background: var(--surface, #fff);
          color: var(--fg-strong);
          cursor: pointer;
          font-size: 15px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }
        .kq-drawer-close:hover {
          border-color: var(--lav-500);
          color: var(--lav-700);
        }
        .kq-drawer-nav {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .kq-drawer-section :global(.kq-drawer-link),
        .kq-drawer-nav :global(.kq-drawer-link) {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 11px 13px;
          border-radius: 10px;
          color: var(--fg-muted, #5c616a);
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.15s;
        }
        .kq-drawer-section :global(.kq-drawer-link i),
        .kq-drawer-nav :global(.kq-drawer-link i) {
          width: 20px;
          font-size: 16px;
          text-align: center;
          color: var(--fg-subtle, #9aa0a8);
          transition: color 0.15s;
        }
        .kq-drawer-nav :global(.kq-drawer-link:hover),
        .kq-drawer-section :global(.kq-drawer-link:hover) {
          background: var(--accent-soft, #ebe8fb);
          color: var(--lav-700, #6d62cf);
        }
        .kq-drawer-nav :global(.kq-drawer-link:hover i),
        .kq-drawer-section :global(.kq-drawer-link:hover i) {
          color: var(--lav-700, #6d62cf);
        }
        :global([data-theme="dark"]) .kq-drawer-nav :global(.kq-drawer-link:hover),
        :global([data-theme="dark"]) .kq-drawer-section :global(.kq-drawer-link:hover) {
          color: var(--lav-300, #ddd8f8);
        }
        .kq-drawer-nav :global(.kq-drawer-link.is-active),
        .kq-drawer-section :global(.kq-drawer-link.is-active) {
          background: var(--navy-800, #1e2d4a);
          color: var(--cream, #f8f4ee);
        }
        .kq-drawer-nav :global(.kq-drawer-link.is-active i),
        .kq-drawer-section :global(.kq-drawer-link.is-active i) {
          color: var(--green-400, #b0d56e);
        }
        :global([data-theme="dark"]) .kq-drawer-nav :global(.kq-drawer-link.is-active),
        :global([data-theme="dark"]) .kq-drawer-section :global(.kq-drawer-link.is-active) {
          background: var(--lav-500, #b5acef);
          color: var(--navy-900, #161f33);
        }
        :global([data-theme="dark"]) .kq-drawer-nav :global(.kq-drawer-link.is-active i),
        :global([data-theme="dark"]) .kq-drawer-section :global(.kq-drawer-link.is-active i) {
          color: var(--navy-900, #161f33);
        }
        .kq-drawer-section {
          border-top: 1px solid var(--border, #e6ddcf);
          padding-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .kq-drawer-section-title {
          font-family: var(--font-display);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--fg-subtle, #9aa0a8);
          margin: 0 0 8px;
        }
        .kq-drawer-sellers {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .kq-drawer-sellers :global(.kq-drawer-seller) {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 7px 8px;
          border-radius: 10px;
          text-decoration: none;
          transition: background 0.15s;
        }
        .kq-drawer-sellers :global(.kq-drawer-seller:hover) {
          background: var(--surface-sunk, #f1ebe1);
        }
        .kq-drawer-sellers :global(.kq-seller-av) {
          width: 38px;
          height: 38px;
          border-radius: 999px;
          overflow: hidden;
          flex-shrink: 0;
          display: block;
        }
        .kq-drawer-sellers :global(.kq-seller-av img) {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 999px;
        }
        .kq-drawer-sellers :global(.kq-seller-info) {
          display: flex;
          flex-direction: column;
          min-width: 0;
          flex: 1;
        }
        .kq-drawer-sellers :global(.kq-seller-name) {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--fg-strong);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .kq-drawer-sellers :global(.kq-seller-handle) {
          font-size: 12px;
          color: var(--accent-hover, #8a7fe3);
        }
        .kq-drawer-sellers :global(.kq-seller-check) {
          width: 18px;
          height: 18px;
          border-radius: 999px;
          flex-shrink: 0;
          background: var(--green-500, #9bc64a);
          color: var(--navy-900, #161f33);
          font-size: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .kq-sellers-empty {
          opacity: 0.5;
          font-size: 13px;
          margin: 0;
        }
        .kq-drawer-cta {
          margin-top: auto;
          padding: 18px;
          border-radius: 20px;
          background: var(--accent-soft, #ebe8fb);
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        .kq-drawer-cta-icon {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background: var(--lav-500, #b5acef);
          color: #fff;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .kq-drawer-cta-text {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--fg-strong);
        }
        .kq-drawer-cta :global(.kq-drawer-cta-btn) {
          width: 100%;
          height: 44px;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default SidebarMenuSection;
