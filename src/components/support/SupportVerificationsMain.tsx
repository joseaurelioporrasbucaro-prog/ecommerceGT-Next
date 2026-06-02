"use client";
import React, { useState } from 'react';
import ThemeChanger from '@/components/home/ThemeChanger';
import Breadcrumbs from '@/utils/Breadcrumbs';
import { useAuth } from '@/utils/AuthContext';
import { getBackendUrl } from '@/utils/backendUrl';
import { toast } from 'react-toastify';
import { ApiError } from '@/utils/Api';
import { useVerificationRequests, useResolveVerification } from '@/hooks/api/useVerification';
import type { VerificationRequestRow } from '@/types/api';

const docUrl = (verId: number, side: 'front' | 'back') =>
  getBackendUrl(`/verification/document/${verId}/${side}`);

type StatusFilter = 'pending' | 'verified' | 'rejected';

const SupportVerificationsMain = () => {
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
        onSuccess: (r) => toast.success(r.message || 'Aprobada.'),
        onError: (e) => toast.error(e instanceof ApiError ? e.message : 'No se pudo aprobar'),
      },
    );

  const confirmReject = () => {
    if (!rejectTarget) return;
    if (reason.trim().length < 4) {
      toast.error('Escribe un motivo de rechazo.');
      return;
    }
    resolve.mutate(
      { verId: rejectTarget.ver_id, action: 'reject', reason: reason.trim() },
      {
        onSuccess: (r) => {
          toast.success(r.message || 'Rechazada.');
          setRejectTarget(null);
          setReason('');
        },
        onError: (e) => toast.error(e instanceof ApiError ? e.message : 'No se pudo rechazar'),
      },
    );
  };

  const rows = data ?? [];

  return (
    <main>
      <ThemeChanger />
      <Breadcrumbs breadcrumbTitle="Soporte" breadcrumbSubTitle="Verificaciones" />

      <section className="creator-area pb-90" style={{ paddingTop: 40 }}>
        <div className="container">
          {!isSupport ? (
            <div className="alert alert-danger">Acceso restringido. Solo el equipo de soporte puede ver esta página.</div>
          ) : (
            <>
              <div className="sv-filter">
                {(['pending', 'verified', 'rejected'] as const).map((s) => (
                  <button key={s} className={`sv-tab ${status === s ? 'active' : ''}`} onClick={() => setStatus(s)}>
                    {s === 'pending' ? 'Pendientes' : s === 'verified' ? 'Aprobadas' : 'Rechazadas'}
                  </button>
                ))}
              </div>

              {isLoading && <p style={{ opacity: 0.6 }}>Cargando…</p>}
              {!isLoading && rows.length === 0 && (
                <p style={{ opacity: 0.6 }}>
                  No hay solicitudes {status === 'pending' ? 'pendientes' : status === 'verified' ? 'aprobadas' : 'rechazadas'}.
                </p>
              )}

              {rows.length > 0 && (
                <div className="sv-table-wrap">
                  <table className="sv-table">
                    <thead>
                      <tr>
                        <th>Tipo</th>
                        <th>Solicitante</th>
                        <th>Documento</th>
                        <th>Archivos</th>
                        <th>Fecha</th>
                        {status === 'pending' && <th className="sv-th-actions">Acciones</th>}
                        {status === 'rejected' && <th>Motivo</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((req) => {
                        const isPersonal = req.ver_type === 'personal';
                        const name = `${req.firstname ?? ''} ${req.lastname ?? ''}`.trim() || 'Usuario';
                        return (
                          <tr key={req.ver_id}>
                            <td>
                              <span className={`sv-chip sv-chip-${isPersonal ? 'personal' : 'business'}`}>
                                {isPersonal ? 'DPI' : 'RTU'}
                              </span>
                            </td>
                            <td>
                              <div className="sv-name">{isPersonal ? name : (req.companyname || 'Empresa')}</div>
                              {req.handle && <div className="sv-handle">@{req.handle}</div>}
                            </td>
                            <td className="sv-mono">{req.ver_document}</td>
                            <td>
                              <div className="sv-files">
                                {isPersonal ? (
                                  <>
                                    <a href={docUrl(req.ver_id, 'front')} target="_blank" rel="noopener noreferrer">Frente</a>
                                    <a href={docUrl(req.ver_id, 'back')} target="_blank" rel="noopener noreferrer">Reverso</a>
                                  </>
                                ) : (
                                  <a href={docUrl(req.ver_id, 'front')} target="_blank" rel="noopener noreferrer">
                                    <i className="fas fa-file-pdf" /> RTU
                                  </a>
                                )}
                              </div>
                            </td>
                            <td className="sv-date">{new Date(req.created_at).toLocaleDateString('es-GT')}</td>
                            {status === 'pending' && (
                              <td>
                                <div className="sv-row-actions">
                                  <button className="sv-btn sv-approve" onClick={() => approve(req)} disabled={resolve.isPending} title="Aprobar">
                                    <i className="fas fa-check" />
                                  </button>
                                  <button className="sv-btn sv-reject" onClick={() => { setRejectTarget(req); setReason(''); }} disabled={resolve.isPending} title="Rechazar">
                                    <i className="fas fa-times" />
                                  </button>
                                </div>
                              </td>
                            )}
                            {status === 'rejected' && <td className="sv-reason">{req.ver_reject_reason || '—'}</td>}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Modal de rechazo */}
      {rejectTarget && (
        <div className="sv-overlay" role="dialog" aria-modal="true">
          <div className="sv-modal">
            <h5>Rechazar solicitud</h5>
            <p className="sv-modal-sub">
              {rejectTarget.ver_type === 'personal'
                ? `${rejectTarget.firstname ?? ''} ${rejectTarget.lastname ?? ''}`.trim()
                : (rejectTarget.companyname || 'Empresa')}
            </p>
            <textarea
              placeholder="Motivo del rechazo (lo verá el usuario)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              autoFocus
            />
            <div className="sv-modal-actions">
              <button className="sv-btn sv-ghost" onClick={() => { setRejectTarget(null); setReason(''); }}>Cancelar</button>
              <button className="sv-btn sv-reject-full" onClick={confirmReject} disabled={resolve.isPending}>
                {resolve.isPending ? 'Rechazando…' : 'Confirmar rechazo'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .sv-filter { display: flex; gap: 10px; margin-bottom: 26px; }
        .sv-tab { padding: 8px 20px; border-radius: 24px; border: 1px solid rgba(128,128,128,0.3); background: transparent; cursor: pointer; font-weight: 600; }
        .sv-tab.active { background: var(--clr-theme-1, #0f4c4c); color: #fff; border-color: transparent; }
        .sv-table-wrap { overflow-x: auto; border: 1px solid var(--clr-common-border, #e0e2e5); border-radius: 12px; }
        .sv-table { width: 100%; border-collapse: collapse; min-width: 720px; background: var(--clr-bg-white, #fff); }
        .sv-table thead th { text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; opacity: 0.6; padding: 14px 16px; border-bottom: 1px solid var(--clr-common-border, #e0e2e5); }
        .sv-table tbody td { padding: 14px 16px; border-bottom: 1px solid rgba(128,128,128,0.12); vertical-align: middle; font-size: 14px; }
        .sv-table tbody tr:hover { background: rgba(15,76,76,0.04); }
        .sv-table tbody tr:last-child td { border-bottom: none; }
        .sv-chip { display: inline-block; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; }
        .sv-chip-personal { background: rgba(59,130,246,0.14); color: #2563eb; }
        .sv-chip-business { background: rgba(212,175,55,0.18); color: #b8860b; }
        .sv-name { font-weight: 600; }
        .sv-handle { font-size: 13px; color: #3b82f6; }
        .sv-mono { font-variant-numeric: tabular-nums; }
        .sv-files { display: flex; gap: 12px; }
        .sv-files a { color: var(--clr-theme-1, #0f4c4c); font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 5px; }
        .sv-files a:hover { text-decoration: underline; }
        .sv-date { white-space: nowrap; opacity: 0.7; }
        .sv-reason { max-width: 280px; opacity: 0.8; }
        .sv-th-actions { text-align: center; }
        .sv-row-actions { display: flex; gap: 8px; }
        .sv-btn { border: none; cursor: pointer; font-weight: 600; display: inline-flex; align-items: center; justify-content: center; }
        .sv-btn:disabled { opacity: 0.6; cursor: default; }
        .sv-approve, .sv-reject { width: 34px; height: 34px; border-radius: 8px; color: #fff; }
        .sv-approve { background: #16a34a; }
        .sv-reject { background: #dc2626; }
        .sv-overlay { position: fixed; inset: 0; z-index: 9999; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; padding: 20px; }
        .sv-modal { background: var(--clr-bg-white, #fff); border-radius: 14px; padding: 24px; width: 100%; max-width: 460px; }
        .sv-modal h5 { margin: 0 0 4px; }
        .sv-modal-sub { opacity: 0.7; font-size: 14px; margin: 0 0 14px; }
        .sv-modal textarea { width: 100%; border: 1px solid rgba(128,128,128,0.3); border-radius: 8px; padding: 10px; resize: vertical; }
        .sv-modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px; }
        .sv-ghost { padding: 9px 18px; border-radius: 24px; background: transparent; border: 1px solid rgba(128,128,128,0.4); }
        .sv-reject-full { padding: 9px 18px; border-radius: 24px; background: #dc2626; color: #fff; }
      `}</style>
    </main>
  );
};

export default SupportVerificationsMain;
