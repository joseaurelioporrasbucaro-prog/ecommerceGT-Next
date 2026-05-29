import type { AnyPublicationListItem, PublicationDetail, PublicationImage, PublicationImageGlb, PublicationListItemAuth } from '@/types/api';
import { getBackendUrl } from '@/utils/backendUrl';

// ============================================================================
// Dimensiones recomendadas (para placeholder y para subir imágenes)
// ============================================================================

/** Card del listado: cuadrada (igual al scaffold), tarjetas más grandes y prolijas. */
export const CARD_IMAGE_DIMENSIONS = { width: 800, height: 800 } as const;

/** Imagen principal del detalle: 16:9 con object-fit: contain (estilo Facebook). */
export const DETAIL_IMAGE_DIMENSIONS = { width: 1600, height: 900 } as const;

/** Thumbnail de galería en detalle. */
export const THUMB_IMAGE_DIMENSIONS = { width: 200, height: 150 } as const;

// ============================================================================
// Placeholder SVG con dimensiones recomendadas
// ============================================================================

/**
 * Genera un data-URI con un SVG que muestra las dimensiones recomendadas.
 * Reemplaza la imagen cuando no existe o falla al cargar (404).
 */
export function buildPlaceholderSvg(width: number, height: number): string {
  const fontSize = Math.max(Math.floor(width / 16), 32);
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">`,
    `<rect width="100%" height="100%" fill="#1f1d2b"/>`,
    `<rect x="2" y="2" width="${width - 4}" height="${height - 4}" fill="none" stroke="#3a3852" stroke-width="2" stroke-dasharray="12 8"/>`,
    `<text x="50%" y="48%" font-family="Arial,sans-serif" font-size="${fontSize}" font-weight="bold" fill="#9b98c5" text-anchor="middle" dominant-baseline="middle">${width} × ${height}</text>`,
    `<text x="50%" y="58%" font-family="Arial,sans-serif" font-size="${Math.floor(fontSize * 0.5)}" fill="#6a6889" text-anchor="middle" dominant-baseline="middle">Sube una imagen ${width}×${height}px</text>`,
    `</svg>`,
  ].join('');
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const CARD_PLACEHOLDER = buildPlaceholderSvg(
  CARD_IMAGE_DIMENSIONS.width,
  CARD_IMAGE_DIMENSIONS.height,
);
export const DETAIL_PLACEHOLDER = buildPlaceholderSvg(
  DETAIL_IMAGE_DIMENSIONS.width,
  DETAIL_IMAGE_DIMENSIONS.height,
);
export const THUMB_PLACEHOLDER = buildPlaceholderSvg(
  THUMB_IMAGE_DIMENSIONS.width,
  THUMB_IMAGE_DIMENSIONS.height,
);

// ============================================================================
// Formato de precios y números
// ============================================================================

/**
 * Formatea precio con separador de miles (coma) y decimales (punto), estilo
 * `Q 1,250,000.00` o `$ 32,500.00`. Si la moneda no se especifica, asume GTQ
 * (publicaciones legacy creadas antes de la columna `pubdet_currency`).
 */
export function formatPrice(
  price: number | string | null | undefined,
  currency?: string | null,
): string {
  if (price === null || price === undefined || price === '') {
    return 'Precio por consultar';
  }

  const numericPrice = Number(price);
  if (!Number.isFinite(numericPrice)) {
    return `${currency === 'USD' ? '$' : 'Q'} ${price}`;
  }

  const isUsd = currency === 'USD';
  // Usamos en-US para garantizar coma=miles, punto=decimal (Intl con GTQ a veces
  // mete espacio fino o usa punto como miles según la versión de ICU del runtime).
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericPrice);
  return `${isUsd ? '$' : 'Q'} ${formatted}`;
}

export function formatNumberValue(value: number | null | undefined, fallback = 'No especificado'): string {
  if (value === null || value === undefined) {
    return fallback;
  }

  return String(value);
}

// ============================================================================
// Resolución de imágenes
// ============================================================================

/** Devuelve URL absoluta de la imagen del listado, o `null` si no hay. */
export function getPublicationListImage(publication: AnyPublicationListItem): string | null {
  const imagePath = publication.image || publication.images[0]?.url;
  return imagePath ? getBackendUrl(imagePath) : null;
}

/**
 * Devuelve todas las imágenes únicas de la publicación (principal + galería).
 * Útil para el efecto de hover-gallery en cards.
 */
