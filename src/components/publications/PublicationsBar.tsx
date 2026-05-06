"use client";

import React from 'react';
import type { PublicationCategory } from '@/types/api';

export interface PublicationFilters {
  search: string;
  category: string;
}

interface PublicationsBarProps {
  filters: PublicationFilters;
  categories: PublicationCategory[];
  onFiltersChange: (filters: PublicationFilters) => void;
}

const PublicationsBar = ({ filters, categories, onFiltersChange }: PublicationsBarProps) => {
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: event.target.value });
  };

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, category: event.target.value });
  };

  return (
    <div className="row wow fadeInUp">
      <div className="col-lg-12">
        <form
          className="art-filter-row"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="filter-by-search mb-30">
            <div>
              <select
                className="item-category-select form-select"
                value={filters.category}
                onChange={handleCategoryChange}
                aria-label="Filtrar por categoría"
              >
                <option value="">Todas las propiedades</option>
                {categories.map((category) => (
                  <option key={category.pubgen_id} value={category.pubgen_description}>
                    {category.pubgen_description}
                  </option>
                ))}
              </select>
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
            <div className="art-meta-type">Catálogo público</div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublicationsBar;
