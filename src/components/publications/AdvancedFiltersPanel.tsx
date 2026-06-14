"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { PublicationFilters } from './PublicationsBar';
import AmenitiesPicker from '@/components/Upload/AmenitiesPicker';

/**
 * H12 — selector de amenidades de la barra de filtros cohesiva.
 *
 * Antes esto era el modal de "Filtros avanzados" (precio/cuartos/baños/tamaño/
 * ubicación + amenidades). Con el rediseño del listado (handoff §1) esos
 * controles viven ahora en la barra de una sola fila (`PublicationsBar`), así
 * que este componente se reduce a su única pieza que necesita un popover: el
 * multi-selector de amenidades. Se monta como un control más de la barra,
 * con la misma altura (44) y estilo de chevron que los selects vecinos.
 *
 * Sigue siendo client-side; solo cablea la UI a `filters.amenityIds`
 * (el filtrado server-side es backend, fuera de scope — ver §1.0).
 */
interface Props {
  filters: PublicationFilters;
  onFiltersChange: (next: PublicationFilters) => void;
}

const AmenitiesFilterDropdown: React.FC<Props> = ({ filters, onFiltersChange }) => {
  const t = useTranslations('publications');
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const count = (filters.amenityIds || []).length;

  // Cierra al click fuera o Escape (el popover no es modal, vive en la barra).
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="afp" ref={rootRef}>
      <button
        type="button"
        className={`afp-trigger ${count > 0 ? 'is-active' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <i className="fas fa-sliders-h afp-lead" aria-hidden="true" />
        <span>{t('features.amenities')}</span>
        {count > 0 && <span className="afp-badge">{count}</span>}
        <i className="fas fa-chevron-down afp-chevron" aria-hidden="true" />
      </button>

      {open && (
        <div className="afp-pop" role="dialog" aria-label={t('filters.amenitiesRequired')}>
          <div className="afp-pop-head">
            <span>{t('filters.amenitiesRequired')}</span>
            {count > 0 && (
              <button
                type="button"
                className="afp-pop-clear"
                onClick={() => onFiltersChange({ ...filters, amenityIds: [] })}
              >
                {t('filters.clearAll')}
              </button>
            )}
          </div>
          <div className="afp-pop-body">
            <AmenitiesPicker
              value={filters.amenityIds || []}
              onChange={(next) => onFiltersChange({ ...filters, amenityIds: next })}
            />
          </div>
        </div>
      )}

      <style jsx>{`
        .afp {
          position: relative;
          display: inline-flex;
        }
        .afp-trigger {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          height: 44px;
          padding: 0 32px 0 14px;
          position: relative;
          border: 1px solid var(--border-strong);
          border-radius: var(--r-sm);
          background: var(--bg-elevated);
          color: var(--fg-muted);
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: border-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
        }
        .afp-trigger:hover {
          border-color: var(--accent);
        }
        .afp-trigger:focus-visible {
          outline: none;
          border-color: var(--accent);
          box-shadow: var(--shadow-focus);
        }
        .afp-trigger.is-active {
          color: var(--fg-strong);
          font-weight: 600;
          border-color: var(--accent);
        }
        .afp-lead {
          font-size: 13px;
          color: var(--lav-700);
        }
        .afp-chevron {
          position: absolute;
          right: 13px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 11px;
          color: var(--fg-subtle);
        }
        .afp-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          border-radius: var(--r-pill);
          background: var(--accent);
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          line-height: 1;
        }
        .afp-pop {
          position: absolute;
          z-index: 40;
          top: calc(100% + 8px);
          right: 0;
          width: min(360px, 90vw);
          max-height: 60vh;
          overflow: auto;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--r-md);
          box-shadow: var(--shadow-md);
          padding: 14px 16px 16px;
        }
        .afp-pop-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 10px;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 14px;
          color: var(--fg-strong);
        }
        .afp-pop-clear {
          border: none;
          background: transparent;
          color: var(--fg-muted);
          font-family: var(--font-body);
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
        }
        .afp-pop-clear:hover {
          color: var(--fg-strong);
        }
        @media (max-width: 575px) {
          .afp {
            flex: 1 1 100%;
          }
          .afp-trigger {
            width: 100%;
            justify-content: flex-start;
          }
          .afp-pop {
            right: auto;
            left: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default AmenitiesFilterDropdown;
