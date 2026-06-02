"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePublicationDetail } from '@/hooks/api/usePublications';
import { ApiError } from '@/utils/Api';
import { getBackendUrl } from '@/utils/backendUrl';
import { formatPrice, getPublicationImagePathGlb } from './publicationUtils';

/**
 * Visor 3D dedicado para los archivos GLB de una publicación.
 *
 * Vive en `/publications/[id]/viewer` para que sea SPA (no abre pestaña
 * nueva, no recarga el bundle) y la navegación back/forward del browser
 * funcione natural.
 *
 * Usa `<model-viewer>` de Google (web component) cargado vía <script> al
 * mount — evita meter ~100KB al bundle global de Next solo para esta ruta.
 *
 * Features:
 *  - Galería de thumbnails si hay múltiples GLB.
 *  - Toggle de auto-rotate.
 *  - Selector de color de fondo (oscuro / claro / showroom).
 *  - Botón AR (aparece auto en iOS/Android).
 *  - Botón fullscreen.
 *  - Sidebar con info de la propiedad (título, precio, dirección).
 *  - Botón "Volver a la publicación" prominente.
 */

// TypeScript necesita saber que <model-viewer> es válido en JSX.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          'auto-rotate'?: boolean | string;
          'camera-controls'?: boolean | string;
          'shadow-intensity'?: string;
          exposure?: string;
          ar?: boolean | string;
          'ar-modes'?: string;
          'tone-mapping'?: string;
          'environment-image'?: string;
          'rotation-per-second'?: string;
          poster?: string;
        },
        HTMLElement
      >;
    }
  }
}

type BgPreset = 'dark' | 'light' | 'showroom';

const BG_PRESETS: Record<BgPreset, { background: string; color: string; label: string }> = {
  dark:     { background: '#0f0f1e',                                       color: '#fff',     label: 'Oscuro' },
  light:    { background: '#f3f4f6',                                       color: '#1f2937',  label: 'Claro' },
  showroom: { background: 'linear-gradient(180deg,#1e293b 0%,#475569 100%)', color: '#fff',   label: 'Estudio' },
};

interface PublicationViewerMainProps {
  id: string;
}

