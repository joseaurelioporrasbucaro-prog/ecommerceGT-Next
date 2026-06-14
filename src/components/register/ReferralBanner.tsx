"use client";
import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

// Handoff #11 §2 — banner "te invitaron" en /register cuando llega ?ref=CODE.
// Sin backend de referidos no podemos resolver el nombre/avatar del invitador
// (necesita GET /referrals/validate/:code), así que mostramos la versión
// genérica honesta. El código viaja en la URL; el submit lo enviará como
// `referredBy` cuando el backend lo acepte (TODO backend).
const ReferralBanner: React.FC = () => {
  const t = useTranslations('auth');
  const ref = useSearchParams().get('ref');
  if (!ref) return null;
  return (
    <div className="kq-ref-banner">
      <span className="kq-ref-icon" aria-hidden="true"><i className="fas fa-gift" /></span>
      <p>{t('referralBanner.text')}</p>
      <style jsx>{`
        .kq-ref-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          margin-bottom: 18px;
          background: var(--accent-soft);
          border-radius: var(--r-md, 14px);
        }
        .kq-ref-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          border-radius: 999px;
          background: var(--lav-200);
          color: var(--lav-700);
          font-size: 15px;
        }
        .kq-ref-banner p {
          margin: 0;
          font-size: 13px;
          line-height: 1.45;
          color: var(--fg-strong);
        }
      `}</style>
    </div>
  );
};

export default ReferralBanner;
