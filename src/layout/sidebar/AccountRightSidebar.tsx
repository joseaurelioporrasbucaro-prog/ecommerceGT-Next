"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import { useAuth } from '@/utils/AuthContext';

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
}

/**
 * Sidebar derecho fijo para las páginas de cuenta (/favorites, /my-publications, etc.)
 * Reusa las clases `.sidebar-category-filter-wrapper` del scaffold:
 * en pantallas ≥1400px se queda visible permanentemente (right: 0).
 * En mobile se abre con el botón hamburguesa derecho del HeaderTwo.
 */
const AccountRightSidebar = ({ menuOpen2, setMenuOpen2 }: AccountRightSidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const items: AccountNavItem[] = [
    { href: '/creator-profile-info-personal', label: 'Mi perfil', icon: 'fal fa-user' },
    { href: '/my-publications', label: 'Mis publicaciones', icon: 'fal fa-th-large' },
    { href: '/favorites', label: 'Favoritos', icon: 'fal fa-heart' },
    { href: '/messages', label: 'Mensajes', icon: 'fal fa-comments', comingSoon: true },
    { onClick: handleLogout, label: 'Cerrar sesión', icon: 'fal fa-sign-out' },
  ];

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
          {/* Botón cerrar (solo se ve en mobile cuando menuOpen2 está abierto) */}
          <div className="filter-widget-close d-xxl-none mb-15">
            <button
              type="button"
              className="account-close-btn"
              onClick={() => setMenuOpen2(false)}
              aria-label="Cerrar"
            >
              <i className="fal fa-times"></i>
            </button>
          </div>

          {/* Tarjeta de usuario */}
          {user && (
            <div className="account-user-card mb-25">
              <div className="account-user-avatar">
                <i className="fal fa-user"></i>
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
              <h3 className="filter-widget-title">Mi cuenta</h3>
              <ul className="account-nav-list">
                {items.map((item) => {
                  const isActive = item.href ? pathname?.startsWith(item.href) : false;

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

                  if (item.onClick) {
                    return (
                      <li key={item.label}>
                        <button
                          type="button"
                          className="account-nav-link is-action"
                          onClick={() => {
                            void item.onClick?.();
                          }}
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
                      >
                        <i className={item.icon}></i>
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .account-right-sidebar :global(.account-close-btn) {
          background: transparent;
          border: 0;
          font-size: 18px;
          cursor: pointer;
          color: inherit;
        }
        .account-right-sidebar :global(.account-user-card) {
          padding: 18px 14px;
          background: rgba(108, 92, 231, 0.08);
          border: 1px solid rgba(108, 92, 231, 0.2);
          border-radius: 12px;
          text-align: center;
        }
        .account-right-sidebar :global(.account-user-avatar) {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(108, 92, 231, 0.18);
          color: var(--tp-theme-1, #6c5ce7);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 10px;
          font-size: 26px;
        }
        .account-right-sidebar :global(.account-user-name) {
          font-weight: 700;
          font-size: 15px;
        }
        .account-right-sidebar :global(.account-user-handle) {
          font-size: 13px;
          color: var(--tp-theme-1, #6c5ce7);
          margin-top: 2px;
        }
        .account-right-sidebar :global(.account-nav-list) {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .account-right-sidebar :global(.account-nav-link) {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 8px;
          background: transparent;
          color: inherit;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border: 0;
          transition: all 0.18s ease;
          width: 100%;
          text-align: left;
        }
        .account-right-sidebar :global(.account-nav-link i) {
          width: 18px;
          font-size: 16px;
          flex-shrink: 0;
        }
        .account-right-sidebar :global(.account-nav-link span) {
          flex: 1;
        }
        .account-right-sidebar :global(.account-nav-link:hover:not(.is-coming-soon)) {
          background: rgba(108, 92, 231, 0.1);
          color: var(--tp-theme-1, #6c5ce7);
        }
        .account-right-sidebar :global(.account-nav-link.is-active) {
          background: var(--tp-theme-1, #6c5ce7);
          color: #fff !important;
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
      `}</style>
    </div>
  );
};

export default AccountRightSidebar;
