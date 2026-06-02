"use client";
import React, { useMemo, useState } from "react";
import ThemeChanger from "../home/ThemeChanger";
import Breadcrumbs from "@/utils/Breadcrumbs";
import NotificationItem from "@/components/notifications/NotificationItem";
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
  useNotificationsUnreadCount,
} from "@/hooks/api/useNotifications";
import { ApiError } from "@/utils/Api";
import type { AppNotification, NotificationType } from "@/types/api";

/**
 * Tabs por categoría — cada uno agrupa varios `notif_type`.
 * Inspirado en el `NavContent` del template, adaptado al dominio del marketplace.
 */
type TabId = 'todas' | 'comentarios' | 'likes' | 'mensajes' | 'ventas';

interface TabDef {
  id: TabId;
  label: string;
  icon: string;
  types: NotificationType[] | 'all';
}

const TABS: TabDef[] = [
  { id: 'todas',        label: 'Todas',        icon: 'fa-bell',         types: 'all' },
  { id: 'comentarios',  label: 'Comentarios',  icon: 'fa-comment-alt',  types: ['mention', 'reply', 'comment'] },
  { id: 'likes',        label: 'Likes',        icon: 'fa-heart',        types: ['comment_like', 'pub_favorite'] },
  { id: 'mensajes',     label: 'Mensajes',     icon: 'fa-envelope',     types: ['message'] },
  { id: 'ventas',       label: 'Ventas',       icon: 'fa-handshake',    types: ['sale_closed', 'review_received'] },
];

