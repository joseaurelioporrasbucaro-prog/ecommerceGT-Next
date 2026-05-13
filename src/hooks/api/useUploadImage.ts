import { useMutation } from '@tanstack/react-query';
import { ApiFetch } from '@/utils/Api';
import type { UploadImageResponse } from '@/types/api';

/**
 * Sube UNA imagen al backend (`POST /upload`, multipart/form-data, campo `image`).
 * Devuelve el filename + path servible. El consumidor decide cómo agruparlas
 * (típicamente subir cada imagen al soltarla en el drop zone).
 */
export function useUploadImage() {
  return useMutation<UploadImageResponse, Error, File>({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      return ApiFetch.post<UploadImageResponse>('/upload', formData);
    },
  });
}
