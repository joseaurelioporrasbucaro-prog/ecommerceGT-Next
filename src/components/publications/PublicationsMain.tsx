"use client";

import { useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import Breadcrumbs from '@/utils/Breadcrumbs';
import { ApiError } from '@/utils/Api';
import { usePublicationCategories } from '@/hooks/api/useCatalogs';
import { usePublications } from '@/hooks/api/usePublications';
import type { AnyPublicationListItem } from '@/types/api';
import CategorySlider from './CategorySlider';
import PublicationCard from './PublicationCard';
import FeaturedPublicationsSection from './FeaturedPublicationsSection';
import PublicationsBar, { type PublicationFilters } from './PublicationsBar';
import PropertiesMap from './PropertiesMap';
import { type SortOption } from './publicationUtils';

// H12 — vista por defecto = GRID. Se conserva lista (filas) y mapa.
type ViewMode = 'grid' | 'list' | 'map';
const VIEW_STORAGE_KEY = 'kq:listView';
const SKELETON_COUNT = 8;

const INITIAL_FILTERS: PublicationFilters = {
  search: '',
  category: '',
  sort: 'recent',
  priceCurrency: 'Q',
};

const PAGE_SIZE = 12;

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
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
  const t = useTranslations('publications');
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
  // H12 — modo de visualización del catálogo: grid (default), lista o mapa.
  // La preferencia se recuerda en localStorage (`kq:listView`). El estado
  // inicial es 'grid' (SSR-safe); el useEffect lo hidrata desde storage.
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  // En móvil el toggle abre la vista a pantalla completa.
  const [mobileFullscreen, setMobileFullscreen] = useState(false);

  // Hidratar preferencia de vista guardada.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(VIEW_STORAGE_KEY);
      if (saved === 'grid' || saved === 'list' || saved === 'map') {
        setViewMode(saved);
      }
    } catch {
      /* localStorage no disponible: nos quedamos con el default */
    }
  }, []);

  const changeView = (next: ViewMode) => {
    setViewMode(next);
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, next);
    } catch {
      /* noop */
    }
  };

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
    // H12 — ubicación por catálogo: departamento y municipio llegan como las
    // descripciones del catálogo; las matcheamos por substring sobre los
    // campos de texto de la publicación (city/town/country).
    const departmentQuery = (filters.location || '').trim().toLowerCase();
    const municipalityQuery = (filters.municipality || '').trim().toLowerCase();
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
      if (departmentQuery || municipalityQuery) {
        const loc = [publication.country, publication.city, publication.town]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (departmentQuery && !loc.includes(departmentQuery)) return false;
        if (municipalityQuery && !loc.includes(municipalityQuery)) return false;
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
    filters.municipality,
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

  const clearAllFilters = () => {
    setFilters({ ...INITIAL_FILTERS });
  };

  const viewButtons: Array<{ mode: ViewMode; icon: string; label: string }> = [
    { mode: 'grid', icon: 'fa-th-large', label: t('listing.viewGrid') },
    { mode: 'list', icon: 'fa-bars', label: t('listing.viewList') },
    { mode: 'map', icon: 'fa-map-marked-alt', label: t('listing.viewMap') },
  ];

  const cardsGrid = (
    <div className={`pub-grid ${viewMode === 'list' ? 'is-rows' : ''}`}>
      {visiblePublications.map((publication, index) => (
        <PublicationCard
          key={publication.id}
          publication={publication}
          isNew={filters.sort === 'recent' && index === 0}
          isFeatured={false}
        />
      ))}
    </div>
  );

  return (
    <main>
      <Breadcrumbs
        breadcrumbTitle={t('listing.breadcrumbTitle')}
        breadcrumbSubTitle={t('listing.breadcrumbTitle')}
      />

      <section className="artworks-area pt-130 pb-90">
        <div className={`container ${mobileFullscreen ? 'is-mobile-fullscreen' : ''}`}>
          <CategorySlider
            categories={categories}
            activeCategory={filters.category}
            onSelect={handleCategorySelect}
          />

          {/* H12 — barra de filtros cohesiva (reemplaza barra fragmentada + modal). */}
          <PublicationsBar
            key={categories.length}
            filters={filters}
            categories={categories}
            resultCount={isLoading || error ? undefined : filteredAndSorted.length}
            onFiltersChange={setFilters}
          />

          {/* Toggle de vista segmentado (activo navy). */}
          <div className="pub-viewbar">
            <div className="view-seg" role="group" aria-label={t('listing.viewModeAria')}>
              {viewButtons.map((b) => (
                <button
                  key={b.mode}
                  type="button"
                  className={`view-seg-btn ${viewMode === b.mode ? 'is-active' : ''}`}
                  aria-pressed={viewMode === b.mode}
                  onClick={() => changeView(b.mode)}
                >
                  <i className={`fas ${b.icon}`} aria-hidden="true" /> <span>{b.label}</span>
                </button>
              ))}
            </div>
            {/* En móvil: alternar vista a pantalla completa. */}
            <button
              type="button"
              className="view-fullscreen-btn"
              onClick={() => setMobileFullscreen((v) => !v)}
              aria-pressed={mobileFullscreen}
            >
              <i className={`fas ${mobileFullscreen ? 'fa-compress' : 'fa-expand'}`} aria-hidden="true" />
              <span>{mobileFullscreen ? t('listing.exitFullscreen') : t('listing.fullscreen')}</span>
            </button>
          </div>

          {/* Destacados/patrocinados segmentados (solo en grid/lista). */}
          {viewMode !== 'map' && <FeaturedPublicationsSection limit={4} />}

          {/* ── Estado: cargando (skeletons de fila, no spinner full-page) ── */}
          {isLoading && (
            <div className="pub-grid" aria-busy="true" aria-live="polite">
              {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <div key={i} className="pub-skel">
                  <div className="pub-skel-photo" />
                  <div className="pub-skel-body">
                    <div className="pub-skel-line w60" />
                    <div className="pub-skel-line w90" />
                    <div className="pub-skel-line w40" />
                    <div className="pub-skel-specs">
                      <span /><span /><span />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Estado: error ── */}
          {!isLoading && error && (
            <div className="pub-state" role="alert">
              <div className="pub-state-icon pub-state-icon--danger">
                <i className="fas fa-triangle-exclamation" aria-hidden="true" />
              </div>
              <h4>{t('listing.errorTitle')}</h4>
              <p>{getErrorMessage(error, t('common.unexpectedError'))}</p>
              <button
                type="button"
                className="pub-state-btn"
                onClick={() => publicationsQuery.refetch()}
              >
                <i className="fas fa-rotate-right" aria-hidden="true" /> {t('listing.retry')}
              </button>
            </div>
          )}

          {/* ── Contenido ── */}
          {!isLoading && !error && (
            <>
              {viewMode === 'map' && <PropertiesMap publications={filteredAndSorted} />}

              {viewMode !== 'map' && (
                <>
                  {visiblePublications.length > 0 ? (
                    <>
                      {cardsGrid}

                      {hasMore && (
                        <div ref={sentinelRef} className="text-center py-4" aria-live="polite">
                          <i className="fal fa-spinner fa-spin" />
                          <span className="ms-2">{t('listing.loadingMore')}</span>
                        </div>
                      )}

                      {!hasMore && (
                        <div className="pub-showing">
                          {t('listing.showing', {
                            visible: visiblePublications.length,
                            total: filteredAndSorted.length,
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    // ── Estado: vacío ──
                    <div className="pub-state">
                      <div className="pub-state-icon">
                        <i className="fas fa-magnifying-glass" aria-hidden="true" />
                      </div>
                      <h4>{t('listing.emptyTitle')}</h4>
                      <p>{t('listing.emptyFilters')}</p>
                      <button type="button" className="pub-state-btn" onClick={clearAllFilters}>
                        <i className="fas fa-broom" aria-hidden="true" /> {t('filters.clearAll')}
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </section>

      <style jsx>{`
        /* ── Toggle de vista segmentado ── */
        .pub-viewbar {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          margin-bottom: 22px;
        }
        .view-seg {
          display: inline-flex;
          background: var(--surface-sunk);
          border: 1px solid var(--border);
          border-radius: var(--r-pill);
          padding: 3px;
        }
        .view-seg-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 16px;
          border: none;
          border-radius: var(--r-pill);
          background: transparent;
          color: var(--fg-muted);
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .view-seg-btn :global(i) {
          font-size: 12px;
        }
        .view-seg-btn:hover {
          color: var(--fg-strong);
        }
        .view-seg-btn.is-active {
          background: var(--navy-800);
          color: var(--cream);
        }
        .view-fullscreen-btn {
          display: none;
          align-items: center;
          gap: 7px;
          padding: 8px 14px;
          border: 1px solid var(--border-strong);
          border-radius: var(--r-pill);
          background: var(--bg-elevated);
          color: var(--fg-muted);
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        /* ── Grid de tarjetas ──
           PublicationCard se auto-envuelve en col-xl-4/col-lg-6/col-md-6.
           Para usar un CSS Grid real (auto-fill minmax 300) neutralizamos
           esos col-* y forzamos cada wrapper a celda neutra width:100%. */
        .pub-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 22px;
          margin-bottom: 30px;
        }
        .pub-grid :global(> [class*='col-']) {
          flex: none !important;
          width: 100% !important;
          max-width: 100% !important;
          padding-left: 0 !important;
          padding-right: 0 !important;
        }
        /* La card trae mb-30 propio; en el grid el gap ya separa las filas. */
        .pub-grid :global(.pub-card) {
          margin-bottom: 0 !important;
        }
        /* Vista LISTA = filas anchas (una columna). */
        .pub-grid.is-rows {
          grid-template-columns: 1fr;
          gap: 16px;
        }

        /* ── Skeletons de carga (shimmer sobre surface-sunk) ── */
        .pub-skel {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--r-lg);
          overflow: hidden;
        }
        .pub-skel-photo {
          width: 100%;
          padding-top: 66.67%;
          background: var(--surface-sunk);
        }
        .pub-skel-body {
          padding: 16px 18px 18px;
        }
        .pub-skel-line {
          height: 12px;
          border-radius: 6px;
          background: var(--surface-sunk);
          margin-bottom: 10px;
        }
        .pub-skel-line.w40 {
          width: 40%;
        }
        .pub-skel-line.w60 {
          width: 60%;
          height: 18px;
        }
        .pub-skel-line.w90 {
          width: 90%;
        }
        .pub-skel-specs {
          display: flex;
          gap: 14px;
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid var(--border);
        }
        .pub-skel-specs span {
          width: 48px;
          height: 12px;
          border-radius: 6px;
          background: var(--surface-sunk);
        }
        .pub-skel-photo,
        .pub-skel-line,
        .pub-skel-specs span {
          position: relative;
          overflow: hidden;
        }
        .pub-skel-photo::after,
        .pub-skel-line::after,
        .pub-skel-specs span::after {
          content: '';
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background: linear-gradient(
            90deg,
            transparent,
            var(--bg-elevated),
            transparent
          );
          animation: pub-shimmer 1.3s infinite;
        }
        @keyframes pub-shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .pub-skel-photo::after,
          .pub-skel-line::after,
          .pub-skel-specs span::after {
            animation: none;
          }
        }

        /* ── Estados vacío / error ── */
        .pub-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 64px 24px;
          gap: 4px;
        }
        .pub-state-icon {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent-soft);
          color: var(--lav-700);
          font-size: 28px;
          margin-bottom: 14px;
        }
        .pub-state-icon--danger {
          background: var(--surface-sunk);
          color: var(--danger);
        }
        .pub-state h4 {
          font-family: var(--font-display);
          font-weight: 700;
          color: var(--fg-strong);
          margin: 0;
        }
        .pub-state p {
          color: var(--fg-muted);
          font-size: 14px;
          margin: 4px 0 16px;
          max-width: 380px;
        }
        .pub-state-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 22px;
          border: none;
          border-radius: var(--r-pill);
          background: var(--accent);
          color: #fff;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .pub-state-btn:hover {
          background: var(--accent-hover);
        }

        .pub-showing {
          text-align: center;
          padding: 16px 0 4px;
          color: var(--fg-subtle);
          font-size: 13px;
        }

        /* ── Responsive ── */
        @media (max-width: 767px) {
          .pub-viewbar {
            justify-content: space-between;
          }
          .view-fullscreen-btn {
            display: inline-flex;
          }
          .view-seg-btn span {
            display: none;
          }
          .view-seg-btn {
            padding: 8px 14px;
          }
          /* Pantalla completa en móvil: el contenedor cubre el viewport y
             scrollea internamente — ideal para el mapa o el grid extenso. */
          .container.is-mobile-fullscreen {
            position: fixed;
            inset: 0;
            z-index: 1200;
            background: var(--bg);
            max-width: none;
            overflow-y: auto;
            padding: 16px;
          }
        }
        @media (min-width: 768px) {
          /* En desktop el botón de pantalla completa no aplica. */
          .container.is-mobile-fullscreen {
            position: static;
          }
        }
      `}</style>
    </main>
  );
};

export default PublicationsMain;
