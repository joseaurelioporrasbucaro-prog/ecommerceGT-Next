"use client";

import Image from 'next/image';
import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import { useCities, useCountries, useMunicipalities } from '@/hooks/api/useCatalogs';
import { useSellerInfo } from '@/hooks/api/usePublications';
import type { PublicationDetail } from '@/types/api';
import { getBackendUrl } from '@/utils/backendUrl';
import {
  formatNumberValue,
  formatPrice,
  getPublicationDetailImages,
} from './publicationUtils';

interface PublicationContentProps {
  publication: PublicationDetail;
}

const PublicationContent = ({ publication }: PublicationContentProps) => {
  const images = useMemo(() => getPublicationDetailImages(publication), [publication]);
  const [activeImage, setActiveImage] = useState(images[0]);
  const countriesQuery = useCountries();
  const citiesQuery = useCities(publication.cou_id);
  const municipalitiesQuery = useMunicipalities(publication.cit_id);
  const sellerQuery = useSellerInfo(publication.cus_id);
  const seller = sellerQuery.data;
  const sellerName = seller ? `${seller.firstName} ${seller.lastName}` : publication.user;
  const sellerImage = seller?.imageUrl ? getBackendUrl(seller.imageUrl) : '/assets/img/profile/avatar.png';
  const countryName = countriesQuery.data?.find((country) => country.country === publication.cou_id)?.description;
  const cityName = citiesQuery.data?.find((city) => city.city === publication.cit_id)?.description;
  const municipalityName = municipalitiesQuery.data?.find(
    (municipality) => municipality.municipality === publication.tow_id,
  )?.description;

  return (
    <section className="art-details-area pt-130 pb-0">
      <div className="container">
        <div className="art-details-wrapper">
          <div className="row">
            <div className="col-xl-6 col-lg-5">
              <div className="art-item-img pos-rel art-details-img wow fadeInUp">
                <span>
                  <Image
                    width={700}
                    height={620}
                    style={{ width: '100%', height: '520px', objectFit: 'cover' }}
                    src={activeImage}
                    alt={publication.pub_title}
                  />
                </span>
              </div>
              {images.length > 1 && (
                <div className="d-flex gap-2 mt-20 flex-wrap">
                  {images.map((image) => (
                    <button
                      key={image}
                      type="button"
                      className="border-0 p-0 bg-transparent"
                      onClick={() => setActiveImage(image)}
                      aria-label="Ver imagen de la publicación"
                    >
                      <Image
                        width={96}
                        height={72}
                        style={{
                          width: '96px',
                          height: '72px',
                          objectFit: 'cover',
                          opacity: image === activeImage ? 1 : 0.65,
                        }}
                        src={image}
                        alt={publication.pub_title}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="col-xl-6 col-lg-7">
              <div className="art-details-content wow fadeInUp">
                <div className="created-by">Publicado por</div>
                <div className="creator mb-30">
                  <div className="profile-img pos-rel">
                    <Link href={`/creator-profile/${publication.cus_id}`}>
                      <Image
                        src={sellerImage}
                        alt={sellerName}
                        width={500}
                        height={500}
                        style={{ width: '100%', height: 'auto' }}
                      />
                    </Link>
                    <div className="profile-verification verified">
                      <i className="fas fa-check"></i>
                    </div>
                  </div>
                  <div className="creator-name-id">
                    <h4 className="artist-name">
                      <Link href={`/creator-profile/${publication.cus_id}`}>{sellerName}</Link>
                    </h4>
                    <div className="artist-id">
                      {seller ? `${seller.totalPublications} publicaciones` : 'Vendedor verificado'}
                    </div>
                  </div>
                </div>

                <div className="art-name-details">
                  <h4 className="art-name mb-25">{publication.pub_title}</h4>
                  <p>{publication.pub_description}</p>
                </div>

                <div className="artist-meta-info art-details-meta-info">
                  <div className="art-meta-item artist-meta-item-border">
                    <div className="art-meta-type">Precio</div>
                    <div className="art-price">{formatPrice(publication.pubdet_price)}</div>
                    <div className="art-meta-notice">Quetzales</div>
                  </div>
                  <div className="art-meta-item artist-meta-item-border">
                    <div className="art-meta-type">Vistas</div>
                    <div className="art-sale">
                      <span className="art-sold">{formatNumberValue(publication.pub_views, '0')}</span>
                    </div>
                    <div className="art-meta-notice">Interés acumulado</div>
                  </div>
                  <div className="art-meta-item">
                    <div className="art-meta-type">Estado</div>
                    <div className="art-sale">
                      <span className="art-stock">Disponible</span>
                    </div>
                    <div className="art-meta-notice">Publicación activa</div>
                  </div>
                </div>

                <div className="art-details-action mt-50 mb-50">
                  <Link href={`/creator-profile/${publication.cus_id}`} className="place-bid">
                    Ver vendedor
                  </Link>
                  <div className="art-action-like-count">
                    <i className="flaticon-heart"></i>
                    Guardar en Fase 4
                  </div>
                  <div className="art-action-collection">
                    <i className="flaticon-plus-sign"></i>Contactar en Fase 6
                  </div>
                </div>

                <div className="art-details-information">
                  <div className="art-information-tab-nav mb-20">
                    <nav>
                      <div className="nav nav-tabs" id="nav-tab" role="tablist">
                        <button
                          className="nav-link active"
                          id="nav-info-tab"
                          data-bs-toggle="tab"
                          data-bs-target="#tab-info"
                          type="button"
                          role="tab"
                          aria-selected="true"
                        >
                          <span className="profile-nav-button">Información</span>
                        </button>
                        <button
                          className="nav-link"
                          id="nav-details-tab"
                          data-bs-toggle="tab"
                          data-bs-target="#tab-details"
                          type="button"
                          role="tab"
                          aria-selected="false"
                        >
                          <span className="profile-nav-button">Características</span>
                        </button>
                      </div>
                    </nav>
                  </div>
                  <div className="art-information-tab-contents mb-0">
                    <div className="tab-content" id="nav-tabContent">
                      <div
                        className="tab-pane fade active show"
                        id="tab-info"
                        role="tabpanel"
                        aria-labelledby="nav-info-tab"
                      >
                        <div className="art-info-wrapper">
                          <ul>
                            <li><span className="art-info-title">Dirección</span>{publication.pub_address}</li>
                            <li><span className="art-info-title">País</span>{countryName ?? 'No especificado'}</li>
                            <li><span className="art-info-title">Departamento</span>{cityName ?? 'No especificado'}</li>
                            <li><span className="art-info-title">Municipio</span>{municipalityName ?? 'No especificado'}</li>
                          </ul>
                        </div>
                      </div>
                      <div
                        className="tab-pane fade"
                        id="tab-details"
                        role="tabpanel"
                        aria-labelledby="nav-details-tab"
                      >
                        <div className="art-info-wrapper">
                          <ul>
                            <li><span className="art-info-title">Habitaciones</span>{formatNumberValue(publication.pubdet_rooms)}</li>
                            <li><span className="art-info-title">Baños</span>{formatNumberValue(publication.pubdet_bathrooms)}</li>
                            <li><span className="art-info-title">Parqueos</span>{formatNumberValue(publication.pubdet_parking)}</li>
                            <li><span className="art-info-title">Nivel</span>{formatNumberValue(publication.pubdet_level)}</li>
                            <li><span className="art-info-title">Tamaño</span>{publication.pubdet_size ? `${publication.pubdet_size} m²` : 'No especificado'}</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PublicationContent;
