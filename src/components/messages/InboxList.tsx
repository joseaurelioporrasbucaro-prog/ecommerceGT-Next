"use client";
import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getBackendUrl } from '@/utils/backendUrl';
import { generateInitialsAvatar } from '@/utils/avatarUtils';
import type { InboxItem } from '@/types/api';

type Tab = 'todos' | 'no-leidos';

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
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<Tab>('todos');

  const filtered = useMemo(() => {
    let list = items;
    if (tab === 'no-leidos') {
      list = list.filter((i) => i.unread_conversation > 0);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (i) =>
          i.contact_name.toLowerCase().includes(q) ||
          i.pub_title.toLowerCase().includes(q),
      );
    }
    return list;
  }, [items, tab, search]);

  return (
    <div className="inbox-wrap">
      {/* Barra de búsqueda */}
      <div className="inbox-search-row">
        <span className="inbox-search-icon">
          <i className="fal fa-search" />
        </span>
        <input
          type="text"
          className="inbox-search"
          placeholder="Buscar en chats…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <div className="inbox-tabs">
        <button
          type="button"
          className={`inbox-tab${tab === 'todos' ? ' is-active' : ''}`}
          onClick={() => setTab('todos')}
        >
          Todos
        </button>
        <button
          type="button"
          className={`inbox-tab${tab === 'no-leidos' ? ' is-active' : ''}`}
          onClick={() => setTab('no-leidos')}
        >
          No leídos
          {items.filter((i) => i.unread_conversation > 0).length > 0 && (
            <span className="tab-badge">
              {items.filter((i) => i.unread_conversation > 0).length}
            </span>
          )}
        </button>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="inbox-empty">
          {search || tab === 'no-leidos'
            ? 'Sin resultados.'
            : (
              <>
                <p>Aún no tenés conversaciones.</p>
                <small>Contactá a un vendedor desde el detalle de una publicación.</small>
              </>
            )}
        </div>
      ) : (
        <ul className="inbox-list">
          {filtered.map((item) => (
            <InboxRow
              key={`${item.pub_id}-${item.contact_id}`}
              item={item}
              isActive={item.pub_id === activePubId && item.contact_id === activeContactId}
            />
          ))}
        </ul>
      )}

      <style jsx>{`
        .inbox-wrap {
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow: hidden;
          min-height: 0;
        }

        /* Búsqueda */
        .inbox-search-row {
          position: relative;
          padding: 10px 12px;
          border-bottom: 1px solid rgba(128, 128, 128, 0.12);
        }
        .inbox-search-icon {
          position: absolute;
          left: 22px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 13px;
          opacity: 0.45;
          pointer-events: none;
        }
        .inbox-search {
          width: 100%;
          padding: 8px 10px 8px 32px;
          border-radius: 20px;
          border: none;
          background: rgba(128, 128, 128, 0.1);
          font-size: 13px;
          color: var(--clr-common-heading, #181818);
          outline: none;
          transition: background 0.15s;
        }
        .inbox-search::placeholder {
          opacity: 0.5;
        }
        .inbox-search:focus {
          background: rgba(108, 92, 231, 0.08);
        }

        /* Tabs */
        .inbox-tabs {
          display: flex;
          gap: 6px;
          padding: 8px 12px;
          border-bottom: 1px solid rgba(128, 128, 128, 0.12);
        }
        .inbox-tab {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 5px 14px;
          border-radius: 20px;
          border: none;
          background: rgba(128, 128, 128, 0.1);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          color: var(--clr-common-heading, #181818);
          transition: background 0.15s, color 0.15s;
        }
        .inbox-tab.is-active {
          background: var(--clr-theme-1, #6c5ce7);
          color: #fff;
        }
        .tab-badge {
          background: #ef4444;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          border-radius: 10px;
          padding: 1px 5px;
          line-height: 1.2;
        }
        .inbox-tab.is-active .tab-badge {
          background: rgba(255, 255, 255, 0.3);
        }

        /* Lista */
        .inbox-list {
          list-style: none;
          padding: 0;
          margin: 0;
          overflow-y: auto;
          flex: 1;
        }
        .inbox-empty {
          padding: 24px 16px;
          font-size: 13px;
          opacity: 0.7;
          text-align: center;
        }
        :global(.inbox-empty p) {
          margin: 0 0 4px;
          font-weight: 600;
        }
        :global(.inbox-empty small) {
          font-size: 12px;
        }
      `}</style>
    </div>
  );
};

