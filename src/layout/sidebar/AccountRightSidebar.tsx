"use client";

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/utils/AuthContext';
import { getBackendUrl } from '@/utils/backendUrl';
import { generateInitialsAvatar } from '@/utils/avatarUtils';
import { stripLocalePath } from '@/utils/stripLocalePath';
import { useMyFavorites } from '@/hooks/api/useFavorites';
import { useUnreadMessagesCount } from '@/hooks/api/useMessages';

interface AccountRightSidebarProps {
  menuOpen2: boolean;
  setMenuOpen2: React.Dispatch<React.SetStateAction<boolean>>;
}

interface AccountNavItem {
  href?: string;
  label: string;
  icon: string;
  onClick?: () => void | Promise<void>;
  comingSoon?: boolean;
  badge?: 'favorites' | 'messages';
}

/**
 * Fase 19.7 — secciones condicionales por rol en el panel de cuenta.
 *
 * - `support`/`admin` → ven el grupo "Soporte" (tickets, verificaciones,
 *   denuncias, usuarios). Es el equivalente sidebar a lo que aparece dentro
 *   de las rutas /soporte/* en SidebarMenuSection.
 * - solo `admin` → además ven "Administración" (imágenes del sitio y
 *   configuración de tarifas). Esto reemplaza tener que tipear /admin/config
 *   o /admin/imagenes a mano.
 */
const SUPPORT_ITEMS: AccountNavItem[] = [
  { href: '/soporte/tickets-admin', label: 'Tickets de soporte', icon: 'fal fa-headset' },
  { href: '/soporte/verificaciones', label: 'Verificaciones', icon: 'fal fa-shield-check' },
  { href: '/soporte/denuncias', label: 'Denuncias', icon: 'fal fa-flag' },
  { href: '/soporte/usuarios', label: 'Usuarios', icon: 'fal fa-users-cog' },
];

const ADMIN_ITEMS: AccountNavItem[] = [
  { href: '/admin/imagenes', label: 'Imágenes del sitio', icon: 'fal fa-images' },
  { href: '/admin/config', label: 'Configuración', icon: 'fal fa-cogs' },
];

/** Pill contador (lavanda suave). Monta sus queries solo con el drawer
 *  abierto — así no agregamos requests permanentes en cada página. */
const FavoritesCountBadge = () => {
  const { data } = useMyFavorites();
  const count = data?.length ?? 0;
  if (count === 0) return null;
  return <span className="kq-acc-badge">{count}</span>;
};

const MessagesCountBadge = () => {
  const { data } = useUnreadMessagesCount(true);
  const count = data?.unreadCount ?? 0;
  if (count === 0) return null;
  return <span className="kq-acc-badge">{count}</span>;
};

/**
 * Handoff #3 §4 — drawer de cuenta. Desliza desde la IZQUIERDA (lo abre el
 * avatar de perfil del header, que vive a la izquierda; el lado lo define
 * `.sidebar-category-filter-wrapper` en _header.scss). El nombre del archivo
 * se conserva por historia git — el "Right" ya no aplica.
 */
