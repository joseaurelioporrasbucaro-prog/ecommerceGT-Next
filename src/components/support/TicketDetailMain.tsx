"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import ThemeChanger from '@/components/home/ThemeChanger';
import Breadcrumbs from '@/utils/Breadcrumbs';
import { toast } from 'react-toastify';
import { ApiError } from '@/utils/Api';
import {
  useTicket, useReplyTicket, useSupportAgents, useAssignTicket, useSetTicketStatus,
} from '@/hooks/api/useTickets';
import { useDateFmt } from '@/utils/datetime';
import type { TicketStatus, SupportAgent, TicketMessage, TicketDetailResponse } from '@/types/api';

const TicketDetailMain = ({ id }: { id: string }) => {
  const t = useTranslations('support');
  const dateFmt = useDateFmt();
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
        onError: (e) => toast.error(e instanceof ApiError ? e.message : t('ticketDetail.sendError')),
      },
    );
  };

  if (isLoading) return <main><ThemeChanger /><div className="container pb-100" style={{ paddingTop: 40 }}><p style={{ opacity: 0.6 }}>{t('ticketDetail.loading')}</p></div></main>;
  if (isError || !data) return <main><ThemeChanger /><div className="container pb-100" style={{ paddingTop: 40 }}><div className="alert alert-danger">{t('ticketDetail.loadError')}</div></div></main>;

  const { ticket, messages } = data as TicketDetailResponse;
  const owner = `${ticket.owner_first ?? ''} ${ticket.owner_last ?? ''}`.trim() || t('common.user');

  return (
    <main>
      <ThemeChanger />
      <Breadcrumbs breadcrumbTitle={t('breadcrumbs.support')} breadcrumbSubTitle={t('ticketDetail.breadcrumb', { id: ticket.ticket_id })} />

      <section className="creator-area pb-90" style={{ paddingTop: 40 }}>
        <div className="container">
          <Link href={staff ? '/soporte/tickets-admin' : '/soporte/tickets'} className="td-back">{t('common.back')}</Link>

          <div className="td-head">
            <div>
              <h4 className="td-subject">{ticket.subject}</h4>
              <div className="td-meta">
                <span className={`td-status td-status-${ticket.status}`}>{t(`status.${ticket.status}`)}</span>
                <span className="td-cat">{ticket.category}</span>
                {staff && <span className="td-owner">{t('ticketDetail.from', { owner })}{ticket.owner_handle ? ` @${ticket.owner_handle}` : ''}</span>}
              </div>
            </div>

            {staff && (
              <div className="td-controls">
                <select value={ticket.status} onChange={(e) => setStatus.mutate(e.target.value as TicketStatus, { onError: () => toast.error(t('ticketDetail.statusError')) })}>
                  {(['open', 'in_progress', 'resolved', 'closed'] as const).map((s) => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
                </select>
                <select
                  value={ticket.assigned_to ?? ''}
                  onChange={(e) => e.target.value && assign.mutate(Number(e.target.value), { onSuccess: () => toast.success(t('ticketDetail.reassigned')), onError: () => toast.error(t('ticketDetail.assignError')) })}
                >
                  <option value="" disabled>{t('ticketDetail.assignPlaceholder')}</option>
                  {agents?.map((a: SupportAgent) => <option key={a.cus_id} value={a.cus_id}>{`${a.firstname ?? ''} ${a.lastname ?? ''}`.trim()}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="td-thread">
            {messages.map((m: TicketMessage) => {
              const who = `${m.first ?? ''} ${m.last ?? ''}`.trim() || t('common.user');
              const isStaffMsg = m.role === 'support' || m.role === 'admin';
              return (
                <div key={m.tmsg_id} className={`td-msg ${isStaffMsg ? 'is-staff' : ''} ${m.is_internal ? 'is-internal' : ''}`}>
                  <div className="td-msg-head">
                    <strong>{who}</strong>
                    {isStaffMsg && <span className="td-badge">{t('breadcrumbs.support')}</span>}
                    {m.is_internal && <span className="td-badge td-internal">{t('ticketDetail.internalNote')}</span>}
                    <span className="td-time">{dateFmt.dateTime(m.created_at)}</span>
                  </div>
                  <p className="td-body">{m.body}</p>
                </div>
              );
            })}
          </div>

          {ticket.status !== 'closed' ? (
            <div className="td-reply">
              <textarea rows={3} placeholder={t('ticketDetail.replyPlaceholder')} value={body} onChange={(e) => setBody(e.target.value)} />
              <div className="td-reply-actions">
                {staff && (
                  <label className="td-internal-toggle">
                    <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} /> {t('ticketDetail.internalToggle')}
                  </label>
                )}
                <button className="td-send" onClick={send} disabled={reply.isPending || body.trim().length === 0}>
                  {reply.isPending ? t('common.sending') : t('common.send')}
                </button>
              </div>
            </div>
          ) : (
            <p className="td-closed">{t('ticketDetail.closed')}</p>
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
