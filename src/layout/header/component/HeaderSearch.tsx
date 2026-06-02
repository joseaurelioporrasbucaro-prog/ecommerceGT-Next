"use client";

import Image from 'next/image';
import Link from 'next/link';
import React, { useMemo, useRef, useState } from 'react';
import { useSearchUsers } from '@/hooks/api/useSearchUsers';
import { usePublications } from '@/hooks/api/usePublications';
import { getBackendUrl } from '@/utils/backendUrl';
import { generateInitialsAvatar } from '@/utils/avatarUtils';
import { getImageVariant } from '@/utils/imageVariants';
import { CARD_PLACEHOLDER, getPublicationListAllImages } from '@/components/publications/publicationUtils';

interface HeaderSearchProps {
  /** Clases extra para el <form> (controla visibilidad responsive por header). */
  className?: string;
  placeholder?: string;
}

const MAX_RESULTS = 5;

/**
 * Buscador del navbar: busca usuarios (GET /search/users) y propiedades
 * (filtrando el listado público ya cacheado por título). Muestra un dropdown
 * con ambas secciones y navega al elegir.
 */
const HeaderSearch = ({ className = '', placeholder = 'Buscar usuarios o propiedades...' }: HeaderSearchProps) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trimmed = query.trim();
  const normalized = trimmed.toLowerCase();
  const enabled = normalized.length >= 2;

  const usersQuery = useSearchUsers(trimmed);
  const publicationsQuery = usePublications();

  const users = enabled ? (usersQuery.data?.users ?? []).slice(0, MAX_RESULTS) : [];

  const publications = useMemo(() => {
    if (!enabled) return [];
    const all = publicationsQuery.data ?? [];
    return all
      // Excluye vendidas (pubsta 3) y anuladas (4): no deben buscarse.
      .filter((p) => p.pubstaId !== 3 && p.pubstaId !== 4)
      .filter((p) => p.title?.toLowerCase().includes(normalized))
      .slice(0, MAX_RESULTS);
  }, [enabled, normalized, publicationsQuery.data]);

  const hasResults = users.length > 0 || publications.length > 0;

  const closeSoon = () => {
    blurTimer.current = setTimeout(() => setOpen(false), 150);
  };
  const cancelClose = () => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
  };

  const closeAfterSelect = () => {
    setOpen(false);
    setQuery('');
  };

  const pubThumb = (p: (typeof publications)[number]): string => {
    const imgs = getPublicationListAllImages(p);
    if (imgs.length === 0 || imgs[0] === CARD_PLACEHOLDER) return CARD_PLACEHOLDER;
    return getBackendUrl(getImageVariant(imgs[0], 'card'));
  };

  return (
    <div
      className={`header-search-wrap ${className}`}
      onFocus={cancelClose}
      onBlur={closeSoon}
      style={{ position: 'relative' }}
    >
      <form
        action="#"
        className="filter-search-input header-search"
        onSubmit={(e) => e.preventDefault()}
      >
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
        <button type="submit"><i className="fal fa-search"></i></button>
      </form>

      {open && enabled && (
        <div className="header-search-dropdown">
          {!hasResults && (
            <div className="hsd-empty">
              {usersQuery.isLoading ? 'Buscando…' : 'Sin resultados'}
            </div>
          )}

          {users.length > 0 && (
            <div className="hsd-section">
              <div className="hsd-title">Usuarios</div>
              {users.map((u) => {
                const name = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || `@${u.handle}`;
                const avatar = u.avatar ? getBackendUrl(u.avatar) : generateInitialsAvatar(name, 64);
                return (
                  <Link
                    key={`u-${u.cusId}`}
                    href={`/creator-profile/${u.cusId}`}
                    className="hsd-item"
                    onClick={closeAfterSelect}
                  >
                    <Image src={avatar} alt={name} width={34} height={34} unoptimized
                      style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    <span className="hsd-text">
                      <span className="hsd-name">{name}</span>
                      <span className="hsd-sub">@{u.handle}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          )}

          {publications.length > 0 && (
            <div className="hsd-section">
              <div className="hsd-title">Propiedades</div>
              {publications.map((p) => {
                const thumb = pubThumb(p);
                return (
                  <Link
                    key={`p-${p.id}`}
                    href={`/publications/${p.id}`}
                    className="hsd-item"
                    onClick={closeAfterSelect}
                  >
                    <Image src={thumb} alt={p.title} width={34} height={34}
                      unoptimized={thumb === CARD_PLACEHOLDER}
                      style={{ borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                    <span className="hsd-text">
                      <span className="hsd-name">{p.title}</span>
                      <span className="hsd-sub">{p.town || p.city || 'Propiedad'}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .header-search-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          z-index: 1000;
          background: var(--clr-bg-white, #fff);
          border: 1px solid rgba(128, 128, 128, 0.18);
          border-radius: 10px;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
          padding: 6px;
          max-height: 70vh;
          overflow-y: auto;
        }
        .hsd-empty {
          padding: 14px 12px;
          font-size: 13px;
          opacity: 0.6;
          text-align: center;
        }
        .hsd-section + .hsd-section {
          margin-top: 4px;
          border-top: 1px solid rgba(128, 128, 128, 0.12);
          padding-top: 4px;
        }
        .hsd-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          opacity: 0.5;
          padding: 6px 10px 4px;
        }
        .hsd-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          background: none;
          border: none;
          padding: 8px 10px;
          border-radius: 8px;
          cursor: pointer;
          text-align: left;
          color: inherit;
          text-decoration: none;
        }
        .hsd-item:hover {
          background: rgba(15, 76, 76, 0.08);
        }
        .hsd-text {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .hsd-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--clr-common-heading, #181818);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .hsd-sub {
          font-size: 12px;
          opacity: 0.55;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        /* La plantilla posiciona absolutos los <button> dentro de
           .filter-search-input; al estar el dropdown FUERA del form, sus
           botones quedan en flujo normal. Refuerzo defensivo: */
        .hsd-item {
          position: static;
        }
      `}</style>
    </div>
  );
};

export default HeaderSearch;
