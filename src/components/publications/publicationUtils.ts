import type { AnyPublicationListItem, PublicationDetail, PublicationImage, PublicationListItemAuth } from '@/types/api';
import { getBackendUrl } from '@/utils/backendUrl';

export const PUBLICATION_PLACEHOLDER_IMAGE = '/assets/img/art/art1.jpg';

export function formatPrice(price: number | string | null | undefined): string {
  if (price === null || price === undefined || price === '') {
    return 'Precio por consultar';
  }

  const numericPrice = Number(price);
  if (!Number.isFinite(numericPrice)) {
    return `Q ${price}`;
  }

  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
    maximumFractionDigits: 0,
  }).format(numericPrice);
}

export function getPublicationListImage(publication: AnyPublicationListItem): string {
  const imagePath = publication.image || publication.images[0]?.url;
  return imagePath ? getBackendUrl(imagePath) : PUBLICATION_PLACEHOLDER_IMAGE;
}

export function getPublicationImagePath(image: PublicationImage): string {
  return image.pubima_url || image.url || '';
}

export function getPublicationDetailImages(publication: PublicationDetail): string[] {
  const images = publication.images
    .map((image) => getPublicationImagePath(image))
    .filter((imagePath) => imagePath !== '')
    .map((imagePath) => getBackendUrl(imagePath));

  return images.length > 0 ? images : [PUBLICATION_PLACEHOLDER_IMAGE];
}

export function isPublicationListItemAuth(
  publication: AnyPublicationListItem,
): publication is PublicationListItemAuth {
  return 'isFavorite' in publication;
}

export function formatNumberValue(value: number | null | undefined, fallback = 'No especificado'): string {
  if (value === null || value === undefined) {
    return fallback;
  }

  return String(value);
}