const ActivityMain = () => {
  const listQuery = useNotifications();
  const unreadQuery = useNotificationsUnreadCount();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const [activeTab, setActiveTab] = useState<TabId>('todas');

  const items = listQuery.data ?? [];
  const unreadCount = unreadQuery.data?.total ?? 0;

  // Conteo de unread por tab — para mostrar badge sobre cada tab.
  const unreadByTab = useMemo(() => {
    const map: Record<TabId, number> = {
      todas: 0, comentarios: 0, likes: 0, mensajes: 0, ventas: 0,
    };
    for (const n of items) {
      if (n.is_read) continue;
      map.todas += 1;
      for (const tab of TABS) {
        if (tab.types === 'all') continue;
        if (tab.types.includes(n.notif_type)) {
          map[tab.id] += 1;
        }
      }
    }
    return map;
  }, [items]);

  const filteredItems = useMemo(() => {
    const tab = TABS.find((t) => t.id === activeTab);
    if (!tab || tab.types === 'all') return items;
    return items.filter((n) => (tab.types as NotificationType[]).includes(n.notif_type));
  }, [items, activeTab]);

  const handleClick = (notif: AppNotification) => {
    if (!notif.is_read) markAsRead.mutate(notif.notif_id);
  };

  return (
    <>
      <ThemeChanger />
      <Breadcrumbs breadcrumbTitle="Notificaciones" breadcrumbSubTitle="Notificaciones" />

      <section className="activity-area pt-60 pb-90">
        <div className="container c-container-1">
          <div className="activity-shell">

            {/* Tabs por categoría */}
            <nav className="activity-tabs" role="tablist">
              {TABS.map((tab) => {
                const count = unreadByTab[tab.id];
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    className={`activity-tab${activeTab === tab.id ? ' is-active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <i className={`fal ${tab.icon}`} />
                    <span>{tab.label}</span>
                    {count > 0 && (
                      <span className="activity-tab-badge">{count > 9 ? '9+' : count}</span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Header con resumen + marcar todas */}
            <header className="activity-header">
              <div>
                <h3>
                  {TABS.find((t) => t.id === activeTab)?.label}
                </h3>
                {unreadCount > 0 && activeTab === 'todas' && (
                  <p className="activity-subtitle">{unreadCount} sin leer en total</p>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  className="activity-mark-all"
                  onClick={() => markAllAsRead.mutate()}
                  disabled={markAllAsRead.isPending}
                >
                  <i className="fal fa-check-double" /> Marcar todas como leídas
                </button>
              )}
            </header>

            {/* Lista */}
            <div className="activity-list">
              {listQuery.isLoading && (
                <div className="activity-state">Cargando notificaciones…</div>
              )}
              {listQuery.error && (
                <div className="activity-state activity-state-error">
                  {listQuery.error instanceof ApiError
                    ? listQuery.error.message
                    : "No se pudieron cargar las notificaciones."}
                </div>
              )}
              {!listQuery.isLoading && !listQuery.error && filteredItems.length === 0 && (
                <div className="activity-state activity-empty">
                  <i className="fal fa-bell-slash" />
                  <h4>Sin actividad en esta categoría</h4>
                  <p>
                    {activeTab === 'todas'
                      ? 'Cuando alguien interactúe con vos lo verás acá.'
                      : 'Cambiá de pestaña o esperá que llegue alguna notificación nueva.'}
                  </p>
                </div>
              )}
              {filteredItems.map((n) => (
                <NotificationItem
                  key={n.notif_id}
                  notification={n}
                  onClick={handleClick}
                />
              ))}
            </div>

          </div>
        </div>
      </section>

      <style jsx>{`
        /* Fuerza altura mínima para que el footer no quede pegado al header
           cuando hay pocas notificaciones — sin esto se ve un gap blanco. */
        .activity-area {
          min-height: calc(100vh - 220px);
        }

        .activity-shell {
          max-width: 820px;
          margin: 0 auto;
          background: var(--clr-bg-white, #fff);
          border: 1px solid rgba(128, 128, 128, 0.18);
          border-radius: 14px;
          overflow: hidden;
        }

        /* Tabs */
        .activity-tabs {
          display: flex;
          gap: 4px;
          padding: 12px 12px 0;
          border-bottom: 1px solid rgba(128, 128, 128, 0.18);
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .activity-tab {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: transparent;
          border: none;
          border-bottom: 3px solid transparent;
          color: var(--clr-common-heading, #181818);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: color 0.15s, border-color 0.15s;
          opacity: 0.65;
        }
        .activity-tab:hover {
          opacity: 1;
        }
        .activity-tab.is-active {
          opacity: 1;
          color: var(--clr-theme-1, #0f4c4c);
          border-bottom-color: var(--clr-theme-1, #0f4c4c);
        }
        .activity-tab :global(i) {
          font-size: 14px;
        }
        .activity-tab-badge {
          background: #ef4444;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 10px;
          line-height: 1.3;
          min-width: 18px;
          text-align: center;
        }

        /* Header */
        .activity-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 24px;
          border-bottom: 1px solid rgba(128, 128, 128, 0.18);
          gap: 12px;
          flex-wrap: wrap;
        }
        .activity-header h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 800;
        }
        .activity-subtitle {
          margin: 4px 0 0;
          font-size: 13px;
          color: var(--clr-theme-1, #0f4c4c);
          font-weight: 600;
        }
        .activity-mark-all {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 8px;
          border: 1px solid rgba(15, 76, 76, 0.25);
          background: rgba(15, 76, 76, 0.08);
          color: var(--clr-theme-1, #0f4c4c);
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s;
        }
        .activity-mark-all:hover {
          background: rgba(15, 76, 76, 0.18);
        }
        .activity-mark-all:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Lista */
        .activity-list {
          display: flex;
          flex-direction: column;
          min-height: 300px;
        }
        .activity-state {
          padding: 50px 30px;
          text-align: center;
          font-size: 14px;
          opacity: 0.7;
        }
        .activity-state-error {
          color: #ef4444;
          opacity: 1;
        }
        .activity-empty :global(i) {
          font-size: 48px;
          opacity: 0.4;
          display: block;
          margin-bottom: 14px;
          color: var(--clr-theme-1, #0f4c4c);
        }
        .activity-empty h4 {
          margin: 0 0 8px;
          font-size: 17px;
        }
        .activity-empty p {
          margin: 0;
          font-size: 13px;
          opacity: 0.7;
          max-width: 360px;
          margin-left: auto;
          margin-right: auto;
        }
      `}</style>
    </>
  );
};

export default ActivityMain;
