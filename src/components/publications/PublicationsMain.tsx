"use client";

import { useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import ThemeChanger from '@/components/home/ThemeChanger';
import Breadcrumbs from '@/utils/Breadcrumbs';
import { ApiError } from '@/utils/Api';
import { usePublicationCategories } from '@/hooks/api/useCatalogs';
import { usePublications } from '@/hooks/api/usePublications';
import type { AnyPublicationListItem } from '@/types/api';
import CategorySlider from './CategorySlider';
import PublicationCard from './PublicationCard';
import PublicationsBar, { type PublicationFilters } from './PublicationsBar';
import { type SortOption } from './publicationUtils';

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
// Componente principal
// ============================================================================

const PublicationsMain = () => {
  // Lee filtros iniciales desde la URL (ej. /publications?category=Casa
  // viene desde los chips del sidebar derecho o links externos).
  const searchParams = useSearchParams();
  const initialCategory = searchParams?.get('category') ?? '';
  const initialSearch = searchParams?.get('q') ?? '';

  const [filters, setFilters] = useState<PublicationFilters>({
    ...INITIAL_FILTERS,
    category: initialCategory,
    search: initialSearch,
  });
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Si la URL cambia (ej. el usuario clickea otra categoría del sidebar
  // mientras ya está en /publications), sincronizar el filtro local.
  useEffect(() => {
    const urlCategory = searchParams?.get('category') ?? '';
    setFilters((prev) =>
      prev.category === urlCategory ? prev : { ...prev, category: urlCategory },
    );
  }, [searchParams]);

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