/* ─── Fila de inbox ─── */

interface InboxRowProps {
  item: InboxItem;
  isActive: boolean;
}

const InboxRow: React.FC<InboxRowProps> = ({ item, isActive }) => {
  const [errored, setErrored] = useState(false);
  const avatarSrc =
    !errored && item.contact_image
      ? getBackendUrl(item.contact_image)
      : generateInitialsAvatar(item.contact_name, 88);
  const href = `/messages?pub=${item.pub_id}&with=${item.contact_id}`;
  const hasUnread = item.unread_conversation > 0;

  return (
    <li>
      <Link href={href} className={`inbox-row${isActive ? ' is-active' : ''}${hasUnread ? ' has-unread' : ''}`}>
        <span className="inbox-avatar">
          <Image
            src={avatarSrc}
            alt={item.contact_name}
            width={44}
            height={44}
            style={{ objectFit: 'cover', borderRadius: '50%' }}
            onError={() => setErrored(true)}
            unoptimized
          />
          {hasUnread && (
            <span className="inbox-dot" aria-label={`${item.unread_conversation} sin leer`} />
          )}
        </span>
        <span className="inbox-meta">
          <span className="inbox-row-top">
            <strong className="inbox-name">{item.contact_name}</strong>
            <span className="inbox-time">{formatTime(item.last_msg_date)}</span>
          </span>
          <span className="inbox-sub">
            <span className="inbox-pub-title">{item.pub_title}</span>
            {hasUnread && (
              <span className="inbox-count">
                {item.unread_conversation > 9 ? '9+' : item.unread_conversation}
              </span>
            )}
          </span>
        </span>
      </Link>

      <style jsx>{`
        :global(.inbox-row) {
          display: flex;
          gap: 10px;
          align-items: center;
          padding: 10px 14px;
          border-bottom: 1px solid rgba(128, 128, 128, 0.08);
          cursor: pointer;
          color: var(--clr-common-heading, #181818);
          text-decoration: none;
          transition: background 0.15s;
        }
        :global(.inbox-row:hover) {
          background: rgba(108, 92, 231, 0.05);
        }
        :global(.inbox-row.is-active) {
          background: rgba(108, 92, 231, 0.1);
        }
        :global(.inbox-avatar) {
          position: relative;
          flex-shrink: 0;
          width: 44px;
          height: 44px;
        }
        :global(.inbox-dot) {
          position: absolute;
          bottom: 1px;
          right: 1px;
          width: 11px;
          height: 11px;
          background: var(--clr-theme-1, #6c5ce7);
          border: 2px solid var(--clr-bg-white, #fff);
          border-radius: 50%;
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
          gap: 6px;
        }
        :global(.inbox-name) {
          font-size: 14px;
          font-weight: 700;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        :global(.inbox-row.has-unread .inbox-name) {
          font-weight: 800;
        }
        :global(.inbox-time) {
          font-size: 11px;
          opacity: 0.55;
          flex-shrink: 0;
        }
        :global(.inbox-row.has-unread .inbox-time) {
          color: var(--clr-theme-1, #6c5ce7);
          opacity: 1;
          font-weight: 700;
        }
        :global(.inbox-sub) {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 6px;
        }
        :global(.inbox-pub-title) {
          font-size: 12px;
          opacity: 0.6;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
        }
        :global(.inbox-count) {
          background: var(--clr-theme-1, #6c5ce7);
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 10px;
          line-height: 1.2;
          min-width: 18px;
          text-align: center;
          flex-shrink: 0;
        }
      `}</style>
    </li>
  );
};

export default InboxList;
