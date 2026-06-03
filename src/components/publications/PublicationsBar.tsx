"use client";

import React from 'react';
import NiceSelect from '@/elements/niceSelect/NiceSelect';
import type { PublicationCategory } from '@/types/api';
import { SORT_OPTIONS, type SortOption } from './publicationUtils';

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
  categories: PublicationCategory[];
  onFiltersChange: (filters: PublicationFilters) => void;
}

const ALL_OPTION = { id: 0, option: 'Todas las propiedades' };

const PublicationsBar = ({ filters, categories, onFiltersChange }: PublicationsBarProps) => {
  const categoryOptions = [
    ALL_OPTION,
    ...categories.map((cat) => ({ id: cat.pubgen_id, option: cat.pubgen_description })),
  ];

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: event.target.value });
  };

  const handleCategoryChange = (item: { id: number; option: string }) => {
    onFiltersChange({ ...filters, category: item.id === 0 ? '' : item.option });
  };

  const handleSortChange = (item: { id: number; option: string }) => {
    const sortOption = SORT_OPTIONS.find((opt) => opt.id === item.id);
    if (sortOption) {
      onFiltersChange({ ...filters, sort: sortOption.value });
    }
  };

  // Default current del sort: posición de la opción activa actual
  const currentSortIndex = SORT_OPTIONS.findIndex((opt) => opt.value === filters.sort);

  return (
    <div className="row wow fadeInUp">
      <div className="col-lg-12">
        <form
          className="art-filter-row"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="filter-by-search mb-30">
            <div>
              <NiceSelect
                key={categoryOptions.length}
                options={categoryOptions}
                defaultCurrent={0}
                onChange={handleCategoryChange}
                name="category"
                className="item-category-select"
              />
            </div>
            <div className="filter-search-input">
              <input
                value={filters.search}
                onChange={handleSearchChange}
                type="text"
                placeholder="Buscar por título, ubicación o descripción"
              />
              <button type="submit" aria-label="Buscar publicaciones">
                <i className="fal fa-search"></i>
              </button>
            </div>
          </div>
          <div className="filter-by-sale d-flex filter-oction">
            <div className="select-category-title">
              <i className="flaticon-filter"></i> Filtros
            </div>
            <div>
              <NiceSelect
                options={SORT_OPTIONS}
                defaultCurrent={currentSortIndex >= 0 ? currentSortIndex : 0}
                onChange={handleSortChange}
                name="sort"
                className="sale-category-select"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublicationsBar;
