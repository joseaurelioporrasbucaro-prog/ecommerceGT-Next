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
}

// Chevron compacto reutilizable para los selects nativos de la barra.
const SelectField: React.FC<{
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
}> = ({ value, onChange, ariaLabel, disabled, active, children }) => (
  <div className={`kqf-select ${active ? 'is-active' : ''}`}>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={ariaLabel}
      disabled={disabled}
    >
      {children}
    </select>
    <i className="fas fa-chevron-down kqf-chevron" aria-hidden="true" />
  </div>
);

const PublicationsBar = ({
  filters,
  categories = [],
  resultCount,
  onFiltersChange,
}: PublicationsBarProps) => {
  const t = useTranslations('publications');

  const cities = useCities(GUATEMALA);
  // El municipio depende del id del departamento; pero en filters guardamos la
  // descripción (para matchear contra el string de la publicación). Resolvemos
  // el id a partir de la descripción seleccionada.
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

  // Etiquetas legibles de las amenidades activas (para los chips).
  const amenityLabel = useMemo(() => {
    const map = new Map<number, string>();
    grouped.forEach((g) => g.items.forEach((a) => map.set(a.id, a.name)));
    return map;
  }, [grouped]);

  // ── Chips de filtros activos ──────────────────────────────────────────────
  type Chip = { key: string; label: string; clear: () => void };
  const chips: Chip[] = [];

  if (filters.search.trim()) {
    chips.push({
      key: 'search',
      label: `"${filters.search.trim()}"`,
      clear: () => update({ search: '' }),
    });
  }
  if (filters.category) {
    chips.push({ key: 'category', label: filters.category, clear: () => update({ category: '' }) });
  }
  if (filters.location) {
    chips.push({
      key: 'location',
      label: filters.location,
      // limpiar departamento también limpia municipio dependiente
      clear: () => update({ location: '', municipality: '' }),
    });
  }
  if (filters.municipality) {
    chips.push({
      key: 'municipality',
      label: filters.municipality,
      clear: () => update({ municipality: '' }),
    });
  }
  if (filters.priceMin) {
    chips.push({
      key: 'priceMin',
      label: `${t('filters.priceMin')}: ${currency} ${filters.priceMin}`,
      clear: () => update({ priceMin: '' }),
    });
  }
  if (filters.priceMax) {
    chips.push({
      key: 'priceMax',
      label: `${t('filters.priceMax')}: ${currency} ${filters.priceMax}`,
      clear: () => update({ priceMax: '' }),
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
    chips.push({
      key: 'sizeMin',
      label: `${filters.sizeMin}+ m²`,
      clear: () => update({ sizeMin: '' }),
    });
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

  return (
    <div className="kqf">
      <div className="kqf-row" role="search">
        {/* Búsqueda */}
        <div className="kqf-search">
          <i className="fal fa-search kqf-search-icon" aria-hidden="true" />
          <input
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            type="text"
            placeholder={t('filters.searchPlaceholder')}
            aria-label={t('filters.searchAria')}
          />
        </div>

        {/* Tipo de propiedad */}
        <SelectField
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

        {/* Departamento (catálogo) */}
        <SelectField
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

        {/* Municipio (dependiente) */}
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

        {/* Precio: rango con selector de moneda */}
        <div className={`kqf-price ${filters.priceMin || filters.priceMax ? 'is-active' : ''}`}>
          <div className="kqf-cur">
            <select
              value={currency}
              onChange={(e) => update({ priceCurrency: e.target.value as 'Q' | 'US$' })}
              aria-label={t('filters.currency')}
            >
              <option value="Q">Q</option>
              <option value="US$">US$</option>
            </select>
          </div>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder={t('filters.priceMin')}
            aria-label={t('filters.priceMin')}
            value={filters.priceMin || ''}
            onChange={(e) => update({ priceMin: e.target.value })}
          />
          <span className="kqf-price-sep">–</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder={t('filters.priceMax')}
            aria-label={t('filters.priceMax')}
            value={filters.priceMax || ''}
            onChange={(e) => update({ priceMax: e.target.value })}
          />
        </div>

        {/* Cuartos */}
        <SelectField
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

        {/* Baños */}
        <SelectField
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

        {/* Orden */}
        <SelectField
          ariaLabel={t('filters.label')}
          value={filters.sort}
          active={filters.sort !== 'recent'}
          onChange={(v) => update({ sort: v as SortOption })}
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </SelectField>
      </div>

      {/* Chips de filtros activos + contador */}
      <div className="kqf-summary">
        <div className="kqf-chips" aria-live="polite">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              className="kqf-chip"
              onClick={chip.clear}
              aria-label={`${t('filters.removeFilter')}: ${chip.label}`}
            >
              <span>{chip.label}</span>
              <i className="fas fa-times" aria-hidden="true" />
            </button>
          ))}
          {hasActiveFilters && (
            <button type="button" className="kqf-clear-all" onClick={clearAll}>
              {t('filters.clearAll')}
            </button>
          )}
        </div>
        {typeof resultCount === 'number' && (
          <div className="kqf-count">
            {/* TODO(backend): total desde endpoint server-side */}
            {t('filters.resultCount', { count: resultCount })}
          </div>
        )}
      </div>

      <style jsx>{`
        .kqf {
          margin-bottom: 22px;
        }
        .kqf-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
        }

        /* ── Búsqueda ── */
        .kqf-search {
          position: relative;
          flex: 1 1 240px;
          min-width: 200px;
          display: flex;
          align-items: center;
        }
        .kqf-search-icon {
          position: absolute;
          left: 14px;
          font-size: 14px;
          color: var(--fg-subtle);
          pointer-events: none;
        }
        .kqf-search input {
          width: 100%;
          height: 44px;
          padding: 0 14px 0 38px;
          border: 1px solid var(--border-strong);
          border-radius: var(--r-sm);
          background: var(--bg-elevated);
          color: var(--fg-strong);
          font-family: var(--font-body);
          font-size: 14px;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .kqf-search input::placeholder {
          color: var(--fg-subtle);
        }
        .kqf-search input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: var(--shadow-focus);
        }

        /* ── Selects ── */
        .kqf-select {
          position: relative;
          display: inline-flex;
        }
        .kqf-select select {
          height: 44px;
          padding: 0 34px 0 14px;
          border: 1px solid var(--border-strong);
          border-radius: var(--r-sm);
          background: var(--bg-elevated);
          color: var(--fg-muted);
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease, color 0.15s ease;
        }
        .kqf-select select:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .kqf-select select:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: var(--shadow-focus);
        }
        .kqf-select.is-active select {
          color: var(--fg-strong);
          font-weight: 600;
          border-color: var(--accent);
        }
        .kqf-chevron {
          position: absolute;
          right: 13px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 11px;
          color: var(--fg-subtle);
          pointer-events: none;
        }

        /* ── Precio ── */
        .kqf-price {
          display: inline-flex;
          align-items: center;
          height: 44px;
          border: 1px solid var(--border-strong);
          border-radius: var(--r-sm);
          background: var(--bg-elevated);
          overflow: hidden;
          transition: border-color 0.15s ease;
        }
        .kqf-price.is-active {
          border-color: var(--accent);
        }
        .kqf-cur select {
          height: 42px;
          border: none;
          background: var(--surface-sunk);
          color: var(--fg-strong);
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 13px;
          padding: 0 8px;
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
          text-align: center;
        }
        .kqf-cur select:focus {
          outline: none;
        }
        .kqf-price input {
          width: 84px;
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
          font-weight: 500;
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
          display: inline-flex;
          align-items: center;
          height: 44px;
          border: 1px solid var(--border-strong);
          border-radius: var(--r-sm);
          background: var(--bg-elevated);
          padding: 0 12px 0 0;
          transition: border-color 0.15s ease;
        }
        .kqf-size.is-active {
          border-color: var(--accent);
        }
        .kqf-size input {
          width: 92px;
          height: 42px;
          border: none;
          background: transparent;
          color: var(--fg-strong);
          font-family: var(--font-body);
          font-size: 14px;
          padding: 0 4px 0 12px;
        }
        .kqf-size input::placeholder {
          color: var(--fg-subtle);
          font-weight: 500;
        }
        .kqf-size input:focus {
          outline: none;
        }
        .kqf-size-suffix {
          font-size: 13px;
          color: var(--fg-subtle);
          font-weight: 600;
        }

        /* ── Resumen (chips + contador) ── */
        .kqf-summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-top: 14px;
          flex-wrap: wrap;
        }
        .kqf-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
          flex: 1;
          min-height: 1px;
        }
        .kqf-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 30px;
          padding: 0 8px 0 12px;
          border: none;
          border-radius: var(--r-pill);
          background: var(--accent-soft);
          color: var(--lav-700);
          font-family: var(--font-body);
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .kqf-chip:hover {
          background: var(--lav-200);
        }
        .kqf-chip :global(i) {
          font-size: 10px;
          opacity: 0.85;
        }
        .kqf-clear-all {
          border: none;
          background: transparent;
          color: var(--fg-muted);
          font-family: var(--font-body);
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
          padding: 0 4px;
          transition: color 0.15s ease;
        }
        .kqf-clear-all:hover {
          color: var(--fg-strong);
        }
        .kqf-count {
          font-family: var(--font-display);
          font-size: 14px;
          font-weight: 700;
          color: var(--fg-strong);
          white-space: nowrap;
        }

        @media (max-width: 575px) {
          .kqf-row {
            gap: 8px;
          }
          .kqf-search {
            flex: 1 1 100%;
          }
          .kqf-select,
          .kqf-price,
          .kqf-size {
            flex: 1 1 calc(50% - 4px);
          }
          .kqf-select select {
            width: 100%;
          }
          .kqf-summary {
            justify-content: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default PublicationsBar;