export function getPublicationListAllImages(publication: AnyPublicationListItem): string[] {
  const result: string[] = [];
  const seen = new Set<string>();

  const push = (path: string | null | undefined) => {
    if (!path) return;
    const url = getBackendUrl(path);
    if (url && !seen.has(url)) {
      seen.add(url);
      result.push(url);
    }
  };

  push(publication.image);
  // Fase 10.3 fix: el endpoint /featured-publications devuelve solo `image`
  // (sin galería), por lo que `images` puede ser undefined al hacer cast.
  publication.images?.forEach((img) => push(img.url));
  return result;
}

export function getPublicationListAllImagesGlb(publication: AnyPublicationListItem): string[] {
  const result: string[] = [];
  const seen = new Set<string>();

  const push = (path: string | null | undefined) => {
    if (!path) return;
    const url = getBackendUrl(path);
    if (url && !seen.has(url)) {
      seen.add(url);
      result.push(url);
    }
  };
  //push(publication.image);
  publication.imagesglb.forEach((img) => push(img.url));
  return result;
}

/** Detecta si una categoría es terreno (no aplican habitaciones/baños/parqueos). */
export function isLandCategory(category: string | null | undefined): boolean {
  if (!category) return false;
  const lower = category.toLowerCase();
  return lower.includes('terreno') || lower.includes('lote') || lower.includes('solar');
}

// ============================================================================
// Estados de publicación (cat_publication_status del backend)
// ============================================================================

export const PUBSTA_DRAFT = 1;
export const PUBSTA_PUBLISHED = 2;
export const PUBSTA_SOLD = 3;
export const PUBSTA_VOID = 4;

export interface StatusBadge {
  label: string;
  color: string;
}

/**
 * Badge a renderizar según el estado de la publicación,
 * o null si está publicada activa (no se muestra badge).
 */
export function getStatusBadge(pubstaId: number | null | undefined): StatusBadge | null {
  if (pubstaId === PUBSTA_SOLD) return { label: 'Vendida', color: '#ef4444' };
  if (pubstaId === PUBSTA_DRAFT) return { label: 'Borrador', color: '#9ca3af' };
  if (pubstaId === PUBSTA_VOID) return { label: 'Anulada', color: '#6b7280' };
  return null;
}

export interface PublicationStatusInfo {
  label: string;
  sublabel: string;
  color: string;
  /** Estados donde NO se permite interacción (comentar, contactar, favear). */
  isClosed: boolean;
}

/**
 * Etiqueta detallada del estado para mostrar en el detalle (meta-grid).
 * Devuelve color, sub-etiqueta descriptiva y bandera `isClosed` para que la UI
 * pueda deshabilitar acciones (comentar, contactar) en publicaciones cerradas.
 */
export function getPublicationStatusInfo(pubstaId: number | null | undefined): PublicationStatusInfo {
  switch (pubstaId) {
    case PUBSTA_SOLD:
      return { label: 'Vendida', sublabel: 'Ya no está disponible', color: '#ef4444', isClosed: true };
    case PUBSTA_VOID:
      return { label: 'Anulada', sublabel: 'Retirada por el vendedor', color: '#6b7280', isClosed: true };
    case PUBSTA_DRAFT:
      return { label: 'Borrador', sublabel: 'No publicada todavía', color: '#9ca3af', isClosed: true };
    case PUBSTA_PUBLISHED:
    default:
      return { label: 'Disponible', sublabel: 'Publicación activa', color: '#2ed573', isClosed: false };
  }
}

export function getPublicationImagePath(image: PublicationImage): string {
  return image.pubima_url || image.url || '';
}

export function getPublicationImagePathGlb(imageglb: PublicationImageGlb): string {
  return imageglb.pubimaglb_url || imageglb.url || '';
}

/** Devuelve URLs absolutas de la galería del detalle, o array vacío. */
export function getPublicationDetailImages(publication: PublicationDetail): string[] {
  return publication.images
    .map((image) => getPublicationImagePath(image))
    .filter((imagePath) => imagePath !== '')
    .map((imagePath) => getBackendUrl(imagePath));
}
export function getPublicationDetailImagesGlb(publication: PublicationDetail): string[] {
  return publication.images
    .map((image) => getPublicationImagePath(image))
    .filter((imagePath) => imagePath !== '')
    .map((imagePath) => getBackendUrl(imagePath));
}

