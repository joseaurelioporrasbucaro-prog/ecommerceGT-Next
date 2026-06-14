"use client";
import React, { useEffect, useState } from 'react';
import { FileUploader } from 'react-drag-drop-files';
import { toast } from 'react-toastify';
import { ApiError, ApiFetch } from '@/utils/Api';
import type { UploadedImage } from '@/types/api';


const ACCEPTED_TYPES = ['GLB'];
const MAX_SIZE_MB = 8;
const MAX_IMAGES = 3;

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
  uploadedGlb: UploadedImage[];
  /** Atómico: agrega UNA imagen a la lista. El padre debe usar functional setState. */
  onAdd: (image: UploadedImage) => void;
  /** Atómico: quita UNA imagen por id. El padre debe usar functional setState. */
  onRemove: (imageId: string) => void;
  /** Habilita/inhabilita el zona drop, ej. mientras se envía el form. */
  disabled?: boolean;
}

const DragDropSectionGlb: React.FC<DragDropSectionProps> = ({
  uploadedGlb,
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

  const totalCount = uploadedGlb.length + pending.length;
  const remaining = Math.max(0, MAX_IMAGES - totalCount);

  // Sube UNA imagen. Reporta progreso vía setPending y resultado vía onAdd.
  // Cada llamada es un Promise independiente (no useMutation compartida) para
  // que múltiples subidas en paralelo no interfieran entre sí.
  const uploadFile = (file: File, localId: string, objectUrl: string) => {
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

  const handleChangeGlb = (incoming: File | File[] | FileList) => {
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

    // Validar tamaños y preparar los pending entries en un solo array.
    // Esto permite UN solo setPending para los N archivos seleccionados,
    // en vez de N renders consecutivos en un forEach.
    type Prepared = { file: File; entry: PendingPreview };
    const prepared: Prepared[] = [];
    for (const file of accepted) {
      const sizeMb = file.size / (1024 * 1024);
      if (sizeMb > MAX_SIZE_MB) {
        toast.error(`"${file.name}" pesa ${sizeMb.toFixed(1)} MB. Máximo ${MAX_SIZE_MB} MB.`);
        continue;
      }
      const localId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const objectUrl = URL.createObjectURL(file);
      prepared.push({
        file,
        entry: { localId, name: file.name, objectUrl, status: 'uploading' },
      });
    }
    if (prepared.length === 0) return;

    // 1 solo setState para los N pending → 1 solo render extra.
    setPending((prev) => [...prev, ...prepared.map((p) => p.entry)]);

    // Disparar las subidas (Promises independientes, no esperamos).
    for (const { file, entry } of prepared) {
      uploadFile(file, entry.localId, entry.objectUrl);
    }
  };

  const removeUploadedGlb = async (image: UploadedImage) => {
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
        handleChange={handleChangeGlb}
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
          <h4 className="upload-dropzone-title">Arrastra tus archivos <span
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title="Formato de archivo para modelos 3D optimizado para web y aplicaciones interactivas."
          >
            GLB
          </span> aquí</h4>
          <span className="upload-dropzone-button">
            <i className="fas fa-image" /> Seleccionar archivos
          </span>
          <div className="browse-file-note">
            {remaining > 0
              ? `${ACCEPTED_TYPES.join(' / ')} · Máx ${MAX_SIZE_MB} MB · Quedan ${remaining} de ${MAX_IMAGES}`
              : `Has alcanzado el máximo de ${MAX_IMAGES} archivos.`}
          </div>
        </div>
      </FileUploader>

      {/* Guía de conversión (compacta): solo soportamos GLB nativamente.
          Si el usuario tiene FBX/OBJ/DAE/SketchUp, le mostramos cómo convertir.
          Actualización 2026-06-02: gltf.report solo edita/optimiza GLB ya
          existentes (no convierte desde otros formatos), por lo que ya no lo
          recomendamos para conversión. Las opciones reales que aceptan FBX/
          OBJ/DAE como entrada son AnyConv (online, gratis) y Blender (offline,
          mejor calidad). */}
      <details className="glb-format-guide">
        <summary>
          <i className="fas fa-info-circle" /> ¿Tienes el modelo en otro formato (FBX, OBJ, DAE, .blend)?
        </summary>
        <div className="glb-guide-content">
          <p>
            Aceptamos solo <code>.glb</code>. Para convertir desde otros formatos:
          </p>
          <ul className="glb-guide-tools">
            <li>
              <a
                href="https://anyconv.com/fbx-to-glb-converter/"
                target="_blank"
                rel="noopener noreferrer"
              >
                AnyConv
              </a>{' '}
              — convertidor online, gratis (FBX, OBJ, DAE → GLB, hasta 50&nbsp;MB)
            </li>
            <li>
              <a
                href="https://products.aspose.app/3d/conversion"
                target="_blank"
                rel="noopener noreferrer"
              >
                Aspose 3D
              </a>{' '}
              — alternativa online (más formatos de entrada)
            </li>
            <li>
              <a
                href="https://www.blender.org/download/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Blender
              </a>{' '}
              — gratis, offline: abre el modelo → Archivo &gt; Exportar &gt; glTF 2.0 (.glb).
              Es la opción más confiable cuando el modelo tiene materiales/texturas complejas.
            </li>
          </ul>
          <p className="glb-guide-note">
            <strong>Notas:</strong> DWG/DXF son planos 2D, no 3D — primero
            exporta a OBJ o GLB desde Revit/AutoCAD/SketchUp. STL no lleva
            texturas. USDZ y VRML aún no se admiten.
          </p>
        </div>
      </details>

      {/* Estilos scoped: usamos selectores específicos `.glb-format-guide ...`
          para evitar colisiones con otros `<details>` o `<summary>` de la página. */}
      <style jsx>{`
        .glb-format-guide {
          margin-top: 10px;
          border: 1px solid var(--lav-300);
          background: var(--accent-soft);
          border-radius: 10px;
          font-size: 12.5px;
        }
        .glb-format-guide summary {
          padding: 9px 13px;
          cursor: pointer;
          list-style: none;
          color: var(--lav-700);
          font-weight: 600;
          user-select: none;
        }
        .glb-format-guide summary::-webkit-details-marker { display: none; }
        .glb-format-guide summary :global(i) { margin-right: 6px; }
        .glb-format-guide summary:hover { opacity: 0.85; }
        .glb-guide-content {
          padding: 0 13px 12px;
        }
        .glb-guide-content p { margin: 0 0 8px; opacity: 0.85; }
        .glb-guide-content code {
          background: var(--accent-soft);
          padding: 1px 5px;
          border-radius: 4px;
        }
        .glb-format-guide .glb-guide-tools {
          margin: 0 0 8px;
          padding-left: 18px;
          line-height: 1.6;
        }
        .glb-format-guide .glb-guide-tools li { margin-bottom: 2px; }
        .glb-format-guide .glb-guide-tools a {
          color: var(--lav-700);
          font-weight: 600;
        }
        .glb-guide-note { font-size: 11.5px; opacity: 0.7; margin: 0; }
      `}</style>

      {(uploadedGlb.length > 0 || pending.length > 0) && (
        <div className="upload-thumbs">
          {uploadedGlb.map((image) => {
            // El id tiene formato "<timestamp>-<filename>.glb" — partimos por
            // el primer guión (no split('-')[1] que rompe con nombres con más
            // guiones, ej. "Vista-Casa-3.glb").
            const dashIdx = image.id.indexOf('-');
            const fileName = dashIdx >= 0 ? image.id.slice(dashIdx + 1) : image.id;
            return (
              <div
                key={image.id}
                className="upload-thumb"
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '1 / 1',
                  borderRadius: 8,
                  overflow: 'hidden',
                  background: 'var(--accent-soft)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 6,
                  gap: 4,
                }}
                title={fileName}
              >
                <i
                  className="fas fa-cube"
                  style={{
                    color: 'var(--lav-700)',
                    fontSize: 22,
                  }}
                />
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    color: 'var(--lav-700)',
                  }}
                >
                  GLB
                </span>
                <span
                  style={{
                    fontSize: 9,
                    lineHeight: 1.15,
                    textAlign: 'center',
                    width: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    opacity: 0.7,
                  }}
                >
                  {fileName}
                </span>
                <button
                  type="button"
                  className="upload-thumb-remove"
                  onClick={() => removeUploadedGlb(image)}
                  disabled={disabled}
                  title="Eliminar archivo"
                  aria-label={`Eliminar ${image.id}`}
                >
                  <i className="fas fa-times" />
                </button>
              </div>
            );
          })}

          {pending.map((p) => (
            <div
              key={p.localId}
              className={`upload-thumb upload-thumb-pending ${p.status === 'error' ? 'is-error' : ''}`}
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '1 / 1',
                borderRadius: 8,
                overflow: 'hidden',
                background: 'var(--accent-soft)',
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 6,
                gap: 4,
              }}
              title={p.name}
            >
              <i
                className="fas fa-cube"
                style={{
                  color: 'var(--lav-700)',
                  fontSize: 22,
                  opacity: 0.5,
                }}
              />
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.5px', opacity: 0.6 }}>
                GLB
              </span>
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
                aria-label="Descartar archivo"
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
          border: 2px dashed var(--lav-400);
          border-radius: 16px;
          background: var(--accent-soft);
          padding: 28px 20px;
          text-align: center;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, filter 0.15s;
          /* La librería pone svg + label internos; los ocultamos para usar nuestro children. */
        }
        .upload-images-panel :global(.upload-dropzone:hover) {
          border-color: var(--lav-500);
          filter: brightness(0.98);
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
          color: var(--lav-700);
          margin-bottom: 4px;
        }
        .upload-images-panel :global(.upload-dropzone-title) {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--fg-strong);
        }
        .upload-images-panel :global(.upload-dropzone-button) {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 22px;
          border-radius: 999px;
          background: var(--navy-800);
          color: var(--cream);
          font-size: 14px;
          font-weight: 700;
          font-family: var(--font-display);
        }
        .upload-images-panel :global(.upload-dropzone .browse-file-note) {
          font-size: 12px;
          opacity: 0.75;
          margin-top: 4px;
        }
        .upload-thumbs {
          /* Mismo grid que DragDropSection — consistencia visual:
             78px → 3 thumbs por fila en col-lg-4. */
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(78px, 1fr));
          gap: 8px;
        }
        .upload-thumbs :global(.upload-thumb) {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
          background: rgba(128, 128, 128, 0.12);
          border: 1px solid var(--border);
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
          border-color: var(--danger);
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
          color: var(--danger);
        }
        .upload-thumbs :global(.upload-thumb-remove) {
          position: absolute;
          top: 3px;
          right: 3px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: none;
          background: rgba(0, 0, 0, 0.65);
          color: #fff;
          font-size: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s;
          z-index: 2;
        }
        .upload-thumbs :global(.upload-thumb-remove:hover) {
          background: var(--danger);
        }
        .upload-thumbs :global(.upload-thumb-remove:disabled) {
          cursor: not-allowed;
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
};

export default DragDropSectionGlb;
