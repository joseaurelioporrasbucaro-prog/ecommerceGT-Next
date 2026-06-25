"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import ThemeChanger from '@/components/home/ThemeChanger';
import Breadcrumbs from '@/utils/Breadcrumbs';
import { toast } from 'react-toastify';
import { ApiError } from '@/utils/Api';
import { useMyTickets, useCreateTicket } from '@/hooks/api/useTickets';
import { useDateFmt } from '@/utils/datetime';
import { DataTable, Row, Cell, StatusChip } from '@/components/support/staffUi';
import type { TicketStatus, MyTicketRow } from '@/types/api';

const CATEGORIES = [
  'cuenta',
  'pago',
  'denuncia',
  'verificacion',
  'otro',
] as const;

const MyTicketsMain = () => {
  const t = useTranslations('support');
  const router = useRouter();
  const dateFmt = useDateFmt();
  const { data, isLoading } = useMyTickets();
  const create = useCreateTicket();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('otro');
  const [body, setBody] = useState('');

  const submit = () => {
    if (subject.trim().length < 4) { toast.error(t('myTickets.validation.subject')); return; }
    if (body.trim().length < 4) { toast.error(t('myTickets.validation.body')); return; }
    create.mutate(
      { subject: subject.trim(), category, body: body.trim() },
      {
        onSuccess: () => { toast.success(t('myTickets.created')); setOpen(false); setSubject(''); setBody(''); setCategory('otro'); },
        onError: (e) => toast.error(e instanceof ApiError ? e.message : t('myTickets.createError')),
      },
    );
  };

  const rows = data ?? [];

  return (
    <main>
      <ThemeChanger />
      <Breadcrumbs breadcrumbTitle={t('breadcrumbs.support')} breadcrumbSubTitle={t('breadcrumbs.myTickets')} />

      <section className="creator-area pb-90" style={{ paddingTop: 40 }}>
        <div className="container">
          <div className="mt-toolbar">
            <h4 style={{ margin: 0 }}>{t('myTickets.title')}</h4>
            <button className="mt-new" onClick={() => setOpen(true)}><i className="fas fa-plus" /> {t('myTickets.newTicket')}</button>
          </div>

          {isLoading && <p style={{ opacity: 0.6 }}>{t('common.loading')}</p>}
          {!isLoading && rows.length === 0 && <p style={{ opacity: 0.6 }}>{t('myTickets.empty')}</p>}

          {rows.length > 0 && (
            <DataTable
              minWidth={620}
              cols={[
                { label: '#' },
                { label: t('table.subject') },
                { label: t('table.category') },
                { label: t('table.status') },
                { label: t('table.updated'), right: true },
              ]}
            >
              {rows.map((ticket: MyTicketRow) => (
                <Row key={ticket.ticket_id} onClick={() => router.push(`/soporte/tickets/${ticket.ticket_id}`)}>
                  <Cell mono muted>#{ticket.ticket_id}</Cell>
                  <Cell strong>{ticket.subject}</Cell>
                  <Cell muted>{ticket.category}</Cell>
                  <Cell><StatusChip s={ticket.status}>{t(`status.${ticket.status}`)}</StatusChip></Cell>
                  <Cell right muted mono>{dateFmt.short(ticket.updated_at)}</Cell>
                </Row>
              ))}
            </DataTable>
          )}
        </div>
      </section>

      {open && (
        <div className="mt-overlay" role="dialog" aria-modal="true">
          <div className="mt-modal">
            <h5>{t('myTickets.modalTitle')}</h5>
            <label className="mt-label">{t('myTickets.subject')}</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={t('myTickets.subjectPlaceholder')} />
            <label className="mt-label">{t('myTickets.category')}</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{t(`categories.${c}`)}</option>)}
            </select>
            <label className="mt-label">{t('myTickets.description')}</label>
            <textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder={t('myTickets.descriptionPlaceholder')} />
            <div className="mt-modal-actions">
              <button type="button" className="kq-btn kq-btn--outline" onClick={() => setOpen(false)}>{t('common.cancel')}</button>
              <button type="button" className="kq-btn kq-btn--action" onClick={submit} disabled={create.isPending}>
                {create.isPending ? t('myTickets.creating') : t('myTickets.create')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .mt-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; gap: 12px; }
        .mt-new { background: var(--navy-800); color: var(--cream); border: none; padding: 10px 20px; border-radius: var(--r-pill, 999px); font-weight: 600; cursor: pointer; }
        .mt-overlay { position: fixed; inset: 0; z-index: 9999; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; padding: 20px; }
        .mt-modal { background: var(--surface); color: var(--fg); border: 1px solid var(--border); border-radius: var(--r-lg, 14px); padding: 24px; width: 100%; max-width: 480px; box-shadow: var(--shadow-lg); }
        .mt-modal h5 { margin: 0 0 8px; color: var(--fg-strong); }
        .mt-label { display: block; font-weight: 600; margin: 12px 0 6px; font-size: 14px; color: var(--fg-strong); }
        .mt-modal input, .mt-modal select, .mt-modal textarea { width: 100%; border: 1px solid var(--border-strong); border-radius: var(--r-sm, 8px); padding: 10px; background: var(--surface); color: var(--fg); }
        .mt-modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; }
      `}</style>
    </main>
  );
};

export default MyTicketsMain;