const AccountRightSidebar = ({ menuOpen2, setMenuOpen2 }: AccountRightSidebarProps) => {
  const pathname = stripLocalePath(usePathname());
  const router = useRouter();
  const { user, logout } = useAuth();
  const [avatarErrored, setAvatarErrored] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const items: AccountNavItem[] = [
    // "Mi perfil" → perfil PÚBLICO del usuario (visible para otros)
    {
      href: user?.id ? `/creator-profile/${user.id}` : '/creator-profile',
      label: 'Mi perfil',
      icon: 'fal fa-user',
    },
    { href: '/my-publications', label: 'Mis publicaciones', icon: 'fal fa-th-large' },
    { href: '/favorites', label: 'Favoritos', icon: 'fal fa-heart', badge: 'favorites' },
    { href: '/messages', label: 'Mensajes', icon: 'fal fa-comments', badge: 'messages' },
    // "Configuraciones" → edición de info personal (privado)
    { href: '/creator-profile-info-personal', label: 'Configuraciones', icon: 'fal fa-cog' },
    // Fase 8 — planes (todos) y empresa (solo admins de empresa).
    { href: '/pricing-plan', label: 'Planes', icon: 'fal fa-gem' },
    ...(user?.isAdmin
      ? [
          { href: '/company', label: 'Mi empresa', icon: 'fal fa-building' },
          { href: '/company/equipo', label: 'Equipo', icon: 'fal fa-users' },
        ]
      : []),
  ];

  // Fase 19.7 — flags de visibilidad por rol.
  const isAdmin = user?.role === 'admin';
  const isSupport = user?.role === 'support' || isAdmin;

  // Foto real del usuario (si está almacenada en backend) o null para fallback con icono.
  const userImageSrc = user?.imagenu && !avatarErrored
    ? (user.imagenu.startsWith('http') ? user.imagenu : getBackendUrl(user.imagenu))
    : null;

  // Renderer compartido para un item de navegación (link o botón).
  const renderItem = (item: AccountNavItem) => {
    const isActive = item.href ? pathname?.startsWith(item.href) : false;
    if (item.onClick) {
      return (
        <li key={item.label}>
          <button
            type="button"
            className="account-nav-link is-logout"
            onClick={() => { void item.onClick?.(); }}
          >
            <i className={item.icon}></i>
            <span>{item.label}</span>
          </button>
        </li>
      );
    }
    return (
      <li key={item.label}>
        <Link
          href={item.href ?? '#'}
          className={`account-nav-link ${isActive ? 'is-active' : ''}`}
          onClick={() => setMenuOpen2(false)}
        >
          <i className={item.icon}></i>
          <span>{item.label}</span>
          {menuOpen2 && item.badge === 'favorites' && <FavoritesCountBadge />}
          {menuOpen2 && item.badge === 'messages' && <MessagesCountBadge />}
        </Link>
      </li>
    );
  };

  return (
    <div className="fix">
      <div
        className={
          menuOpen2
            ? 'sidebar-category-filter-wrapper open'
            : 'sidebar-category-filter-wrapper'
        }
      >
        <div className="sidebar-category-filter account-right-sidebar">
          {/* Head: título + cerrar (siempre visible — el drawer ya no es riel fijo) */}
          <div className="kq-acc-head mb-20">
            <h3 className="kq-acc-title">Mi cuenta</h3>
            <button
              type="button"
              className="kq-acc-close"
              onClick={() => setMenuOpen2(false)}
              aria-label="Cerrar"
            >
              <i className="fal fa-times"></i>
            </button>
          </div>

          {/* Tarjeta de usuario con foto real (si existe), o avatar de iniciales como fallback. */}
          {user && (
            <div className="account-user-card mb-25">
              <div className="account-user-avatar">
                <Image
                  src={
                    userImageSrc ??
                    generateInitialsAvatar(`${user.firstName} ${user.lastName}`, 128)
                  }
                  alt={`${user.firstName} ${user.lastName}`}
                  width={64}
                  height={64}
                  onError={() => setAvatarErrored(true)}
                  unoptimized
                  style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }}
                />
              </div>
              <div className="account-user-name">
                {user.firstName} {user.lastName}
              </div>
              {user.handle && (
                <div className="account-user-handle">@{user.handle}</div>
              )}
            </div>
          )}

          {/* Menú de cuenta */}
          <div className="filter-widget mb-20">
            <div className="filter-widget-content">
              <ul className="account-nav-list">
                {items.map((item) => {
                  if (item.comingSoon) {
                    return (
                      <li key={item.label}>
                        <span className="account-nav-link is-coming-soon">
                          <i className={item.icon}></i>
                          <span>{item.label}</span>
                          <span className="account-nav-pill">Próx.</span>
                        </span>
                      </li>
                    );
                  }
                  return renderItem(item);
                })}
              </ul>
            </div>
          </div>

          {/* Fase 19.7 — sección Soporte (solo support + admin). */}
          {isSupport && (
            <div className="filter-widget mb-20">
              <div className="filter-widget-content">
                <h3 className="kq-acc-section-title">Soporte</h3>
                <ul className="account-nav-list">
                  {SUPPORT_ITEMS.map(renderItem)}
                </ul>
              </div>
            </div>
          )}

          {/* Fase 19.7 — sección Administración (solo admin). */}
          {isAdmin && (
            <div className="filter-widget mb-20">
              <div className="filter-widget-content">
                <h3 className="kq-acc-section-title">Administración</h3>
                <ul className="account-nav-list">
                  {ADMIN_ITEMS.map(renderItem)}
                </ul>
              </div>
            </div>
          )}

          {/* Cerrar sesión — siempre al final, en rojo (handoff #3 §4). */}
          <div className="kq-acc-foot">
            <ul className="account-nav-list">
              {renderItem({
                onClick: handleLogout,
                label: 'Cerrar sesión',
                icon: 'fal fa-sign-out',
              })}
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        .account-right-sidebar {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          padding: 20px;
        }
        .account-right-sidebar :global(.kq-acc-head),
        .kq-acc-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .kq-acc-title {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 18px;
          color: var(--fg-strong);
          margin: 0;
        }
        .account-right-sidebar :global(.kq-acc-close) {
          width: 36px;
          height: 36px;
          border-radius: 999px;
          border: 1.5px solid var(--border-strong, #d4c8b6);
          background: var(--surface, #fff);
          color: var(--fg-strong);
          font-size: 15px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }
        .account-right-sidebar :global(.kq-acc-close:hover) {
          border-color: var(--lav-500);
          color: var(--lav-700);
        }
        .account-right-sidebar :global(.account-user-card) {
          padding: 22px 16px;
          background: var(--accent-soft, #ebe8fb);
          border: 1px solid var(--lav-300, #ddd8f8);
          border-radius: 20px;
          text-align: center;
        }
        :global([data-theme='dark']) .account-right-sidebar :global(.account-user-card) {
          border-color: rgba(181, 172, 239, 0.25);
        }
        .account-right-sidebar :global(.account-user-avatar) {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          margin: 0 auto 12px;
          overflow: hidden;
        }
        .account-right-sidebar :global(.account-user-avatar img) {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover;
          border-radius: 50%;
        }
        .account-right-sidebar :global(.account-user-name) {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 17px;
          color: var(--fg-strong);
        }
        .account-right-sidebar :global(.account-user-handle) {
          font-size: 13px;
          color: var(--accent-hover, #8a7fe3);
          margin-top: 2px;
        }
        .kq-acc-section-title {
          font-family: var(--font-display);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--fg-subtle, #9aa0a8);
          margin: 0 0 8px;
          border-top: 1px solid var(--border, #e6ddcf);
          padding-top: 16px;
        }
        .account-right-sidebar :global(.account-nav-list) {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .account-right-sidebar :global(.account-nav-link) {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 11px 13px;
          border-radius: 10px;
          background: transparent;
          color: var(--fg-muted, #5c616a);
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border: 0;
          transition: all 0.15s;
          width: 100%;
          text-align: left;
        }
        .account-right-sidebar :global(.account-nav-link i) {
          width: 20px;
          font-size: 16px;
          text-align: center;
          flex-shrink: 0;
          color: var(--fg-subtle, #9aa0a8);
          transition: color 0.15s;
        }
        .account-right-sidebar :global(.account-nav-link span) {
          flex: 0 1 auto;
        }
        .account-right-sidebar :global(.account-nav-link:hover:not(.is-coming-soon):not(.is-logout)) {
          background: var(--accent-soft, #ebe8fb);
          color: var(--lav-700, #6d62cf);
        }
        .account-right-sidebar :global(.account-nav-link:hover:not(.is-coming-soon):not(.is-logout) i) {
          color: var(--lav-700, #6d62cf);
        }
        :global([data-theme='dark']) .account-right-sidebar :global(.account-nav-link:hover:not(.is-coming-soon):not(.is-logout)) {
          color: var(--lav-300, #ddd8f8);
        }
        .account-right-sidebar :global(.account-nav-link.is-active) {
          background: var(--navy-800, #1e2d4a);
          color: var(--cream, #f8f4ee);
        }
        .account-right-sidebar :global(.account-nav-link.is-active i) {
          color: var(--green-400, #b0d56e);
        }
        :global([data-theme='dark']) .account-right-sidebar :global(.account-nav-link.is-active) {
          background: var(--lav-500, #b5acef);
          color: var(--navy-900, #161f33);
        }
        :global([data-theme='dark']) .account-right-sidebar :global(.account-nav-link.is-active i) {
          color: var(--navy-900, #161f33);
        }
        .account-right-sidebar :global(.kq-acc-badge) {
          margin-left: auto;
          background: var(--lav-200, #ebe8fb);
          color: var(--lav-700, #6d62cf);
          font-size: 11.5px;
          font-weight: 700;
          padding: 1px 8px;
          border-radius: 999px;
        }
        :global([data-theme='dark']) .account-right-sidebar :global(.kq-acc-badge) {
          background: rgba(181, 172, 239, 0.22);
          color: var(--lav-300, #ddd8f8);
        }
        .account-right-sidebar :global(.account-nav-link.is-coming-soon) {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .account-right-sidebar :global(.account-nav-pill) {
          font-size: 10px;
          padding: 2px 8px;
          background: rgba(128, 128, 128, 0.25);
          border-radius: 10px;
          font-weight: 700;
          flex: 0 0 auto;
        }
        .kq-acc-foot {
          margin-top: auto;
          border-top: 1px solid var(--border, #e6ddcf);
          padding-top: 14px;
        }
        .account-right-sidebar :global(.account-nav-link.is-logout) {
          color: var(--danger, #cf4a4a);
        }
        .account-right-sidebar :global(.account-nav-link.is-logout i) {
          color: var(--danger, #cf4a4a);
        }
        .account-right-sidebar :global(.account-nav-link.is-logout:hover) {
          background: var(--danger-bg, #f8e4e4);
        }
      `}</style>
    </div>
  );
};

export default AccountRightSidebar;
