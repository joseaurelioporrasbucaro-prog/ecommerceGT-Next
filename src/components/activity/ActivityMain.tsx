"use client";
import React from "react";
import { useRouter } from 'next/navigation';
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
import type { AppNotification } from "@/types/api";

const ActivityMain = () => {
  const router = useRouter();
  const listQuery = useNotifications();
  const unreadQuery = useNotificationsUnreadCount();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const items = listQuery.data ?? [];
  const unreadCount = unreadQuery.data?.total ?? 0;

  const handleClick = (notif: AppNotification) => {
    if (!notif.is_read) markAsRead.mutate(notif.notif_id);
    // El propio <Link> dentro de NotificationItem ya hace la navegación.
  };

  return (
    <>
      <ThemeChanger />
      <Breadcrumbs breadcrumbTitle="Notificaciones" breadcrumbSubTitle="Notificaciones" />

      <section className="activity-area pt-90 pb-90">
        <div className="container c-container-1">
          <div className="activity-shell">
            <header className="activity-header">
              <div>
                <h3>Tus notificaciones</h3>
                {unreadCount > 0 && (
                  <p className="activity-subtitle">{unreadCount} sin leer</p>
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
              {!listQuery.isLoading && !listQuery.error && items.length === 0 && (
                <div className="activity-state activity-empty">
                  <i className="fal fa-bell-slash" />
                  <h4>Sin actividad todavía</h4>
                  <p>
                    Cuando alguien interactúe con vos (mensajes, menciones, likes,
                    respuestas) lo verás acá.
                  </p>
                </div>
              )}
              {items.map((n) => (
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
        .activity-shell {
          max-width: 720px;
          margin: 0 auto;
          background: var(--clr-bg-white, #fff);
          border: 1px solid rgba(128, 128, 128, 0.18);
          border-radius: 14px;
          overflow: hidden;
        }
        .activity-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
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
          color: var(--clr-theme-1, #6c5ce7);
          font-weight: 600;
        }
        .activity-mark-all {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 8px;
          border: 1px solid rgba(108, 92, 231, 0.25);
          background: rgba(108, 92, 231, 0.08);
          color: var(--clr-theme-1, #6c5ce7);
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s;
        }
        .activity-mark-all:hover {
          background: rgba(108, 92, 231, 0.18);
        }
        .activity-mark-all:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
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
          color: var(--clr-theme-1, #6c5ce7);
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
