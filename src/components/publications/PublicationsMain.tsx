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
import FeaturedPublicationsSection from './FeaturedPublicationsSection';
import PublicationsBar, { type PublicationFilters } from './PublicationsBar';
import AdvancedFiltersPanel from './AdvancedFiltersPanel';
import PropertiesMap from './PropertiesMap';
import { type SortOption } from './publicationUtils';

type ViewMode = 'list' | 'map' | 'split';

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
  // Fase 19 — modo de visualización del catálogo: lista, mapa o split.
  // En móvil forzamos lista (split rompe el grid). El useEffect debajo
  // sincroniza si el usuario rota o cambia de tamaño.
  const [viewMode, setViewMode] = useState<ViewMode>('list');

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

  // Filtrar primero, ordenar después.
  // Fase 19 — sumamos filtros avanzados client-side (precio min/max,
  // habitaciones mín, baños mín, tamaño mín, ubicación). Strings vacíos /
  // NaN se ignoran. Para ubicación buscamos coincidencia parcial
  // case-insensitive en country/city/town.
  const filteredAndSorted = useMemo(() => {
    const priceMin = Number(filters.priceMin) || 0;
    const priceMax = Number(filters.priceMax) || Number.POSITIVE_INFINITY;
    const roomsMin = Number(filters.roomsMin) || 0;
    const bathsMin = Number(filters.bathsMin) || 0;
    const sizeMin = Number(filters.sizeMin) || 0;
    const locationQuery = (filters.location || '').trim().toLowerCase();
    const requiredAmenities = filters.amenityIds || [];

    const filtered = publications.filter((publication: AnyPublicationListItem) => {
      // Categoría + búsqueda de texto (existente).
      if (filters.category && publication.category !== filters.category) return false;
      if (!matchesSearch(publication, filters.search)) return false;

      // Avanzados (Fase 19).
      const price = Number(publication.price) || 0;
      if (price < priceMin) return false;
      if (price > priceMax) return false;

      // Habitaciones y baños: si la publicación no tiene el campo (ej.
      // terrenos), tratamos como 0 — solo lo cumple si el mínimo también
      // es 0 (es decir, no filtró).
      const rooms = Number(publication.rooms) || 0;
      if (rooms < roomsMin) return false;
      const baths = Number(publication.bathrooms) || 0;
      if (baths < bathsMin) return false;

      // Tamaño aplica solo a terrenos típicamente. Mismo manejo.
      const size = Number(publication.sizee) || 0;
      if (size < sizeMin) return false;

      // Ubicación: substring case-insensitive en country/city/town.
      if (locationQuery) {
        const loc = [publication.country, publication.city, publication.town]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!loc.includes(locationQuery)) return false;
      }

      // Fase 19.5 — amenidades: la publicación debe tener TODAS las
      // amenidades marcadas (AND). Si la publi no expone amenities,
      // tratamos como [] y solo pasa si requiredAmenities también es vacío.
      if (requiredAmenities.length > 0) {
        const pubAmen = Array.isArray(publication.amenities)
          ? publication.amenities
          : [];
        const pubAmenSet = new Set(pubAmen);
        for (const required of requiredAmenities) {
          if (!pubAmenSet.has(required)) return false;
        }
      }

      return true;
    });
    return applySort(filtered, filters.sort);
  }, [
    filters.category,
    filters.search,
    filters.sort,
    filters.priceMin,
    filters.priceMax,
    filters.roomsMin,
    filters.bathsMin,
    filters.sizeMin,
    filters.location,
    filters.amenityIds,
    publications,
  ]);

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

          {/* Fase 19 — filtros avanzados client-side. Colapsado por defecto. */}
          <AdvancedFiltersPanel filters={filters} onFiltersChange={setFilters} />

          {/* Fase 19 — toggle de vista (Lista / Mapa / Split). */}
          <div className="view-toggle">
            <span className="view-toggle-label">Ver como:</span>
            <div className="view-toggle-group" role="group" aria-label="Modo de visualización">
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'list' ? 'is-active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <i className="fas fa-th" /> Lista
              </button>
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'split' ? 'is-active' : ''}`}
                onClick={() => setViewMode('split')}
              >
                <i className="fas fa-columns" /> Lista + Mapa
              </button>
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'map' ? 'is-active' : ''}`}
                onClick={() => setViewMode('map')}
              >
                <i className="fas fa-map-marked-alt" /> Mapa
              </button>
            </div>
          </div>

          {/* Fase 10 — destacados/patrocinados segmentados (solo en lista) */}
          {viewMode === 'list' && <FeaturedPublicationsSection limit={4} />}

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
              {/* Modo MAPA puro: solo el mapa. */}
              {viewMode === 'map' && (
                <PropertiesMap publications={filteredAndSorted} />
              )}

              {/* Modo SPLIT: lista a la izquierda, mapa sticky a la derecha.
                  En móvil el split se colapsa a una columna (mapa arriba,
                  lista abajo).

                  Nota: PublicationCard ya envuelve internamente con
                  col-xl-4 col-lg-6 col-md-6. Para que NO se aniden las
                  columnas y las cards ocupen el ancho completo de la
                  columna izquierda, NO los envolvemos en otro col-*; el
                  CSS del split-view-list anula los col-* internos vía
                  :global y los fuerza a width:100%. */}
              {viewMode === 'split' && (
                <div className="split-view">
                  <div className="split-view-list">
                    <div className="row wow fadeInUp split-view-cards">
                      {visiblePublications.length > 0 ? (
                        visiblePublications.map((publication, index) => (
                          <PublicationCard
                            key={publication.id}
                            publication={publication}
                            isNew={filters.sort === 'recent' && index === 0}
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
                      <div ref={sentinelRef} className="text-center py-4" aria-live="polite">
                        <i className="fal fa-spinner fa-spin" />
                        <span className="ms-2">Cargando más propiedades...</span>
                      </div>
                    )}
                  </div>
                  <div className="split-view-map">
                    <PropertiesMap publications={filteredAndSorted} />
                  </div>
                </div>
              )}

              {/* Modo LISTA (default): grid 4 columnas como hasta ahora. */}
              {viewMode === 'list' && (
                <>
                  <div className="row wow fadeInUp">
                    {visiblePublications.length > 0 ? (
                      visiblePublications.map((publication, index) => (
                        <PublicationCard
                          key={publication.id}
                          publication={publication}
                          isNew={filters.sort === 'recent' && index === 0}
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
                    <div ref={sentinelRef} className="text-center py-4" aria-live="polite">
                      <i className="fal fa-spinner fa-spin" />
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
            </>
          )}
        </div>
      </section>

      <style jsx>{`
        .view-toggle {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
          flex-wrap: wrap;
        }
        .view-toggle-label {
          font-size: 13px;
          color: var(--clr-common-body-text, #636363);
          font-weight: 600;
        }
        .view-toggle-group {
          display: inline-flex;
          background: var(--clr-bg-white, #fff);
          border: 1px solid var(--clr-common-border, #e0e2e5);
          border-radius: 8px;
          overflow: hidden;
        }
        .view-toggle-btn {
          padding: 8px 14px;
          background: transparent;
          border: none;
          font-size: 13px;
          font-weight: 600;
          color: var(--clr-common-body-text, #636363);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: background 0.15s, color 0.15s;
        }
        .view-toggle-btn :global(i) {
          font-size: 12px;
        }
        .view-toggle-btn + .view-toggle-btn {
          border-left: 1px solid var(--clr-common-border, #e0e2e5);
        }
        .view-toggle-btn:hover {
          background: rgba(39, 133, 255, 0.06);
          color: var(--clr-theme-1, #2785ff);
        }
        .view-toggle-btn.is-active {
          background: var(--clr-theme-1, #2785ff);
          color: #fff;
        }

        .split-view {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
          gap: 18px;
          margin-bottom: 30px;
        }
        .split-view-list {
          min-width: 0;
        }
        .split-view-map {
          position: sticky;
          top: 100px;
          align-self: start;
        }
        /* En el split, NO usamos el row/col de Bootstrap (cuyas cols
           internas se aniden y se rompan). Convertimos el contenedor
           en un CSS Grid responsive y forzamos a cada card-wrapper
           (col-xl-4 etc del PublicationCard) a comportarse como una
           celda neutra del grid: width 100%, max-width none, flex
           none. Resultado: 2 cards por fila cuando hay ~580+px de
           ancho de columna izquierda, 1 cuando es estrecha. */
        .split-view-cards {
          display: grid !important;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 14px;
          margin-left: 0 !important;
          margin-right: 0 !important;
        }
        .split-view-cards :global(> [class*="col-"]) {
          flex: none !important;
          width: 100% !important;
          max-width: 100% !important;
          padding-left: 0 !important;
          padding-right: 0 !important;
        }
        @media (max-width: 991px) {
          /* En tablet/móvil colapsamos a una columna: mapa arriba,
             listado abajo. Aquí el mapa NO es sticky porque ocupa demasiado. */
          .split-view {
            grid-template-columns: 1fr;
          }
          .split-view-map {
            position: static;
          }
        }
      `}</style>
    </main>
  );
};

export default PublicationsMain;
