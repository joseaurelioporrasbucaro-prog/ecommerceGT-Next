"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { FileUploader } from 'react-drag-drop-files';
import { toast } from 'react-toastify';
import { ApiError, ApiFetch } from '@/utils/Api';
import { getBackendUrl } from '@/utils/backendUrl';
import type { UploadedImage } from '@/types/api';

const ACCEPTED_TYPES = ['JPG', 'JPEG', 'PNG', 'WEBP', 'GIF'];
const MAX_SIZE_MB = 8;
const MAX_IMAGES = 10;

interface PendingPreview {
  /** ID local temporal mientras la imagen se sube. */
  localId: string;
  name: string;
  /** ObjectURL para mostrar el preview antes de tener la URL del backend. */
  objectUrl: string;
  status: 'uploading' | 'error';
  error?: string;
}

interface DragDropSectionProps {
  /** Imágenes ya confirmadas en backend (id+url). */
  uploaded: UploadedImage[];
  /** Atómico: agrega UNA imagen a la lista. El padre debe usar functional setState. */
  onAdd: (image: UploadedImage) => void;
  /** Atómico: quita UNA imagen por id. El padre debe usar functional setState. */
  onRemove: (imageId: string) => void;
  /** Habilita/inhabilita el zona drop, ej. mientras se envía el form. */
  disabled?: boolean;
}

