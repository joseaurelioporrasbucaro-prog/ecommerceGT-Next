"use client";
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import ThemeChanger from '@/components/home/ThemeChanger';
import { useAuth } from '@/utils/AuthContext';
import { getBackendUrl } from '@/utils/backendUrl';
import { toast } from 'react-toastify';
import { ApiError } from '@/utils/Api';
import { useVerificationRequests, useResolveVerification } from '@/hooks/api/useVerification';
import { useDateFmt } from '@/utils/datetime';
import type { VerificationRequestRow } from '@/types/api';
import StaffShell from '@/components/support/StaffShell';
import { DataTable, Row, Cell, FilterTabs } from '@/components/support/staffUi';

const docUrl = (verId: number, side: 'front' | 'back') =>
  getBackendUrl(`/verification/document/${verId}/${side}`);

type StatusFilter = 'pending' | 'verified' | 'rejected';

const SupportVerificationsMain = () => {
  const t = useTranslations('support');
  const dateFmt = useDateFmt();
  const { user } = useAuth();
  const [status, setStatus] = useState<StatusFilter>('pending');
  const { data, isLoading } = useVerificationRequests(status);
  const resolve = useResolveVerification();

  // Modal de rechazo: guarda la solicitud a rechazar + el motivo.
  const [rejectTarget, setRejectTarget] = useState<VerificationRequestRow | null>(null);
  const [reason, setReason] = useState('');

  const isSupport = user?.role === 'support' || user?.role === 'admin';

  const approve = (req: VerificationRequestRow) =>
    resolve.mutate(
      { verId: req.ver_id, action: 'approve' },
      {
        onSuccess: (r) => toast.success(r.message || t('verifications.approved')),
        onError: (e) => toast.error(e instanceof ApiError ? e.message : t('verifications.approveError')),
      },
    );

  const confirmReject = () => {
    if (!rejectTarget) return;
    if (reason.trim().length < 4) {
      toast.error(t('verifications.rejectReasonRequired'));
      return;
    }
    resolve.mutate(
      { verId: rejectTarget.ver_id, action: 'reject', reason: reason.trim() },
      {
        onSuccess: (r) => {
          toast.success(r.message || t('verifications.rejected'));
          setRejectTarget(null);
          setReason('');
        },
        onError: (e) => toast.error(e instanceof ApiError ? e.message : t('verifications.rejectError')),
      },
    );
  };

  const rows = data ?? [];

  const cols = [
    { label: t('table.type') },
    { label: t('table.requester') },
    { label: t('table.document') },
    { label: t('table.files') },
    { label: t('table.date') },
    ...(status === 'pending' ? [{ label: t('table.actions'), right: true }] : []),
    ...(status === 'rejected' ? [{ label: t('table.reason') }] : []),
  ];

  return (
    <main>
      <ThemeChanger />

      <StaffShell
        active="verif"
        title={t('breadcrumbs.verifications')}
        sub={t('verifications.subtitle')}
      >
        {!isSupport ? (
          <div
            style={{
              padding: '14px 18px', borderRadius: 'var(--r-md)',
              background: 'var(--danger-bg)', color: 'var(--danger)', font: 'var(--text-body-sm)', fontWeight: 600,
            }}
          >
            {t('common.restricted')}
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 18 }}>
              <FilterTabs
                active={status}
                onSelect={(k) => setStatus(k as StatusFilter)}
                tabs={(['pending', 'verified', 'rejected'] as const).map((s) => [
                  s,
                  t(`verifications.status.${s}`),
                ])}
              />
            </div>

            {isLoading && (
              <p style={{ font: 'var(--text-body-sm)', color: 'var(--fg-subtle)' }}>{t('common.loading')}</p>
            )}
            {!isLoading && rows.length === 0 && (
              <p style={{ font: 'var(--text-body-sm)', color: 'var(--fg-subtle)' }}>
                {t(`verifications.empty.${status}`)}
              </p>
            )}

            {rows.length > 0 && (
              <DataTable cols={cols}>
                {rows.map((req: VerificationRequestRow) => {
                  const isPersonal = req.ver_type === 'personal';
                  const name = `${req.firstname ?? ''} ${req.lastname ?? ''}`.trim() || t('common.user');
                  return (
                    <Row key={req.ver_id}>
                      <Cell>
                        <span
                          style={{
                            display: 'inline-flex', padding: '2px 10px', borderRadius: '999px',
                            background: isPersonal ? 'var(--lav-200)' : 'var(--navy-100)',
                            color: isPersonal ? 'var(--lav-700)' : 'var(--navy-700)',
                            font: 'var(--text-caption)', fontWeight: 700,
                          }}
                        >
                          {isPersonal ? 'DPI' : 'RTU'}
                        </span>
                      </Cell>
                      <Cell strong>
                        {isPersonal ? name : (req.companyname || t('common.company'))}
                        {req.handle && (
                          <span style={{ color: 'var(--accent-hover)', fontWeight: 400 }}> @{req.handle}</span>
                        )}
                      </Cell>
                      <Cell mono muted>{req.ver_document}</Cell>
                      <Cell>
                        <span style={{ display: 'inline-flex', gap: 12 }}>
                          {isPersonal ? (
                            <>
                              <a
                                href={docUrl(req.ver_id, 'front')}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'var(--lav-700)', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', gap: 5, alignItems: 'center' }}
                              >
                                <i className="far fa-image" style={{ fontSize: 12 }} /> {t('verifications.front')}
                              </a>
                              <a
                                href={docUrl(req.ver_id, 'back')}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'var(--lav-700)', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', gap: 5, alignItems: 'center' }}
                              >
                                <i className="far fa-image" style={{ fontSize: 12 }} /> {t('verifications.back')}
                              </a>
                            </>
                          ) : (
                            <a
                              href={docUrl(req.ver_id, 'front')}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: 'var(--lav-700)', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', gap: 5, alignItems: 'center' }}
                            >
                              <i className="far fa-image" style={{ fontSize: 12 }} /> RTU
                            </a>
                          )}
                        </span>
                      </Cell>
                      <Cell muted mono>{dateFmt.short(req.created_at)}</Cell>
                      {status === 'pending' && (
                        <Cell right>
                          <span style={{ display: 'inline-flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button
                              title={t('verifications.approve')}
                              onClick={() => approve(req)}
                              disabled={resolve.isPending}
                              style={{
                                width: 34, height: 34, borderRadius: 'var(--r-sm)', border: 'none',
                                cursor: resolve.isPending ? 'default' : 'pointer', background: 'var(--green-500)',
                                color: 'var(--navy-900)', opacity: resolve.isPending ? 0.6 : 1,
                              }}
                            >
                              <i className="fas fa-check" />
                            </button>
                            <button
                              title={t('verifications.reject')}
                              onClick={() => { setRejectTarget(req); setReason(''); }}
                              disabled={resolve.isPending}
                              style={{
                                width: 34, height: 34, borderRadius: 'var(--r-sm)', border: 'none',
                                cursor: resolve.isPending ? 'default' : 'pointer', background: 'var(--danger)',
                                color: '#fff', opacity: resolve.isPending ? 0.6 : 1,
                              }}
                            >
                              <i className="fas fa-times" />
                            </button>
                          </span>
                        </Cell>
                      )}
                      {status === 'rejected' && (
                        <Cell muted>{req.ver_reject_reason || '-'}</Cell>
                      )}
                    </Row>
                  );
                })}
              </DataTable>
            )}

            <p
              style={{
                font: 'var(--text-caption)', color: 'var(--fg-subtle)', marginTop: 14,
                display: 'flex', gap: 7, alignItems: 'center',
              }}
            >
              <i className="fas fa-lock" /> {t('verifications.privacyNote')}
            </p>
          </>
        )}
      </StaffShell>

      {/* Modal de rechazo */}
      {rejectTarget && (
        <div className="sv-overlay" role="dialog" aria-modal="true">
          <div className="sv-modal">
            <h5>{t('verifications.rejectRequest')}</h5>
            <p className="sv-modal-sub">
              {rejectTarget.ver_type === 'personal'
                ? `${rejectTarget.firstname ?? ''} ${rejectTarget.lastname ?? ''}`.trim()
                : (rejectTarget.companyname || t('common.company'))}
            </p>
            <textarea
              placeholder={t('verifications.rejectPlaceholder')}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              autoFocus
            />
            <div className="sv-modal-actions">
              <button className="sv-btn sv-ghost" onClick={() => { setRejectTarget(null); setReason(''); }}>{t('common.cancel')}</button>
              <button className="sv-btn sv-reject-full" onClick={confirmReject} disabled={resolve.isPending}>
                {resolve.isPending ? t('verifications.rejecting') : t('verifications.confirmReject')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .sv-overlay { position: fixed; inset: 0; z-index: 9999; background: rgba(13, 18, 30, 0.55); display: flex; align-items: center; justify-content: center; padding: 20px; }
        .sv-modal { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); box-shadow: var(--shadow-lg); padding: 24px; width: 100%; max-width: 460px; }
        .sv-modal h5 { margin: 0 0 4px; font-family: var(--font-display); font-weight: 600; color: var(--fg-strong); }
        .sv-modal-sub { color: var(--fg-muted); font: var(--text-body-sm); margin: 0 0 14px; }
        .sv-modal textarea { width: 100%; border: 1.5px solid var(--border-strong); border-radius: var(--r-md); padding: 10px 12px; resize: vertical; background: var(--surface); color: var(--fg); font: var(--text-body-sm); }
        .sv-modal textarea:focus { outline: none; border-color: var(--lav-500); }
        .sv-modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px; }
        .sv-btn { border: none; cursor: pointer; font-weight: 600; display: inline-flex; align-items: center; justify-content: center; }
        .sv-btn:disabled { opacity: 0.6; cursor: default; }
        .sv-ghost { padding: 9px 18px; border-radius: 999px; background: var(--surface); border: 1.5px solid var(--border-strong); color: var(--fg-muted); }
        .sv-reject-full { padding: 9px 18px; border-radius: 999px; background: var(--danger); color: #fff; }
      `}</style>
    </main>
  );
};

export default SupportVerificationsMain;
