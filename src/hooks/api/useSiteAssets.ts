import { useQuery } from '@tanstack/react-query';
import { ApiFetch } from '@/utils/Api';
import { getBackendUrl } from '@/utils/backendUrl';

/**
 * Fase 15 — Portal de gestión de imágenes (CMS-lite).
 *
 * `GET /site-assets` devuelve un mapa con todas las imágenes del sitio que
 * el admin puede cambiar sin redeploy. Cache backend 5min + staleTime 10min
 * aquí porque cambian rara vez.
 *
 * Las URLs pueden ser:
 *  - `/assets/img/...` (asset estático del template, fallback inicial)
 *  - `/uploads/site-assets/...` (subido por el admin vía /upload + portal)
 *  - URL absoluta (si en el futuro se mueve a R2/CDN)
 *
 * `resolveAssetUrl()` normaliza: estáticos van directo a Next public,
 * uploads se prefijan con la URL del backend.
 */
export interface SiteAsset {
  url: string;
  label: string | null;
  width: number | null;
  height: number | null;
}

export type SiteAssetsMap = Record<string, SiteAsset>;

export function useSiteAssets() {
  return useQuery({
    queryKey: ['siteAssets'] as const,
    queryFn: () => ApiFetch.get<SiteAssetsMap>('/site-assets'),
    staleTime: 10 * 60_000,
    retry: false,
  });
}

/**
 * Resuelve la URL final de un asset. Si la URL empieza con `/uploads/`
 * la prefija con el backend; si empieza con `/assets/` la deja relativa
 * (la sirve Next desde public/).
 */
export function resolveAssetUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads/')) return getBackendUrl(url) ?? url;
  return url; // /assets/... → Next public
}

/**
 * Hook conveniente para obtener UN asset por key. Devuelve null mientras
 * carga; los consumidores deben tener un fallback estático.
 */
export function useSiteAsset(key: string): SiteAsset | null {
  const { data } = useSiteAssets();
  if (!data) return null;
  return data[key] ?? null;
}