const PublicationViewerMain: React.FC<PublicationViewerMainProps> = ({ id }) => {
  const publicationQuery = usePublicationDetail(id);
  const publication = publicationQuery.data;

  // Lista de URLs absolutas de los GLB. Usamos `getPublicationImagePathGlb`
  // que ya tiene fallback de `pubimaglb_url → url` por si el backend
  // devuelve el shape raw (sin alias) en alguna ruta.
  const models = useMemo(() => {
    if (!publication?.imagesglb) return [] as { url: string; name: string }[];
    return publication.imagesglb
      .map((g) => {
        const path = getPublicationImagePathGlb(g);
        return path ? {
          url: getBackendUrl(path),
          name: g.id || g.pubimaglb_id ? `Modelo ${g.id || g.pubimaglb_id}` : 'Modelo 3D',
        } : null;
      })
      .filter((m): m is { url: string; name: string } => m !== null);
  }, [publication]);

  const [activeIdx, setActiveIdx] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [bg, setBg] = useState<BgPreset>('dark');
  const viewerWrapRef = useRef<HTMLDivElement | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Carga <model-viewer> on-demand. Lo dejamos en window para no duplicar
  // si el usuario navega a otro detalle 3D después.
  useEffect(() => {
    const w = window as unknown as { __modelViewerLoaded?: boolean };
    if (w.__modelViewerLoaded) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js';
    script.onload = () => {
      w.__modelViewerLoaded = true;
      setScriptLoaded(true);
    };
    script.onerror = () => {
      // Fallback: log y dejamos el placeholder visible.
      // eslint-disable-next-line no-console
      console.error('No se pudo cargar model-viewer');
    };
    document.head.appendChild(script);
  }, []);

  const handleFullscreen = () => {
    const el = viewerWrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      el.requestFullscreen().catch(() => {});
    }
  };

  if (publicationQuery.isLoading) {
    return (
      <div className="pv-loading">
        <i className="fas fa-spinner fa-spin" /> Cargando visor 3D…
      </div>
    );
  }

  if (publicationQuery.error || !publication) {
    return (
      <div className="pv-error">
        <i className="fas fa-exclamation-triangle" />
        <p>{publicationQuery.error instanceof ApiError ? publicationQuery.error.message : 'No se pudo cargar la publicación.'}</p>
        <Link href="/publications" className="pv-btn">Volver al catálogo</Link>
        <style jsx>{viewerStyles}</style>
      </div>
    );
  }

  if (models.length === 0) {
    return (
      <div className="pv-error">
        <i className="fas fa-cube" />
        <p>Esta publicación no tiene archivos 3D.</p>
        <Link href={`/publications/${id}`} className="pv-btn">
          <i className="fas fa-arrow-left" /> Volver a la publicación
        </Link>
        <style jsx>{viewerStyles}</style>
      </div>
    );
  }

  const activeModel = models[activeIdx] ?? models[0];
  const bgStyle = BG_PRESETS[bg];

  return (
    <main className="pv-root" style={{ background: bgStyle.background, color: bgStyle.color }}>
      {/* Header con back + título + meta */}
      <header className="pv-header">
        <Link href={`/publications/${id}`} className="pv-back">
          <i className="fas fa-arrow-left" />
          <span>Volver a la publicación</span>
        </Link>
        <div className="pv-title">
          <h1>{publication.pub_title}</h1>
          <span className="pv-subtitle">
            <i className="fas fa-cube" /> Visor 3D — {models.length} {models.length === 1 ? 'modelo' : 'modelos'}
          </span>
        </div>
        <div className="pv-price">
          {formatPrice(publication.pubdet_price, publication.pubdet_currency)}
        </div>
      </header>

      {/* Viewer + controles */}
      <div className="pv-body">
        <div ref={viewerWrapRef} className="pv-canvas">
          {scriptLoaded ? (
            <model-viewer
              key={activeModel.url}
              src={activeModel.url}
              alt={`Modelo 3D: ${publication.pub_title}`}
              camera-controls
              auto-rotate={autoRotate ? '' : undefined}
              rotation-per-second="20deg"
              shadow-intensity="1"
              exposure="1"
              tone-mapping="aces"
              ar
              ar-modes="webxr scene-viewer quick-look"
              style={{
                width: '100%',
                height: '100%',
                background: 'transparent',
                ['--poster-color' as string]: 'transparent',
              }}
            />
          ) : (
            <div className="pv-canvas-loading">
              <i className="fas fa-spinner fa-spin" /> Cargando visor…
            </div>
          )}
        </div>

        {/* Toolbar inferior con controles */}
        <div className="pv-toolbar">
          <div className="pv-toolbar-group">
            <button
              type="button"
              className={`pv-tool ${autoRotate ? 'active' : ''}`}
              onClick={() => setAutoRotate((v) => !v)}
              title={autoRotate ? 'Detener rotación' : 'Rotar automáticamente'}
            >
              <i className={`fas ${autoRotate ? 'fa-pause' : 'fa-sync'}`} />
              <span>{autoRotate ? 'Pausar' : 'Rotar'}</span>
            </button>

            <button
              type="button"
              className="pv-tool"
              onClick={handleFullscreen}
              title="Pantalla completa"
            >
              <i className="fas fa-expand" />
              <span>Pantalla completa</span>
            </button>
          </div>

          <div className="pv-toolbar-group pv-bg-group">
            <span className="pv-bg-label">Fondo:</span>
            {(Object.keys(BG_PRESETS) as BgPreset[]).map((preset) => (
              <button
                key={preset}
                type="button"
                className={`pv-bg-swatch ${bg === preset ? 'active' : ''}`}
                onClick={() => setBg(preset)}
                title={BG_PRESETS[preset].label}
                style={{ background: BG_PRESETS[preset].background }}
                aria-label={BG_PRESETS[preset].label}
              />
            ))}
          </div>
        </div>

        {/* Thumbnails (solo si hay más de 1) */}
        {models.length > 1 && (
          <div className="pv-thumbnails">
            {models.map((m, i) => (
              <button
                key={m.url}
                type="button"
                className={`pv-thumb ${i === activeIdx ? 'active' : ''}`}
                onClick={() => setActiveIdx(i)}
                title={m.name}
              >
                <i className="fas fa-cube" />
                <span>Modelo {i + 1}</span>
              </button>
            ))}
          </div>
        )}

        {/* Hint de uso */}
        <div className="pv-hint">
          <i className="fas fa-info-circle" />
          <span>Arrastra para rotar · Rueda del ratón para zoom · Doble click para reset</span>
        </div>
      </div>

      <style jsx>{viewerStyles}</style>
    </main>
  );
};

