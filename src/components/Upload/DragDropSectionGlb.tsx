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

      {/* Guía de conversión: model-viewer (visor 3D) solo soporta GLB/glTF.
         Si el usuario tiene FBX/OBJ/DAE/SketchUp, le mostramos opciones
         gratuitas para convertir antes de subir. Sin esto, recibíamos
         consultas de usuarios sin saber qué hacer con archivos de Revit
         o ZBrush. */}
      <div className="glb-format-guide">
        <div className="glb-guide-head">
          <i className="fas fa-info-circle" />
          <strong>¿Tu modelo no está en formato GLB?</strong>
        </div>
        <p className="glb-guide-body">
          Aceptamos solo <code>.glb</code> (formato optimizado para web).
          Si tienes otro formato, conviértelo gratis antes de subir:
        </p>
        <div className="glb-guide-tools">
          <a
            href="https://gltf.report"
            target="_blank"
            rel="noopener noreferrer"
            className="glb-guide-tool"
          >
            <i className="fas fa-external-link-alt" />
            <div>
              <strong>gltf.report</strong>
              <span>Convertidor online — FBX, OBJ, DAE, GLTF</span>
            </div>
          </a>
          <a
            href="https://www.blender.org/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="glb-guide-tool"
          >
            <i className="fas fa-external-link-alt" />
            <div>
              <strong>Blender</strong>
              <span>Importa cualquier formato → Archivo &gt; Exportar &gt; glTF 2.0 (.glb)</span>
            </div>
          </a>
        </div>
        <details className="glb-guide-details">
          <summary>Ver compatibilidad por formato</summary>
          <ul className="glb-guide-list">
            <li><strong>FBX</strong> (3ds Max, Lumion, Revit): convertir en gltf.report o Blender.</li>
            <li><strong>OBJ</strong> (SketchUp, ZBrush): convertir en Blender. Asegúrate de incluir el archivo .mtl y texturas.</li>
            <li><strong>DAE</strong> (Collada): convertir en Blender.</li>
            <li><strong>STL</strong> (impresión 3D): convertir en Blender. Nota: no tiene texturas.</li>
            <li><strong>DWG / DXF</strong>: son planos 2D de AutoCAD — no aplican aquí. Exporta primero a 3D (Revit, SketchUp) y de ahí a GLB.</li>
            <li><strong>USDZ</strong> (AR iOS), <strong>VRML</strong>: no soportados por ahora.</li>
          </ul>
        </details>
      </div>

      <style jsx>{`
        .glb-format-guide {
          margin-top: 14px;
          border: 1px solid rgba(108, 92, 231, 0.25);
          background: rgba(108, 92, 231, 0.05);
          border-radius: 12px;
          padding: 14px 16px;
        }
        .glb-guide-head {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: var(--clr-theme-1, #6c5ce7);
          margin-bottom: 6px;
        }
        .glb-guide-head :global(i) { font-size: 16px; }
        .glb-guide-body {
          margin: 0 0 10px;
          font-size: 13px;
          opacity: 0.85;
        }
        .glb-guide-body code {
          background: rgba(108, 92, 231, 0.12);
          padding: 1px 6px;
          border-radius: 4px;
          font-size: 12px;
        }
        .glb-guide-tools {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 8px;
        }
        @media (max-width: 575px) {
          .glb-guide-tools { grid-template-columns: 1fr; }
        }
        .glb-guide-tool {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          color: inherit !important;
          text-decoration: none !important;
          transition: background 0.15s, transform 0.15s;
        }
        .glb-guide-tool:hover {
          background: rgba(108, 92, 231, 0.1);
          transform: translateY(-1px);
        }
        .glb-guide-tool :global(i) {
          color: var(--clr-theme-1, #6c5ce7);
          font-size: 14px;
          flex-shrink: 0;
        }
        .glb-guide-tool > div {
          display: flex;
          flex-direction: column;
          gap: 1px;
          min-width: 0;
        }
        .glb-guide-tool strong { font-size: 13px; }
        .glb-guide-tool span {
          font-size: 11.5px;
          opacity: 0.7;
          line-height: 1.3;
        }
        .glb-guide-details {
          margin-top: 6px;
          font-size: 12.5px;
        }
        .glb-guide-details summary {
          cursor: pointer;
          opacity: 0.65;
          padding: 6px 0;
          user-select: none;
        }
        .glb-guide-details summary:hover { opacity: 0.85; }
        .glb-guide-list {
          margin: 6px 0 0;
          padding-left: 22px;
          opacity: 0.8;
          line-height: 1.55;
        }
        .glb-guide-list li { margin-bottom: 3px; }
        .glb-guide-list strong { color: var(--clr-theme-1, #6c5ce7); }
      `}</style>

      {(uploadedGlb.length > 0 || pending.length > 0) && (
        <div className="upload-thumbs">
          {uploadedGlb.map((image) => (
            <div key={image.id} className="upload-thumb">
              <div key={image.id}>
                <div
                  className="position-relative d-flex flex-column align-items-center border rounded p-1"
                  style={{
                    gap: "8px",
                    minHeight: "160px",
                    borderWidth: "0.5px"
                  }}
                >
                  {/* Botón eliminar */}
                  <button
                    type="button"
                    className="upload-thumb-remove"
                    onClick={() => removeUploadedGlb(image)}
                    disabled={disabled}
                    title="Eliminar imagen"
                    aria-label={`Eliminar ${image.id}`}
                  >
                    <i className="fas fa-times" />
                  </button>

                  {/* Icono */}
                  <div
                    className="d-flex align-items-center justify-content-center rounded"
                    style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor: "#E6F1FB"
                    }}
                  >
                    <i className="fas fa-cube"
                      style={{
                        color: "#185FA5",
                        fontSize: "24px"
                      }}
                    />
                  </div>

                  {/* Tipo archivo */}
                  <span
                    className="badge text-bg-secondary"
                    style={{
                      fontSize: "10px"
                    }}
                  >
                    GLB
                  </span>

                  {/* Nombre archivo */}
                  <small
                    className="text-center"
                    style={{
                      wordBreak: "break-all"
                    }}
                  >
                    {image.id.split("-")[1]}
                  </small>
                </div>
              </div>
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

export default DragDropSectionGlb;
