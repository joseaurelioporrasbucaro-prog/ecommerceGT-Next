"use client";
import React from 'react';
import PublicationCard from './PublicationCard';
import { useFeaturedPublications, recordAdClick, type FeaturedPublication } from '@/hooks/api/useCampaigns';
import type { AnyPublicationListItem } from '@/types/api';

/** Fase 10 — grid de publicaciones destacadas (patrocinadas). Para campañas con
 *  objetivo 'mensajes' se sustituye el CTA "Ver propiedad" por "Enviar mensaje"
 *  dorado (Fase 10.4) usando el prop `ctaOverride` de PublicationCard. */
const FeaturedPublicationsSection = ({ limit = 4 }: { limit?: number }) => {
  const { data } = useFeaturedPublications(limit);
  const items = data ?? [];
  if (items.length === 0) return null;

  return (
    <div className="featured-section">
      <h4 className="featured-title"><i className="fas fa-bolt" /> Destacados</h4>
      <div className="row">
        {items.map((pub: FeaturedPublication) => {
          const isMessages = pub.campObjective === 'mensajes';
          return (
            <div key={pub.campId} className="featured-col-wrap">
              <div onMouseDown={() => { if (!isMessages) recordAdClick(pub.campId); }}>
                <PublicationCard
                  publication={pub as unknown as AnyPublicationListItem}
                  isFeatured
                  ctaOverride={isMessages ? {
                    label: 'Enviar mensaje',
                    href: `/messages?pub=${pub.id}`,
                    iconClass: 'fa-paper-plane',
                    gold: true,
                    onMouseDown: () => recordAdClick(pub.campId),
                  } : undefined}
                />
              </div>
            </div>
          );
        })}
      </div>
      <style jsx>{`
        .featured-section { margin-bottom: 36px; }
        .featured-title { display: flex; align-items: center; gap: 9px; margin-bottom: 18px; }
        .featured-title :global(i) { color: #f59e0b; }
      `}</style>
    </div>
  );
};

export default FeaturedPublicationsSection;
