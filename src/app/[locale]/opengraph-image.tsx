// Next 13.4 expone ImageResponse en `next/server` (en 13.5+ migra a `next/og`).
import { ImageResponse } from 'next/server';
import { isAppLocale } from '@/i18n/routing';

/**
 * Fase 18 — OG image por defecto, generada dinámicamente con la marca Kiosqui.
 *
 * Reemplaza el `/assets/img/og-default.jpg` que se referenciaba en metadata pero
 * nunca existió (preview vacía al compartir home/faq/etc.). Al ser convención de
 * archivo de Next, se aplica a TODAS las rutas bajo `[locale]/` salvo las que
 * exporten su propia imagen (ej. /publications/[id] usa la foto del anuncio).
 * Localizada: el subtítulo cambia según el locale de la ruta.
 */
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Kiosqui — Marketplace inmobiliario de Guatemala';

const TAGLINE: Record<string, string> = {
  es: 'Bienes raíces en Guatemala',
  en: 'Real estate in Guatemala',
};

export default function OpengraphImage({ params }: { params: { locale: string } }) {
  const locale = isAppLocale(params?.locale) ? params.locale : 'es';
  const tagline = TAGLINE[locale] ?? TAGLINE.es;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '96px',
          // Satori (motor de ImageResponse) NO soporta radial-gradient con sintaxis
          // de tamaño+posición; un linear-gradient es 100% soportado y rinde la marca.
          background: 'linear-gradient(125deg, #1e2d4a 0%, #283a5c 52%, #45407e 100%)',
        }}
      >
        {/* Eyebrow: pill verde con país */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '10px 22px',
            borderRadius: '999px',
            background: '#9bc64a',
            color: '#1e2d4a',
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 2,
          }}
        >
          GUATEMALA
        </div>

        {/* Wordmark Kiosqui (la "qui" en verde de marca) */}
        <div style={{ display: 'flex', marginTop: 40, fontSize: 150, fontWeight: 800, lineHeight: 1 }}>
          <span style={{ color: '#f8f4ee' }}>Kios</span>
          <span style={{ color: '#9bc64a' }}>qui</span>
        </div>

        {/* Subtítulo localizado */}
        <div style={{ display: 'flex', marginTop: 28, fontSize: 52, fontWeight: 500, color: '#ddd8f8' }}>
          {tagline}
        </div>

        {/* Pie: dominio + barra de acento */}
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 56 }}>
          <div style={{ display: 'flex', width: 64, height: 8, borderRadius: 4, background: '#b5acef' }} />
          <div style={{ display: 'flex', marginLeft: 20, fontSize: 32, fontWeight: 600, color: '#f8f4ee' }}>
            kiosqui.gt
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
