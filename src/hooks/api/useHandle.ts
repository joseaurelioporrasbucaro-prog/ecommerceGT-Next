import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiFetch } from '@/utils/Api';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { CURRENT_USER_QUERY_KEY } from '@/hooks/api/useCurrentUser';
import type {
  HandleCheckResponse,
  HandleSuggestionsResponse,
  UpdateHandlePayload,
  UpdateHandleResponse,
} from '@/types/api';

export const HANDLE_CHECK_QUERY_KEY = ['handleCheck'] as const;
export const HANDLE_SUGGESTIONS_QUERY_KEY = ['handleSuggestions'] as const;

function normalizeHandleInput(value: string): string {
  return value.trim().toLowerCase();
}

export function useCheckHandle(handle: string) {
  const normalizedHandle = normalizeHandleInput(handle);
  const debouncedHandle = useDebouncedValue(normalizedHandle, 350);

  return useQuery({
    queryKey: [...HANDLE_CHECK_QUERY_KEY, debouncedHandle] as const,
    queryFn: () =>
      ApiFetch.get<HandleCheckResponse>(
        `/handle/check/${encodeURIComponent(debouncedHandle)}`,
      ),
    enabled: debouncedHandle.length >= 3,
    retry: false,
    staleTime: 30_000,
  });
}

export function useHandleSuggestions(base: string) {
  const normalizedBase = normalizeHandleInput(base);
  const debouncedBase = useDebouncedValue(normalizedBase, 350);

  return useQuery({
    queryKey: [...HANDLE_SUGGESTIONS_QUERY_KEY, debouncedBase] as const,
    queryFn: () =>
      ApiFetch.get<HandleSuggestionsResponse>(
        `/handle/suggestions?base=${encodeURIComponent(debouncedBase)}`,
      ),
    enabled: debouncedBase.length >= 3,
    retry: false,
    staleTime: 30_000,
  });
}

export function useUpdateHandle() {
  const queryClient = useQueryClient();

  return useMutation<UpdateHandleResponse, Error, UpdateHandlePayload>({
    mutationFn: (payload) => ApiFetch.put<UpdateHandleResponse>('/handle', payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
    },
  });
}