// ============================================================================
// Type guards
// ============================================================================

export function isPublicationListItemAuth(
  publication: AnyPublicationListItem,
): publication is PublicationListItemAuth {
  return 'isFavorite' in publication;
}

// ============================================================================
// Iconos de categoría
// ============================================================================

/**
 * Devuelve la ruta del SVG personalizado para una categoría inmobiliaria.
 *
 * Convención: subir los archivos a `public/assets/img/property-categories/`
 * con los nombres `casa.svg`, `apartamento.svg`, `terreno.svg`, `local.svg`, `bodega.svg`.
 *
 * Si no existe el SVG personalizado, devuelve `null` y el componente cae al icono Font Awesome.
 */
export function getCategoryIconPath(description: string): string | null {
  const lower = description.toLowerCase();
  if (lower.includes('casa') || lower.includes('habit')) return '/assets/img/property-categories/casa.svg';
  if (lower.includes('apto') || lower.includes('apart') || lower.includes('edif')) return '/assets/img/property-categories/apartamento.svg';
  if (lower.includes('terreno') || lower.includes('lote') || lower.includes('solar')) return '/assets/img/property-categories/terreno.svg';
  if (lower.includes('local') || lower.includes('comerc') || lower.includes('oficina')) return '/assets/img/property-categories/local.svg';
  if (lower.includes('bodega') || lower.includes('industri')) return '/assets/img/property-categories/bodega.svg';
  return null;
}

/** Icono Font Awesome de fallback si el SVG personalizado no existe. */
export function getCategoryFallbackIcon(description: string): string {
  const lower = description.toLowerCase();
  if (lower.includes('casa') || lower.includes('habit')) return 'fa-home';
  if (lower.includes('apto') || lower.includes('apart') || lower.includes('edif')) return 'fa-building';
  if (lower.includes('terreno') || lower.includes('lote') || lower.includes('solar')) return 'fa-map';
  if (lower.includes('local') || lower.includes('comerc') || lower.includes('oficina')) return 'fa-store';
  if (lower.includes('bodega') || lower.includes('industri')) return 'fa-warehouse';
  return 'fa-tag';
}

// ============================================================================
// Iconos de características (habitaciones, baños, parqueos, ubicación)
// ============================================================================

/**
 * Mapeo de feature → ruta del SVG en `public/assets/img/property-icons/`.
 * Si el archivo no existe, el componente cae al icono Font Awesome.
 *
 * Convención de archivos (Flaticon, atribución en footer):
 * - habitacion.svg  → cama (Freepik)
 * - bano.svg        → baño (smalllikeart)
 * - parqueo.svg     → auto (Freepik)
 * - ubicacion.svg   → mapa (Freepik)
 */
export type PropertyFeature =
  | 'rooms'
  | 'bathrooms'
  | 'parking'
  | 'location'
  | 'size'
  | 'level'
  | 'country'
  | 'state'
  | 'town'
  | 'address';

export function getPropertyIconPath(feature: PropertyFeature): string | null {
  switch (feature) {
    case 'rooms': return '/assets/img/property-icons/habitacion.svg';
    case 'bathrooms': return '/assets/img/property-icons/bano.svg';
    case 'parking': return '/assets/img/property-icons/parqueo.svg';
    case 'location': return '/assets/img/property-icons/ubicacion.svg';
    default: return null;
  }
}

export function getPropertyFallbackIcon(feature: PropertyFeature): string {
  switch (feature) {
    case 'rooms': return 'fa-bed';
    case 'bathrooms': return 'fa-bath';
    case 'parking': return 'fa-car';
    case 'location': return 'fa-map-marker-alt';
    case 'address': return 'fa-location-arrow';
    case 'size': return 'fa-ruler-combined';
    case 'level': return 'fa-layer-group';
    case 'country': return 'fa-flag';
    case 'state': return 'fa-map';
    case 'town': return 'fa-map-pin';
    default: return 'fa-info-circle';
  }
}

// ============================================================================
// Sort
// ============================================================================

export type SortOption = 'recent' | 'price-asc' | 'price-desc';

export const SORT_OPTIONS: Array<{ id: number; option: string; value: SortOption }> = [
  { id: 1, option: 'Más recientes', value: 'recent' },
  { id: 2, option: 'Menor precio', value: 'price-asc' },
  { id: 3, option: 'Mayor precio', value: 'price-desc' },
];
