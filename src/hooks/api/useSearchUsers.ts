import { useQuery } from '@tanstack/react-query';
import { ApiFetch } from '@/utils/Api';
import type { UserSearchResult } from '@/types/api';

interface SearchUsersResponse {
  users: UserSearchResult[];
}

/**
 * Busca usuarios por prefijo de handle para el dropdown de menciones (@usuario).
 * El backend exige prefijo ≥2 chars; acá deshabilitamos la query por debajo de eso.
 */
export function useSearchUsers(query: string) {
  const normalized = query.trim().toLowerCase().replace(/^@/, '');
  const enabled = normalized.length >= 2;

  return useQuery({
    queryKey: ['searchUsers', normalized] as const,
    queryFn: () =>
      ApiFetch.get<SearchUsersResponse>(
        `/search/users?q=${encodeURIComponent(normalized)}`,
      ),
    enabled,
    retry: false,
    staleTime: 60_000,
  });
}
