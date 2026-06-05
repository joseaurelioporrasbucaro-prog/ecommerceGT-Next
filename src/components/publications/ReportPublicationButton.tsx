"use client";
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useMutation } from '@tanstack/react-query';
import { ApiError, ApiFetch } from '@/utils/Api';
import { toast } from 'react-toastify';

const REASONS: { value: string; label: string }[] = [
  { value: 'spam', label: 'reasonSpam' },
  { value: 'ofensivo', label: 'reasonOffensive' },
  { value: 'estafa', label: 'reasonFraud' },
  { value: 'prohibido', label: 'reasonProhibited' },
  { value: 'otro', label: 'reasonOther' },
];

/** Fase 8.4 — botón + modal para denunciar una publicación. */
const ReportPublicationButton = ({ pubId }: { pubId: number | string }) => {
  const t = useTranslations('publications');
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('spam');
  const [detail, setDetail] = useState('');
  const [consent, setConsent] = useState(false);

  const mutation = useMutation({
    mutationFn: () => ApiFetch.post<{ message: string }>(`/reportpublication/${pubId}`, { reason, detail: detail || undefined }),
    onSuccess: (r) => {
      toast.success(r.message || t('reports.publicationSuccess'));
      setOpen(false);
      setDetail('');
      setConsent(false);
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : t('reports.error')),
  });

  return (
    <>
      <button type="button" className="rp-trigger" onClick={() => setOpen(true)} title={t('reports.publicationTitle')}>
        <i className="fas fa-flag" /> {t('reports.trigger')}
      </button>

      {open && (
        <div className="rp-overlay" role="dialog" aria-modal="true">
          <div className="rp-modal">
            <h5>{t('reports.publicationTitle')}</h5>
            <label className="rp-label">{t('reports.reasonLabel')}</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)}>
              {REASONS.map((r) => <option key={r.value} value={r.value}>{t(`reports.${r.label}`)}</option>)}
            </select>
            <label className="rp-label">{t('reports.detailLabel')}</label>
            <textarea rows={3} value={detail} onChange={(e) => setDetail(e.target.value)} placeholder={t('reports.detailPlaceholder')} />
            <label className="rp-consent">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>{t('reports.consentPublication')}</span>
            </label>
            <div className="rp-actions">
              <button className="rp-ghost" onClick={() => setOpen(false)}>{t('common.cancel')}</button>
              <button className="rp-send" onClick={() => mutation.mutate()} disabled={mutation.isPending || !consent}>
                {mutation.isPending ? t('common.sending') : t('reports.send')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .rp-trigger { background: transparent; border: 1px solid rgba(128,128,128,0.35); border-radius: 24px; padding: 8px 16px; cursor: pointer; font-weight: 600; color: inherit; display: inline-flex; align-items: center; gap: 7px; }
        .rp-trigger:hover { border-color: #dc2626; color: #dc2626; }
        .rp-overlay { position: fixed; inset: 0; z-index: 9999; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; padding: 20px; }
        .rp-modal { background: var(--clr-bg-white, #fff); border-radius: 14px; padding: 24px; width: 100%; max-width: 440px; }
        .rp-modal h5 { margin: 0 0 14px; }
        .rp-label { display: block; font-weight: 600; margin: 12px 0 6px; font-size: 14px; }
        .rp-modal select, .rp-modal textarea { width: 100%; border: 1px solid rgba(128,128,128,0.3); border-radius: 8px; padding: 10px; }
        .rp-consent { display: flex; gap: 9px; align-items: flex-start; margin-top: 14px; font-size: 13px; opacity: 0.85; cursor: pointer; line-height: 1.4; }
        .rp-consent input { margin-top: 3px; flex-shrink: 0; }
        .rp-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; }
        .rp-ghost { background: transparent; border: 1px solid rgba(128,128,128,0.4); padding: 9px 18px; border-radius: 24px; cursor: pointer; }
        .rp-send { background: #dc2626; color: #fff; border: none; padding: 9px 18px; border-radius: 24px; cursor: pointer; font-weight: 600; }
        .rp-send:disabled { opacity: 0.6; }
      `}</style>
    </>
  );
};

export default ReportPublicationButton;
