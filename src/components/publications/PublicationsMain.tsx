"use client";

import { useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import Breadcrumbs from '@/utils/Breadcrumbs';
import { ApiError } from '@/utils/Api';
import { usePublicationCategories, useCities, useMunicipalities } from '@/hooks/api/useCatalogs';
import {
  useInfinitePublications,
  usePublicationsMap,
  type PublicationsMapEntry,
} from '@/hooks/api/usePublications';
import type { AnyPublicationListItem, City, Municipality, PublicationCategory } from '@/types/api';
import PublicationCard from './PublicationCard';
import {
  useFeaturedPublications,
  recordAdClick,
  type FeaturedPublication,
} from '@/hooks/api/useCampaigns';
import PublicationsBar, { type PublicationFilters } from './PublicationsBar';
import PropertiesMap from './PropertiesMap';
import { type SortOption } from './publicationUtils';

// País del catálogo (`cat_country`). Mismo valor que usa PublicationsBar.
const GUATEMALA = 502;

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

// Patrocinados (campañas) intercalados estilo Facebook:
//  - SPONSORED_POOL: cuántos pedimos al backend para rotar.
//  - SPONSORED_LEAD: cuántos van "al principio" del feed (como ya estaba).
//  - SPONSORED_EVERY: cada cuántas orgánicas se vuelve a colar uno (cíclico),
//    para que reaparezcan "disimuladamente" al ir bajando.
const SPONSORED_POOL = 8;
const SPONSORED_LEAD = 1;
const SPONSORED_EVERY = 6;

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

// ── Feed unificado: orgánicas + patrocinados intercalados ────────────────────
type FeedEntry =
  | { kind: 'organic'; pub: AnyPublicationListItem }
  | { kind: 'sponsored'; pub: FeaturedPublication; slot: number };

function buildInterleavedFeed(
  organic: AnyPublicationListItem[],
  sponsored: FeaturedPublication[],
  lead: number,
  every: number,
): FeedEntry[] {
  if (sponsored.length === 0) {
    return organic.map((pub) => ({ kind: 'organic', pub }));
  }
  const out: FeedEntry[] = [];
  let s = 0;
  const take = () => {
    const pub = sponsored[s % sponsored.length];
    const slot = s;
    s += 1;
    return { pub, slot };
  };
  // Bloque inicial al principio del listado.
  for (let i = 0; i < lead && i < sponsored.length; i += 1) {
    const { pub, slot } = take();
    out.push({ kind: 'sponsored', pub, slot });
  }
  // Luego, 1 patrocinado cada `every` orgánicas (rotando el pool).
  organic.forEach((pub, idx) => {
    out.push({ kind: 'organic', pub });
    if ((idx + 1) % every === 0) {
      const { pub: spon, slot } = take();
      out.push({ kind: 'sponsored', pub: spon, slot });
    }
  });
  return out;
}

// Tarjeta patrocinada del feed: misma card del catálogo (mismo tamaño y reflow
// a fila en vista lista) con su badge "Patrocinado". Registra el clic de la
// campaña como hacía FeaturedPublicationsSection. El badge SÍ se muestra (no
// hay sección rotuladora): así se reconoce pero queda discreto, estilo FB.
const SponsoredFeedCard = ({ pub }: { pub: FeaturedPublication }) => {
  const t = useTranslations('publications');
  const isMessages = pub.campObjective === 'mensajes';
  return (
    <div
      className="pub-spon"
      onMouseDown={() => {
        if (!isMessages) recordAdClick(pub.campId);
      }}
    >
      <PublicationCard
        publication={pub as unknown as AnyPublicationListItem}
        isFeatured
        ctaOverride={
          isMessages
            ? {
                label: t('card.sendMessage'),
                href: `/messages?pub=${pub.id}`,
                iconClass: 'fa-comments',
                onMouseDown: () => recordAdClick(pub.campId),
              }
            : undefined
        }
      />
    </div>
  );
};

/**
 * Normaliza un nombre de ubicación para compararlo: sin espacios sobrantes,
 * en minúsculas y sin tildes.
 *
 * Lo de las tildes importa porque el mismo departamento puede haber quedado
 * guardado como "Sacatepéquez" o "Sacatepequez" según de dónde venga el dato,
 * y una comparación cruda los daría por distintos. Mismo criterio que usa el
 * backend para normalizar handles.
 */
function normalizeLocation(value: string | null | undefined): string {
  return (value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, ''); // marcas diacríticas que NFD dejó sueltas
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
  const sentinelRef = useRef<HTMLDivElement>(null);
  // H12 — modo de visualización del catálogo: grid (default), lista o mapa.
  // La preferencia se recuerda en localStorage (`kq:listView`). El estado
  // inicial es 'grid' (SSR-safe); el useEffect lo hidrata desde storage.
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

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

  const categoriesQuery = usePublicationCategories();

  // ── Filtros server-side ─────────────────────────────────────────────────────
  // La barra guarda las DESCRIPCIONES que eligió el usuario ("Guatemala",
  // "Casa"); el backend filtra por ID de catálogo. Acá se traduce una cosa en
  // la otra. Los catálogos ya están en la caché de React Query porque la barra
  // los pide con los mismos hooks, así que esto no agrega requests.
  const citiesQuery = useCities(GUATEMALA);
  const selectedCity = (citiesQuery.data ?? []).find(
    (c: City) => c.description === filters.location,
  );
  const municipalitiesQuery = useMunicipalities(selectedCity ? selectedCity.city : null);
  const selectedMunicipality = (municipalitiesQuery.data ?? []).find(
    (m: Municipality) => m.description === filters.municipality,
  );
  const selectedCategory = (categoriesQuery.data ?? []).find(
    (c: PublicationCategory) => c.pubgen_description === filters.category,
  );

  const serverFilters = useMemo(
    () => ({
      cityId: selectedCity?.city ?? null,
      townId: selectedMunicipality?.municipality ?? null,
      categoryId: selectedCategory?.pubgen_id ?? null,
      priceMin: filters.priceMin,
      priceMax: filters.priceMax,
      roomsMin: filters.roomsMin,
      bathsMin: filters.bathsMin,
      sizeMin: filters.sizeMin,
      q: filters.search,
      amenityIds: filters.amenityIds,
    }),
    [
      selectedCity?.city,
      selectedMunicipality?.municipality,
      selectedCategory?.pubgen_id,
      filters.priceMin,
      filters.priceMax,
      filters.roomsMin,
      filters.bathsMin,
      filters.sizeMin,
      filters.search,
      filters.amenityIds,
    ],
  );

  // Scroll infinito paginado por cursor. El orden va al servidor: con
  // paginación no se puede ordenar en el cliente, porque solo se tiene la
  // página actual y el resto todavía no llegó.
  const publicationsQuery = useInfinitePublications(serverFilters, filters.sort, PAGE_SIZE);

  // El resumen por municipio cumple DOS funciones, y por eso se pide siempre y
  // no solo en la vista de mapa:
  //   1. Los pines del mapa, con el total real de cada municipio (si usara las
  //      publicaciones cargadas, mostraría los 12 de la primera tanda).
  //   2. El contador de resultados. Con paginación, `filteredAndSorted.length`
  //      es "lo que llevo cargado", no "cuántas hay" — decía 12 aunque hubiera
  //      600. La suma de los conteos del resumen sí es el total.
  // Cuesta ~800 bytes y usa exactamente los mismos filtros que el listado.
  const mapSummaryQuery = usePublicationsMap(serverFilters);
  const mapSummary = mapSummaryQuery.data;
  const totalResultados = useMemo(
    () =>
      mapSummary
        ? mapSummary.reduce((acc: number, fila: PublicationsMapEntry) => acc + fila.count, 0)
        : undefined,
    [mapSummary],
  );
  // Patrocinados (campañas) para intercalar en el feed.
  const featuredQuery = useFeaturedPublications(SPONSORED_POOL);

  // Las páginas ya llegaron filtradas y ordenadas por el servidor; acá solo se
  // aplanan en una lista continua para el grid.
  const publications = useMemo(
    () => (publicationsQuery.data?.pages ?? []).flatMap((page) => page.items),
    [publicationsQuery.data],
  );
  const categories = categoriesQuery.data ?? [];
  const sponsored = useMemo(() => featuredQuery.data ?? [], [featuredQuery.data]);
  const sponsoredIds = useMemo(
    () => new Set(sponsored.map((s: FeaturedPublication) => s.id)),
    [sponsored],
  );

  // Filtrar primero, ordenar después.
  //
  // ⚠️ Este filtrado ya NO es el mecanismo principal: el backend devuelve la
  // lista filtrada (ver el usePublications de arriba). Se conserva como red de
  // seguridad, por dos motivos concretos:
  //   1. Mientras los catálogos cargan, todavía no se resolvió el ID del
  //      departamento y la request sale sin ese filtro. Sin esta segunda pasada
  //      se verían por un instante publicaciones de otros departamentos.
  //   2. Con `placeholderData` se muestran los resultados del filtro anterior
  //      mientras llegan los nuevos, y esos ya no corresponden al filtro actual.
  // Sobre datos ya filtrados por el servidor no descarta nada, así que es
  // barato. Los criterios de las dos capas tienen que decir lo mismo: si se
  // cambia uno, cambiar el otro.
  const filteredAndSorted = useMemo(() => {
    const priceMin = Number(filters.priceMin) || 0;
    const priceMax = Number(filters.priceMax) || Number.POSITIVE_INFINITY;
    const roomsMin = Number(filters.roomsMin) || 0;
    const bathsMin = Number(filters.bathsMin) || 0;
    const sizeMin = Number(filters.sizeMin) || 0;
    // H12 — ubicación por catálogo: departamento y municipio llegan como las
    // descripciones del catálogo; las matcheamos por substring sobre los
    // campos de texto de la publicación (city/town/country).
    const departmentQuery = normalizeLocation(filters.location);
    const municipalityQuery = normalizeLocation(filters.municipality);
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

      // Ubicación: cada nivel se compara contra SU PROPIO campo.
      //
      // Antes se concatenaban country + city + town en un solo string y se
      // buscaba el término por substring sobre esa mezcla. Eso hacía que un
      // nivel matcheara contra otro: filtrando departamento "Guatemala"
      // entraban publicaciones de CUALQUIER departamento, porque el país
      // también se llama Guatemala y estaba en el mismo blob. Reportado con
      // una publicación de San Lucas Sacatepéquez apareciendo en el filtro
      // de Guatemala.
      //
      // El substring además cruzaba niveles al revés: el municipio "San Lucas
      // Sacatepéquez" contiene el nombre del departamento, así que filtrar por
      // departamento "Sacatepéquez" colaba municipios homónimos de otros
      // departamentos.
      //
      // `location` es el departamento (viene de useCities → cat_city, que en
      // la publicación es `city`) y `municipality` es el municipio (cat_town →
      // `town`). Ambos salen del MISMO catálogo que guarda la publicación, así
      // que la comparación correcta es de igualdad, no de substring.
      if (departmentQuery && normalizeLocation(publication.city) !== departmentQuery) {
        return false;
      }
      if (municipalityQuery && normalizeLocation(publication.town) !== municipalityQuery) {
        return false;
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
    // Sin `applySort`: el orden lo resuelve el servidor. Reordenar acá sería
    // peor que inútil — solo se tiene la página actual, así que ordenaría un
    // pedazo del resultado y las tandas siguientes entrarían desordenadas
    // respecto de las anteriores.
    return filtered;
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

  // ¿Hay algún filtro activo (cualquiera salvo el orden)? Con filtros activos
  // NO promovemos patrocinados: cada inmueble aparece en su posición natural
  // ("se reacomodan entre los resultados"). Sin filtros, los promovemos arriba
  // + intercalados estilo FB.
  const hasActiveFilters = Boolean(
    filters.search ||
      filters.category ||
      filters.priceMin ||
      filters.priceMax ||
      filters.roomsMin ||
      filters.bathsMin ||
      filters.sizeMin ||
      filters.location ||
      filters.municipality ||
      (filters.amenityIds && filters.amenityIds.length > 0),
  );

  // Feed orgánico: sin filtros, sacamos los patrocinados (se muestran como
  // promovidos) para no duplicar el mismo inmueble.
  const organicBase = useMemo(
    () =>
      hasActiveFilters
        ? filteredAndSorted
        : filteredAndSorted.filter((p) => !sponsoredIds.has(p.id)),
    [hasActiveFilters, filteredAndSorted, sponsoredIds],
  );

  // Ya no hace falta resetear un contador al cambiar de filtro: cada
  // combinación de filtros y orden es su propia queryKey, así que React Query
  // arranca esa búsqueda desde la primera página sola. Ese reseteo manual era
  // justamente donde se colaba el bug de "cambié el filtro y sigo viendo
  // resultados del anterior".

  // El sentinel ahora PIDE la página siguiente en vez de revelar más de un
  // array ya descargado. Visualmente es el mismo scroll infinito de siempre.
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = publicationsQuery;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        // El guard de isFetchingNextPage no es opcional: sin él, mientras la
        // request está en vuelo el sentinel sigue visible y dispara una tanda
        // por cada frame en que se intersecta.
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const visibleOrganic = organicBase;
  const hasMore = Boolean(hasNextPage);

  // Feed final renderizado en el grid (orgánicas + patrocinados intercalados).
  const feed: FeedEntry[] = hasActiveFilters
    ? visibleOrganic.map((pub) => ({ kind: 'organic', pub }))
    : buildInterleavedFeed(visibleOrganic, sponsored, SPONSORED_LEAD, SPONSORED_EVERY);
  const firstOrganicId = organicBase[0]?.id;

  const isLoading = publicationsQuery.isLoading || categoriesQuery.isLoading;
  const error = publicationsQuery.error || categoriesQuery.error;

  const clearAllFilters = () => {
    setFilters({ ...INITIAL_FILTERS });
  };

  const cardsGrid = (
    <div className={`pub-grid ${viewMode === 'list' ? 'is-rows' : ''}`}>
      {feed.map((entry) =>
        entry.kind === 'sponsored' ? (
          <SponsoredFeedCard key={`spon-${entry.pub.campId}-${entry.slot}`} pub={entry.pub} />
        ) : (
          <PublicationCard
            key={entry.pub.id}
            publication={entry.pub}
            isNew={filters.sort === 'recent' && entry.pub.id === firstOrganicId}
            isFeatured={false}
          />
        ),
      )}
    </div>
  );

  return (
    <main>
      <Breadcrumbs
        breadcrumbTitle={t('listing.breadcrumbTitle')}
        breadcrumbSubTitle={t('listing.breadcrumbTitle')}
      />

      <section className="artworks-area pt-130 pb-90">
        <div className="pub-shell">
          {/* H12 — barra de filtros cohesiva: filtros + orden + toggle de vista. */}
          <PublicationsBar
            key={categories.length}
            filters={filters}
            categories={categories}
            resultCount={isLoading || error ? undefined : totalResultados}
            onFiltersChange={setFilters}
            viewMode={viewMode}
            onViewChange={changeView}
          />

          {/* Los patrocinados ya no van en una sección aparte: se intercalan
              dentro del mismo grid (feed unificado estilo FB) — ver `feed`. */}

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
              {viewMode === 'map' && (
                <div className="pub-maplayout">
                  <div className="pub-grid is-rows pub-maplist">
                    {filteredAndSorted.slice(0, 40).map((publication) => (
                      <PublicationCard
                        key={publication.id}
                        publication={publication}
                        isFeatured={false}
                      />
                    ))}
                  </div>
                  <div className="pub-mapcanvas">
                    <PropertiesMap publications={filteredAndSorted} summary={mapSummary} />
                  </div>
                </div>
              )}

              {viewMode !== 'map' && (
                <>
                  {feed.length > 0 ? (
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
                            visible: visibleOrganic.length,
                            total: organicBase.length,
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
        /* Contenedor más ancho que el .container de Bootstrap (~1140px): el
           listado del mockup es full-width con padding → caben los 8 filtros
           en una fila y 4 cards por fila. */
        .pub-shell {
          max-width: 1340px;
          margin: 0 auto;
          padding: 0 24px;
        }
        @media (max-width: 575px) {
          .pub-shell {
            padding: 0 16px;
          }
        }

        /* ── Grid de tarjetas ──
           OJO: cardsGrid se define como const fuera del return, así que
           styled-jsx NO le pone la clase de scope al <div.pub-grid> → las
           reglas scopeadas no matchean y las cards se apilan (display:block).
           Por eso TODAS las reglas del grid van con :global(). .pub-grid es
           único del listado, así que el global no filtra a otras pantallas. */
        :global(.pub-grid) {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 22px;
          margin-bottom: 30px;
        }
        /* Bootstrap envuelve cada card en un col-* con max-width 33/50%; lo
           neutralizamos para que cada celda ocupe el ancho completo. Selector
           DESCENDIENTE (no hijo directo): la card orgánica es hija directa
           del grid, pero la patrocinada va dentro de .pub-spon, así ambas
           quedan a ancho completo de su celda. */
        :global(.pub-grid [class*='col-']) {
          flex: none !important;
          width: 100% !important;
          max-width: 100% !important;
          padding-left: 0 !important;
          padding-right: 0 !important;
        }
        :global(.pub-grid .pub-card) {
          margin-bottom: 0 !important;
        }
        /* Celda patrocinada: wrapper que captura el clic de campaña. Flex para
           que la card interna (col-* neutralizada) estire a la altura de la
           celda igual que las orgánicas. En vista lista hereda el reflow a fila
           vía las reglas .pub-grid.is-rows .pub-card. */
        :global(.pub-grid .pub-spon) {
          display: flex;
        }
        /* Vista LISTA = una columna; la card se reflowea a fila horizontal. */
        :global(.pub-grid.is-rows) {
          grid-template-columns: 1fr;
          gap: 16px;
        }
        :global(.pub-grid.is-rows .pub-card) {
          flex-direction: row;
          align-items: stretch;
        }
        :global(.pub-grid.is-rows .pub-photo) {
          width: 260px;
          flex-shrink: 0;
          padding-top: 0;
          min-height: 190px;
        }
        :global(.pub-grid.is-rows .pub-body) {
          flex: 1;
          min-width: 0;
        }
        /* Handoff #14 §1 — botón "Enviar mensaje" (pautada de mensajes) visible
           solo en vista lista, como pill a la derecha. En lista se oculta el CTA
           full-width (.pub-cta-row) porque el pill lo reemplaza. */
        :global(.pub-grid.is-rows .pub-list-cta) {
          display: inline-flex;
        }
        :global(.pub-grid.is-rows .pub-cta-row) {
          display: none;
        }
        @media (max-width: 575px) {
          :global(.pub-grid.is-rows .pub-card) {
            flex-direction: column;
          }
          :global(.pub-grid.is-rows .pub-photo) {
            width: 100%;
            padding-top: 66.67%;
            min-height: 0;
          }
        }

        /* ── Vista mapa: split lista + mapa ── */
        .pub-maplayout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 20px;
          align-items: start;
          margin-bottom: 30px;
        }
        .pub-maplist {
          max-height: 78vh;
          overflow-y: auto;
          padding-right: 4px;
          margin-bottom: 0;
        }
        .pub-mapcanvas {
          position: sticky;
          top: 90px;
        }
        @media (max-width: 991px) {
          .pub-maplayout {
            grid-template-columns: 1fr;
          }
          .pub-mapcanvas {
            position: static;
          }
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
      `}</style>
    </main>
  );
};

export default PublicationsMain;
