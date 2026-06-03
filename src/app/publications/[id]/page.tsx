import PublicationDetailsMain from '@/components/publications/PublicationDetailsMain';
import PublicationJsonLd from '@/components/publications/PublicationJsonLd';
import Wrapper from '@/layout/DefaultWrapper';
import { fetchPublicationForSEO } from '@/utils/publicationSeo';
import type { Metadata } from 'next';
import React from 'react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kiosqui.gt';

/**
 * Fase 18.1 — metadata dinámico por publicación.
 *
 * generateMetadata corre en el servidor antes de renderizar. Usamos
 * `fetchPublicationForSEO()` que hace fetch público al backend (el
 * endpoint /publication/:id usa authMiddlewareAux, así que funciona sin
 * cookie). Si falla devuelve null y usamos metadata fallback — preferimos
 * no romper la página por un error de SEO.
 *
 * Lo que armamos:
 *  - title  = pub_title (template del root añade " | KIOSQUI")
 *  - description = pub_description truncado a ~160 chars
 *  - openGraph: type article, primera imagen, alt = título
 *  - twitter: summary_large_image
 *  - canonical apuntando a la URL real
 */
export async function generateMetadata(
  { params }: { params: { id: string } },
): Promise<Metadata> {
  const pub = await fetchPublicationForSEO(params.id);
  if (!pub) {
    return {
      title: 'Publicación no encontrada',
      description:
        'La publicación que buscás puede haberse retirado o no existir en KIOSQUI.',
    };
  }

  const desc = (pub.description || '').slice(0, 160);
  const url = `/publications/${pub.id}`;

  return {
    title: pub.title,
    description: desc || pub.title,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: pub.title,
      description: desc || pub.title,
      url,
      images: pub.images.length > 0
        ? pub.images.map((src) => ({ url: src, width: 1200, height: 800, alt: pub.title }))
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: pub.title,
      description: desc || pub.title,
      images: pub.images.slice(0, 1),
    },
  };
}

const PublicationDetailsPage = async (
  { params }: { params: { id: string } },
) => {
  // Fase 18.1 — re-fetch para JSON-LD. La cache de Next deduplica con la
  // llamada de generateMetadata (mismo URL, mismas opciones), así que NO
  // hace doble request. El JSON-LD viaja en SSR directamente al HTML
  // inicial — Google y otros crawlers lo ven sin necesidad de JS.
  const pub = await fetchPublicationForSEO(params.id);

  return (
    <Wrapper>
      {pub && <PublicationJsonLd publication={pub} siteUrl={SITE_URL} />}
      <main>
        <PublicationDetailsMain id={params.id} />
      </main>
    </Wrapper>
  );
};

export default PublicationDetailsPage;
