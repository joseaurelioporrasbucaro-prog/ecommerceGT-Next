"use client";

import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useCities, useMunicipalities } from '@/hooks/api/useCatalogs';
import { useAmenitiesGrouped } from '@/hooks/api/useAmenities';
import type { City, Municipality, PublicationCategory } from '@/types/api';
import { type SortOption } from './publicationUtils';
import AmenitiesFilterDropdown from './AdvancedFiltersPanel';

// cou_id de Guatemala (mismo valor que usa PautaMain para el catálogo de ciudades).
const GUATEMALA = 502;

export type ListView = 'grid' | 'list' | 'map';

export interface PublicationFilters {
  search: string;
  category: string;
  sort: SortOption;
  // Fase 19 — filtros avanzados client-side. Strings vacíos = sin filtro;
  // al parsear se convierten a Number (NaN = ignorar).
  priceMin?: string;
  priceMax?: string;
  /** Moneda del rango de precio que el comprador eligió (Q / US$). Solo
   * etiqueta los inputs; el filtrado client-side sigue siendo numérico
   * (nunca convertimos con una tasa inventada). */
  priceCurrency?: 'Q' | 'US$';
  roomsMin?: string;
  bathsMin?: string;
  sizeMin?: string;
  /** H12 — ubicación por catálogo (no texto libre). Guardamos la
   * DESCRIPCIÓN del departamento/municipio (string que el backend devuelve
   * en city/town de cada publicación) para que el filtro client-side la
   * matchee por substring. */
  location?: string;
  /** Descripción del municipio elegido (dependiente del departamento). */
  municipality?: string;
  /** Fase 19.5 — IDs de amenidades que la publicación DEBE tener (AND). */
  amenityIds?: number[];
}

interface PublicationsBarProps {
  filters: PublicationFilters;
  categories?: PublicationCategory[];
  /** Conteo de resultados ya filtrados (client-side). */
  resultCount?: number;
  onFiltersChange: (filters: PublicationFilters) => void;
  /** Vista activa + cambio (toggle integrado a la barra, como el diseño).
   * Opcional: si no se pasa onViewChange, el toggle no se renderiza (ej. en
   * /favorites, que no tiene vista de mapa). */
  viewMode?: ListView;
  onViewChange?: (v: ListView) => void;
}

// Select nativo estilizado como "pill" del diseño: ícono + valor + chevron.
const SelectField: React.FC<{
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  icon?: string;
  disabled?: boolean;
  active?: boolean;
  wide?: boolean;
  children: React.ReactNode;
}> = ({ value, onChange, ariaLabel, icon, disabled, active, wide, children }) => (
  <div className={`kqf-sel ${active ? 'is-active' : ''} ${wide ? 'is-wide' : ''}`}>
    {icon && <i className={`${icon} kqf-sel-icon`} aria-hidden="true" />}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={ariaLabel}
      disabled={disabled}
    >
      {children}
    </select>
    <i className="fas fa-chevron-down kqf-sel-chevron" aria-hidden="true" />
  </div>
);

