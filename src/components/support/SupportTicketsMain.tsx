"use client";
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import ThemeChanger from '@/components/home/ThemeChanger';
import { useAuth } from '@/utils/AuthContext';
import { useSupportTickets } from '@/hooks/api/useTickets';
import { useDateFmt } from '@/utils/datetime';
import StaffShell from './StaffShell';
import { DataTable, Row, Cell, StatusChip, Av, FilterTabs, initialsOf } from './staffUi';
import type { TicketStatus, SupportTicketRow } from '@/types/api';

const PAGE_SIZE = 15;

const SupportTicketsMain = () => {
  const t = useTranslations('support');
  const dateFmt = useDateFmt();
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
  // Copy nuevo (voseo) con fallback inline: evita keys ausentes mientras el equipo las agrega al support.json.
  const sub = t.has('tickets.sub') ? t('tickets.sub') : 'Todos los tickets de soporte. Filtrá por estado o asignación.';
  const countWord = t.has('tickets.count') ? t('tickets.count') : 'tickets';

  return (
    <main>
      <ThemeChanger />

      <section className="creator-area pb-90" style={{ paddingTop: 40 }}>
        <div className="container">
          <StaffShell active="tickets" title={t('breadcrumbs.tickets')} sub={sub}>
            {!isSupport ? (
              <div className="alert alert-danger">{t('common.restricted')}</div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', marginBottom: 18 }}>
                  <FilterTabs
                    active={status}
                    onSelect={(k) => setStatus(k as '' | TicketStatus)}
                    tabs={[
                      ['', t('filters.all')],
                      ['open', t('statusFilter.open')],
                      ['in_progress', t('statusFilter.in_progress')],
                      ['resolved', t('statusFilter.resolved')],
                      ['closed', t('statusFilter.closed')],
                    ]}
                  />
                  <div style={{ width: 1, height: 24, background: 'var(--border)' }} />
                  <FilterTabs
                    active={assignee}
                    onSelect={(k) => setAssignee(k as '' | 'me' | 'unassigned')}
                    tabs={[
                      ['', t('assignee.all')],
                      ['me', t('assignee.me')],
                      ['unassigned', t('assignee.unassigned')],
                    ]}
                  />
                  <span style={{ marginLeft: 'auto', font: 'var(--text-body-sm)', color: 'var(--fg-muted)' }}>
                    <strong style={{ color: 'var(--fg-strong)' }}>{rows.length}</strong> {countWord}
                  </span>
                </div>

                {isLoading && <p style={{ color: 'var(--fg-muted)' }}>{t('common.loading')}</p>}
                {!isLoading && rows.length === 0 && <p style={{ color: 'var(--fg-muted)' }}>{t('tickets.empty')}</p>}

                {rows.length > 0 && (
                  <>
                    <DataTable
                      cols={[
                        { label: '#' },
                        { label: t('table.subject') },
                        { label: t('table.requester') },
                        { label: t('table.category') },
                        { label: t('table.status') },
                        { label: t('table.agent') },
                        { label: t('table.updated'), right: true },
                      ]}
                    >
                      {paged.map((ticket: SupportTicketRow) => {
                        const owner = `${ticket.owner_first ?? ''} ${ticket.owner_last ?? ''}`.trim() || t('common.user');
                        const agent = ticket.assigned_to ? `${ticket.agent_first ?? ''} ${ticket.agent_last ?? ''}`.trim() : '';
                        return (
                          <Row key={ticket.ticket_id} onClick={() => { window.location.href = `/soporte/tickets/${ticket.ticket_id}`; }}>
                            <Cell mono muted>#{ticket.ticket_id}</Cell>
                            <Cell strong>{ticket.subject}</Cell>
                            <Cell>
                              {owner}
                              {ticket.owner_handle ? <span style={{ color: 'var(--accent-hover)' }}> @{ticket.owner_handle}</span> : ''}
                            </Cell>
                            <Cell muted>{ticket.category}</Cell>
                            <Cell>
                              <StatusChip s={ticket.status}>{t(`status.${ticket.status}`)}</StatusChip>
                            </Cell>
                            <Cell>
                              {ticket.assigned_to ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                                  <Av init={initialsOf(agent)} sm /> {agent}
                                </span>
                              ) : (
                                <span style={{ color: 'var(--fg-subtle)' }}>{t('assignee.unassigned')}</span>
                              )}
                            </Cell>
                            <Cell right muted mono>{dateFmt.short(ticket.updated_at)}</Cell>
                          </Row>
                        );
                      })}
                    </DataTable>
                    {(() => {
                      const pageCount = Math.ceil(rows.length / PAGE_SIZE);
                      if (pageCount <= 1) return null;
                      const from = (page - 1) * PAGE_SIZE + 1;
                      const to = Math.min(page * PAGE_SIZE, rows.length);
                      const pill = (on: boolean): React.CSSProperties => ({
                        minWidth: 34, height: 34, borderRadius: 'var(--r-sm)', cursor: 'pointer',
                        border: on ? '1.5px solid transparent' : '1.5px solid var(--border-strong)',
                        background: on ? 'var(--navy-800)' : 'var(--surface)',
                        color: on ? 'var(--cream)' : 'var(--fg)', font: 'var(--text-body-sm)', fontWeight: 600,
                      });
                      return (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, font: 'var(--text-body-sm)', color: 'var(--fg-muted)', flexWrap: 'wrap', gap: 12 }}>
                          <span>{t('pagination.summary', { from, to, total: rows.length })}</span>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              type="button"
                              onClick={() => setPage(page - 1)}
                              disabled={page <= 1}
                              aria-label={t('pagination.previous')}
                              style={{ ...pill(false), opacity: page <= 1 ? 0.4 : 1, cursor: page <= 1 ? 'default' : 'pointer' }}
                            >
                              <i className="fas fa-chevron-left" aria-hidden style={{ fontSize: 12 }} />
                            </button>
                            {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                              <button key={n} type="button" onClick={() => setPage(n)} style={pill(n === page)}>{n}</button>
                            ))}
                            <button
                              type="button"
                              onClick={() => setPage(page + 1)}
                              disabled={page >= pageCount}
                              aria-label={t('pagination.next')}
                              style={{ ...pill(false), opacity: page >= pageCount ? 0.4 : 1, cursor: page >= pageCount ? 'default' : 'pointer' }}
                            >
                              <i className="fas fa-chevron-right" aria-hidden style={{ fontSize: 12 }} />
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </>
                )}
              </>
            )}
          </StaffShell>
        </div>
      </section>
    </main>
  );
};

export default SupportTicketsMain;
