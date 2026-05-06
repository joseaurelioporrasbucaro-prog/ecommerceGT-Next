"use client";

import React, { useMemo, useState } from 'react';
import ThemeChanger from '@/components/home/ThemeChanger';
import Breadcrumbs from '@/utils/Breadcrumbs';
import Pagination from '@/utils/Pagination';
import { ApiError } from '@/utils/Api';
import { usePublicationCategories } from '@/hooks/api/useCatalogs';
import { usePublications } from '@/hooks/api/usePublications';
import type { AnyPublicationListItem } from '@/types/api';
import PublicationCard from './PublicationCard';
import PublicationsBar, { type PublicationFilters } from './PublicationsBar';

const INITIAL_FILTERS: PublicationFilters = {
  search: '',
  category: '',
};

function getErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Error inesperado';
}

function matchesSearch(publication: AnyPublicationListItem, search: string): boolean {
  const normalizedSearch = search.trim().toLowerCase();
  if (!normalizedSearch) {
    return true;
  }

  const searchableText = [
    publication.title,
    publication.description,
    publication.address,
    publication.country,
    publication.city,
    publication.town,
    publication.category,
  ].join(' ').toLowerCase();

  return searchableText.includes(normalizedSearch);
}

const PublicationsMain = () => {
  const [filters, setFilters] = useState<PublicationFilters>(INITIAL_FILTERS);
  const publicationsQuery = usePublications();
  const categoriesQuery = usePublicationCategories();

  const publications = publicationsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  const filteredPublications = useMemo(() => {
    return publications.filter((publication) => {
      const categoryMatches = !filters.category || publication.category === filters.category;
      return categoryMatches && matchesSearch(publication, filters.search);
    });
  }, [filters.category, filters.search, publications]);

  const isLoading = publicationsQuery.isLoading || categoriesQuery.isLoading;
  const error = publicationsQuery.error || categoriesQuery.error;

  return (
    <main>
      <ThemeChanger />
      <Breadcrumbs
        breadcrumbTitle="Publicaciones"
        breadcrumbSubTitle="Publicaciones"
      />

      <section className="artworks-area pt-130 pb-90">
        <div className="container">
          <PublicationsBar
            filters={filters}
            categories={categories}
            onFiltersChange={setFilters}
          />

          {isLoading && (
            <div className="row wow fadeInUp">
              <div className="col-12">
                <div className="alert alert-info">Cargando publicaciones...</div>
              </div>
            </div>
          )}

          {error && (
            <div className="row wow fadeInUp">
              <div className="col-12">
                <div className="alert alert-danger">{getErrorMessage(error)}</div>
              </div>
            </div>
          )}

          {!isLoading && !error && (
            <>
              <div className="row wow fadeInUp">
                {filteredPublications.length > 0 ? (
                  filteredPublications.map((publication) => (
                    <PublicationCard key={publication.id} publication={publication} />
                  ))
                ) : (
                  <div className="col-12">
                    <div className="alert alert-warning">
                      No encontramos publicaciones con esos filtros.
                    </div>
                  </div>
                )}
              </div>
              <div className="row wow fadeInUp">
                <div className="col-12">
                  <Pagination />
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
};

export default PublicationsMain;