const PublicationsBar = ({
  filters,
  categories = [],
  resultCount,
  onFiltersChange,
  viewMode,
  onViewChange,
}: PublicationsBarProps) => {
  const t = useTranslations('publications');

  const cities = useCities(GUATEMALA);
  const selectedCity = (cities.data ?? []).find((c: City) => c.description === filters.location);
  const munis = useMunicipalities(selectedCity ? selectedCity.city : null);
  const { grouped } = useAmenitiesGrouped();

  const currency = filters.priceCurrency || 'Q';

  const sortOptions: Array<{ value: SortOption; label: string }> = [
    { value: 'recent', label: t('filters.sortRecent') },
    { value: 'price-asc', label: t('filters.sortLowPrice') },
    { value: 'price-desc', label: t('filters.sortHighPrice') },
  ];

  const update = (patch: Partial<PublicationFilters>) => {
    onFiltersChange({ ...filters, ...patch });
  };

  const amenityLabel = useMemo(() => {
    const map = new Map<number, string>();
    grouped.forEach((g) => g.items.forEach((a) => map.set(a.id, a.name)));
    return map;
  }, [grouped]);

  // ── Chips de filtros activos ──────────────────────────────────────────────
  type Chip = { key: string; label: string; clear: () => void };
  const chips: Chip[] = [];

  if (filters.category) {
    chips.push({ key: 'category', label: filters.category, clear: () => update({ category: '' }) });
  }
  if (filters.location) {
    chips.push({
      key: 'location',
      label: filters.municipality ? `${filters.location} · ${filters.municipality}` : filters.location,
      clear: () => update({ location: '', municipality: '' }),
    });
  }
  if (filters.priceMin || filters.priceMax) {
    const lo = filters.priceMin ? `${currency} ${filters.priceMin}` : '';
    const hi = filters.priceMax ? `${currency} ${filters.priceMax}` : '';
    chips.push({
      key: 'price',
      label: lo && hi ? `${lo} – ${hi}` : lo || `≤ ${hi}`,
      clear: () => update({ priceMin: '', priceMax: '' }),
    });
  }
  if (filters.roomsMin) {
    chips.push({
      key: 'roomsMin',
      label: `${filters.roomsMin}+ ${t('features.rooms')}`,
      clear: () => update({ roomsMin: '' }),
    });
  }
  if (filters.bathsMin) {
    chips.push({
      key: 'bathsMin',
      label: `${filters.bathsMin}+ ${t('features.bathrooms')}`,
      clear: () => update({ bathsMin: '' }),
    });
  }
  if (filters.sizeMin) {
    chips.push({ key: 'sizeMin', label: `${filters.sizeMin}+ m²`, clear: () => update({ sizeMin: '' }) });
  }
  (filters.amenityIds || []).forEach((id) => {
    chips.push({
      key: `amenity-${id}`,
      label: amenityLabel.get(id) || `#${id}`,
      clear: () => update({ amenityIds: (filters.amenityIds || []).filter((x) => x !== id) }),
    });
  });

  const hasActiveFilters = chips.length > 0;

  const clearAll = () => {
    onFiltersChange({
      ...filters,
      search: '',
      category: '',
      priceMin: '',
      priceMax: '',
      roomsMin: '',
      bathsMin: '',
      sizeMin: '',
      location: '',
      municipality: '',
      amenityIds: [],
    });
  };

  const locationText = filters.municipality || filters.location || '';

  const viewButtons: Array<{ mode: ListView; icon: string; label: string }> = [
    { mode: 'grid', icon: 'fa-th-large', label: t('listing.viewGrid') },
    { mode: 'list', icon: 'fa-bars', label: t('listing.viewList') },
    { mode: 'map', icon: 'fa-map-marked-alt', label: t('listing.viewMap') },
  ];

  return (
    <div className="kqf">
      {/* ── Fila de filtros cohesiva ── */}
      <div className="kqf-row" role="search">
        <SelectField
          icon="fas fa-home"
          ariaLabel={t('filters.type')}
          value={filters.category}
          active={!!filters.category}
          onChange={(v) => update({ category: v })}
        >
          <option value="">{t('filters.type')}</option>
          {categories.map((c: PublicationCategory) => (
            <option key={c.pubgen_id} value={c.pubgen_description}>
              {c.pubgen_description}
            </option>
          ))}
        </SelectField>

        <SelectField
          icon="fas fa-map-marker-alt"
          ariaLabel={t('features.state')}
          value={filters.location || ''}
          active={!!filters.location}
          onChange={(v) => update({ location: v, municipality: '' })}
        >
          <option value="">{t('features.state')}</option>
          {(cities.data ?? []).map((c: City) => (
            <option key={c.city} value={c.description}>
              {c.description}
            </option>
          ))}
        </SelectField>

        <SelectField
          ariaLabel={t('features.municipality')}
          value={filters.municipality || ''}
          active={!!filters.municipality}
          disabled={!filters.location}
          onChange={(v) => update({ municipality: v })}
        >
          <option value="">{t('features.municipality')}</option>
          {(munis.data ?? []).map((m: Municipality) => (
            <option key={m.municipality} value={m.description}>
              {m.description}
            </option>
          ))}
        </SelectField>

        {/* Precio: rango con selector de moneda, en un solo control compacto. */}
        <div className={`kqf-price ${filters.priceMin || filters.priceMax ? 'is-active' : ''}`}>
          <i className="fas fa-tag kqf-price-icon" aria-hidden="true" />
          <select
            className="kqf-cur"
            value={currency}
            onChange={(e) => update({ priceCurrency: e.target.value as 'Q' | 'US$' })}
            aria-label={t('filters.currency')}
          >
            <option value="Q">Q</option>
            <option value="US$">US$</option>
          </select>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder={t('filters.min')}
            aria-label={t('filters.priceMin')}
            value={filters.priceMin || ''}
            onChange={(e) => update({ priceMin: e.target.value })}
          />
          <span className="kqf-price-sep">–</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder={t('filters.max')}
            aria-label={t('filters.priceMax')}
            value={filters.priceMax || ''}
            onChange={(e) => update({ priceMax: e.target.value })}
          />
        </div>

        <SelectField
          icon="fas fa-bed"
          ariaLabel={t('filters.roomsMin')}
          value={filters.roomsMin || ''}
          active={!!filters.roomsMin}
          onChange={(v) => update({ roomsMin: v })}
        >
          <option value="">{t('features.rooms')}</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={String(n)}>{`${n}+`}</option>
          ))}
        </SelectField>

        <SelectField
          icon="fas fa-bath"
          ariaLabel={t('filters.bathroomsMin')}
          value={filters.bathsMin || ''}
          active={!!filters.bathsMin}
          onChange={(v) => update({ bathsMin: v })}
        >
          <option value="">{t('features.bathrooms')}</option>
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={String(n)}>{`${n}+`}</option>
          ))}
        </SelectField>

        {/* Tamaño mínimo (m²) */}
        <div className={`kqf-size ${filters.sizeMin ? 'is-active' : ''}`}>
          <i className="fas fa-vector-square kqf-size-icon" aria-hidden="true" />
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder={t('filters.size')}
            aria-label={t('filters.sizeMin')}
            value={filters.sizeMin || ''}
            onChange={(e) => update({ sizeMin: e.target.value })}
          />
          <span className="kqf-size-suffix">m²</span>
        </div>

        {/* Amenidades (multi) — popover reutilizado */}
        <AmenitiesFilterDropdown filters={filters} onFiltersChange={onFiltersChange} />
      </div>

      {/* ── Orden + toggle de vista (fila propia, a la derecha) ── */}
      <div className="kqf-toolbar">
          <SelectField
            icon="fas fa-sort-amount-down"
            ariaLabel={t('filters.label')}
            value={filters.sort}
            active={filters.sort !== 'recent'}
            wide
            onChange={(v) => update({ sort: v as SortOption })}
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </SelectField>

          {onViewChange && (
            <div className="kqf-view" role="group" aria-label={t('listing.viewModeAria')}>
              {viewButtons.map((b) => (
                <button
                  key={b.mode}
                  type="button"
                  className={`kqf-view-btn ${viewMode === b.mode ? 'is-active' : ''}`}
                  aria-pressed={viewMode === b.mode}
                  aria-label={b.label}
                  title={b.label}
                  onClick={() => onViewChange(b.mode)}
                >
                  <i className={`fas ${b.icon}`} aria-hidden="true" />
                </button>
              ))}
            </div>
          )}
      </div>

      {/* ── Chips de filtros activos ── */}
      {hasActiveFilters && (
        <div className="kqf-chips" aria-live="polite">
          {chips.map((chip) => (
            <span key={chip.key} className="kqf-chip">
              <span className="kqf-chip-label">{chip.label}</span>
              <button
                type="button"
                className="kqf-chip-x"
                onClick={chip.clear}
                aria-label={`${t('filters.removeFilter')}: ${chip.label}`}
              >
                <i className="fas fa-times" aria-hidden="true" />
              </button>
            </span>
          ))}
          <button type="button" className="kqf-clear-all" onClick={clearAll}>
            {t('filters.clearAll')}
          </button>
        </div>
      )}

      {/* ── Contador (debajo, con borde inferior, como el diseño) ── */}
      {typeof resultCount === 'number' && (
        <div className="kqf-count-row">
          {/* TODO(backend): total desde endpoint server-side */}
          <span className="kqf-count-strong">{t('filters.resultCount', { count: resultCount })}</span>
          {locationText && <span className="kqf-count-loc">{` en ${locationText}`}</span>}
        </div>
      )}

      <style jsx>{`
        .kqf {
          margin-bottom: 4px;
        }
        .kqf-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
        }

        /* ── Pill de select (ícono + valor + chevron) ──
           OJO: estos selects los renderiza <SelectField>, un componente APARTE
           de PublicationsBar. styled-jsx solo agrega la clase de scope a los
           elementos del MISMO componente que tiene el <style jsx>, así que el
           <div.kqf-sel> de SelectField NO recibe scope → sin :global() las
           reglas no matchean y el select queda nativo (sin pill/ícono/altura).
           Mismo patrón que .pub-grid. .kqf-sel es único de esta barra. */
        :global(.kqf-sel) {
          position: relative;
          display: inline-flex;
          align-items: center;
          height: 44px;
          flex: 1 1 130px;
          min-width: 0;
          background: var(--surface);
          border: 1.5px solid var(--border-strong);
          border-radius: var(--r-sm);
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        :global(.kqf-sel.is-wide) {
          flex: 0 0 auto;
          width: 190px;
        }
        :global(.kqf-sel.is-active) {
          border-color: var(--accent);
        }
        :global(.kqf-sel:focus-within) {
          border-color: var(--accent);
          box-shadow: var(--shadow-focus);
        }
        :global(.kqf-sel-icon) {
          position: absolute;
          left: 13px;
          font-size: 13px;
          color: var(--fg-subtle);
          pointer-events: none;
          z-index: 1;
        }
        :global(.kqf-sel select) {
          width: 100%;
          height: 100%;
          border: none;
          background: transparent;
          color: var(--fg-subtle);
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 400;
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
          padding: 0 30px 0 34px;
          text-overflow: ellipsis;
          white-space: nowrap;
          border-radius: var(--r-sm);
        }
        :global(.kqf-sel select:disabled) {
          opacity: 0.5;
          cursor: not-allowed;
        }
        :global(.kqf-sel select:focus) {
          outline: none;
        }
        :global(.kqf-sel.is-active select) {
          color: var(--fg-strong);
          font-weight: 600;
        }
        :global(.kqf-sel-chevron) {
          position: absolute;
          right: 13px;
          font-size: 11px;
          color: var(--fg-subtle);
          pointer-events: none;
        }

        /* ── Precio (rango con moneda) ── */
        .kqf-price {
          position: relative;
          display: inline-flex;
          align-items: center;
          height: 44px;
          flex: 1 1 200px;
          min-width: 0;
          padding-left: 34px;
          border: 1.5px solid var(--border-strong);
          border-radius: var(--r-sm);
          background: var(--surface);
          overflow: hidden;
          transition: border-color 0.15s ease;
        }
        .kqf-price.is-active {
          border-color: var(--accent);
        }
        .kqf-price-icon {
          position: absolute;
          left: 13px;
          font-size: 13px;
          color: var(--fg-subtle);
          pointer-events: none;
        }
        .kqf-cur {
          height: 42px;
          border: none;
          background: var(--surface-sunk);
          color: var(--fg-strong);
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 13px;
          padding: 0 6px;
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
          text-align: center;
        }
        .kqf-cur:focus {
          outline: none;
        }
        .kqf-price input {
          flex: 1;
          min-width: 0;
          width: auto;
          height: 42px;
          border: none;
          background: transparent;
          color: var(--fg-strong);
          font-family: var(--font-body);
          font-size: 14px;
          padding: 0 8px;
        }
        .kqf-price input::placeholder {
          color: var(--fg-subtle);
          font-weight: 400;
        }
        .kqf-price input:focus {
          outline: none;
        }
        .kqf-price-sep {
          color: var(--fg-subtle);
          font-size: 13px;
        }

        /* ── Tamaño ── */
        .kqf-size {
          position: relative;
          display: inline-flex;
          align-items: center;
          height: 44px;
          flex: 1 1 130px;
          min-width: 0;
          padding-left: 34px;
          padding-right: 12px;
          border: 1.5px solid var(--border-strong);
          border-radius: var(--r-sm);
          background: var(--surface);
          transition: border-color 0.15s ease;
        }
        .kqf-size.is-active {
          border-color: var(--accent);
        }
        .kqf-size-icon {
          position: absolute;
          left: 13px;
          font-size: 13px;
          color: var(--fg-subtle);
          pointer-events: none;
        }
        .kqf-size input {
          flex: 1;
          min-width: 0;
          height: 42px;
          border: none;
          background: transparent;
          color: var(--fg-strong);
          font-family: var(--font-body);
          font-size: 14px;
          padding: 0 4px;
        }
        .kqf-size input::placeholder {
          color: var(--fg-subtle);
          font-weight: 400;
        }
        .kqf-size input:focus {
          outline: none;
        }
        .kqf-size-suffix {
          font-size: 13px;
          color: var(--fg-subtle);
          font-weight: 600;
        }

        /* ── Toolbar: orden + toggle (fila propia, a la derecha) ── */
        .kqf-toolbar {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 10px;
          margin-top: 12px;
        }
        .kqf-view {
          display: inline-flex;
          height: 44px;
          background: var(--surface);
          border: 1.5px solid var(--border-strong);
          border-radius: var(--r-sm);
          overflow: hidden;
          flex-shrink: 0;
        }
        .kqf-view-btn {
          width: 44px;
          border: none;
          background: transparent;
          color: var(--fg-muted);
          cursor: pointer;
          font-size: 14px;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .kqf-view-btn + .kqf-view-btn {
          border-left: 1px solid var(--border);
        }
        .kqf-view-btn:hover {
          color: var(--fg-strong);
        }
        .kqf-view-btn.is-active {
          background: var(--navy-800);
          color: var(--cream);
        }

        /* ── Chips activos ── */
        .kqf-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          align-items: center;
          margin: 14px 0;
        }
        .kqf-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 30px;
          padding: 0 6px 0 13px;
          border-radius: var(--r-pill);
          background: var(--accent-soft);
          color: var(--lav-700);
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
        }
        .kqf-chip-x {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: none;
          background: rgba(109, 98, 207, 0.18);
          color: var(--lav-700);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
        }
        .kqf-chip-x :global(i) {
          font-size: 9px;
        }
        .kqf-clear-all {
          border: none;
          background: transparent;
          color: var(--fg-muted);
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
          padding: 0 4px;
        }
        .kqf-clear-all:hover {
          color: var(--fg-strong);
        }

        /* ── Contador ── */
        .kqf-count-row {
          padding: 4px 0 14px;
          margin-top: ${hasActiveFilters ? '0' : '14px'};
          border-bottom: 1px solid var(--border);
          font-size: 15px;
          color: var(--fg-muted);
        }
        .kqf-count-strong {
          font-family: var(--font-display);
          font-weight: 700;
          color: var(--fg-strong);
        }

        /* ── Responsive ── */
        @media (max-width: 991px) {
          .kqf-toolbar {
            margin-left: 0;
            width: 100%;
            justify-content: space-between;
          }
        }
        @media (max-width: 575px) {
          :global(.kqf-sel),
          .kqf-size {
            flex: 1 1 calc(50% - 5px);
            width: auto;
          }
          .kqf-price {
            flex: 1 1 100%;
          }
          .kqf-price input {
            flex: 1;
            width: auto;
          }
          .kqf-toolbar {
            flex-wrap: wrap;
            gap: 8px;
          }
          :global(.kqf-sel.is-wide) {
            flex: 1 1 auto;
            width: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default PublicationsBar;
