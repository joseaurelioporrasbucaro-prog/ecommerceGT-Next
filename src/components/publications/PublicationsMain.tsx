"use client";

import Image from 'next/image';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Navigation, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css/bundle';
import ThemeChanger from '@/components/home/ThemeChanger';
import Breadcrumbs from '@/utils/Breadcrumbs';
import { ApiError } from '@/utils/Api';
import { usePublicationCategories } from '@/hooks/api/useCatalogs';
import { usePublications } from '@/hooks/api/usePublications';
import type { AnyPublicationListItem, PublicationCategory } from '@/types/api';
import PublicationCard from './PublicationCard';
import PublicationsBar, { type PublicationFilters } from './PublicationsBar';
import {
  getCategoryFallbackIcon,
  getCategoryIconPath,
  type SortOption,
} from './publicationUtils';

const INITIAL_FILTERS: PublicationFilters = {
  search: '',
  category: '',
  sort: 'recent',
};

const PAGE_SIZE = 12;

function getErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Error inesperado';
}

function matchesSearch(publication: AnyPublicationListItem, search: string): boolean {
  const normalizedSearch = search.trim().toLowerCase();
  if (!normalizedSearch) return true;

  const searchableText = [
    publication.title,
    publication.description,
    publication.address,
    publication.country,
    publication.city,
    publication.town,
    publication.category,
  ].join(' ').toLowerCase();

  return searchableText.includes(normalizedSearch);
}

function applySort(items: AnyPublicationListItem[], sort: SortOption): AnyPublicationListItem[] {
  const arr = [...items];
  switch (sort) {
    case 'price-asc':
      return arr.sort((a, b) => Number(a.price) - Number(b.price));
    case 'price-desc':
      return arr.sort((a, b) => Number(b.price) - Number(a.price));
    case 'recent':
    default:
      // Asumimos que el id incremental refleja orden de creación (más alto = más reciente).
      // Cuando el backend exponga `created_at` en el listado, cambiar acá.
      return arr.sort((a, b) => b.id - a.id);
  }
}

// ============================================================================
// Slider de categorías con Swiper (flechas se activan cuando hay overflow)
// ============================================================================

interface CategoryButtonProps {
  label: string;
  iconPath: string | null;
  fallbackIcon: string;
  isActive: boolean;
  onClick: () => void;
}

const CategoryButton = ({ label, iconPath, fallbackIcon, isActive, onClick }: CategoryButtonProps) => {
  const [iconErrored, setIconErrored] = useState(false);
  const showCustomIcon = iconPath && !iconErrored;

  return (
    <button
      type="button"
      className={`property-category-btn ${isActive ? 'is-active' : ''}`}
      onClick={onClick}
    >
      {showCustomIcon ? (
        <Image
          src={iconPath}
          alt=""
          width={20}
          height={20}
          unoptimized
          onError={() => setIconErrored(true)}
        />
      ) : (
        <i className={`fal ${fallbackIcon}`}></i>
      )}
      <span>{label}</span>
    </button>
  );
};

interface CategorySliderProps {
  categories: PublicationCategory[];
  activeCategory: string;
  onSelect: (category: string) => void;
}

