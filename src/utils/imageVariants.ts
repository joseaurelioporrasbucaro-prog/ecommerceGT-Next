/**
 * Helper para construir URLs de variantes optimizadas de imágenes.
 *
 * El backend (`POST /upload`) genera 3 variantes con sharp además del original:
 *   - thumb  (200x150)   — thumbnails de navegación
 *   - card   (800x800)   — cards del listado, cuadradas
 *   - detail (1600x900)  — imagen principal de la galería
 *
 * Las variantes son archivos JPEG con sufijo (ej. `1234-foo.jpg` →
 * `1234-foo_card.jpg`). El componente que renderiza la imagen debe tener
 * un onError que caiga al original si la variante no existe (publicaciones
 * viejas creadas antes de Fase 5.4 no tienen variantes en disco).
 */
export type ImageVariant = 'thumb' | 'card' | 'detail';

/**
 * Dado un path de imagen original (ej. `/uploads/images/123-foo.jpg`),
 * devuelve el path de la variante (ej. `/uploads/images/123-foo_card.jpg`).
 *
 * Si el path está vacío, ya tiene sufijo de variante, o no es un upload del
 * backend (ej. URL absoluta a otro host), retorna el path tal cual sin
 * modificar — para que el caller no tenga que casos-especiales.
 */
export function getImageVariant(
  originalPath: string | null | undefined,
  variant: ImageVariant,
): string {
  if (!originalPath) return '';

  // No tocar URLs absolutas a otros hosts.
  if (/^https?:\/\//i.test(originalPath) && !originalPath.includes('/uploads/images/')) {
    return originalPath;
  }

  const lastDot = originalPath.lastIndexOf('.');
  const lastSlash = originalPath.lastIndexOf('/');
  // Si no hay punto, o el punto está antes del último slash (no es extensión),
  // devolver el path tal cual.
  if (lastDot < 0 || lastDot < lastSlash) return originalPath;

  const base = originalPath.slice(0, lastDot);

  // Si ya tiene sufijo de variante, no doblar.
  if (/_(thumb|card|detail)$/.test(base)) return originalPath;

  return `${base}_${variant}.jpg`;
}
