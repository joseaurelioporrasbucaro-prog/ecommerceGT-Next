"use client";
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useMutation } from '@tanstack/react-query';
import { ApiError, ApiFetch } from '@/utils/Api';
import { toast } from 'react-toastify';

const REASONS = [
  { value: 'Spam', labelKey: 'reasonSpam' },
  { value: 'Contenido ofensivo', labelKey: 'reasonOffensive' },
  { value: 'Acoso', labelKey: 'reasonHarassment' },
  { value: 'Estafa / fraude', labelKey: 'reasonFraud' },
  { value: 'Otro', labelKey: 'reasonOther' },
] as const;

/** Fase 8.4 — botón + modal para denunciar un comentario (con consentimiento). */
const ReportCommentButton = ({ commentId }: { commentId: number }) => {
  const t = useTranslations('publications');
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>(REASONS[0].value);
  const [consent, setConsent] = useState(false);

  const mutation = useMutation({
    mutationFn: () => ApiFetch.post<{ message: string }>('/reportcomment', { comment_id: commentId, reason }),
    onSuccess: (r) => {
      toast.success(r.message || t('reports.commentSuccess'));
      setOpen(false);
      setConsent(false);
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : t('reports.error')),
  });

  return (
    <>
      <button type="button" className="rc-trigger" onClick={() => setOpen(true)} title={t('reports.commentTitle')}>
        <i className="fal fa-flag" /> {t('reports.trigger')}
      </button>

      {open && (
        <div className="rc-overlay" role="dialog" aria-modal="true">
          <div className="rc-modal">
            <h5>{t('reports.commentTitle')}</h5>
            <label className="rc-label">{t('reports.reasonLabel')}</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)}>
              {REASONS.map((r) => <option key={r.value} value={r.value}>{t(`reports.${r.labelKey}`)}</option>)}
            </select>
            <label className="rc-consent">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>{t('reports.consentComment')}</span>
            </label>
            <div className="rc-actions">
              <button className="rc-ghost" onClick={() => setOpen(false)}>{t('common.cancel')}</button>
              <button className="rc-send" onClick={() => mutation.mutate()} disabled={mutation.isPending || !consent}>
                {mutation.isPending ? t('common.sending') : t('reports.send')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .rc-trigger { background: none; border: none; padding: 0; cursor: pointer; color: inherit; opacity: 0.6; font-size: 13px; display: inline-flex; align-items: center; gap: 5px; }
        .rc-trigger:hover { opacity: 1; color: #dc2626; }
        .rc-overlay { position: fixed; inset: 0; z-index: 9999; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; padding: 20px; }
        .rc-modal { background: var(--clr-bg-white, #fff); border-radius: 14px; padding: 24px; width: 100%; max-width: 440px; }
        .rc-modal h5 { margin: 0 0 14px; }
        .rc-label { display: block; font-weight: 600; margin: 12px 0 6px; font-size: 14px; }
        .rc-modal select { width: 100%; border: 1px solid rgba(128,128,128,0.3); border-radius: 8px; padding: 10px; }
        .rc-consent { display: flex; gap: 9px; align-items: flex-start; margin-top: 14px; font-size: 13px; opacity: 0.85; line-height: 1.4; cursor: pointer; }
        .rc-consent input { margin-top: 3px; flex-shrink: 0; }
        .rc-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; }
        .rc-ghost { background: transparent; border: 1px solid rgba(128,128,128,0.4); padding: 9px 18px; border-radius: 24px; cursor: pointer; }
        .rc-send { background: #dc2626; color: #fff; border: none; padding: 9px 18px; border-radius: 24px; cursor: pointer; font-weight: 600; }
        .rc-send:disabled { opacity: 0.6; }
      `}</style>
    </>
  );
};

export default ReportCommentButton;
