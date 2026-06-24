'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

/* ============================================================
   Batch F — Shell del portal staff (soporte + admin).
   Sidebar lateral con navegación + área de contenido (título/sub/acciones).
   NO renderiza header: las páginas ya van envueltas en DefaultWrapper.
   Layout/hover/responsive en src/style/kiosqui/staff.css (global).
   ============================================================ */

type NavKey = 'tickets' | 'verif' | 'reports' | 'users' | 'admin' | 'images';

interface NavItem { key: NavKey; icon: string; href: string; match: string; }

const NAV: NavItem[] = [
  { key: 'tickets', icon: 'fa-headset', href: '/soporte/tickets-admin', match: '/soporte/tickets' },
  { key: 'verif', icon: 'fa-id-card', href: '/soporte/verificaciones', match: '/soporte/verificaciones' },
  { key: 'reports', icon: 'fa-flag', href: '/soporte/denuncias', match: '/soporte/denuncias' },
  { key: 'users', icon: 'fa-users', href: '/soporte/usuarios', match: '/soporte/usuarios' },
  { key: 'admin', icon: 'fa-sliders-h', href: '/admin/config', match: '/admin/config' },
  { key: 'images', icon: 'fa-images', href: '/admin/imagenes', match: '/admin/imagenes' },
];

export default function StaffShell({
  active,
  title,
  sub,
  actions,
  counts,
  children,
}: {
  /** Sección activa explícita; si se omite, se detecta por la ruta actual. */
  active?: NavKey;
  title: React.ReactNode;
  sub?: React.ReactNode;
  actions?: React.ReactNode;
  /** Contadores opcionales por sección (no se inventan si no se pasan). */
  counts?: Partial<Record<NavKey, number>>;
  children: React.ReactNode;
}) {
  const t = useTranslations('support');
  const pathname = usePathname() || '';

  const isActive = (n: NavItem) => (active ? active === n.key : pathname.includes(n.match));

  return (
    <div className="staff-shell">
      <aside className="staff-sidebar">
        <div className="staff-sidebar-label">{t('nav.portalStaff')}</div>
        <nav className="staff-nav">
          {NAV.map((n) => (
            <Link key={n.key} href={n.href} className={`staff-nav-item${isActive(n) ? ' is-active' : ''}`}>
              <i className={`fas ${n.icon}`} aria-hidden />
              <span className="staff-nav-label">{t(`nav.${n.key}`)}</span>
              {counts && counts[n.key] != null && (
                <span className="staff-nav-count">{counts[n.key]}</span>
              )}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="staff-content">
        <div className="staff-head">
          <div>
            <h1 className="staff-title">{title}</h1>
            {sub && <p className="staff-sub">{sub}</p>}
          </div>
          {actions && <div className="staff-actions">{actions}</div>}
        </div>
        {children}
      </div>
    </div>
  );
}
