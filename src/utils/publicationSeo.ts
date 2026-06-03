/**
 * Fase 18.1 — helpers de SEO para páginas de publicación.
 *
 * Centraliza:
 *  - fetch al detalle público (server-side, sin React Query — corre desde
 *    generateMetadata que es función plana del servidor).
 *  - resolución de URLs de imágenes en absoluto (necesario para OG:image
 *    porque las redes resuelven la URL sin contexto del frontend).
 *  - normalización a un shape acotado y seguro (`PublicationSeoData`)
 *    que solo expone los campos que SEO + JSON-LD necesitan.
 *
 * No usa React — todo runtime de servidor / build.
 */

import { getBackendUrl } from './backendUrl';
import { getImageVariant } from './imageVariants';

export interface PublicationSeoData {
  id: number;
  title: string;
  description: string;
  /** URLs ABSOLUTAS, listas para usar en og:image / JSON-LD. */
  images: string[];
  price: number | null;
  currency: string; // 'GTQ' | 'USD'
  address: string | null;
  rooms: number | null;
  bathrooms: number | null;
  parking: number | null;
  /** Metros cuadrados, solo para terrenos. */
  size: number | null;
  /** Categoría: 1 Casa, 2 Apto, 3 Terreno. */
  categoryId: number | null;
  /** Transacción: aproximación a venta o alquiler para Schema.org. */
  transactionId: number | null;
  /** ISO date string del backend. */
  publishedAt: string | null;
}

interface BackendPublication {
  pub_id: number;
  pub_title?: string;
  pub_description?: string;
  pub_address?: string;
  pubgen_id?: number;
  pubtra_id?: number;
  pubsta_id?: number;
  pub_create_date?: string;
  pubdet_price?: number | string | null;
  pubdet_currency?: string | null;
  pubdet_rooms?: number | null;
  pubdet_bathrooms?: number | null;
  pubdet_parking?: number | null;
  pubdet_size?: number | null;
  images?: Array<{ url?: string; pubima_url?: string }>;
}

/**
 * Construye URL absoluta para OG. Las redes sociales NO ejecutan JS y
 * acceden a la URL desde su crawler, así que necesitan absoluta. Resuelve
 * relativas con `getBackendUrl` y deja absolutas como están.
 */
function absoluteImageUrl(src: string | null | undefined): string | null {
  if (!src) return null;
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  const variant = getImageVariant(src, 'card');
  const resolved = getBackendUrl(variant);
  // getBackendUrl puede devolver '' si recibe vacío.
  if (!resolved || (!resolved.startsWith('http://') && !resolved.startsWith('https://'))) {
    return null;
  }
  return resolved;
}

/**
 * Fetch directo al detalle público desde el SERVIDOR. No usamos ApiFetch
 * porque ApiFetch añade cookies del browser — acá estamos en SSR.
 *
 * Cache: revalidamos cada 5 minutos. Suficiente para SEO (Google no llega
 * cada minuto a tus pages) y evita golpear al backend en cada crawler hit.
 */
export async function fetchPublicationForSEO(
  id: string,
): Promise<PublicationSeoData | null> {
  // Solo procesamos IDs enteros — el endpoint usa decryption por id; aquí
  // pasamos el id encriptado tal cual nos lo dio Next via params.
  if (!id) return null;

  const backend = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const url = `${backend}/publication/${encodeURIComponent(id)}`;

  try {
    const res = await fetch(url, {
      // Revalidación cada 5 min. Google + redes no necesitan más frescura.
      next: { revalidate: 300 },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as BackendPublication | { message: string };
    if (!body || typeof body !== 'object') return null;
    if (!('pub_id' in body)) return null;

    const pub = body as BackendPublication;

    const imageUrls: string[] = (pub.images || [])
      .map((img) => absoluteImageUrl(img.url ?? img.pubima_url ?? null))
      .filter((u): u is string => !!u);

    const priceNum =
      pub.pubdet_price === null || pub.pubdet_price === undefined
        ? null
        : Number(pub.pubdet_price);

    return {
      id: pub.pub_id,
      title: (pub.pub_title || 'Propiedad').trim(),
      description: (pub.pub_description || '').trim(),
      images: imageUrls,
      price: Number.isFinite(priceNum as number) ? (priceNum as number) : null,
      currency: pub.pubdet_currency || 'GTQ',
      address: pub.pub_address?.trim() || null,
      rooms: pub.pubdet_rooms ?? null,
      bathrooms: pub.pubdet_bathrooms ?? null,
      parking: pub.pubdet_parking ?? null,
      size: pub.pubdet_size ?? null,
      categoryId: pub.pubgen_id ?? null,
      transactionId: pub.pubtra_id ?? null,
      publishedAt: pub.pub_create_date ?? null,
    };
  } catch {
    // SSR fetch falla por cualquier motivo (timeout, red, etc.) — devolver
    // null para que generateMetadata caiga al fallback.
    return null;
  }
}
