"use client";

import React from 'react';
import ThemeChanger from '@/components/home/ThemeChanger';
import Breadcrumbs from '@/utils/Breadcrumbs';
import AccountSidebar from '@/components/account/AccountSidebar';
import { ApiError } from '@/utils/Api';
import { useMyFavorites } from '@/hooks/api/useFavorites';
import type { FavoriteItem, PublicationListItemAuth } from '@/types/api';
import PublicationCard from './PublicationCard';

function getErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Error inesperado';
}

function favoriteToPublication(item: FavoriteItem): PublicationListItemAuth {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    address: item.address,
    price: item.price,
    rooms: item.rooms,
    bathrooms: item.bathrooms,
    parking: item.parking,
    levell: null,
    sizee: null,
    country: item.country,
    city: item.city,
    town: item.town,
    category: 'Propiedad',
    image: item.image || '',
    images: item.image ? [{ id: item.image, url: item.image }] : [],
    id_cus: 0,
    isFavorite: true,
  };
}

const FavoritesMain = () => {
  const favoritesQuery = useMyFavorites();
  const favorites = favoritesQuery.data ?? [];
  const publications = favorites.map(favoriteToPublication);

  return (
    <main>
      <ThemeChanger />
      <Breadcrumbs breadcrumbTitle="Mis favoritos" breadcrumbSubTitle="Mis favoritos" />

      <section className="artworks-area pt-80 pb-90">
        <div className="container">
          <div className="row">
            <div className="col-lg-3 col-md-12 mb-30">
              <AccountSidebar />
            </div>

            <div className="col-lg-9 col-md-12">
              {favoritesQuery.isLoading && (
                <div className="alert alert-info">Cargando favoritos...</div>
              )}

              {favoritesQuery.error && (
                <div className="alert alert-danger">{getErrorMessage(favoritesQuery.error)}</div>
              )}

              {!favoritesQuery.isLoading && !favoritesQuery.error && publications.length === 0 && (
                <div className="alert alert-warning">
                  Todavía no tienes publicaciones guardadas como favoritas.
                </div>
              )}

              {!favoritesQuery.isLoading && !favoritesQuery.error && publications.length > 0 && (
                <div className="row wow fadeInUp">
                  {publications.map((publication) => (
                    <PublicationCard key={publication.id} publication={publication} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default FavoritesMain;
