"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import ThemeChanger from '@/components/home/ThemeChanger';
import Breadcrumbs from '@/utils/Breadcrumbs';
import { useAuth } from '@/utils/AuthContext';
import { toast } from 'react-toastify';
import { ApiError } from '@/utils/Api';
import { useSupportReports, useResolveReport, useMessageContext } from '@/hooks/api/useSupportReports';
import { useBanUser } from '@/hooks/api/useSupportUsers';
import type { SupportReportRow, ReportType } from '@/types/api';

const TYPE_LABEL: Record<ReportType, string> = {
  comment: 'Comentario', message: 'Mensaje', publication: 'Publicación',
};

const contentHref = (r: SupportReportRow): string | null => {
  if (r.report_type === 'publication') return `/publications/${r.content_id}`;
  if (r.report_type === 'comment' && r.pub_id) return `/publications/${r.pub_id}`;
  return null;
};

// Modal del contexto de la conversación de un mensaje denunciado.
const ConversationModal = ({ messageId, onClose }: { messageId: number; onClose: () => void }) => {
  const { data, isLoading } = useMessageContext(messageId);
  return (
    <div className="sr-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="sr-convo" onClick={(e) => e.stopPropagation()}>
        <h5>Conversación</h5>
        {isLoading && <p style={{ opacity: 0.6 }}>Cargando…</p>}
        <div className="sr-convo-list">
          {data?.messages.map((m) => (
            <div key={m.message_id} className={`sr-bubble ${m.message_id === data.reportedMessageId ? 'reported' : ''}`}>
              <div className="sr-bubble-head">
                <strong>{`${m.first ?? ''} ${m.last ?? ''}`.trim() || 'Usuario'}</strong>
                <span>{new Date(m.created_at).toLocaleString('es-GT')}</span>
              </div>
              <p>{m.content}</p>
              {m.message_id === data?.reportedMessageId && <span className="sr-reported-tag">Mensaje denunciado</span>}
            </div>
          ))}
        </div>
        <div className="sr-convo-actions"><button className="sr-btn sr-dismiss" onClick={onClose}>Cerrar</button></div>
      </div>
      <style jsx>{`
        .sr-overlay { position: fixed; inset: 0; z-index: 9999; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; padding: 20px; }
        .sr-convo { background: var(--clr-bg-white, #fff); border-radius: 14px; padding: 22px; width: 100%; max-width: 560px; max-height: 80vh; display: flex; flex-direction: column; }
        .sr-convo h5 { margin: 0 0 14px; }
        .sr-convo-list { overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
        .sr-bubble { border: 1px solid rgba(128,128,128,0.2); border-radius: 10px; padding: 10px 12px; }
        .sr-bubble.reported { border-color: #dc2626; background: rgba(239,68,68,0.06); }
        .sr-bubble-head { display: flex; justify-content: space-between; font-size: 12px; opacity: 0.7; margin-bottom: 4px; }
        .sr-bubble p { margin: 0; white-space: pre-wrap; }
        .sr-reported-tag { display: inline-block; margin-top: 6px; font-size: 11px; font-weight: 700; color: #dc2626; }
        .sr-convo-actions { display: flex; justify-content: flex-end; margin-top: 14px; }
        .sr-btn { border: none; cursor: pointer; font-weight: 600; padding: 8px 16px; border-radius: 8px; background: rgba(128,128,128,0.15); }
      `}</style>
    </div>
  );
};