const CategorySlider = ({ categories, activeCategory, onSelect }: CategorySliderProps) => (
  <div className="row wow fadeInUp">
    <div className="col-lg-12">
      <div className="categories-bar pos-rel mb-30">
        <Swiper
          modules={[Navigation, A11y]}
          spaceBetween={10}
          slidesPerView="auto"
          navigation={{
            nextEl: '.property-categories-next',
            prevEl: '.property-categories-prev',
          }}
        >
          <SwiperSlide style={{ width: 'auto' }}>
            <CategoryButton
              label="Todas"
              iconPath={null}
              fallbackIcon="fa-th-large"
              isActive={activeCategory === ''}
              onClick={() => onSelect('')}
            />
          </SwiperSlide>
          {categories.map((cat) => (
            <SwiperSlide key={cat.pubgen_id} style={{ width: 'auto' }}>
              <CategoryButton
                label={cat.pubgen_description}
                iconPath={getCategoryIconPath(cat.pubgen_description)}
                fallbackIcon={getCategoryFallbackIcon(cat.pubgen_description)}
                isActive={activeCategory === cat.pubgen_description}
                onClick={() => onSelect(cat.pubgen_description)}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Flechas — Swiper las desactiva visualmente cuando todo cabe */}
        <div className="categories-nav">
          <div className="categories-bar-button-prev property-categories-prev">
            <i className="fal fa-angle-left"></i>
          </div>
          <div className="categories-bar-button-next property-categories-next">
            <i className="fal fa-angle-right"></i>
          </div>
        </div>
      </div>
    </div>

    <style jsx>{`
      :global(.property-category-btn) {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        background: transparent;
        border: 1px solid #3a3852;
        border-radius: 8px;
        color: inherit;
        cursor: pointer;
        font-weight: 500;
        white-space: nowrap;
        transition: all 0.25s ease;
      }
      :global(.property-category-btn i) {
        font-size: 16px;
      }
      :global(.property-category-btn:hover) {
        background: var(--tp-theme-1, #6c5ce7);
        border-color: var(--tp-theme-1, #6c5ce7);
        color: #fff;
        transform: translateY(-2px);
      }
      :global(.property-category-btn.is-active) {
        background: var(--tp-theme-1, #6c5ce7);
        border-color: var(--tp-theme-1, #6c5ce7);
        color: #fff;
      }
    `}</style>
  </div>
);

// ============================================================================
// Componente principal
// ============================================================================

const PublicationsMain = () => {
  const [filters, setFilters] = useState<PublicationFilters>(INITIAL_FILTERS);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const publicationsQuery = usePublications();
  const categoriesQuery = usePublicationCategories();

  const publications = publicationsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  // Filtrar primero, ordenar después
  const filteredAndSorted = useMemo(() => {
    const filtered = publications.filter((publication) => {
      const categoryMatches = !filters.category || publication.category === filters.category;
      return categoryMatches && matchesSearch(publication, filters.search);
    });
    return applySort(filtered, filters.sort);
  }, [filters.category, filters.search, filters.sort, publications]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filters.category, filters.search, filters.sort]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredAndSorted.length));
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredAndSorted.length]);

  const visiblePublications = filteredAndSorted.slice(0, visibleCount);
  const hasMore = visibleCount < filteredAndSorted.length;

  const isLoading = publicationsQuery.isLoading || categoriesQuery.isLoading;
  const error = publicationsQuery.error || categoriesQuery.error;

  const handleCategorySelect = (category: string) => {
    setFilters((prev) => ({ ...prev, category }));
  };

  return (
    <main>
      <ThemeChanger />
      <Breadcrumbs
        breadcrumbTitle="Publicaciones"
        breadcrumbSubTitle="Publicaciones"
      />

      <section className="artworks-area pt-130 pb-90">
        <div className="container">
          <CategorySlider
            categories={categories}
            activeCategory={filters.category}
            onSelect={handleCategorySelect}
          />

          <PublicationsBar
            key={categories.length}
            filters={filters}
            categories={categories}
            onFiltersChange={setFilters}
          />

          {isLoading && (
            <div className="row wow fadeInUp">
              <div className="col-12">
                <div className="alert alert-info">Cargando publicaciones...</div>
              </div>
            </div>
          )}

          {error && (
            <div className="row wow fadeInUp">
              <div className="col-12">
                <div className="alert alert-danger">{getErrorMessage(error)}</div>
              </div>
            </div>
          )}

          {!isLoading && !error && (
            <>
              <div className="row wow fadeInUp">
                {visiblePublications.length > 0 ? (
                  visiblePublications.map((publication, index) => (
                    <PublicationCard
                      key={publication.id}
                      publication={publication}
                      // "Nuevo" naranja: primera publicación cuando se ordena por más recientes.
                      // Cuando backend exponga `created_at` real, marcar últimos N días.
                      isNew={filters.sort === 'recent' && index === 0}
                      // "Destacada" verde: pendiente de Fase de sponsors (backend `pub_featured`).
                      isFeatured={false}
                    />
                  ))
                ) : (
                  <div className="col-12">
                    <div className="alert alert-warning">
                      No encontramos publicaciones con esos filtros.
                    </div>
                  </div>
                )}
              </div>

              {hasMore && (
                <div
                  ref={sentinelRef}
                  className="text-center py-4"
                  aria-live="polite"
                >
                  <i className="fal fa-spinner fa-spin"></i>
                  <span className="ms-2">Cargando más propiedades...</span>
                </div>
              )}

              {!hasMore && visiblePublications.length > 0 && (
                <div className="text-center py-4 text-muted" style={{ opacity: 0.6 }}>
                  Mostrando {visiblePublications.length} de {filteredAndSorted.length} propiedades
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
};

export default PublicationsMain;
