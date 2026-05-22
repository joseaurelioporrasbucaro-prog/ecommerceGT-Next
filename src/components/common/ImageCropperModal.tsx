"use client";
import React, { useCallback, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';

interface ImageCropperModalProps {
  /** Object URL de la imagen seleccionada. */
  imageSrc: string;
  /** Relación de aspecto del recorte (ej. 1 = cuadrado, 16/9 = portada). */
  aspect: number;
  /** Forma del marco: 'round' para avatar, 'rect' para portada/logo. */
  cropShape?: 'rect' | 'round';
  title?: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: (file: File) => void;
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', (e) => reject(e));
    img.src = url;
  });
}

async function getCroppedFile(imageSrc: string, crop: Area): Promise<File> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(crop.width));
  canvas.height = Math.max(1, Math.round(crop.height));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo procesar la imagen');
  ctx.drawImage(
    image,
    crop.x, crop.y, crop.width, crop.height,
    0, 0, crop.width, crop.height,
  );
  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob falló'))), 'image/jpeg', 0.92),
  );
  return new File([blob], 'crop.jpg', { type: 'image/jpeg' });
}

const ImageCropperModal = ({
  imageSrc,
  aspect,
  cropShape = 'rect',
  title = 'Encuadra tu imagen',
  busy = false,
  onCancel,
  onConfirm,
}: ImageCropperModalProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaPixels, setAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_area: Area, areaPx: Area) => {
    setAreaPixels(areaPx);
  }, []);

  const handleConfirm = async () => {
    if (!areaPixels) return;
    const file = await getCroppedFile(imageSrc, areaPixels);
    onConfirm(file);
  };

  return (
    <div className="icm-overlay" role="dialog" aria-modal="true">
      <div className="icm-modal">
        <h4 className="icm-title">{title}</h4>

        <div className="icm-crop-area">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={cropShape}
            showGrid={cropShape === 'rect'}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="icm-zoom">
          <span><i className="fas fa-search-minus" /></span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
          <span><i className="fas fa-search-plus" /></span>
        </div>

        <div className="icm-actions">
          <button type="button" className="icm-btn icm-btn-ghost" onClick={onCancel} disabled={busy}>
            Cancelar
          </button>
          <button type="button" className="icm-btn" onClick={handleConfirm} disabled={busy || !areaPixels}>
            {busy ? 'Subiendo…' : 'Recortar y subir'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .icm-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .icm-modal {
          background: var(--clr-bg-white, #fff);
          border-radius: 16px;
          width: 100%;
          max-width: 560px;
          padding: 24px;
        }
        .icm-title {
          font-size: 20px;
          margin-bottom: 16px;
        }
        .icm-crop-area {
          position: relative;
          width: 100%;
          height: 340px;
          background: #111;
          border-radius: 12px;
          overflow: hidden;
        }
        .icm-zoom {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 18px 0;
          color: var(--clr-common-body-text, #888);
        }
        .icm-zoom input {
          flex: 1;
        }
        .icm-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
        .icm-btn {
          padding: 11px 24px;
          border-radius: 30px;
          background: var(--clr-theme-1, #5a5af2);
          color: #fff;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: 0.3s;
        }
        .icm-btn:hover:not(:disabled) {
          opacity: 0.9;
        }
        .icm-btn:disabled {
          opacity: 0.6;
          cursor: default;
        }
        .icm-btn-ghost {
          background: transparent;
          color: var(--clr-theme-1, #5a5af2);
          border: 1px solid var(--clr-theme-1, #5a5af2);
        }
      `}</style>
    </div>
  );
};

export default ImageCropperModal;
