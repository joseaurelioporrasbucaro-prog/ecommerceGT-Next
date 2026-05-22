import { ApiFetch } from './Api';

interface UploadResponse {
  message: string;
  file: string;
  path: string;
  variants?: { thumb?: string; card?: string; detail?: string };
}

/**
 * Sube una imagen vía `POST /upload` (mismo endpoint que las publicaciones,
 * procesado con sharp) y devuelve el path a guardar.
 *
 * El backend borra el original tras generar variantes, así que guardamos la
 * variante (un archivo real) para evitar imágenes rotas:
 *   - `card`   → 800x800 (cuadrada): avatar y logo.
 *   - `detail` → 1600x900 (16:9): portada.
 * Si sharp falló y no hay variantes, cae al `path` original (que en ese caso
 * sí se conserva).
 */
export async function uploadImage(
  file: File,
  variant: 'card' | 'detail' = 'card',
): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);
  const res = await ApiFetch.post<UploadResponse>('/upload', formData);
  return res.variants?.[variant] || res.variants?.card || res.path;
}
