"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import { useAuth } from '@/utils/AuthContext';

interface AccountNavItem {
  href?: string;
  label: string;
  icon: string;
  /** Acción opcional (ej. logout). Si está, se usa en lugar del Link. */
  onClick?: () => void | Promise<void>;
  /** Marca el item como deshabilitado/futuro. */
  comingSoon?: boolean;
}

const AccountSidebar = () => {
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
    <aside className="account-sidebar">
      {user && (
        <div className="account-sidebar-user">
          <div className="account-sidebar-avatar">
            <i className="fal fa-user"></i>
          </div>
          <div className="account-sidebar-name">
            {user.firstName} {user.lastName}
          </div>
          {user.handle && (
            <div className="account-sidebar-handle">@{user.handle}</div>
          )}
        </div>
      )}

      <nav className="account-sidebar-nav">
        {items.map((item) => {
          const isActive = item.href ? pathname?.startsWith(item.href) : false;

          if (item.comingSoon) {
            return (
              <span
                key={item.label}
                className="account-sidebar-link is-coming-soon"
                title="Disponible en una próxima fase"
              >
                <i className={item.icon}></i>
                <span>{item.label}</span>
                <span className="account-sidebar-pill">Próx.</span>
              </span>
            );
          }

          if (item.onClick) {
            return (
              <button
                key={item.label}
                type="button"
                className="account-sidebar-link is-action"
                onClick={() => {
                  void item.onClick?.();
                }}
              >
                <i className={item.icon}></i>
                <span>{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href ?? '#'}
              className={`account-sidebar-link ${isActive ? 'is-active' : ''}`}
            >
              <i className={item.icon}></i>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <style jsx>{`
        .account-sidebar {
          position: sticky;
          top: 100px;
          background: rgba(128, 128, 128, 0.06);
          border: 1px solid rgba(128, 128, 128, 0.18);
          border-radius: 12px;
          padding: 24px 18px;
        }
        .account-sidebar-user {
          padding-bottom: 18px;
          margin-bottom: 18px;
          border-bottom: 1px solid rgba(128, 128, 128, 0.2);
          text-align: center;
        }
        .account-sidebar-avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(108, 92, 231, 0.18);
          color: var(--tp-theme-1, #6c5ce7);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
          font-size: 26px;
        }
        .account-sidebar-name {
          font-weight: 700;
          font-size: 16px;
        }
        .account-sidebar-handle {
          font-size: 13px;
          color: var(--tp-theme-1, #6c5ce7);
          margin-top: 2px;
        }
        .account-sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .account-sidebar-nav :global(.account-sidebar-link) {
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
          text-align: left;
        }
        .account-sidebar-nav :global(.account-sidebar-link i) {
          width: 18px;
          font-size: 16px;
          flex-shrink: 0;
        }
        .account-sidebar-nav :global(.account-sidebar-link span) {
          flex: 1;
        }
        .account-sidebar-nav :global(.account-sidebar-link:hover:not(.is-coming-soon)) {
          background: rgba(108, 92, 231, 0.1);
          color: var(--tp-theme-1, #6c5ce7);
        }
        .account-sidebar-nav :global(.account-sidebar-link.is-active) {
          background: var(--tp-theme-1, #6c5ce7);
          color: #fff !important;
        }
        .account-sidebar-nav :global(.account-sidebar-link.is-coming-soon) {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .account-sidebar-nav :global(.account-sidebar-pill) {
          font-size: 10px;
          padding: 2px 8px;
          background: rgba(128, 128, 128, 0.25);
          border-radius: 10px;
          font-weight: 700;
          flex: 0 0 auto;
        }
      `}</style>
    </aside>
  );
};

export default AccountSidebar;