const SupportReportsMain = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<'pending' | 'resolved' | 'dismissed'>('pending');
  const { data, isLoading } = useSupportReports(status);
  const resolve = useResolveReport();
  const ban = useBanUser();

  const [convoMsgId, setConvoMsgId] = useState<number | null>(null);
  // Sanción al autor.
  const [banRow, setBanRow] = useState<SupportReportRow | null>(null);
  const [banStatus, setBanStatus] = useState<'suspended' | 'banned'>('suspended');
  const [banReason, setBanReason] = useState('');

  const isSupport = user?.role === 'support' || user?.role === 'admin';

  const act = (r: SupportReportRow, action: 'dismiss' | 'delete') => {
    if (action === 'delete' && !window.confirm('¿Eliminar el contenido denunciado? Esta acción no se puede deshacer.')) return;
    resolve.mutate(
      { type: r.report_type, reportId: r.report_id, contentId: r.content_id, action },
      {
        onSuccess: (res) => toast.success(res.message || 'Listo.'),
        onError: (e) => toast.error(e instanceof ApiError ? e.message : 'No se pudo resolver'),
      },
    );
  };

  const confirmBan = () => {
    if (!banRow) return;
    if (banReason.trim().length < 4) { toast.error('Escribe un motivo.'); return; }
    ban.mutate(
      { cusId: banRow.author_id, status: banStatus, reason: banReason.trim() },
      {
        onSuccess: (r) => { toast.success(r.message || 'Usuario sancionado.'); setBanRow(null); setBanReason(''); },
        onError: (e) => toast.error(e instanceof ApiError ? e.message : 'No se pudo sancionar'),
      },
    );
  };

  const rows = data ?? [];

  return (
    <main>
      <ThemeChanger />
      <Breadcrumbs breadcrumbTitle="Soporte" breadcrumbSubTitle="Denuncias" />

      <section className="creator-area pb-90" style={{ paddingTop: 40 }}>
        <div className="container">
          {!isSupport ? (
            <div className="alert alert-danger">Acceso restringido. Solo el equipo de soporte puede ver esta página.</div>
          ) : (
            <>
              <div className="sr-filter">
                {([['pending', 'Pendientes'], ['resolved', 'Resueltas'], ['dismissed', 'Descartadas']] as const).map(([v, label]) => (
                  <button key={v} className={`sr-tab ${status === v ? 'active' : ''}`} onClick={() => setStatus(v)}>{label}</button>
                ))}
              </div>

              {isLoading && <p style={{ opacity: 0.6 }}>Cargando…</p>}
              {!isLoading && rows.length === 0 && <p style={{ opacity: 0.6 }}>No hay denuncias en este estado.</p>}

              {rows.length > 0 && (
                <div className="sr-table-wrap">
                  <table className="sr-table">
                    <thead>
                      <tr>
                        <th>Tipo</th><th>Contenido</th><th>Autor</th><th>Motivo</th><th>Fecha</th>
                        {status === 'pending' && <th>Acciones</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => {
                        const author = `${r.author_first ?? ''} ${r.author_last ?? ''}`.trim() || 'Usuario';
                        const href = contentHref(r);
                        return (
                          <tr key={`${r.report_type}-${r.report_id}`}>
                            <td><span className={`sr-chip sr-chip-${r.report_type}`}>{TYPE_LABEL[r.report_type]}</span></td>
                            <td className="sr-content">
                              <span className="sr-excerpt">{r.content_excerpt || '(sin texto)'}</span>
                              {r.report_type === 'message' ? (
                                <button className="sr-view" onClick={() => setConvoMsgId(r.content_id)}>ver conversación</button>
                              ) : href ? (
                                <Link className="sr-view" href={href} target="_blank">ver</Link>
                              ) : null}
                            </td>
                            <td>
                              <Link className="sr-author" href={`/creator-profile/${r.author_id}`} target="_blank">
                                {author}{r.author_handle ? ` @${r.author_handle}` : ''}
                              </Link>
                            </td>
                            <td>
                              <span className="sr-reason">{r.reason}</span>
                              {r.detail && <div className="sr-detail">{r.detail}</div>}
                            </td>
                            <td className="sr-date">{new Date(r.created_at).toLocaleDateString('es-GT')}</td>
                            {status === 'pending' && (
                              <td>
                                <div className="sr-actions">
                                  <button className="sr-btn sr-dismiss" onClick={() => act(r, 'dismiss')} disabled={resolve.isPending} title="Descartar">
                                    <i className="fas fa-check" /> Descartar
                                  </button>
                                  <button className="sr-btn sr-delete" onClick={() => act(r, 'delete')} disabled={resolve.isPending} title="Eliminar contenido">
                                    <i className="fas fa-trash" /> Eliminar
                                  </button>
                                  <button className="sr-btn sr-sanction" onClick={() => { setBanRow(r); setBanStatus('suspended'); setBanReason(''); }} title="Sancionar autor">
                                    <i className="fas fa-ban" /> Sancionar autor
                                  </button>
                                </div>
                              </td>
                            )}
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

      {convoMsgId != null && <ConversationModal messageId={convoMsgId} onClose={() => setConvoMsgId(null)} />}

      {banRow && (
        <div className="sr-overlay" role="dialog" aria-modal="true">
          <div className="sr-modal">
            <h5>Sancionar autor</h5>
            <p className="sr-modal-sub">{`${banRow.author_first ?? ''} ${banRow.author_last ?? ''}`.trim()}{banRow.author_handle ? ` · @${banRow.author_handle}` : ''}</p>
            <div className="sr-radio-row">
              <label className={banStatus === 'suspended' ? 'active' : ''}>
                <input type="radio" checked={banStatus === 'suspended'} onChange={() => setBanStatus('suspended')} /> Suspender (temporal)
              </label>
              <label className={banStatus === 'banned' ? 'active' : ''}>
                <input type="radio" checked={banStatus === 'banned'} onChange={() => setBanStatus('banned')} /> Banear (permanente)
              </label>
            </div>
            <textarea rows={3} placeholder="Motivo (lo verá el usuario al iniciar sesión)" value={banReason} onChange={(e) => setBanReason(e.target.value)} autoFocus />
            <div className="sr-modal-actions">
              <button className="sr-btn sr-dismiss" onClick={() => setBanRow(null)}>Cancelar</button>
              <button className="sr-btn sr-sanction-full" onClick={confirmBan} disabled={ban.isPending}>
                {ban.isPending ? 'Aplicando…' : (banStatus === 'banned' ? 'Banear' : 'Suspender')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .sr-filter { display: flex; gap: 10px; margin-bottom: 24px; flex-wrap: wrap; }
        .sr-tab { padding: 8px 18px; border-radius: 24px; border: 1px solid rgba(128,128,128,0.3); background: transparent; cursor: pointer; font-weight: 600; }
        .sr-tab.active { background: var(--clr-theme-1, #6c5ce7); color: #fff; border-color: transparent; }
        .sr-table-wrap { overflow-x: auto; border: 1px solid var(--clr-common-border, #e0e2e5); border-radius: 12px; }
        .sr-table { width: 100%; border-collapse: collapse; min-width: 860px; background: var(--clr-bg-white, #fff); }
        .sr-table thead th { text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; opacity: 0.6; padding: 14px 16px; border-bottom: 1px solid var(--clr-common-border, #e0e2e5); }
        .sr-table tbody td { padding: 14px 16px; border-bottom: 1px solid rgba(128,128,128,0.12); vertical-align: top; font-size: 14px; }
        .sr-table tbody tr:hover { background: rgba(108,92,231,0.04); }
        .sr-chip { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; white-space: nowrap; }
        .sr-chip-comment { background: rgba(59,130,246,0.14); color: #2563eb; }
        .sr-chip-message { background: rgba(0,184,148,0.16); color: #00b894; }
        .sr-chip-publication { background: rgba(245,158,11,0.18); color: #b8860b; }
        .sr-content { max-width: 300px; }
        .sr-excerpt { display: block; overflow: hidden; text-overflow: ellipsis; }
        .sr-view { font-size: 12px; color: var(--clr-theme-1, #6c5ce7); background: none; border: none; padding: 0; cursor: pointer; }
        .sr-author { color: #3b82f6; text-decoration: none; }
        .sr-reason { text-transform: capitalize; font-weight: 600; }
        .sr-detail { font-size: 12px; opacity: 0.65; }
        .sr-date { white-space: nowrap; opacity: 0.7; }
        .sr-actions { display: flex; gap: 8px; flex-wrap: wrap; }
        .sr-btn { border: none; cursor: pointer; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 8px; font-size: 13px; white-space: nowrap; }
        .sr-btn:disabled { opacity: 0.6; cursor: default; }
        .sr-dismiss { background: rgba(34,197,94,0.12); color: #16a34a; }
        .sr-delete { background: rgba(239,68,68,0.12); color: #dc2626; }
        .sr-sanction { background: rgba(245,158,11,0.16); color: #b8860b; }
        .sr-overlay { position: fixed; inset: 0; z-index: 9999; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; padding: 20px; }
        .sr-modal { background: var(--clr-bg-white, #fff); border-radius: 14px; padding: 24px; width: 100%; max-width: 460px; }
        .sr-modal h5 { margin: 0 0 4px; }
        .sr-modal-sub { opacity: 0.7; font-size: 14px; margin: 0 0 14px; }
        .sr-radio-row { display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
        .sr-radio-row label { flex: 1; min-width: 150px; border: 1px solid rgba(128,128,128,0.3); border-radius: 8px; padding: 10px 12px; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 8px; }
        .sr-radio-row label.active { border-color: var(--clr-theme-1, #6c5ce7); background: rgba(108,92,231,0.06); }
        .sr-modal textarea { width: 100%; border: 1px solid rgba(128,128,128,0.3); border-radius: 8px; padding: 10px; resize: vertical; }
        .sr-modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px; }
        .sr-sanction-full { background: #dc2626; color: #fff; padding: 9px 18px; border-radius: 24px; }
      `}</style>
    </main>
  );
};

export default SupportReportsMain;
