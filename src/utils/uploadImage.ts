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
 * Se prefiere la variante `card` (800x800 WebP, cuadrada — ideal para avatar y
 * logo). El backend borra el original tras generar variantes, así que guardar
 * la variante (un archivo real) evita avatares rotos. Si sharp falló y no hay
 * variantes, cae al `path` original (que en ese caso sí se conserva).
 */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);
  const res = await ApiFetch.post<UploadResponse>('/upload', formData);
  return res.variants?.card || res.path;
}
