"use client";
import React from 'react';
import PublicationCard from './PublicationCard';
import { useFeaturedPublications, recordAdClick } from '@/hooks/api/useCampaigns';
import type { AnyPublicationListItem } from '@/types/api';

/** Fase 10 — carrusel/grid de publicaciones destacadas (patrocinadas). */
const FeaturedPublicationsSection = ({ limit = 4 }: { limit?: number }) => {
  const { data } = useFeaturedPublications(limit);
  const items = data ?? [];
  if (items.length === 0) return null;

  return (
    <div className="featured-section">
      <h4 className="featured-title"><i className="fas fa-bolt" /> Destacados</h4>
      <div className="row">
        {items.map((pub) => (
          <div key={pub.campId} onMouseDown={() => recordAdClick(pub.campId)} className="featured-col-wrap">
            <PublicationCard publication={pub as unknown as AnyPublicationListItem} isFeatured />
          </div>
        ))}
      </div>
      <style jsx>{`
        .featured-section { margin-bottom: 36px; }
        .featured-title { display: flex; align-items: center; gap: 9px; margin-bottom: 18px; }
        .featured-title :global(i) { color: #f59e0b; }
        .featured-col-wrap { display: contents; }
      `}</style>
    </div>
  );
};

export default FeaturedPublicationsSection;
