"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { usePublicationDetail } from '@/hooks/api/usePublications';
import { ApiError } from '@/utils/Api';
import { getBackendUrl } from '@/utils/backendUrl';
import { formatPrice, getPublicationImagePathGlb } from './publicationUtils';
import type { PublicationImageGlb } from '@/types/api';

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

const BG_PRESETS: Record<BgPreset, { background: string; color: string; labelKey: 'dark' | 'light' | 'showroom' }> = {
  dark:     { background: '#0f0f1e',                                       color: '#fff',     labelKey: 'dark' },
  light:    { background: '#f3f4f6',                                       color: '#1f2937',  labelKey: 'light' },
  showroom: { background: 'linear-gradient(180deg,#1e293b 0%,#475569 100%)', color: '#fff',   labelKey: 'showroom' },
};

interface PublicationViewerMainProps {
  id: string;
}

const PublicationViewerMain: React.FC<PublicationViewerMainProps> = ({ id }) => {
  const t = useTranslations('publications');
  const publicationQuery = usePublicationDetail(id);
  const publication = publicationQuery.data;

  // Lista de URLs absolutas de los GLB. Usamos `getPublicationImagePathGlb`
  // que ya tiene fallback de `pubimaglb_url → url` por si el backend
  // devuelve el shape raw (sin alias) en alguna ruta.
  const models = useMemo(() => {
    if (!publication?.imagesglb) return [] as { url: string; name: string }[];
    return publication.imagesglb
      .map((g: PublicationImageGlb) => {
        const path = getPublicationImagePathGlb(g);
        const modelId = g.id || g.pubimaglb_id;
        return path ? {
          url: getBackendUrl(path),
          name: modelId ? t('viewer.modelNamed', { id: modelId }) : t('viewer.model3d'),
        } : null;
      })
      .filter((m: { url: string; name: string } | null): m is { url: string; name: string } => m !== null);
  }, [publication, t]);

  const [activeIdx, setActiveIdx] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [bg, setBg] = useState<BgPreset>('dark');
  const viewerWrapRef = useRef<HTMLDivElement | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Carga <model-viewer> on-demand y espera a que el Custom Element esté
  // registrado antes de renderearlo. Sin esto, React puede renderear el
  // <model-viewer> como un div vacío (porque el browser aún no procesó el
  // custom element) y luego, cuando carga, queda mal dimensionado hasta un
  // resize — síntoma típico: "solo se ve en fullscreen".
  useEffect(() => {
    const SRC = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js';
    const w = window as unknown as { __modelViewerLoaded?: boolean };

    const waitForDefined = () => {
      if (window.customElements && window.customElements.whenDefined) {
        window.customElements.whenDefined('model-viewer').then(() => {
          w.__modelViewerLoaded = true;
          setScriptLoaded(true);
        });
      } else {
        // Browser muy viejo sin customElements — degradación grácil.
        w.__modelViewerLoaded = true;
        setScriptLoaded(true);
      }
    };

    if (w.__modelViewerLoaded) {
      setScriptLoaded(true);
      return;
    }

    // ¿El script ya está en el DOM de un mount anterior pero aún no resolvió?
    const existing = document.querySelector(`script[src="${SRC}"]`);
    if (existing) {
      waitForDefined();
      return;
    }

    const script = document.createElement('script');
    script.type = 'module';
    script.src = SRC;
    script.onload = waitForDefined;
    script.onerror = () => {
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
        <i className="fas fa-spinner fa-spin" /> {t('viewer.loading3d')}
      </div>
    );
  }

  if (publicationQuery.error || !publication) {
    return (
      <div className="pv-error">
        <i className="fas fa-exclamation-triangle" />
        <p>{publicationQuery.error instanceof ApiError ? publicationQuery.error.message : t('viewer.errorPublication')}</p>
        <Link href="/publications" className="pv-btn">{t('viewer.returnCatalog')}</Link>
        <style jsx>{viewerStyles}</style>
      </div>
    );
  }

  if (models.length === 0) {
    return (
      <div className="pv-error">
        <i className="fas fa-cube" />
        <p>{t('viewer.noModels')}</p>
        <Link href={`/publications/${id}`} className="pv-btn">
          <i className="fas fa-arrow-left" /> {t('viewer.returnPublication')}
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
          <span>{t('viewer.returnPublication')}</span>
        </Link>
        <div className="pv-title">
          <h1>{publication.pub_title}</h1>
          <span className="pv-subtitle">
            <i className="fas fa-cube" /> {t('viewer.subtitle')} — {t('viewer.modelCount', { count: models.length })}
          </span>
        </div>
        <div className="pv-price">
          {formatPrice(publication.pubdet_price, publication.pubdet_currency, t('card.priceConsult'))}
        </div>
      </header>

      {/* Viewer + controles */}
      <div className={`pv-body ${models.length <= 1 ? 'no-thumbs' : ''}`}>
        <div ref={viewerWrapRef} className="pv-canvas">
          {scriptLoaded ? (
            <model-viewer
              key={activeModel.url}
              src={activeModel.url}
              alt={t('viewer.modelAlt', { title: publication.pub_title })}
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
              <i className="fas fa-spinner fa-spin" /> {t('viewer.canvasLoading')}
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
              title={autoRotate ? t('viewer.pauseRotateTitle') : t('viewer.startRotateTitle')}
            >
              <i className={`fas ${autoRotate ? 'fa-pause' : 'fa-sync'}`} />
              <span>{autoRotate ? t('viewer.pauseRotate') : t('viewer.autoRotate')}</span>
            </button>

            <button
              type="button"
              className="pv-tool"
              onClick={handleFullscreen}
              title={t('viewer.fullscreen')}
            >
              <i className="fas fa-expand" />
              <span>{t('viewer.fullscreen')}</span>
            </button>
          </div>

          <div className="pv-toolbar-group pv-bg-group">
            <span className="pv-bg-label">{t('viewer.bgLabel')}</span>
            {(Object.keys(BG_PRESETS) as BgPreset[]).map((preset) => (
              <button
                key={preset}
                type="button"
                className={`pv-bg-swatch ${bg === preset ? 'active' : ''}`}
                onClick={() => setBg(preset)}
                title={t(`viewer.${BG_PRESETS[preset].labelKey}`)}
                style={{ background: BG_PRESETS[preset].background }}
                aria-label={t(`viewer.${BG_PRESETS[preset].labelKey}`)}
              />
            ))}
          </div>
        </div>

        {/* Thumbnails (solo si hay más de 1) */}
        {models.length > 1 && (
          <div className="pv-thumbnails">
            {models.map((m: { url: string; name: string }, i: number) => (
              <button
                key={m.url}
                type="button"
                className={`pv-thumb ${i === activeIdx ? 'active' : ''}`}
                onClick={() => setActiveIdx(i)}
                title={m.name}
              >
                <i className="fas fa-cube" />
                <span>{t('viewer.modelNamed', { id: i + 1 })}</span>
              </button>
            ))}
          </div>
        )}

        {/* Hint de uso */}
        <div className="pv-hint">
          <i className="fas fa-info-circle" />
          <span>{t('viewer.hint')}</span>
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
    display: flex;
    flex-direction: column;
    padding: 18px 28px 24px;
    gap: 14px;
  }

  /* model-viewer NECESITA altura explícita en px/vh, no flex:1 — con flex
     se inicializa a 0 y no se reflowa al cargar el modelo (por eso solo
     se veía en fullscreen del navegador, que fuerza un resize). Calcula
     el alto restando header (~70px) + toolbar (~64px) + thumbs (~80px) +
     hint (~30px) + paddings (~50px) ≈ 290px del viewport. */
  .pv-canvas {
    height: calc(100vh - 290px);
    min-height: 380px;
    border-radius: 18px;
    overflow: hidden;
    background: rgba(0,0,0,0.2);
    border: 1px solid rgba(255,255,255,0.06);
    position: relative;
  }
  .pv-canvas :global(model-viewer) {
    display: block;
    width: 100% !important;
    height: 100% !important;
  }
  /* Sin thumbnails (un solo modelo), recupera el alto del slot que no se usa. */
  .pv-body.no-thumbs .pv-canvas {
    height: calc(100vh - 210px);
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
