import { ApiFetch } from './Api';

interface UploadPdfResponse {
  message: string;
  path: string;
}

/**
 * Fase 8.1 — sube un PDF vía `POST /upload-pdf` (ej. el RTU para verificación
 * empresarial). El backend lo comprime con Ghostscript si está disponible y lo
 * guarda en uploads/verification. Devuelve el path a guardar.
 */
export async function uploadPdf(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await ApiFetch.post<UploadPdfResponse>('/upload-pdf', formData);
  return res.path;
}