// Estilos separados para reuso en estados de loading/error.
const viewerStyles = `
  .pv-root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    transition: background 0.3s;
  }

  .pv-header {
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 18px 28px;
    background: rgba(0,0,0,0.25);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .pv-back {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--clr-theme-1, #6c5ce7);
    color: #fff !important;
    padding: 9px 16px;
    border-radius: 8px;
    text-decoration: none !important;
    font-weight: 600;
    font-size: 14px;
    transition: opacity 0.15s, transform 0.15s;
    white-space: nowrap;
  }
  .pv-back:hover {
    opacity: 0.9;
    transform: translateX(-2px);
  }
  .pv-title {
    flex: 1;
    min-width: 0;
  }
  .pv-title h1 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .pv-subtitle {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    opacity: 0.7;
    margin-top: 2px;
  }
  .pv-price {
    font-size: 20px;
    font-weight: 700;
    background: linear-gradient(135deg, #fbbf24, #d97706);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    white-space: nowrap;
  }

  .pv-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 18px 28px 24px;
    gap: 14px;
    min-height: 0;
  }

  .pv-canvas {
    flex: 1;
    min-height: 50vh;
    border-radius: 18px;
    overflow: hidden;
    background: rgba(0,0,0,0.2);
    border: 1px solid rgba(255,255,255,0.06);
    position: relative;
  }
  .pv-canvas-loading {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    opacity: 0.6;
    font-size: 14px;
  }

  .pv-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    padding: 12px 16px;
    background: rgba(0,0,0,0.25);
    backdrop-filter: blur(8px);
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.06);
  }
  .pv-toolbar-group {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .pv-tool {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 14px;
    background: rgba(255,255,255,0.08);
    color: inherit;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, transform 0.15s;
  }
  .pv-tool:hover {
    background: rgba(255,255,255,0.14);
  }
  .pv-tool.active {
    background: var(--clr-theme-1, #6c5ce7);
    border-color: var(--clr-theme-1, #6c5ce7);
    color: #fff;
  }

  .pv-bg-group {
    gap: 6px;
  }
  .pv-bg-label {
    font-size: 12px;
    opacity: 0.65;
    margin-right: 4px;
  }
  .pv-bg-swatch {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.2);
    cursor: pointer;
    transition: transform 0.15s, border-color 0.15s;
  }
  .pv-bg-swatch:hover {
    transform: scale(1.08);
  }
  .pv-bg-swatch.active {
    border-color: var(--clr-theme-1, #6c5ce7);
    box-shadow: 0 0 0 3px rgba(108,92,231,0.3);
  }

  .pv-thumbnails {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding: 4px 2px;
  }
  .pv-thumb {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    min-width: 90px;
    padding: 14px 16px;
    background: rgba(255,255,255,0.06);
    border: 2px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    cursor: pointer;
    color: inherit;
    font-size: 12px;
    font-weight: 600;
    transition: background 0.15s, border-color 0.15s, transform 0.15s;
  }
  .pv-thumb i {
    font-size: 22px;
    opacity: 0.7;
  }
  .pv-thumb:hover {
    background: rgba(255,255,255,0.1);
    transform: translateY(-2px);
  }
  .pv-thumb.active {
    background: rgba(108,92,231,0.15);
    border-color: var(--clr-theme-1, #6c5ce7);
  }
  .pv-thumb.active i {
    color: var(--clr-theme-1, #6c5ce7);
    opacity: 1;
  }

  .pv-hint {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    opacity: 0.55;
    text-align: center;
    justify-content: center;
    padding-top: 4px;
  }

  /* Estados de loading/error/empty */
  .pv-loading,
  .pv-error {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    background: #0f0f1e;
    color: #fff;
    padding: 20px;
    text-align: center;
  }
  .pv-loading {
    font-size: 16px;
    opacity: 0.7;
  }
  .pv-error i {
    font-size: 48px;
    color: #fbbf24;
    opacity: 0.85;
  }
  .pv-error p {
    margin: 0;
    font-size: 15px;
    opacity: 0.85;
    max-width: 480px;
  }
  .pv-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--clr-theme-1, #6c5ce7);
    color: #fff !important;
    padding: 10px 22px;
    border-radius: 8px;
    text-decoration: none !important;
    font-weight: 600;
    font-size: 14px;
    margin-top: 8px;
  }
  .pv-btn:hover {
    opacity: 0.9;
  }

  @media (max-width: 768px) {
    .pv-header {
      flex-wrap: wrap;
      gap: 12px;
      padding: 14px 16px;
    }
    .pv-title h1 { font-size: 15px; }
    .pv-price { font-size: 16px; }
    .pv-body {
      padding: 14px 16px 20px;
    }
    .pv-toolbar {
      gap: 8px;
    }
    .pv-tool span {
      display: none;
    }
    .pv-tool {
      padding: 9px 11px;
    }
  }
`;

export default PublicationViewerMain;
