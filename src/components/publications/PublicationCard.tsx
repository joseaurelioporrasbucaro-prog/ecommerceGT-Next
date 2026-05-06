import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import type { AnyPublicationListItem } from '@/types/api';
import {
  formatNumberValue,
  formatPrice,
  getPublicationListImage,
  isPublicationListItemAuth,
} from './publicationUtils';

interface PublicationCardProps {
  publication: AnyPublicationListItem;
}

const PublicationCard = ({ publication }: PublicationCardProps) => {
  const imageSrc = getPublicationListImage(publication);
  const isFavorite = isPublicationListItemAuth(publication) && publication.isFavorite;

  return (
    <div className="col-xl-3 col-lg-4 col-md-6">
      <div className="art-item-single mb-30">
        <div className="art-item-wraper">
          <div className="art-item-inner">
            <div className="art-item-img pos-rel">
              <div className="tag featured">
                <i className="fas fa-home"></i>
                {publication.category}
              </div>
              <div className="art-action">
                <div className="art-action-like" title={isFavorite ? 'Favorito' : 'Disponible'}>
                  <i className={isFavorite ? 'fas fa-heart' : 'flaticon-heart'}></i>
                </div>
              </div>
              <Link href={`/publications/${publication.id}`} className="place-bid">
                Ver propiedad
              </Link>
              <Link href={`/publications/${publication.id}`}>
                <Image
                  width={500}
                  height={360}
                  style={{ width: '100%', height: '260px', objectFit: 'cover' }}
                  src={imageSrc}
                  alt={publication.title}
                />
              </Link>
            </div>
            <div className="art-item-content pos-rel">
              <div className="artist">
                <div className="artist-id">
                  {publication.city}{publication.town ? `, ${publication.town}` : ''}
                </div>
              </div>
              <h4 className="art-name">
                <Link href={`/publications/${publication.id}`}>{publication.title}</Link>
              </h4>
              <p className="mb-20">{publication.description}</p>
              <div className="art-meta-info">
                <div className="art-meta-item">
                  <div className="art-meta-type">Precio</div>
                  <div className="art-price">{formatPrice(publication.price)}</div>
                </div>
                <div className="art-activity-btn">
                  <Link className="art-activity" href={`/publications/${publication.id}`}>
                    <i className="fal fa-eye"></i>
                    Detalle
                  </Link>
                </div>
              </div>
              <div className="art-meta-info mt-20">
                <div className="art-meta-item">
                  <div className="art-meta-type">Habitaciones</div>
                  <div className="art-price">{formatNumberValue(publication.rooms, '-')}</div>
                </div>
                <div className="art-meta-item">
                  <div className="art-meta-type">Baños</div>
                  <div className="art-price">{formatNumberValue(publication.bathrooms, '-')}</div>
                </div>
                <div className="art-meta-item">
                  <div className="art-meta-type">Parqueos</div>
                  <div className="art-price">{formatNumberValue(publication.parking, '-')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicationCard;
