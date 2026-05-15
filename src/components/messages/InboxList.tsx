"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getBackendUrl } from '@/utils/backendUrl';
import type { InboxItem } from '@/types/api';

const DEFAULT_AVATAR = '/assets/img/profile/default-avatar.png';

interface InboxListProps {
  items: InboxItem[];
  activePubId: number | null;
  activeContactId: number | null;
}

const formatTime = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (sameDay) {
    return d.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });
  }
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) {
    return d.toLocaleDateString('es-GT', { weekday: 'short' });
  }
  return d.toLocaleDateString('es-GT', { day: '2-digit', month: 'short' });
};

const InboxList: React.FC<InboxListProps> = ({ items, activePubId, activeContactId }) => {
  if (items.length === 0) {
    return (
      <div className="inbox-empty">
        <p>Aún no tienes conversaciones.</p>
        <small>Cuando contactes a un vendedor desde el detalle de una publicación, el chat aparecerá acá.</small>
      </div>
    );
  }

  return (
    <ul className="inbox-list">
      {items.map((item) => (
        <InboxRow
          key={`${item.pub_id}-${item.contact_id}`}
          item={item}
          isActive={item.pub_id === activePubId && item.contact_id === activeContactId}
        />
      ))}
      <style jsx>{`
        .inbox-list {
          list-style: none;
          padding: 0;
          margin: 0;
          overflow-y: auto;
        }
        :global(.inbox-empty) {
          padding: 24px 20px;
          font-size: 14px;
          opacity: 0.75;
        }
        :global(.inbox-empty p) {
          margin: 0 0 6px;
          font-weight: 600;
        }
      `}</style>
    </ul>
  );
};

interface InboxRowProps {
  item: InboxItem;
  isActive: boolean;
}

const InboxRow: React.FC<InboxRowProps> = ({ item, isActive }) => {
  const [errored, setErrored] = useState(false);
  const avatarSrc =
    !errored && item.contact_image
      ? getBackendUrl(item.contact_image)
      : DEFAULT_AVATAR;

  const href = `/messages?pub=${item.pub_id}&with=${item.contact_id}`;

  return (
    <li>
      <Link href={href} className={`inbox-row ${isActive ? 'is-active' : ''}`}>
        <span className="inbox-avatar">
          <Image
            src={avatarSrc}
            alt={item.contact_name}
            width={42}
            height={42}
            style={{ objectFit: 'cover', borderRadius: '50%' }}
            onError={() => setErrored(true)}
            unoptimized
          />
          {item.unread_conversation > 0 && (
            <span className="inbox-unread-dot" aria-label={`${item.unread_conversation} sin leer`}>
              {item.unread_conversation > 9 ? '9+' : item.unread_conversation}
            </span>
          )}
        </span>
        <span className="inbox-meta">
          <span className="inbox-row-top">
            <strong className="inbox-name">{item.contact_name}</strong>
            <span className="inbox-time">{formatTime(item.last_msg_date)}</span>
          </span>
          <span className="inbox-pub-title" title={item.pub_title}>
            {item.pub_title}
          </span>
        </span>
      </Link>
      <style jsx>{`
        :global(.inbox-row) {
          display: flex;
          gap: 12px;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(128, 128, 128, 0.12);
          cursor: pointer;
          color: var(--clr-common-heading, #181818);
          text-decoration: none;
          transition: background 0.15s;
        }
        :global(.inbox-row:hover) {
          background: rgba(108, 92, 231, 0.06);
        }
        :global(.inbox-row.is-active) {
          background: rgba(108, 92, 231, 0.12);
        }
        :global(.inbox-avatar) {
          position: relative;
          flex-shrink: 0;
          width: 42px;
          height: 42px;
        }
        :global(.inbox-unread-dot) {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #ef4444;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 10px;
          line-height: 1;
          min-width: 18px;
          text-align: center;
        }
        :global(.inbox-meta) {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        :global(.inbox-row-top) {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 8px;
        }
        :global(.inbox-name) {
          font-size: 14px;
          font-weight: 700;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        :global(.inbox-time) {
          font-size: 11px;
          opacity: 0.6;
          flex-shrink: 0;
        }
        :global(.inbox-pub-title) {
          font-size: 12px;
          opacity: 0.7;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>
    </li>
  );
};

export default InboxList;
