"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import ThemeChanger from '@/components/home/ThemeChanger';
import Breadcrumbs from '@/utils/Breadcrumbs';
import { useAuth } from '@/utils/AuthContext';
import { useSupportTickets } from '@/hooks/api/useTickets';
import Pagination from './Pagination';
import type { TicketStatus, SupportTicketRow } from '@/types/api';

const STATUS_LABEL: Record<TicketStatus, string> = {
  open: 'Abierto', in_progress: 'En progreso', resolved: 'Resuelto', closed: 'Cerrado',
};
const PAGE_SIZE = 15;

const SupportTicketsMain = () => {
  const { user } = useAuth();
  const [status, setStatusRaw] = useState<'' | TicketStatus>('');
  const [assignee, setAssigneeRaw] = useState<'' | 'me' | 'unassigned'>('');
  const [page, setPage] = useState(1);
  const setStatus = (s: '' | TicketStatus) => { setStatusRaw(s); setPage(1); };
  const setAssignee = (a: '' | 'me' | 'unassigned') => { setAssigneeRaw(a); setPage(1); };
  const { data, isLoading } = useSupportTickets(status, assignee);
  const isSupport = user?.role === 'support' || user?.role === 'admin';
  const rows = data ?? [];
  const paged = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <main>
      <ThemeChanger />
      <Breadcrumbs breadcrumbTitle="Soporte" breadcrumbSubTitle="Tickets" />

      <section className="creator-area pb-90" style={{ paddingTop: 40 }}>
        <div className="container">
          {!isSupport ? (
            <div className="alert alert-danger">Acceso restringido. Solo el equipo de soporte puede ver esta página.</div>
          ) : (
            <>
              <div className="st-filters">
                {([['', 'Todos'], ['open', 'Abiertos'], ['in_progress', 'En progreso'], ['resolved', 'Resueltos'], ['closed', 'Cerrados']] as const).map(([v, l]) => (
                  <button key={v} className={`st-tab ${status === v ? 'active' : ''}`} onClick={() => setStatus(v)}>{l}</button>
                ))}
                <span className="st-sep" />
                {([['', 'Todos los agentes'], ['me', 'Asignados a mí'], ['unassigned', 'Sin asignar']] as const).map(([v, l]) => (
                  <button key={v} className={`st-tab ${assignee === v ? 'active' : ''}`} onClick={() => setAssignee(v)}>{l}</button>
                ))}
              </div>

              {isLoading && <p style={{ opacity: 0.6 }}>Cargando…</p>}
              {!isLoading && rows.length === 0 && <p style={{ opacity: 0.6 }}>No hay tickets que coincidan.</p>}

              {rows.length > 0 && (
                <div className="st-table-wrap">
                  <table className="st-table">
                    <thead>
                      <tr>
                        <th>#</th><th>Asunto</th><th>Solicitante</th><th>Categoría</th>
                        <th>Estado</th><th>Agente</th><th>Actualizado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paged.map((t: SupportTicketRow) => {
                        const owner = `${t.owner_first ?? ''} ${t.owner_last ?? ''}`.trim() || 'Usuario';
                        const agent = t.assigned_to ? `${t.agent_first ?? ''} ${t.agent_last ?? ''}`.trim() : '—';
                        return (
                          <tr key={t.ticket_id} onClick={() => { window.location.href = `/soporte/tickets/${t.ticket_id}`; }} className="st-row">
                            <td>#{t.ticket_id}</td>
                            <td className="st-subject"><Link href={`/soporte/tickets/${t.ticket_id}`}>{t.subject}</Link></td>
                            <td>{owner}{t.owner_handle ? <span className="st-handle"> @{t.owner_handle}</span> : ''}</td>
                            <td className="st-cat">{t.category}</td>
                            <td><span className={`st-status st-status-${t.status}`}>{STATUS_LABEL[t.status]}</span></td>
                            <td>{agent}</td>
                            <td className="st-date">{new Date(t.updated_at).toLocaleDateString('es-GT')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <Pagination page={page} pageSize={PAGE_SIZE} total={rows.length} onPage={setPage} />
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <style jsx>{`
        .st-filters { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
        .st-sep { width: 1px; height: 22px; background: rgba(128,128,128,0.3); margin: 0 6px; }
        .st-tab { padding: 7px 16px; border-radius: 24px; border: 1px solid rgba(128,128,128,0.3); background: transparent; cursor: pointer; font-weight: 600; font-size: 13px; white-space: nowrap; }
        .st-tab.active { background: var(--clr-theme-1, #6c5ce7); color: #fff; border-color: transparent; }
        .st-table-wrap { overflow-x: auto; border: 1px solid var(--clr-common-border, #e0e2e5); border-radius: 12px; }
        .st-table { width: 100%; border-collapse: collapse; min-width: 760px; background: var(--clr-bg-white, #fff); }
        .st-table thead th { text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; opacity: 0.6; padding: 14px 16px; border-bottom: 1px solid var(--clr-common-border, #e0e2e5); }
        .st-table tbody td { padding: 14px 16px; border-bottom: 1px solid rgba(128,128,128,0.12); font-size: 14px; }
        .st-row { cursor: pointer; }
        .st-row:hover { background: rgba(108,92,231,0.04); }
        .st-subject :global(a) { color: var(--clr-common-heading, #181818); font-weight: 600; text-decoration: none; }
        .st-handle { color: #3b82f6; }
        .st-cat { text-transform: capitalize; }
        .st-status { font-size: 11px; font-weight: 700; padding: 3px 11px; border-radius: 20px; white-space: nowrap; }
        .st-status-open { background: rgba(245,158,11,0.18); color: #b8860b; }
        .st-status-in_progress { background: rgba(59,130,246,0.16); color: #2563eb; }
        .st-status-resolved { background: rgba(34,197,94,0.16); color: #16a34a; }
        .st-status-closed { background: rgba(128,128,128,0.18); color: #777; }
        .st-date { white-space: nowrap; opacity: 0.7; }
      `}</style>
    </main>
  );
};

export default SupportTicketsMain;
