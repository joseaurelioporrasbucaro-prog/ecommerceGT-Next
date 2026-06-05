"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getBackendUrl } from '@/utils/backendUrl';
import { generateInitialsAvatar } from '@/utils/avatarUtils';
import { useDateFmt } from '@/utils/datetime';
import {
  formatRelativeTime,
  getNotificationContent,
} from './notificationUtils';
import type { AppNotification } from '@/types/api';

interface NotificationItemProps {
  notification: AppNotification;
  onClick: (notif: AppNotification) => void;
  /** Variante compacta para el dropdown del bell. */
  compact?: boolean;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClick,
  compact = false,
}) => {
  const t = useTranslations('notifications');
  const dateFmt = useDateFmt();
  const formatMoney = (value: number) =>
    `Q${dateFmt.number(value, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const content = getNotificationContent(notification, t, formatMoney);
  const actorName =
    `${notification.actor_first_name ?? ''} ${notification.actor_last_name ?? ''}`.trim() ||
    t('actorFallback');
  const avatarSrc = notification.actor_image
    ? getBackendUrl(notification.actor_image)
    : generateInitialsAvatar(actorName, 80);

  return (
    <Link
      href={content.href}
      className={`notif-item${notification.is_read ? '' : ' is-unread'}${compact ? ' is-compact' : ''}`}
      onClick={() => onClick(notification)}
    >
      <div className="notif-avatar-wrap">
        <Image
          src={avatarSrc}
          alt={actorName}
          width={compact ? 40 : 48}
          height={compact ? 40 : 48}
          style={{ borderRadius: '50%', objectFit: 'cover' }}
          unoptimized
        />
        <span
          className="notif-type-icon"
          style={{ background: content.iconColor }}
          aria-hidden
        >
          <i className={`fas ${content.icon}`} />
        </span>
      </div>

      <div className="notif-body">
        <div className="notif-text">{content.text}</div>
        {content.snippet && (
          <div className="notif-snippet">«{content.snippet}»</div>
        )}
        <div className="notif-time">
          {formatRelativeTime(notification.created_at, t, (iso) => dateFmt.dayMonth(iso, ''))}
        </div>
      </div>

      {!notification.is_read && <span className="notif-dot" aria-label={t('unread')} />}

      <style jsx>{`
        :global(.notif-item) {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 14px 16px;
          border-bottom: 1px solid rgba(128, 128, 128, 0.1);
          text-decoration: none;
          color: var(--clr-common-heading, #181818);
          transition: background 0.15s;
          cursor: pointer;
          position: relative;
        }
        :global(.notif-item:hover) {
          background: rgba(108, 92, 231, 0.06);
        }
        :global(.notif-item.is-unread) {
          background: rgba(108, 92, 231, 0.05);
        }
        :global(.notif-item.is-compact) {
          padding: 10px 14px;
        }

        .notif-avatar-wrap {
          position: relative;
          flex-shrink: 0;
        }
        .notif-type-icon {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          color: #fff;
          font-size: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--clr-bg-white, #fff);
        }

        .notif-body {
          flex: 1;
          min-width: 0;
        }
        .notif-text {
          font-size: 14px;
          line-height: 1.4;
          color: var(--clr-common-heading, #181818);
        }
        :global(.notif-item.is-compact) .notif-text {
          font-size: 13px;
        }
        .notif-snippet {
          font-size: 12px;
          opacity: 0.65;
          margin-top: 2px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-style: italic;
        }
        .notif-time {
          font-size: 11px;
          opacity: 0.55;
          margin-top: 4px;
        }
        .notif-dot {
          flex-shrink: 0;
          width: 10px;
          height: 10px;
          background: var(--clr-theme-1, #6c5ce7);
          border-radius: 50%;
          margin-top: 6px;
        }
      `}</style>
    </Link>
  );
};

export default NotificationItem;
