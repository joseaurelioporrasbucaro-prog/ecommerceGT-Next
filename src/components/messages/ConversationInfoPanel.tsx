"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getBackendUrl } from '@/utils/backendUrl';
import { generateInitialsAvatar } from '@/utils/avatarUtils';
import type { InboxItem } from '@/types/api';

interface ConversationInfoPanelProps {
  pubId: number;
  contactId: number;
  inboxItem: InboxItem | null;
}

const ConversationInfoPanel: React.FC<ConversationInfoPanelProps> = ({
  pubId,
  contactId,
  inboxItem,
}) => {
  const t = useTranslations('messages');
  const [imgErrored, setImgErrored] = useState(false);
  const [openSection, setOpenSection] = useState<'acciones' | 'publicacion' | null>('acciones');

  const contactName = inboxItem?.contact_name ?? t('info.contactFallback');
  const avatarSrc =
    !imgErrored && inboxItem?.contact_image
      ? getBackendUrl(inboxItem.contact_image)
      : generateInitialsAvatar(contactName, 144);

  const toggle = (section: 'acciones' | 'publicacion') =>
    setOpenSection((prev) => (prev === section ? null : section));

  return (
    <aside className="info-panel">
      {/* Avatar + nombre */}
      <div className="info-top">
        <div className="info-avatar-wrap">
          <Image
            src={avatarSrc}
            alt={contactName}
            width={72}
            height={72}
            style={{ objectFit: 'cover', borderRadius: '50%' }}
            onError={() => setImgErrored(true)}
            unoptimized
          />
        </div>
        <strong className="info-name">{contactName}</strong>
      </div>

      {/* Acciones rápidas */}
      <div className="info-actions-row">
        <Link href={`/creator-profile/${contactId}`} className="info-action-btn" title={t('info.profileTitle')}>
          <i className="fal fa-user" />
          <span>{t('info.profile')}</span>
        </Link>
        <Link href={`/publications/${pubId}`} className="info-action-btn" title={t('info.publicationTitle')}>
          <i className="fal fa-home" />
          <span>{t('info.publication')}</span>
        </Link>
      </div>

      {/* Sección: Accesos directos */}
      <div className="info-section">
        <button
          className="info-section-header"
          onClick={() => toggle('acciones')}
          type="button"
        >
          <span>{t('info.shortcuts')}</span>
          <i className={`fal fa-chevron-${openSection === 'acciones' ? 'up' : 'down'}`} />
        </button>
        {openSection === 'acciones' && (
          <div className="info-section-body">
            <Link href={`/creator-profile/${contactId}`} className="info-link">
              <i className="fal fa-user-circle" />
              {t('info.viewSellerProfile')}
            </Link>
            <Link href={`/publications/${pubId}`} className="info-link">
              <i className="fal fa-search-location" />
              {t('info.viewPublication')}
            </Link>
            <Link href={`/publications?category=`} className="info-link">
              <i className="fal fa-th-large" />
              {t('info.exploreProperties')}
            </Link>
          </div>
        )}
      </div>

      {/* Sección: Sobre esta publicación */}
      {inboxItem && (
        <div className="info-section">
          <button
            className="info-section-header"
            onClick={() => toggle('publicacion')}
            type="button"
          >
            <span>{t('info.aboutPublication')}</span>
            <i className={`fal fa-chevron-${openSection === 'publicacion' ? 'up' : 'down'}`} />
          </button>
          {openSection === 'publicacion' && (
            <div className="info-section-body">
              <p className="info-pub-title">{inboxItem.pub_title}</p>
              <Link href={`/publications/${pubId}`} className="fill-btn info-pub-btn">
                {t('info.viewDetail')}
              </Link>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .info-panel {
          border-left: 1px solid rgba(128, 128, 128, 0.18);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          background: var(--clr-bg-white, #fff);
        }
        .info-top {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 28px 16px 16px;
          border-bottom: 1px solid rgba(128, 128, 128, 0.18);
        }
        .info-avatar-wrap {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
        }
        .info-name {
          font-size: 15px;
          font-weight: 700;
          text-align: center;
          color: var(--clr-common-heading, #181818);
        }
        .info-actions-row {
          display: flex;
          justify-content: center;
          gap: 16px;
          padding: 14px 16px;
          border-bottom: 1px solid rgba(128, 128, 128, 0.18);
        }
        :global(.info-action-btn) {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          background: rgba(128, 128, 128, 0.1);
          border-radius: 50%;
          width: 44px;
          height: 44px;
          justify-content: center;
          color: var(--clr-common-heading, #181818);
          text-decoration: none;
          font-size: 16px;
          transition: background 0.15s;
        }
        :global(.info-action-btn:hover) {
          background: rgba(108, 92, 231, 0.15);
          color: var(--clr-theme-1, #6c5ce7);
        }
        :global(.info-action-btn span) {
          font-size: 9px;
          font-weight: 600;
          display: none;
        }
        .info-section {
          border-bottom: 1px solid rgba(128, 128, 128, 0.18);
        }
        .info-section-header {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 16px;
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 700;
          color: var(--clr-common-heading, #181818);
          text-align: left;
          transition: background 0.15s;
        }
        .info-section-header:hover {
          background: rgba(128, 128, 128, 0.06);
        }
        .info-section-header i {
          font-size: 12px;
          opacity: 0.6;
        }
        .info-section-body {
          padding: 6px 16px 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        :global(.info-link) {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 8px;
          color: var(--clr-common-heading, #181818);
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          transition: background 0.15s;
        }
        :global(.info-link:hover) {
          background: rgba(108, 92, 231, 0.08);
          color: var(--clr-theme-1, #6c5ce7);
        }
        :global(.info-link i) {
          width: 28px;
          height: 28px;
          background: rgba(128, 128, 128, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          flex-shrink: 0;
        }
        .info-pub-title {
          font-size: 13px;
          opacity: 0.8;
          margin: 0 0 8px;
          line-height: 1.4;
        }
        :global(.info-pub-btn) {
          font-size: 13px;
          padding: 8px 16px;
          border-radius: 6px;
          text-align: center;
          text-decoration: none;
        }
      `}</style>
    </aside>
  );
};

export default ConversationInfoPanel;
