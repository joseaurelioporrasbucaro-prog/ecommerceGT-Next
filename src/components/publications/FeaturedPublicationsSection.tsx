"use client";
import React from 'react';
import { useTranslations } from 'next-intl';
import PublicationCard from './PublicationCard';
import { useFeaturedPublications, recordAdClick, type FeaturedPublication } from '@/hooks/api/useCampaigns';
import type { AnyPublicationListItem } from '@/types/api';

/** Fase 10 — grid de publicaciones destacadas (patrocinadas). Para campañas con
 *  objetivo 'mensajes' se sustituye el CTA "Ver propiedad" por "Enviar mensaje"
 *  (Handoff #8 [CARD-3]: ahora verde sólido del sistema, ya no dorado).
 *  `inSponsoredSection`: cuando la sección padre ya rotula "Destacado"/"Patrocinado"
 *  (ej. la home), suprime el badge en cada card (regla anti-redundancia [CARD-4]). */
const FeaturedPublicationsSection = ({
  limit = 4,
  inSponsoredSection = false,
}: { limit?: number; inSponsoredSection?: boolean }) => {
  const t = useTranslations('publications');
  const { data } = useFeaturedPublications(limit);
  const items = data ?? [];
  if (items.length === 0) return null;

  return (
    <div className="featured-section">
      <h4 className="featured-title"><i className="fas fa-bolt" /> {t('card.featured')}</h4>
      <div className="row">
        {items.map((pub: FeaturedPublication) => {
          const isMessages = pub.campObjective === 'mensajes';
          return (
            <div key={pub.campId} className="featured-col-wrap">
              <div onMouseDown={() => { if (!isMessages) recordAdClick(pub.campId); }}>
                <PublicationCard
                  publication={pub as unknown as AnyPublicationListItem}
                  isFeatured
                  inSponsoredSection={inSponsoredSection}
                  ctaOverride={isMessages ? {
                    label: t('card.sendMessage'),
                    href: `/messages?pub=${pub.id}`,
                    iconClass: 'fa-comments',
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
        .featured-title :global(i) { color: var(--rating); }
      `}</style>
    </div>
  );
};

export default FeaturedPublicationsSection;
