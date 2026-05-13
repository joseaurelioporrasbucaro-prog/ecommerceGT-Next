"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { FileUploader } from 'react-drag-drop-files';
import { toast } from 'react-toastify';
import { ApiError, ApiFetch } from '@/utils/Api';
import { useUploadImage } from '@/hooks/api/useUploadImage';
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
  /** Reportar al padre cada cambio en la lista de subidas. */
  onUploadedChange: (next: UploadedImage[]) => void;
  /** Habilita/inhabilita el zona drop, ej. mientras se envía el form. */
  disabled?: boolean;
}

const DragDropSection: React.FC<DragDropSectionProps> = ({
  uploaded,
  onUploadedChange,
  disabled = false,
}) => {
  const [pending, setPending] = useState<PendingPreview[]>([]);
  const uploadMutation = useUploadImage();

  // Liberar los ObjectURLs al desmontar para no leakear memoria.
  useEffect(() => {
    return () => {
      pending.forEach((p) => URL.revokeObjectURL(p.objectUrl));
    };
  }, [pending]);

  const totalCount = uploaded.length + pending.length;
  const remaining = Math.max(0, MAX_IMAGES - totalCount);

  const handleChange = (incoming: File | File[]) => {
    if (disabled) return;
    const files = Array.isArray(incoming) ? incoming : [incoming];
    if (files.length === 0) return;

    const accepted = files.slice(0, remaining);
    if (files.length > accepted.length) {
      toast.warn(`Máximo ${MAX_IMAGES} imágenes en total. Solo se procesarán las primeras ${accepted.length}.`);
    }

    accepted.forEach((file) => {
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

      uploadMutation.mutate(file, {
        onSuccess: (response) => {
          setPending((prev) => prev.filter((p) => p.localId !== localId));
          URL.revokeObjectURL(objectUrl);
          onUploadedChange([
            ...uploaded,
            { id: response.file, url: response.path },
          ]);
        },
        onError: (err) => {
          const message = err instanceof ApiError ? err.message : 'Error al subir';
          setPending((prev) =>
            prev.map((p) =>
              p.localId === localId ? { ...p, status: 'error', error: message } : p,
            ),
          );
          toast.error(`"${file.name}": ${message}`);
        },
      });
    });
  };

  const removeUploaded = async (image: UploadedImage) => {
    if (disabled) return;
    onUploadedChange(uploaded.filter((img) => img.id !== image.id));
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
      <div className={`browse-file-wrapper mb-20 ${disabled ? 'is-disabled' : ''}`}>
        <div className="browse-file-icon">
          <i className="flaticon-cloud-computing"></i>
        </div>
        <h1 className="browse-file-text">Arrastra tus fotos aquí</h1>
        <FileUploader
          multiple
          handleChange={handleChange}
          name="image"
          types={ACCEPTED_TYPES}
          disabled={disabled || remaining === 0}
        />
        <div className="browse-file-note">
          {remaining > 0
            ? `${ACCEPTED_TYPES.join(' / ')} · Máx ${MAX_SIZE_MB} MB · Quedan ${remaining} de ${MAX_IMAGES}`
            : `Has alcanzado el máximo de ${MAX_IMAGES} imágenes.`}
        </div>
      </div>

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
        .upload-images-panel :global(.browse-file-wrapper.is-disabled) {
          opacity: 0.6;
          pointer-events: none;
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
