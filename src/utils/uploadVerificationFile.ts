import { ApiFetch } from './Api';

interface UploadVerificationResponse {
  message: string;
  path: string;
}

/**
 * Fase 8.2 — sube un documento de verificación (foto del DPI o PDF del RTU) vía
 * `POST /upload-verification`. El backend lo guarda en `uploads/verification`
 * (NO público): imágenes → WebP legible, PDF → comprimido con Ghostscript.
 * Devuelve el path privado a guardar en la solicitud de verificación.
 */
export async function uploadVerificationFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await ApiFetch.post<UploadVerificationResponse>('/upload-verification', formData);
  return res.path;
}
