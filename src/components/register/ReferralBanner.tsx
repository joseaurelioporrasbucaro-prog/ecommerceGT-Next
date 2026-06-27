"use client";
import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useValidateReferralCode } from '@/hooks/api/useReferrals';

// Banner "te invitaron" en /register cuando llega ?ref=CODE. Resuelve el nombre
// del invitador vía GET /referrals/validate/:code; si no se valida (o no hay
// nombre), cae al texto genérico. El código viaja en la URL y RegisterForm lo
// envia como referralCode en el submit.
const ReferralBanner: React.FC = () => {
  const t = useTranslations('auth');
  const ref = useSearchParams().get('ref');
  const validation = useValidateReferralCode(ref);
  if (!ref) return null;
  const referrerName = validation.data?.valid ? validation.data.referrerName : null;
  return (
    <div className="kq-ref-banner">
      <span className="kq-ref-icon" aria-hidden="true"><i className="fas fa-gift" /></span>
      <p>{referrerName ? t('referralBanner.textNamed', { name: referrerName }) : t('referralBanner.text')}</p>
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
