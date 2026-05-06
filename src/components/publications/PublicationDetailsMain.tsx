"use client";

import Link from 'next/link';
import React from 'react';
import ThemeChanger from '@/components/home/ThemeChanger';
import { ApiError } from '@/utils/Api';
import { usePublicationDetail } from '@/hooks/api/usePublications';
import PublicationComments from './PublicationComments';
import PublicationContent from './PublicationContent';

interface PublicationDetailsMainProps {
  id: string;
}

function getErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Error inesperado';
}

const PublicationDetailsMain = ({ id }: PublicationDetailsMainProps) => {
  const publicationQuery = usePublicationDetail(id);
  const publication = publicationQuery.data;

  return (
    <>
      <ThemeChanger />
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
          <PublicationContent publication={publication} />
          <PublicationComments pubId={publication.pub_id} />
        </>
      )}
    </>
  );
};

export default PublicationDetailsMain;
