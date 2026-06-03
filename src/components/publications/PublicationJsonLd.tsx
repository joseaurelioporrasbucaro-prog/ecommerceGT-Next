import React from 'react';
import type { PublicationSeoData } from '@/utils/publicationSeo';

/**
 * Fase 18.1 — Schema.org JSON-LD para una publicación.
 *
 * Emite un script `application/ld+json` con un objeto Product (más
 * universal y mejor soportado que RealEstateListing en rich results
 * de Google a 2026; RealEstateListing aún tiene cobertura limitada).
 *
 * Mapeo:
 *   - @type           → Product
 *   - name            → pub_title
 *   - description     → pub_description
 *   - image[]         → URLs absolutas de las fotos
 *   - offers.price    → pubdet_price
 *   - offers.priceCurrency → 'GTQ' | 'USD'
 *   - offers.availability → InStock si pubsta=2 (activa); else OutOfStock
 *   - additionalProperty[] → habitaciones, baños, parqueos, m² (cuando aplica)
 *   - category        → "Casa" / "Apartamento" / "Terreno"
 *
 * Renderizamos desde el SERVER COMPONENT (sin "use client"). Como es un
 * <script> con contenido pre-serializado, no necesita interactividad.
 */
interface Props {
  publication: PublicationSeoData;
  /** URL absoluta del sitio — para construir @id y url canónicas. */
  siteUrl: string;
}

const CATEGORY_LABELS: Record<number, string> = {
  1: 'Casa',
  2: 'Apartamento',
  3: 'Terreno',
};

const PublicationJsonLd: React.FC<Props> = ({ publication, siteUrl }) => {
  const url = `${siteUrl}/publications/${publication.id}`;
  const category =
    publication.categoryId != null
      ? CATEGORY_LABELS[publication.categoryId] ?? 'Propiedad'
      : 'Propiedad';

  // pubsta_id no viene en SeoData (no lo necesitábamos para metadata) — si
  // hay precio asumimos disponibilidad InStock. Si querés ser más estricto,
  // exponer pubsta_id en PublicationSeoData y mapear 2→InStock, 3→SoldOut,
  // 4→Discontinued.
  const availability =
    publication.price && publication.price > 0
      ? 'https://schema.org/InStock'
      : 'https://schema.org/LimitedAvailability';

  const additionalProperty: Array<{
    '@type': 'PropertyValue';
    name: string;
    value: number;
    unitText?: string;
  }> = [];
  if (publication.rooms != null) {
    additionalProperty.push({
      '@type': 'PropertyValue',
      name: 'Habitaciones',
      value: publication.rooms,
    });
  }
  if (publication.bathrooms != null) {
    additionalProperty.push({
      '@type': 'PropertyValue',
      name: 'Baños',
      value: publication.bathrooms,
    });
  }
  if (publication.parking != null) {
    additionalProperty.push({
      '@type': 'PropertyValue',
      name: 'Parqueos',
      value: publication.parking,
    });
  }
  if (publication.size != null) {
    additionalProperty.push({
      '@type': 'PropertyValue',
      name: 'Tamaño del terreno',
      value: publication.size,
      unitText: 'm²',
    });
  }

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': url,
    url,
    name: publication.title,
    description: publication.description || publication.title,
    category,
    ...(publication.images.length > 0 && { image: publication.images }),
    ...(publication.address && {
      // No usamos PostalAddress completo porque solo tenemos texto libre.
      // Schema acepta string en address.
      address: publication.address,
    }),
    ...(publication.price && publication.price > 0 && {
      offers: {
        '@type': 'Offer',
        priceCurrency: publication.currency || 'GTQ',
        price: publication.price,
        availability,
        url,
      },
    }),
    ...(additionalProperty.length > 0 && { additionalProperty }),
    ...(publication.publishedAt && { datePublished: publication.publishedAt }),
  };

  return (
    <script
      type="application/ld+json"
      // dangerouslySetInnerHTML es la forma estándar de inyectar JSON-LD en
      // React. JSON.stringify garantiza que no haya tokens inválidos.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};

export default PublicationJsonLd;
