"use client";
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { PublicationFilters } from './PublicationsBar';
import AmenitiesPicker from '@/components/Upload/AmenitiesPicker';

/**
 * Fase 19 — panel modal de filtros avanzados.
 *
 * Vive arriba del listado como botón compacto. Al abrir, muestra precio,
 * habitaciones mín, baños mín, m² mín y ubicación. Los filtros se aplican CLIENT-SIDE en
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
        className="afp-toggle kq-chip"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="advanced-publication-filters"
      >
        <i className="fas fa-sliders-h" />
        <span>{t('filters.advanced')}</span>
        {activeCount > 0 && <span className="afp-badge">{activeCount}</span>}
        <i className="fas fa-chevron-down afp-chevron" />
      </button>

      {open && (
        <div className="afp-layer" id="advanced-publication-filters">
          <button
            type="button"
            className="afp-backdrop"
            aria-label={t('filters.close')}
            onClick={() => setOpen(false)}
          />
          <aside className="afp-modal" role="dialog" aria-modal="true" aria-labelledby="afp-title">
            <div className="afp-header">
              <div>
                <span className="afp-kicker">{t('filters.label')}</span>
                <h3 id="afp-title">{t('filters.advanced')}</h3>
              </div>
              <button
                type="button"
                className="afp-close"
                aria-label={t('filters.close')}
                onClick={() => setOpen(false)}
              >
                <i className="fas fa-times" />
              </button>
            </div>

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
            </div>

            <div className="afp-actions">
              <button
                type="button"
                className="afp-clear-btn"
                onClick={clearAll}
                disabled={activeCount === 0}
              >
                <i className="fas fa-times-circle" /> {t('filters.clear', { count: activeCount })}
              </button>
              <button type="button" className="fill-btn fill-btn-sm afp-apply-btn" onClick={() => setOpen(false)}>
                {t('filters.apply')}
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default AdvancedFiltersPanel;