const DragDropSection: React.FC<DragDropSectionProps> = ({
  uploaded,
  onAdd,
  onRemove,
  disabled = false,
}) => {
  const [pending, setPending] = useState<PendingPreview[]>([]);

  // Liberar los ObjectURLs al desmontar para no leakear memoria.
  useEffect(() => {
    return () => {
      pending.forEach((p) => URL.revokeObjectURL(p.objectUrl));
    };
    // Solo al unmount; no queremos cleanup en cada cambio del array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalCount = uploaded.length + pending.length;
  const remaining = Math.max(0, MAX_IMAGES - totalCount);

  const uploadFile = (file: File) => {
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_SIZE_MB) {
      toast.error(`"${file.name}" pesa ${sizeMb.toFixed(1)} MB. Máximo ${MAX_SIZE_MB} MB.`);
      return;
    }

    const localId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const objectUrl = URL.createObjectURL(file);

    setPending((prev) => [
      ...prev,
      { localId, name: file.name, objectUrl, status: 'uploading' },
    ]);

    // IMPORTANTE: cada upload usa su propio Promise (no useMutation con instancia
    // compartida). Así múltiples uploads en paralelo no interfieren entre sí
    // y los onSuccess no compiten por el mismo state. El stale closure desaparece
    // porque onAdd/onRemove en el padre usan functional setState.
    const formData = new FormData();
    formData.append('image', file);

    ApiFetch.post<{ message: string; file: string; path: string }>('/upload', formData)
      .then((response) => {
        setPending((prev) => prev.filter((p) => p.localId !== localId));
        URL.revokeObjectURL(objectUrl);
        onAdd({ id: response.file, url: response.path });
      })
      .catch((err) => {
        const message = err instanceof ApiError ? err.message : 'Error al subir';
        setPending((prev) =>
          prev.map((p) =>
            p.localId === localId ? { ...p, status: 'error', error: message } : p,
          ),
        );
        toast.error(`"${file.name}": ${message}`);
      });
  };

  const handleChange = (incoming: File | File[] | FileList) => {
    if (disabled) return;
    // react-drag-drop-files con multiple=true devuelve FileList (array-like, no Array).
    // Single-file mode devuelve un File suelto. Normalizamos a File[] real.
    const files: File[] =
      incoming instanceof File ? [incoming] : Array.from(incoming as FileList | File[]);
    if (files.length === 0) return;

    const accepted = files.slice(0, remaining);
    if (files.length > accepted.length) {
      toast.warn(`Máximo ${MAX_IMAGES} imágenes en total. Solo se procesarán las primeras ${accepted.length}.`);
    }

    accepted.forEach(uploadFile);
  };

  const removeUploaded = async (image: UploadedImage) => {
    if (disabled) return;
    onRemove(image.id);
    try {
      await ApiFetch.post('/deleteimg', { url: image.url });
    } catch {
      // Si falla la limpieza en el backend no rompemos el flujo del usuario;
      // queda un huérfano que un job de mantenimiento puede recoger.
    }
  };

  const removePending = (localId: string) => {
    setPending((prev) => {
      const target = prev.find((p) => p.localId === localId);
      if (target) URL.revokeObjectURL(target.objectUrl);
      return prev.filter((p) => p.localId !== localId);
    });
  };

  return (
    <div className="upload-images-panel">
      <FileUploader
        multiple
        handleChange={handleChange}
        name="image"
        types={ACCEPTED_TYPES}
        disabled={disabled || remaining === 0}
        // Render custom: usamos `children` para reemplazar el dropzone default
        // (que mostraba 2 botones feos "Upload" + "JP..."). Toda el área es
        // clickeable y droppable.
        classes={`upload-dropzone ${disabled || remaining === 0 ? 'is-disabled' : ''}`}
      >
        <div className="upload-dropzone-content">
          <div className="browse-file-icon">
            <i className="flaticon-cloud-computing"></i>
          </div>
          <h4 className="upload-dropzone-title">Arrastra tus fotos aquí</h4>
          <span className="upload-dropzone-button">
            <i className="fas fa-image" /> Seleccionar archivos
          </span>
          <div className="browse-file-note">
            {remaining > 0
              ? `${ACCEPTED_TYPES.join(' / ')} · Máx ${MAX_SIZE_MB} MB · Quedan ${remaining} de ${MAX_IMAGES}`
              : `Has alcanzado el máximo de ${MAX_IMAGES} imágenes.`}
          </div>
        </div>
      </FileUploader>

      {(uploaded.length > 0 || pending.length > 0) && (
        <div className="upload-thumbs">
          {uploaded.map((image) => (
            <div key={image.id} className="upload-thumb">
              <Image
                src={getBackendUrl(image.url)}
                alt={image.id}
                fill
                sizes="120px"
                style={{ objectFit: 'cover' }}
                unoptimized
              />
              <button
                type="button"
                className="upload-thumb-remove"
                onClick={() => removeUploaded(image)}
                disabled={disabled}
                title="Eliminar imagen"
                aria-label={`Eliminar ${image.id}`}
              >
                <i className="fas fa-times" />
              </button>
            </div>
          ))}

          {pending.map((p) => (
            <div
              key={p.localId}
              className={`upload-thumb upload-thumb-pending ${p.status === 'error' ? 'is-error' : ''}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.objectUrl} alt={p.name} />
              <div className="upload-thumb-overlay">
                {p.status === 'uploading' ? (
                  <span className="upload-thumb-spinner">
                    <i className="fas fa-spinner fa-spin" />
                  </span>
                ) : (
                  <span className="upload-thumb-error" title={p.error}>
                    <i className="fas fa-exclamation-triangle" />
                  </span>
                )}
              </div>
              <button
                type="button"
                className="upload-thumb-remove"
                onClick={() => removePending(p.localId)}
                title={p.status === 'error' ? 'Descartar' : 'Cancelar'}
                aria-label="Descartar imagen"
              >
                <i className="fas fa-times" />
              </button>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .upload-images-panel :global(.upload-dropzone) {
          display: block;
          width: 100%;
          margin-bottom: 20px;
          border: 2px dashed var(--clr-theme-1, #6c5ce7);
          border-radius: 12px;
          background: rgba(108, 92, 231, 0.04);
          padding: 28px 20px;
          text-align: center;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
          /* La librería pone svg + label internos; los ocultamos para usar nuestro children. */
        }
        .upload-images-panel :global(.upload-dropzone:hover) {
          background: rgba(108, 92, 231, 0.08);
        }
        .upload-images-panel :global(.upload-dropzone.is-disabled) {
          opacity: 0.5;
          pointer-events: none;
        }
        .upload-images-panel :global(.upload-dropzone svg) {
          display: none;
        }
        .upload-images-panel :global(.upload-dropzone span) {
          display: contents;
        }
        .upload-images-panel :global(.upload-dropzone-content) {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .upload-images-panel :global(.upload-dropzone .browse-file-icon) {
          font-size: 42px;
          color: var(--clr-theme-1, #6c5ce7);
          margin-bottom: 4px;
        }
        .upload-images-panel :global(.upload-dropzone-title) {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--clr-common-heading, #181818);
        }
        .upload-images-panel :global(.upload-dropzone-button) {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 22px;
          border-radius: 6px;
          background: var(--clr-theme-1, #6c5ce7);
          color: #fff;
          font-size: 14px;
          font-weight: 600;
        }
        .upload-images-panel :global(.upload-dropzone .browse-file-note) {
          font-size: 12px;
          opacity: 0.75;
          margin-top: 4px;
        }
        .upload-thumbs {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
          gap: 12px;
        }
        .upload-thumbs :global(.upload-thumb) {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
          background: rgba(128, 128, 128, 0.12);
          border: 1px solid var(--clr-common-border, #e0e2e5);
        }
        .upload-thumbs :global(.upload-thumb img) {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .upload-thumbs :global(.upload-thumb-pending) {
          opacity: 0.8;
        }
        .upload-thumbs :global(.upload-thumb-pending.is-error) {
          border-color: #ef4444;
        }
        .upload-thumbs :global(.upload-thumb-overlay) {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.35);
          color: #fff;
          font-size: 22px;
        }
        .upload-thumbs :global(.upload-thumb-error) {
          color: #ef4444;
        }
        .upload-thumbs :global(.upload-thumb-remove) {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: none;
          background: rgba(0, 0, 0, 0.6);
          color: #fff;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s;
        }
        .upload-thumbs :global(.upload-thumb-remove:hover) {
          background: #ef4444;
        }
        .upload-thumbs :global(.upload-thumb-remove:disabled) {
          cursor: not-allowed;
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
};

export default DragDropSection;
