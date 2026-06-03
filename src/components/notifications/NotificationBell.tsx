"use client";
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
  useNotificationsUnreadCount,
} from '@/hooks/api/useNotifications';
import { useAuth } from '@/utils/AuthContext';
import NotificationItem from './NotificationItem';
import type { AppNotification } from '@/types/api';

const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Solo polling cuando hay sesión.
  const unreadQuery = useNotificationsUnreadCount(Boolean(user));
  // El listado solo se fetchea cuando abrimos el dropdown.
  const listQuery = useNotifications(Boolean(user) && open);
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  // Cerrar dropdown al click fuera.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (!user) return null;

  const unreadCount = unreadQuery.data?.total ?? 0;
  const items = listQuery.data ?? [];

  const handleItemClick = (notif: AppNotification) => {
    if (!notif.is_read) {
      markAsRead.mutate(notif.notif_id);
    }
    setOpen(false);
  };

  return (
    <div className="notif-bell-wrapper" ref={wrapperRef}>
      <button
        type="button"
        className="notif-bell-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ''}`}
      >
        <i className="fal fa-bell" />
        {unreadCount > 0 && (
          <span className="notif-bell-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notif-dropdown" role="menu">
          <header className="notif-dropdown-head">
            <strong>Notificaciones</strong>
            {unreadCount > 0 && (
              <button
                type="button"
                className="notif-mark-all"
                onClick={() => markAllAsRead.mutate()}
                disabled={markAllAsRead.isPending}
              >
                Marcar todas
              </button>
            )}
          </header>

          <div className="notif-dropdown-body">
            {listQuery.isLoading && (
              <div className="notif-state">Cargando…</div>
            )}
            {!listQuery.isLoading && items.length === 0 && (
              <div className="notif-state notif-empty">
                <i className="fal fa-bell-slash" />
                <p>No tenés notificaciones todavía.</p>
              </div>
            )}
            {items.map((n) => (
              <NotificationItem
                key={n.notif_id}
                notification={n}
                onClick={handleItemClick}
                compact
              />
            ))}
          </div>

          <footer className="notif-dropdown-foot">
            <Link href="/activity" onClick={() => setOpen(false)}>
              Ver todas
            </Link>
          </footer>
        </div>
      )}

      <style jsx>{`
        .notif-bell-wrapper {
          position: relative;
          display: inline-block;
        }
        .notif-bell-btn {
          position: relative;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: none;
          background: rgba(128, 128, 128, 0.12);
          color: var(--clr-common-heading, #181818);
          font-size: 16px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s, color 0.15s;
        }
        .notif-bell-btn:hover {
          background: rgba(108, 92, 231, 0.15);
          color: var(--clr-theme-1, #6c5ce7);
        }
        .notif-bell-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          background: #ef4444;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 5px;
          border-radius: 10px;
          line-height: 1;
          min-width: 18px;
          text-align: center;
          border: 2px solid var(--clr-bg-white, #fff);
        }

        .notif-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 380px;
          max-width: calc(100vw - 32px);
          background: var(--clr-bg-white, #fff);
          border: 1px solid rgba(128, 128, 128, 0.18);
          border-radius: 12px;
          box-shadow: 0 8px 28px rgba(0, 0, 0, 0.18);
          z-index: 9999;
          overflow: hidden;
        }
        .notif-dropdown-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 16px;
          border-bottom: 1px solid rgba(128, 128, 128, 0.18);
        }
        .notif-dropdown-head strong {
          font-size: 16px;
          color: var(--clr-common-heading, #181818);
        }
        .notif-mark-all {
          border: none;
          background: transparent;
          color: var(--clr-theme-1, #6c5ce7);
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
        }
        .notif-mark-all:hover {
          background: rgba(108, 92, 231, 0.1);
        }
        .notif-mark-all:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .notif-dropdown-body {
          max-height: 420px;
          overflow-y: auto;
        }
        .notif-state {
          padding: 28px 20px;
          text-align: center;
          font-size: 13px;
          opacity: 0.7;
          color: var(--clr-common-heading, #181818);
        }
        .notif-empty :global(i) {
          font-size: 32px;
          opacity: 0.4;
          display: block;
          margin-bottom: 10px;
        }
        .notif-empty p {
          margin: 0;
        }

        .notif-dropdown-foot {
          border-top: 1px solid rgba(128, 128, 128, 0.18);
          text-align: center;
        }
        .notif-dropdown-foot :global(a) {
          display: block;
          padding: 12px;
          color: var(--clr-theme-1, #6c5ce7);
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
        }
        .notif-dropdown-foot :global(a:hover) {
          background: rgba(108, 92, 231, 0.06);
        }
      `}</style>
    </div>
  );
};

export default NotificationBell;
