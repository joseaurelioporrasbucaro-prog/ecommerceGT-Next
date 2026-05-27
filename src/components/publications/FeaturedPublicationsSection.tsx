"use client";
import React from 'react';
import Link from 'next/link';
import PublicationCard from './PublicationCard';
import { useFeaturedPublications, recordAdClick } from '@/hooks/api/useCampaigns';
import type { AnyPublicationListItem } from '@/types/api';

/** Fase 10 — grid de publicaciones destacadas (patrocinadas). Para campañas con
 *  objetivo 'mensajes' se muestra un botón "Enviar mensaje" (consume por clic). */
const FeaturedPublicationsSection = ({ limit = 4 }: { limit?: number }) => {
  const { data } = useFeaturedPublications(limit);
  const items = data ?? [];
  if (items.length === 0) return null;

  return (
    <div className="featured-section">
      <h4 className="featured-title"><i className="fas fa-bolt" /> Destacados</h4>
      <div className="row">
        {items.map((pub) => (
          <div key={pub.campId} className="featured-col-wrap">
            <div onMouseDown={() => { if (pub.campObjective !== 'mensajes') recordAdClick(pub.campId); }}>
              <PublicationCard publication={pub as unknown as AnyPublicationListItem} isFeatured />
            </div>
            {pub.campObjective === 'mensajes' && (
              <Link
                href={`/messages?pub=${pub.id}`}
                className="featured-msg-btn"
                onMouseDown={() => recordAdClick(pub.campId)}
              >
                <i className="fas fa-paper-plane" /> Enviar mensaje
              </Link>
            )}
          </div>
        ))}
      </div>
      <style jsx>{`
        .featured-section { margin-bottom: 36px; }
        .featured-title { display: flex; align-items: center; gap: 9px; margin-bottom: 18px; }
        .featured-title :global(i) { color: #f59e0b; }
        .featured-msg-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          margin: -14px 12px 20px; padding: 10px; border-radius: 8px;
          background: var(--clr-theme-1, #6c5ce7); color: #fff; font-weight: 600;
          text-decoration: none;
        }
        .featured-msg-btn:hover { opacity: 0.92; }
      `}</style>
    </div>
  );
};

export default FeaturedPublicationsSection;
