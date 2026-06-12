"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import NiceSelect from '@/elements/niceSelect/NiceSelect';
import type { PublicationCategory } from '@/types/api';
import { type SortOption } from './publicationUtils';

export interface PublicationFilters {
  search: string;
  category: string;
  sort: SortOption;
  // Fase 19 — filtros avanzados client-side. Strings vacíos = sin filtro;
  // al parsear se convierten a Number (NaN = ignorar).
  priceMin?: string;
  priceMax?: string;
  roomsMin?: string;
  bathsMin?: string;
  sizeMin?: string;
  /** Texto libre de ubicación (busca en country/city/town concatenados). */
  location?: string;
  /** Fase 19.5 — IDs de amenidades que la publicación DEBE tener (AND). */
  amenityIds?: number[];
}

interface PublicationsBarProps {
  filters: PublicationFilters;
  categories?: PublicationCategory[];
  onFiltersChange: (filters: PublicationFilters) => void;
}

const PublicationsBar = ({ filters, onFiltersChange }: PublicationsBarProps) => {
  const t = useTranslations('publications');
  const sortOptions: Array<{ id: number; option: string; value: SortOption }> = [
    { id: 1, option: t('filters.sortRecent'), value: 'recent' },
    { id: 2, option: t('filters.sortLowPrice'), value: 'price-asc' },
    { id: 3, option: t('filters.sortHighPrice'), value: 'price-desc' },
  ];

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: event.target.value });
  };

  const handleSortChange = (item: { id: number; option: string }) => {
    const sortOption = sortOptions.find((opt) => opt.id === item.id);
    if (sortOption) {
      onFiltersChange({ ...filters, sort: sortOption.value });
    }
  };

  // Default current del sort: posición de la opción activa actual
  const currentSortIndex = sortOptions.findIndex((opt) => opt.value === filters.sort);

  return (
    <div className="row wow fadeInUp">
      <div className="col-lg-12">
        <form
          className="art-filter-row kq-publications-toolbar"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="filter-by-search kq-filter-search">
            <div className="filter-search-input kq-search-field">
              <input
                value={filters.search}
                onChange={handleSearchChange}
                type="text"
                placeholder={t('filters.searchPlaceholder')}
              />
              <button type="submit" aria-label={t('filters.searchAria')}>
                <i className="fal fa-search"></i>
              </button>
            </div>
          </div>
          <div className="filter-by-sale d-flex filter-oction kq-sort-control">
            <span className="kq-sort-caption">{t('filters.label')}</span>
            <div className="kq-sort-select-wrap">
              <NiceSelect
                options={sortOptions}
                defaultCurrent={currentSortIndex >= 0 ? currentSortIndex : 0}
                onChange={handleSortChange}
                name="sort"
                className="sale-category-select kq-sort-chip"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublicationsBar;
