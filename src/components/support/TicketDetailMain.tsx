"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import ThemeChanger from '@/components/home/ThemeChanger';
import Breadcrumbs from '@/utils/Breadcrumbs';
import { toast } from 'react-toastify';
import { ApiError } from '@/utils/Api';
import {
  useTicket, useReplyTicket, useSupportAgents, useAssignTicket, useSetTicketStatus,
} from '@/hooks/api/useTickets';
import type { TicketStatus } from '@/types/api';

const STATUS_LABEL: Record<TicketStatus, string> = {
  open: 'Abierto', in_progress: 'En progreso', resolved: 'Resuelto', closed: 'Cerrado',
};

const TicketDetailMain = ({ id }: { id: string }) => {
  const { data, isLoading, isError } = useTicket(id);
  const reply = useReplyTicket(id);
  const assign = useAssignTicket(id);
  const setStatus = useSetTicketStatus(id);
  const staff = data?.viewerIsStaff;
  const { data: agents } = useSupportAgents();

  const [body, setBody] = useState('');
  const [internal, setInternal] = useState(false);

  const send = () => {
    if (body.trim().length < 1) return;
    reply.mutate(
      { body: body.trim(), isInternal: staff ? internal : undefined },
      {
        onSuccess: () => { setBody(''); setInternal(false); },
        onError: (e) => toast.error(e instanceof ApiError ? e.message : 'No se pudo enviar'),
      },
    );
  };

  if (isLoading) return <main><ThemeChanger /><div className="container pt-130 pb-100"><p style={{ opacity: 0.6 }}>Cargando ticket…</p></div></main>;
  if (isError || !data) return <main><ThemeChanger /><div className="container pt-130 pb-100"><div className="alert alert-danger">No se pudo cargar el ticket.</div></div></main>;

  const { ticket, messages } = data;
  const owner = `${ticket.owner_first ?? ''} ${ticket.owner_last ?? ''}`.trim() || 'Usuario';

  return (
    <main>
      <ThemeChanger />
      <Breadcrumbs breadcrumbTitle="Soporte" breadcrumbSubTitle={`Ticket #${ticket.ticket_id}`} />

      <section className="creator-area pt-130 pb-100">
        <div className="container">
          <Link href={staff ? '/soporte/tickets-admin' : '/soporte/tickets'} className="td-back">← Volver</Link>

          <div className="td-head">
            <div>
              <h4 className="td-subject">{ticket.subject}</h4>
              <div className="td-meta">
                <span className={`td-status td-status-${ticket.status}`}>{STATUS_LABEL[ticket.status]}</span>
                <span className="td-cat">{ticket.category}</span>
                {staff && <span className="td-owner">de {owner}{ticket.owner_handle ? ` @${ticket.owner_handle}` : ''}</span>}
              </div>
            </div>

            {staff && (
              <div className="td-controls">
                <select value={ticket.status} onChange={(e) => setStatus.mutate(e.target.value as TicketStatus, { onError: () => toast.error('No se pudo cambiar el estado') })}>
                  {(['open', 'in_progress', 'resolved', 'closed'] as const).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
                <select
                  value={ticket.assigned_to ?? ''}
                  onChange={(e) => e.target.value && assign.mutate(Number(e.target.value), { onSuccess: () => toast.success('Reasignado'), onError: () => toast.error('No se pudo reasignar') })}
                >
                  <option value="" disabled>Asignar a…</option>
                  {agents?.map((a) => <option key={a.cus_id} value={a.cus_id}>{`${a.firstname ?? ''} ${a.lastname ?? ''}`.trim()}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="td-thread">
            {messages.map((m) => {
              const who = `${m.first ?? ''} ${m.last ?? ''}`.trim() || 'Usuario';
              const isStaffMsg = m.role === 'support' || m.role === 'admin';
              return (
                <div key={m.tmsg_id} className={`td-msg ${isStaffMsg ? 'is-staff' : ''} ${m.is_internal ? 'is-internal' : ''}`}>
                  <div className="td-msg-head">
                    <strong>{who}</strong>
                    {isStaffMsg && <span className="td-badge">Soporte</span>}
                    {m.is_internal && <span className="td-badge td-internal">Nota interna</span>}
                    <span className="td-time">{new Date(m.created_at).toLocaleString('es-GT')}</span>
                  </div>
                  <p className="td-body">{m.body}</p>
                </div>
              );
            })}
          </div>

          {ticket.status !== 'closed' ? (
            <div className="td-reply">
              <textarea rows={3} placeholder="Escribe una respuesta…" value={body} onChange={(e) => setBody(e.target.value)} />
              <div className="td-reply-actions">
                {staff && (
                  <label className="td-internal-toggle">
                    <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} /> Nota interna (no la ve el usuario)
                  </label>
                )}
                <button className="td-send" onClick={send} disabled={reply.isPending || body.trim().length === 0}>
                  {reply.isPending ? 'Enviando…' : 'Enviar'}
                </button>
              </div>
            </div>
          ) : (
            <p className="td-closed">Este ticket está cerrado.</p>
          )}
        </div>
      </section>

      <style jsx>{`
        .td-back { display: inline-block; margin-bottom: 16px; color: var(--clr-theme-1, #6c5ce7); text-decoration: none; }
        .td-head { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; margin-bottom: 22px; flex-wrap: wrap; }
        .td-subject { margin: 0 0 8px; }
        .td-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; font-size: 13px; }
        .td-status { font-weight: 700; padding: 3px 11px; border-radius: 20px; font-size: 12px; }
        .td-status-open { background: rgba(245,158,11,0.18); color: #b8860b; }
        .td-status-in_progress { background: rgba(59,130,246,0.16); color: #2563eb; }
        .td-status-resolved { background: rgba(34,197,94,0.16); color: #16a34a; }
        .td-status-closed { background: rgba(128,128,128,0.18); color: #777; }
        .td-cat { text-transform: capitalize; opacity: 0.7; }
        .td-owner { opacity: 0.7; }
        .td-controls { display: flex; gap: 10px; flex-wrap: wrap; }
        .td-controls select { padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(128,128,128,0.3); }
        .td-thread { display: flex; flex-direction: column; gap: 12px; margin-bottom: 22px; }
        .td-msg { border: 1px solid rgba(128,128,128,0.2); border-radius: 12px; padding: 14px 16px; background: var(--clr-bg-white, #fff); }
        .td-msg.is-staff { border-color: rgba(108,92,231,0.3); background: rgba(108,92,231,0.04); }
        .td-msg.is-internal { border-color: rgba(245,158,11,0.4); background: rgba(245,158,11,0.06); }
        .td-msg-head { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; font-size: 13px; }
        .td-badge { font-size: 11px; font-weight: 700; padding: 1px 8px; border-radius: 12px; background: rgba(108,92,231,0.16); color: #6c5ce7; }
        .td-internal { background: rgba(245,158,11,0.2); color: #b8860b; }
        .td-time { margin-left: auto; opacity: 0.5; }
        .td-body { margin: 0; white-space: pre-wrap; }
        .td-reply textarea { width: 100%; border: 1px solid rgba(128,128,128,0.3); border-radius: 10px; padding: 12px; resize: vertical; }
        .td-reply-actions { display: flex; align-items: center; gap: 16px; margin-top: 10px; justify-content: flex-end; }
        .td-internal-toggle { font-size: 13px; display: flex; align-items: center; gap: 7px; margin-right: auto; }
        .td-send { background: var(--clr-theme-1, #6c5ce7); color: #fff; border: none; padding: 10px 24px; border-radius: 24px; font-weight: 600; cursor: pointer; }
        .td-send:disabled { opacity: 0.6; cursor: default; }
        .td-closed { opacity: 0.6; }
      `}</style>
    </main>
  );
};

export default TicketDetailMain;
