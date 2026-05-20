"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import ThemeChanger from '@/components/home/ThemeChanger';
import Breadcrumbs from '@/utils/Breadcrumbs';
import { ApiError } from '@/utils/Api';
import { usePublicationCategories } from '@/hooks/api/useCatalogs';
import { useMyFavorites } from '@/hooks/api/useFavorites';
import type {
  AnyPublicationListItem,
  FavoriteItem,
  PublicationListItemAuth,
} from '@/types/api';
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
      return arr.sort((a, b) => b.id - a.id);
  }
}

/**
 * El endpoint `/myfavorites` devuelve un `FavoriteItem` con menos campos
 * que `PublicationListItemAuth`. Normalizamos para reusar `PublicationCard`
 * y todas las utilidades de filtro/sort de PublicationsMain.
 */
function favoriteToPublication(item: FavoriteItem): PublicationListItemAuth {
  return {
    id: item.id,
    pubstaId: item.pubstaId,
    title: item.title,
    description: item.description,
    address: item.address,
    price: item.price,
    rooms: item.rooms,
    bathrooms: item.bathrooms,
    parking: item.parking,
    levell: null,
    sizee: null,
    country: item.country,
    city: item.city,
    town: item.town,
    category: item.category || 'Propiedad',
    image: item.image || '',
    images: item.image ? [{ id: item.image, url: item.image }] : [],
    id_cus: 0,
    isFavorite: true,
  };
}

// ============================================================================
// Componente principal — mirror de PublicationsMain pero alimentado por
// useMyFavorites y sin lectura de filtros desde URL.
// ============================================================================

const FavoritesMain = () => {
  const [filters, setFilters] = useState<PublicationFilters>(INITIAL_FILTERS);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const favoritesQuery = useMyFavorites();
  const categoriesQuery = usePublicationCategories();

  // Mapear FavoriteItem → PublicationListItemAuth para reusar PublicationCard.
  const publications = useMemo<AnyPublicationListItem[]>(
    () => (favoritesQuery.data ?? []).map(favoriteToPublication),
    [favoritesQuery.data],
  );
  const categories = categoriesQuery.data ?? [];

  const filteredAndSorted = useMemo(() => {
    const filtered = publications.filter((publication) => {
      const categoryMatches = !filters.category || publication.category === filters.category;
      return categoryMatches && matchesSearch(publication, filters.search);
    });
    return applySort(filtered, filters.sort);
  }, [filters.category, filters.search, filters.sort, publications]);

  // Reset paginación cuando cambian los filtros.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filters.category, filters.search, filters.sort]);

  // Infinite scroll con IntersectionObserver.
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

  const isLoading = favoritesQuery.isLoading || categoriesQuery.isLoading;
  const error = favoritesQuery.error || categoriesQuery.error;

  const handleCategorySelect = (category: string) => {
    setFilters((prev) => ({ ...prev, category }));
  };

  return (
    <main>
      <ThemeChanger />
      <Breadcrumbs breadcrumbTitle="Mis favoritos" breadcrumbSubTitle="Mis favoritos" />

      <section className="artworks-area pt-130 pb-90">
        <div className="container">
          <CategorySlider
            uniqueId="favorites-categories"
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
                <div className="alert alert-info">Cargando favoritos...</div>
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
                  visiblePublications.map((publication) => (
                    <PublicationCard
                      key={publication.id}
                      publication={publication}
                    />
                  ))
                ) : publications.length === 0 ? (
                  <div className="col-12">
                    <div className="alert alert-warning">
                      Todavía no tenés publicaciones guardadas como favoritas.
                      Tocá el corazón en cualquier propiedad para agregarla acá.
                    </div>
                  </div>
                ) : (
                  <div className="col-12">
                    <div className="alert alert-warning">
                      No encontramos favoritos con esos filtros.
                    </div>
                  </div>
                )}
              </div>

              {hasMore && (
                <div ref={sentinelRef} className="text-center py-4" aria-live="polite">
                  <i className="fal fa-spinner fa-spin"></i>
                  <span className="ms-2">Cargando más favoritos...</span>
                </div>
              )}

              {!hasMore && visiblePublications.length > 0 && (
                <div className="text-center py-4 text-muted" style={{ opacity: 0.6 }}>
                  Mostrando {visiblePublications.length} de {filteredAndSorted.length} favoritos
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
};

export default FavoritesMain;
