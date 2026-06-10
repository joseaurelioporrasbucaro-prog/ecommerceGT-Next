// ============================================================================
// Fase 22 — Helper para construir URLs de publicaciones (Aurelio 2026-06-05).
//
// Antes los componentes hacían:
//   <Link href={`/publications/${publication.id}`}>
//
// Esto exponía el `pub_id` numérico, permitiendo enumeración manual
// (cambiar 124 → 125 y leer otra publicación). Ahora usamos el slug SEO
// (`casa-zona-15-aBxYz9`) que es impredecible.
//
// Para no romper publicaciones legacy que aún no tienen slug, este helper
// hace fallback al id cuando el slug es null/undefined/vacío. El backend
// acepta ambos y responde 301 redirect del id al slug si está disponible.
// ============================================================================

interface PublicationLike {
  /** Listado (`PublicationListItem`) o cards: viene como `id`. */
  id?: number | string;
  /** Detalle (`PublicationDetail`): viene como `pub_id`. */
  pub_id?: number | string;
  /** Listado: viene como `slug`. */
  slug?: string | null;
  /** Detalle: viene como `pub_slug`. */
  pub_slug?: string | null;
}

/**
 * Devuelve el segmento canónico para la URL `/publications/<segmento>`.
 *
 * Preferencia: slug > pub_slug > id > pub_id. Si nada llega, devuelve
 * cadena vacía (el llamador debería evitar renderizar el link).
 *
 * Ejemplos:
 *   publicationPath({ id: 123, slug: 'casa-zona-15-aBxYz9' })
 *     → '/publications/casa-zona-15-aBxYz9'
 *   publicationPath({ id: 123, slug: null })   // legacy sin backfill
 *     → '/publications/123'
 *   publicationPath({ pub_id: 7, pub_slug: 'apartamento-vista-CnEd2K' })
 *     → '/publications/apartamento-vista-CnEd2K'
 */
export function publicationPath(publication: PublicationLike): string {
  const slug = publication.slug || publication.pub_slug;
  if (slug && typeof slug === 'string' && slug.length > 0) {
    return `/publications/${slug}`;
  }
  const id = publication.id ?? publication.pub_id;
  if (id !== undefined && id !== null && String(id).length > 0) {
    return `/publications/${id}`;
  }
  return '';
}

/**
 * Igual que `publicationPath` pero solo devuelve el segmento sin el prefijo
 * — útil cuando ya armaste el path base (ej. encodeURIComponent en redirects
 * a /login).
 */
export function publicationIdentifier(publication: PublicationLike): string {
  const slug = publication.slug || publication.pub_slug;
  if (slug && typeof slug === 'string' && slug.length > 0) return slug;
  const id = publication.id ?? publication.pub_id;
  return id !== undefined && id !== null ? String(id) : '';
}
