import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { ApiFetch } from '@/utils/Api';
import type { Amenity } from '@/types/api';

/**
 * Fase 19.5 — catálogo público de amenidades.
 *
 * GET /amenities. Devuelve el catálogo completo activo, ordenado por
 * categoría y orden. Cache 10 min — cambia con poca frecuencia.
 *
 * Etiquetas de categoría usadas en el seed:
 *   condominio | interior | exterior | seguridad | servicios
 *
 * `useAmenitiesGrouped()` además devuelve el listado ya particionado por
 * categoría para renderizar fácil en el form.
 */
export const AMENITIES_QUERY_KEY = ['amenities'] as const;

export function useAmenities() {
  return useQuery({
    queryKey: AMENITIES_QUERY_KEY,
    queryFn: () => ApiFetch.get<Amenity[]>('/amenities'),
    staleTime: 10 * 60_000,
  });
}

const CATEGORY_LABELS: Record<string, string> = {
  condominio: 'Condominio',
  interior:   'Interior de la propiedad',
  exterior:   'Exterior',
  seguridad:  'Seguridad',
  servicios:  'Servicios incluidos',
  otros:      'Otros',
};

export interface AmenityGroup {
  category: string;
  label: string;
  items: Amenity[];
}

export function useAmenitiesGrouped() {
  const query = useAmenities();
  const grouped = useMemo<AmenityGroup[]>(() => {
    const items = query.data ?? [];
    const byCat = new Map<string, Amenity[]>();
    for (const a of items) {
      const cat = a.category || 'otros';
      const list = byCat.get(cat) ?? [];
      list.push(a);
      byCat.set(cat, list);
    }
    // Orden fijo de categorías; lo que no esté en la lista cae al final.
    const ORDER = ['condominio', 'interior', 'exterior', 'seguridad', 'servicios', 'otros'];
    return ORDER
      .filter((cat) => byCat.has(cat))
      .map((cat) => ({
        category: cat,
        label: CATEGORY_LABELS[cat] || cat,
        items: byCat.get(cat)!,
      }))
      .concat(
        // Cualquier categoría que aparezca pero no esté en ORDER, al final.
        Array.from(byCat.keys())
          .filter((cat) => !ORDER.includes(cat))
          .map((cat) => ({
            category: cat,
            label: CATEGORY_LABELS[cat] || cat,
            items: byCat.get(cat)!,
          })),
      );
  }, [query.data]);

  return { ...query, grouped };
}
