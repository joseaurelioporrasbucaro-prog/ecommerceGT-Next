"use client";
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { PublicationFilters } from './PublicationsBar';
import AmenitiesPicker from '@/components/Upload/AmenitiesPicker';

/**
 * Fase 19 — panel colapsable de filtros avanzados.
 *
 * Vive arriba del listado, colapsado por defecto para no abrumar al
 * usuario casual. Al abrir, muestra precio, habitaciones mín, baños mín,
 * m² mín y ubicación. Los filtros se aplican CLIENT-SIDE en
 * PublicationsMain (no toca el backend).
 *
 * Diseño: contador de filtros activos en el header del panel para que
 * el usuario sepa si tiene filtros aplicados aunque el panel esté cerrado.
 */
interface Props {
  filters: PublicationFilters;
  onFiltersChange: (next: PublicationFilters) => void;
}

const countActive = (f: PublicationFilters): number => {
  let n = 0;
  if (f.priceMin && f.priceMin !== '') n++;
  if (f.priceMax && f.priceMax !== '') n++;
  if (f.roomsMin && f.roomsMin !== '') n++;
  if (f.bathsMin && f.bathsMin !== '') n++;
  if (f.sizeMin && f.sizeMin !== '') n++;
  if (f.location && f.location.trim() !== '') n++;
  if (f.amenityIds && f.amenityIds.length > 0) n += f.amenityIds.length;
  return n;
};

const AdvancedFiltersPanel: React.FC<Props> = ({ filters, onFiltersChange }) => {
  const t = useTranslations('publications');
  const [open, setOpen] = useState(false);
  const activeCount = countActive(filters);

  const update = (patch: Partial<PublicationFilters>) => {
    onFiltersChange({ ...filters, ...patch });
  };

  const clearAll = () => {
    onFiltersChange({
      ...filters,
      priceMin: '',
      priceMax: '',
      roomsMin: '',
      bathsMin: '',
      sizeMin: '',
      location: '',
      amenityIds: [],
    });
  };

  return (
    <div className={`afp ${open ? 'is-open' : ''}`}>
      <button
        type="button"
        className="afp-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <i className="fas fa-sliders-h" />
        <span>{t('filters.advanced')}</span>
        {activeCount > 0 && <span className="afp-badge">{activeCount}</span>}
        <i className={`fas ${open ? 'fa-chevron-up' : 'fa-chevron-down'} afp-chevron`} />
      </button>

      {open && (
        <div className="afp-body">
          <div className="afp-grid">
            <div className="afp-group">
              <label className="afp-label">{t('filters.priceMin')}</label>
              <input
                type="number"
                inputMode="numeric"
                placeholder="Q 0"
                value={filters.priceMin || ''}
                onChange={(e) => update({ priceMin: e.target.value })}
              />
            </div>
            <div className="afp-group">
              <label className="afp-label">{t('filters.priceMax')}</label>
              <input
                type="number"
                inputMode="numeric"
                placeholder={t('filters.withoutLimit')}
                value={filters.priceMax || ''}
                onChange={(e) => update({ priceMax: e.target.value })}
              />
            </div>
            <div className="afp-group">
              <label className="afp-label">{t('filters.roomsMin')}</label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="0"
                value={filters.roomsMin || ''}
                onChange={(e) => update({ roomsMin: e.target.value })}
              />
            </div>
            <div className="afp-group">
              <label className="afp-label">{t('filters.bathroomsMin')}</label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="0"
                value={filters.bathsMin || ''}
                onChange={(e) => update({ bathsMin: e.target.value })}
              />
            </div>
            <div className="afp-group">
              <label className="afp-label">{t('filters.sizeMin')}</label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="0"
                value={filters.sizeMin || ''}
                onChange={(e) => update({ sizeMin: e.target.value })}
              />
            </div>
            <div className="afp-group afp-group-wide">
              <label className="afp-label">{t('filters.location')}</label>
              <input
                type="text"
                placeholder={t('filters.locationPlaceholder')}
                value={filters.location || ''}
                onChange={(e) => update({ location: e.target.value })}
              />
            </div>
          </div>

          {/* Fase 19.5 — filtro por amenidades. Reusa AmenitiesPicker con
              estilo de chips. La publicación debe tener TODAS las marcadas
              (AND), no cualquiera (OR) — es lo intuitivo para el comprador. */}
          <div className="afp-amenities">
            <label className="afp-label">{t('filters.amenitiesRequired')}</label>
            <AmenitiesPicker
              value={filters.amenityIds || []}
              onChange={(next) => update({ amenityIds: next })}
            />
          </div>

          {activeCount > 0 && (
            <div className="afp-actions">
              <button type="button" className="afp-clear-btn" onClick={clearAll}>
                <i className="fas fa-times-circle" /> {t('filters.clear', { count: activeCount })}
              </button>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .afp {
          background: var(--clr-bg-white, #fff);
          border: 1px solid var(--clr-common-border, #e0e2e5);
          border-radius: 10px;
          margin-bottom: 16px;
          overflow: hidden;
        }
        .afp-toggle {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 18px;
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 14.5px;
          font-weight: 600;
          color: var(--clr-common-heading);
          text-align: left;
        }
        .afp-toggle :global(i.fa-sliders-h) {
          color: var(--clr-theme-1, #2785ff);
        }
        .afp-toggle :global(.afp-chevron) {
          margin-left: auto;
          font-size: 12px;
          opacity: 0.6;
        }
        .afp-badge {
          background: var(--clr-theme-1, #2785ff);
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 12px;
          margin-left: 4px;
        }
        .afp-body {
          padding: 0 18px 18px;
          border-top: 1px solid var(--clr-common-border, #e0e2e5);
        }
        .afp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
          margin-top: 16px;
        }
        .afp-group-wide {
          grid-column: 1 / -1;
        }
        .afp-label {
          display: block;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--clr-common-body-text);
          margin-bottom: 5px;
        }
        .afp-group input {
          width: 100%;
          padding: 9px 12px;
          border: 1px solid var(--clr-common-border, #e0e2e5);
          border-radius: 7px;
          font-size: 14px;
          background: var(--clr-bg-white, #fff);
          color: var(--clr-common-heading);
          box-sizing: border-box;
        }
        .afp-group input:focus {
          outline: none;
          border-color: var(--clr-theme-1, #2785ff);
        }
        .afp-amenities {
          margin-top: 22px;
          padding-top: 18px;
          border-top: 1px dashed var(--clr-common-border, #e0e2e5);
        }
        .afp-amenities :global(.amenities-picker) {
          margin-top: 8px;
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
        }
        .afp-amenities :global(.amp-intro) {
          display: none !important;
        }
        .afp-actions {
          margin-top: 14px;
          text-align: right;
        }
        .afp-clear-btn {
          background: transparent;
          border: 1px solid var(--clr-common-border, #e0e2e5);
          color: var(--clr-common-body-text);
          padding: 7px 14px;
          border-radius: 7px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .afp-clear-btn:hover {
          border-color: #ef4444;
          color: #ef4444;
        }
      `}</style>
    </div>
  );
};

export default AdvancedFiltersPanel;
