"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import ThemeChanger from '@/components/home/ThemeChanger';
import Breadcrumbs from '@/utils/Breadcrumbs';
import { useAuth } from '@/utils/AuthContext';
import { toast } from 'react-toastify';
import { ApiError } from '@/utils/Api';
import { useSupportReports, useResolveReport } from '@/hooks/api/useSupportReports';
import type { SupportReportRow, ReportType } from '@/types/api';

const TYPE_LABEL: Record<ReportType, string> = {
  comment: 'Comentario',
  message: 'Mensaje',
  publication: 'Publicación',
};

const contentHref = (r: SupportReportRow): string | null => {
  if (r.report_type === 'publication') return `/publications/${r.content_id}`;
  if (r.report_type === 'comment' && r.pub_id) return `/publications/${r.pub_id}`;
  return null; // mensajes no tienen deep-link público
};

const SupportReportsMain = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<'pending' | 'resolved' | 'dismissed'>('pending');
  const { data, isLoading } = useSupportReports(status);
  const resolve = useResolveReport();

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

  const rows = data ?? [];

  return (
    <main>
      <ThemeChanger />
      <Breadcrumbs breadcrumbTitle="Soporte" breadcrumbSubTitle="Denuncias" />

      <section className="creator-area pt-130 pb-100">
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
                        <th>Tipo</th>
                        <th>Contenido</th>
                        <th>Autor</th>
                        <th>Motivo</th>
                        <th>Fecha</th>
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
                              {href && <Link className="sr-view" href={href} target="_blank">ver</Link>}
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

      <style jsx>{`
        .sr-filter { display: flex; gap: 10px; margin-bottom: 24px; flex-wrap: wrap; }
        .sr-tab { padding: 8px 18px; border-radius: 24px; border: 1px solid rgba(128,128,128,0.3); background: transparent; cursor: pointer; font-weight: 600; }
        .sr-tab.active { background: var(--clr-theme-1, #6c5ce7); color: #fff; border-color: transparent; }
        .sr-table-wrap { overflow-x: auto; border: 1px solid var(--clr-common-border, #e0e2e5); border-radius: 12px; }
        .sr-table { width: 100%; border-collapse: collapse; min-width: 820px; background: var(--clr-bg-white, #fff); }
        .sr-table thead th { text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; opacity: 0.6; padding: 14px 16px; border-bottom: 1px solid var(--clr-common-border, #e0e2e5); }
        .sr-table tbody td { padding: 14px 16px; border-bottom: 1px solid rgba(128,128,128,0.12); vertical-align: top; font-size: 14px; }
        .sr-table tbody tr:hover { background: rgba(108,92,231,0.04); }
        .sr-chip { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; white-space: nowrap; }
        .sr-chip-comment { background: rgba(59,130,246,0.14); color: #2563eb; }
        .sr-chip-message { background: rgba(0,184,148,0.16); color: #00b894; }
        .sr-chip-publication { background: rgba(245,158,11,0.18); color: #b8860b; }
        .sr-content { max-width: 320px; }
        .sr-excerpt { display: block; overflow: hidden; text-overflow: ellipsis; }
        .sr-view { font-size: 12px; color: var(--clr-theme-1, #6c5ce7); }
        .sr-author { color: #3b82f6; text-decoration: none; }
        .sr-reason { text-transform: capitalize; font-weight: 600; }
        .sr-detail { font-size: 12px; opacity: 0.65; }
        .sr-date { white-space: nowrap; opacity: 0.7; }
        .sr-actions { display: flex; gap: 8px; }
        .sr-btn { border: none; cursor: pointer; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 8px; font-size: 13px; white-space: nowrap; }
        .sr-btn:disabled { opacity: 0.6; cursor: default; }
        .sr-dismiss { background: rgba(34,197,94,0.12); color: #16a34a; }
        .sr-delete { background: rgba(239,68,68,0.12); color: #dc2626; }
      `}</style>
    </main>
  );
};

export default SupportReportsMain;
