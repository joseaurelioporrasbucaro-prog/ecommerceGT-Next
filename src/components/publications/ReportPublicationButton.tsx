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
        .rp-trigger {
          background: transparent;
          border: 1.5px solid var(--border-strong);
          border-radius: var(--r-pill);
          padding: 8px 16px;
          cursor: pointer;
          font-weight: 600;
          font-family: var(--font-body);
          color: var(--fg-subtle);
          display: inline-flex;
          align-items: center;
          gap: 7px;
          transition: border-color 0.18s ease, color 0.18s ease;
        }
        .rp-trigger:hover {
          border-color: var(--danger);
          color: var(--danger);
        }
        .rp-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(17, 24, 42, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .rp-modal {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--r-lg);
          box-shadow: var(--shadow-lg);
          padding: 24px;
          width: 100%;
          max-width: 440px;
        }
        .rp-modal h5 {
          margin: 0 0 14px;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 1.25rem;
          color: var(--fg-strong);
        }
        .rp-label {
          display: block;
          font-weight: 600;
          margin: 12px 0 6px;
          font-size: 14px;
          color: var(--fg-subtle);
        }
        .rp-modal select,
        .rp-modal textarea {
          width: 100%;
          border: 1.5px solid var(--border-strong);
          border-radius: var(--r-md);
          padding: 10px;
          background: var(--surface);
          color: var(--fg-strong);
          font-family: var(--font-body);
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
        }
        .rp-modal select:focus,
        .rp-modal textarea:focus {
          outline: none;
          border-color: var(--lav-500);
          box-shadow: var(--shadow-focus);
        }
        .rp-consent {
          display: flex;
          gap: 9px;
          align-items: flex-start;
          margin-top: 14px;
          font-size: 13px;
          color: var(--fg-muted);
          cursor: pointer;
          line-height: 1.4;
        }
        .rp-consent input {
          margin-top: 3px;
          flex-shrink: 0;
          accent-color: var(--lav-600);
        }
        .rp-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 18px;
        }
        .rp-ghost {
          background: transparent;
          border: 1.5px solid var(--border-strong);
          color: var(--fg-strong);
          padding: 9px 18px;
          border-radius: var(--r-pill);
          cursor: pointer;
          font-weight: 600;
          font-family: var(--font-body);
          transition: border-color 0.18s ease, color 0.18s ease;
        }
        .rp-ghost:hover {
          border-color: var(--lav-500);
          color: var(--lav-700);
        }
        .rp-send {
          background: var(--danger);
          color: #fff;
          border: 1.5px solid var(--danger);
          padding: 9px 18px;
          border-radius: var(--r-pill);
          cursor: pointer;
          font-weight: 600;
          font-family: var(--font-body);
          transition: filter 0.18s ease, transform 0.18s ease;
        }
        .rp-send:hover:not(:disabled) {
          filter: brightness(0.94);
          transform: translateY(-1px);
        }
        .rp-send:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
};

export default ReportPublicationButton;
