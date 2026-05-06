import { useQuery } from '@tanstack/react-query';
import { ApiFetch } from '@/utils/Api';
import type {
  CitiesPayload,
  City,
  Country,
  Gender,
  MunicipalitiesPayload,
  Municipality,
  PublicationCategory,
  PublicationTransaction,
  PublicationTransactionsPayload,
} from '@/types/api';

type CatalogId = number | string | null | undefined;

export const COUNTRIES_QUERY_KEY = ['catalogs', 'countries'] as const;
export const CITIES_QUERY_KEY = ['catalogs', 'cities'] as const;
export const MUNICIPALITIES_QUERY_KEY = ['catalogs', 'municipalities'] as const;
export const PUBLICATION_CATEGORIES_QUERY_KEY = ['catalogs', 'publicationCategories'] as const;
export const PUBLICATION_TRANSACTIONS_QUERY_KEY = ['catalogs', 'publicationTransactions'] as const;
export const GENDERS_QUERY_KEY = ['catalogs', 'genders'] as const;

function toCatalogNumber(value: CatalogId): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

export function useCountries() {
  return useQuery({
    queryKey: COUNTRIES_QUERY_KEY,
    queryFn: () => ApiFetch.get<Country[]>('/cat/countries'),
    retry: false,
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function useCities(countryId: CatalogId) {
  const country = toCatalogNumber(countryId);

  return useQuery({
    queryKey: [...CITIES_QUERY_KEY, country] as const,
    queryFn: () => {
      if (country === null) {
        return Promise.resolve<City[]>([]);
      }

      const payload: CitiesPayload = { country };
      return ApiFetch.post<City[]>('/cat/cities', payload);
    },
    enabled: country !== null,
    retry: false,
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function useMunicipalities(cityId: CatalogId) {
  const city = toCatalogNumber(cityId);

  return useQuery({
    queryKey: [...MUNICIPALITIES_QUERY_KEY, city] as const,
    queryFn: () => {
      if (city === null) {
        return Promise.resolve<Municipality[]>([]);
      }

      const payload: MunicipalitiesPayload = { city };
      return ApiFetch.post<Municipality[]>('/cat/municipalities', payload);
    },
    enabled: city !== null,
    retry: false,
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function usePublicationCategories() {
  return useQuery({
    queryKey: PUBLICATION_CATEGORIES_QUERY_KEY,
    queryFn: () => ApiFetch.get<PublicationCategory[]>('/cat/pubcategories'),
    retry: false,
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function usePublicationTransactions(categoryId: CatalogId) {
  const categorid = toCatalogNumber(categoryId);

  return useQuery({
    queryKey: [...PUBLICATION_TRANSACTIONS_QUERY_KEY, categorid] as const,
    queryFn: () => {
      if (categorid === null) {
        return Promise.resolve<PublicationTransaction[]>([]);
      }

      const payload: PublicationTransactionsPayload = { categorid };
      return ApiFetch.post<PublicationTransaction[]>('/cat/pubtransactions', payload);
    },
    enabled: categorid !== null,
    retry: false,
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function useGenders() {
  return useQuery({
    queryKey: GENDERS_QUERY_KEY,
    queryFn: () => ApiFetch.get<Gender[]>('/cat/gender'),
    retry: false,
    staleTime: 24 * 60 * 60 * 1000,
  });
}
