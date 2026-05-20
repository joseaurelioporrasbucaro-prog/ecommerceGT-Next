"use client";

import Link from 'next/link';
import React, { useMemo } from 'react';
import ThemeChanger from '@/components/home/ThemeChanger';
import { ApiError } from '@/utils/Api';
import { usePublicationDetail } from '@/hooks/api/usePublications';
import { useRegisterView } from '@/hooks/api/useRegisterView';
import { getBackendUrl } from '@/utils/backendUrl';
import PublicationComments from './PublicationComments';
import PublicationContent from './PublicationContent';
import PublicationGallery from './PublicationGallery';
import { getPublicationImagePath } from './publicationUtils';

interface PublicationDetailsMainProps {
  id: string;
}

function getErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Error inesperado';
}

const PublicationDetailsMain = ({ id }: PublicationDetailsMainProps) => {
  const publicationQuery = usePublicationDetail(id);
  const publication = publicationQuery.data;

  // Registra una vista al abrir el detalle (el backend ignora al dueño).
  useRegisterView(id);

  const galleryImages = useMemo(() => {
    if (!publication) return [];
    return publication.images
      .map((img) => getPublicationImagePath(img))
      .filter((path) => path !== '')
      .map((path) => getBackendUrl(path));
  }, [publication]);

  return (
    <>
      <ThemeChanger />

      {/* Breadcrumb */}
      <section className="page-title-area">
        <div className="container">
          <div className="row wow fadeInUp">
            <div className="col-lg-12">
              <div className="page-title">
                <h2 className="breadcrumb-title mb-10">
                  {publication?.pub_title ?? 'Detalle de publicación'}
                </h2>
                <div className="breadcrumb-menu">
                  <nav className="breadcrumb-trail breadcrumbs">
                    <ul className="trail-items">
                      <li className="trail-item trail-begin"><Link href="/">Inicio</Link></li>
                      <li className="trail-item"><Link href="/publications">Publicaciones</Link></li>
                      <li className="trail-item trail-end">
                        <span>{publication?.pub_title ?? 'Detalle'}</span>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {publicationQuery.isLoading && (
        <section className="art-details-area pt-130 pb-90">
          <div className="container">
            <div className="alert alert-info">Cargando publicación...</div>
          </div>
        </section>
      )}

      {publicationQuery.error && (
        <section className="art-details-area pt-130 pb-90">
          <div className="container">
            <div className="alert alert-danger">{getErrorMessage(publicationQuery.error)}</div>
          </div>
        </section>
      )}

      {publication && (
        <>
          {/* ───────── Galería arriba (full-width responsive) ───────── */}
          <section className="pt-50 pb-30">
            <div className="container">
              <PublicationGallery images={galleryImages} alt={publication.pub_title} />
            </div>
          </section>

          {/* ───────── Info abajo ───────── */}
          <PublicationContent publication={publication} />

          {/* ───────── Comentarios ───────── */}
          <PublicationComments
            pubId={publication.pub_id}
            pubstaId={publication.pubsta_id}
          />
        </>
      )}
    </>
  );
};

export default PublicationDetailsMain;
