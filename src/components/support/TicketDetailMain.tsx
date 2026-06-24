"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import ThemeChanger from '@/components/home/ThemeChanger';
import StaffShell from '@/components/support/StaffShell';
import { Av, initialsOf } from '@/components/support/staffUi';
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

  if (isLoading) {
    return (
      <main>
        <ThemeChanger />
        <StaffShell active="tickets" title={t('ticketDetail.breadcrumb', { id })}>
          <p style={{ color: 'var(--fg-muted)' }}>{t('ticketDetail.loading')}</p>
        </StaffShell>
      </main>
    );
  }
  if (isError || !data) {
    return (
      <main>
        <ThemeChanger />
        <StaffShell active="tickets" title={t('ticketDetail.breadcrumb', { id })}>
          <div
            style={{
              border: '1px solid var(--danger)', background: 'var(--danger-bg)', color: 'var(--danger)',
              borderRadius: 'var(--r-md)', padding: '14px 16px', font: 'var(--text-body-sm)', fontWeight: 600,
            }}
          >
            {t('ticketDetail.loadError')}
          </div>
        </StaffShell>
      </main>
    );
  }

  const { ticket, messages } = data as TicketDetailResponse;
  const owner = `${ticket.owner_first ?? ''} ${ticket.owner_last ?? ''}`.trim() || t('common.user');

  return (
    <main>
      <ThemeChanger />
      <StaffShell
        active="tickets"
        title={t('ticketDetail.breadcrumb', { id: ticket.ticket_id })}
        sub={ticket.subject}
        actions={
          <Link
            href={staff ? '/soporte/tickets-admin' : '/soporte/tickets'}
            style={{ font: 'var(--text-body-sm)', fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}
          >
            {t('common.back')}
          </Link>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }} className="td-grid">
          {/* Hilo de mensajes */}
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {messages.map((m: TicketMessage) => {
                const who = `${m.first ?? ''} ${m.last ?? ''}`.trim() || t('common.user');
                const isStaffMsg = m.role === 'support' || m.role === 'admin';
                const borderColor = m.is_internal ? 'var(--warning)' : isStaffMsg ? 'var(--lav-300)' : 'var(--border)';
                const bg = m.is_internal ? 'var(--warning-bg)' : isStaffMsg ? 'var(--lav-100)' : 'var(--surface)';
                return (
                  <div
                    key={m.tmsg_id}
                    style={{
                      border: `1px solid ${borderColor}`, borderRadius: 'var(--r-md)',
                      padding: '14px 16px', background: bg,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
                      <Av init={initialsOf(who)} sm />
                      <strong style={{ font: 'var(--text-body-sm)', color: 'var(--fg-strong)' }}>{who}</strong>
                      {isStaffMsg && !m.is_internal && (
                        <span style={{ font: 'var(--text-caption)', fontWeight: 700, padding: '1px 8px', borderRadius: '999px', background: 'var(--lav-500)', color: '#fff' }}>
                          {t('breadcrumbs.support')}
                        </span>
                      )}
                      {m.is_internal && (
                        <span style={{ font: 'var(--text-caption)', fontWeight: 700, padding: '1px 8px', borderRadius: '999px', background: 'var(--warning)', color: '#fff' }}>
                          {t('ticketDetail.internalNote')}
                        </span>
                      )}
                      <span style={{ marginLeft: 'auto', font: 'var(--text-caption)', color: 'var(--fg-subtle)' }}>
                        {dateFmt.dateTime(m.created_at)}
                      </span>
                    </div>
                    <p style={{ margin: 0, font: 'var(--text-body)', color: 'var(--fg)', whiteSpace: 'pre-wrap' }}>{m.body}</p>
                  </div>
                );
              })}
            </div>

            {/* Responder */}
            {ticket.status !== 'closed' ? (
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 14, background: 'var(--surface)' }}>
                <textarea
                  className="kq-input"
                  rows={3}
                  placeholder={t('ticketDetail.replyPlaceholder')}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  style={{ resize: 'vertical', fontFamily: 'var(--font-body)' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12 }}>
                  {staff && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, font: 'var(--text-body-sm)', color: 'var(--fg-muted)', cursor: 'pointer', marginRight: 'auto' }}>
                      <input
                        type="checkbox"
                        checked={internal}
                        onChange={(e) => setInternal(e.target.checked)}
                        style={{ width: 16, height: 16, accentColor: 'var(--warning)' }}
                      />
                      {t('ticketDetail.internalToggle')}
                    </label>
                  )}
                  <button
                    className="kq-btn kq-btn--action"
                    onClick={send}
                    disabled={reply.isPending || body.trim().length === 0}
                    style={staff ? undefined : { marginLeft: 'auto' }}
                  >
                    {reply.isPending ? t('common.sending') : t('common.send')}
                  </button>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--fg-muted)', font: 'var(--text-body-sm)' }}>{t('ticketDetail.closed')}</p>
            )}
          </div>

          {/* Panel lateral de control */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {staff && (
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 18, background: 'var(--surface)' }}>
                <div style={{ font: 'var(--text-label)', color: 'var(--fg-strong)', marginBottom: 12 }}>{t('table.status')}</div>
                <div style={{ position: 'relative', marginBottom: 18 }}>
                  <select
                    className="kq-input"
                    value={ticket.status}
                    onChange={(e) => setStatus.mutate(e.target.value as TicketStatus, { onError: () => toast.error(t('ticketDetail.statusError')) })}
                    style={{ appearance: 'none', cursor: 'pointer', paddingRight: 38 }}
                  >
                    {(['open', 'in_progress', 'resolved', 'closed'] as const).map((s) => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
                  </select>
                  <i className="fas fa-chevron-down" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--fg-subtle)', pointerEvents: 'none' }} aria-hidden />
                </div>
                <div style={{ font: 'var(--text-label)', color: 'var(--fg-strong)', marginBottom: 12 }}>{t('table.agent')}</div>
                <div style={{ position: 'relative' }}>
                  <select
                    className="kq-input"
                    value={ticket.assigned_to ?? ''}
                    onChange={(e) => e.target.value && assign.mutate(Number(e.target.value), { onSuccess: () => toast.success(t('ticketDetail.reassigned')), onError: () => toast.error(t('ticketDetail.assignError')) })}
                    style={{ appearance: 'none', cursor: 'pointer', paddingRight: 38 }}
                  >
                    <option value="" disabled>{t('ticketDetail.assignPlaceholder')}</option>
                    {agents?.map((a: SupportAgent) => <option key={a.cus_id} value={a.cus_id}>{`${a.firstname ?? ''} ${a.lastname ?? ''}`.trim()}</option>)}
                  </select>
                  <i className="fas fa-chevron-down" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--fg-subtle)', pointerEvents: 'none' }} aria-hidden />
                </div>
              </div>
            )}

            <div
              style={{
                border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 18, background: 'var(--surface)',
                display: 'flex', flexDirection: 'column', gap: 10, font: 'var(--text-body-sm)',
              }}
            >
              {staff && (
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <span style={{ color: 'var(--fg-muted)' }}>{t('table.requester')}</span>
                  <span style={{ color: 'var(--fg-strong)', fontWeight: 600, textAlign: 'right' }}>
                    {owner}{ticket.owner_handle ? ` @${ticket.owner_handle}` : ''}
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ color: 'var(--fg-muted)' }}>{t('table.category')}</span>
                <span style={{ color: 'var(--fg-strong)', textAlign: 'right', textTransform: 'capitalize' }}>{ticket.category}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ color: 'var(--fg-muted)' }}>{t('table.date')}</span>
                <span style={{ color: 'var(--fg-strong)', textAlign: 'right' }}>{dateFmt.dateTime(ticket.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </StaffShell>

      <style jsx>{`
        @media (max-width: 820px) {
          .td-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
};

export default TicketDetailMain;
