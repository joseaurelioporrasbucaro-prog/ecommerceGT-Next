import { useEffect, useRef } from 'react';
import { ApiFetch } from '@/utils/Api';

/**
 * Registra UNA vista de la publicación al montar la página de detalle.
 * El backend (POST /publications/:id/view) ignora la vista si el viewer es el
 * dueño. Se dispara una sola vez por id (guard con useRef) para no contar
 * vistas extra por re-renders. Errores se ignoran en silencio (no es crítico).
 */
export function useRegisterView(id: number | string | null | undefined) {
  const sentForId = useRef<string | null>(null);

  useEffect(() => {
    if (id === null || id === undefined || id === '') return;
    const key = String(id);
    if (sentForId.current === key) return;
    sentForId.current = key;

    ApiFetch.post(`/publications/${key}/view`, {}).catch(() => {
      /* el conteo de vistas no es crítico — ignorar fallos */
    });
  }, [id]);
}
