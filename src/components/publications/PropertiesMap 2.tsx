"use client";
import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { AnyPublicationListItem } from '@/types/api';
import {
  getCoordsFromLocation,
  clusterByCoords,
  GUATEMALA_CENTER,
} from '@/utils/gtMunicipalityCoords';
import { getBackendUrl } from '@/utils/backendUrl';
import { getImageVariant } from '@/utils/imageVariants';
import { formatPrice } from './publicationUtils';
import Link from 'next/link';

/**
 * Fase 19 — Mapa interactivo de propiedades.
 *
 * Stack: Leaflet (gratis, sin API key) + tiles de OpenStreetMap.
 *
 * Cómo funciona:
 *   1. Cada publicación se geo-ubica con `getCoordsFromLocation` usando
 *      el municipio/ciudad indicado por el propietario (centroide aprox).
 *      Sin lat/lng real en backend todavía — eso entra en Fase 19.1.
 *   2. Publicaciones que comparten coords (mismo municipio) se agrupan
 *      en clusters. Un pin con badge "N" se muestra en lugar de N pins
 *      encimados.
 *   3. Al click en un pin se abre popup con foto + precio + título +
 *      botón "Ver detalle".
 *
 * Como Leaflet manipula el DOM directo, usamos `dynamic(..., { ssr: false })`
 * para evitar errores de "window is not defined" en SSR.
 */

// Cargas dinámicas: react-leaflet usa `window` y rompe en SSR si lo
// importamos directo. Estos wrappers ssr:false lo evitan.
const MapContainer = dynamic(
  () => import('react-leaflet').then((m) => m.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((m) => m.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import('react-leaflet').then((m) => m.Marker),
  { ssr: false },
);
const Popup = dynamic(
  () => import('react-leaflet').then((m) => m.Popup),
  { ssr: false },
);

interface Props {
  publications: AnyPublicationListItem[];
}

interface PubWithCoords {
  pub: AnyPublicationListItem;
  __coords: [number, number];
}

const PropertiesMap: React.FC<Props> = ({ publications }) => {
  // Geocodificar todas las publicaciones (memo: se recalcula solo cuando
  // cambia la lista, que es lo deseable cuando los filtros aplican).
  const clusters = useMemo(() => {
    const withCoords: PubWithCoords[] = publications.map((pub) => ({
      pub,
      __coords: getCoordsFromLocation(pub.country, pub.city, pub.town),
    }));
    return clusterByCoords(withCoords);
  }, [publications]);

  // Para que Leaflet inicialice bien los íconos default (los SVG vienen
  // del paquete pero Next no los sirve por path automático), parchamos
  // el ícono default cuando estamos en el cliente.
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    import('leaflet').then((L) => {
      // Solo parcheamos una vez. Sin esto, los markers salen rotos
      // (no encuentra marker-icon.png).
      delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
    });
  }, []);

  return (
    <div className="pm-map-wrap">
      <MapContainer
        center={GUATEMALA_CENTER}
        zoom={7}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {clusters.map((cluster) => {
          const count = cluster.items.length;
          // En cada cluster, mostramos popup con la primera publicación y
          // un mini-listado si hay más.
          const first = cluster.items[0].pub;
          const firstImage = first.images?.[0]?.url || first.image;
          const imgSrc = firstImage
            ? getBackendUrl(getImageVariant(firstImage, 'card'))
            : '';

          return (
            <Marker key={`${cluster.coords[0]}-${cluster.coords[1]}`} position={cluster.coords}>
              <Popup minWidth={220} maxWidth={260}>
                <div className="pm-popup">
                  {imgSrc && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imgSrc} alt={first.title} className="pm-popup-img" />
                  )}
                  <div className="pm-popup-title">{first.title}</div>
                  <div className="pm-popup-price">
                    {formatPrice(first.price, first.currency)}
                  </div>
                  <div className="pm-popup-loc">
                    <i className="fas fa-map-marker-alt" /> {first.town || first.city}
                  </div>
                  <Link href={`/publications/${first.id}`} className="pm-popup-cta">
                    Ver propiedad
                  </Link>
                  {count > 1 && (
                    <div className="pm-popup-more">
                      + {count - 1} {count - 1 === 1 ? 'propiedad más' : 'propiedades más'} en esta zona
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {publications.length === 0 && (
        <div className="pm-empty-overlay">
          <i className="fas fa-map-marked-alt" />
          <p>No hay propiedades para mostrar con los filtros actuales.</p>
        </div>
      )}

      <style jsx global>{`
        /* Leaflet CSS — usamos CDN para evitar problemas de bundling. */
        @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');

        .pm-popup-img {
          width: 100%;
          height: 120px;
          object-fit: cover;
          border-radius: 6px;
          margin-bottom: 8px;
        }
        .pm-popup-title {
          font-weight: 700;
          font-size: 14px;
          margin-bottom: 4px;
          line-height: 1.3;
        }
        .pm-popup-price {
          font-size: 15px;
          font-weight: 800;
          color: var(--clr-theme-1, #2785ff);
          margin-bottom: 6px;
        }
        .pm-popup-loc {
          font-size: 12px;
          opacity: 0.7;
          margin-bottom: 10px;
        }
        .pm-popup-loc i {
          margin-right: 4px;
        }
        .pm-popup-cta {
          display: block;
          background: var(--clr-theme-1, #2785ff);
          color: #fff !important;
          text-align: center;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          background-image: none !important;
        }
        .pm-popup-cta:hover {
          opacity: 0.9;
          color: #fff !important;
        }
        .pm-popup-more {
          font-size: 11px;
          opacity: 0.65;
          margin-top: 8px;
          text-align: center;
          font-style: italic;
        }
      `}</style>

      <style jsx>{`
        .pm-map-wrap {
          position: relative;
          width: 100%;
          height: 600px;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid var(--clr-common-border, #e0e2e5);
        }
        .pm-empty-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.92);
          z-index: 500;
          pointer-events: none;
          text-align: center;
        }
        .pm-empty-overlay i {
          font-size: 48px;
          opacity: 0.3;
          margin-bottom: 14px;
        }
        .pm-empty-overlay p {
          margin: 0;
          font-size: 14px;
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
};

export default PropertiesMap;
