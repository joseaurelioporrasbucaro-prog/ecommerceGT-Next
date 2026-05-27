"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import ThemeChanger from '@/components/home/ThemeChanger';
import Breadcrumbs from '@/utils/Breadcrumbs';
import { toast } from 'react-toastify';
import { ApiError } from '@/utils/Api';
import { useMyTickets, useCreateTicket } from '@/hooks/api/useTickets';
import type { TicketStatus } from '@/types/api';

const STATUS_LABEL: Record<TicketStatus, string> = {
  open: 'Abierto', in_progress: 'En progreso', resolved: 'Resuelto', closed: 'Cerrado',
};
const CATEGORIES = [
  { v: 'cuenta', l: 'Cuenta' }, { v: 'pago', l: 'Pago' },
  { v: 'denuncia', l: 'Denuncia' }, { v: 'verificacion', l: 'Verificación' }, { v: 'otro', l: 'Otro' },
];

const MyTicketsMain = () => {
  const { data, isLoading } = useMyTickets();
  const create = useCreateTicket();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('otro');
  const [body, setBody] = useState('');

  const submit = () => {
    if (subject.trim().length < 4) { toast.error('Escribe un asunto.'); return; }
    if (body.trim().length < 4) { toast.error('Describe tu solicitud.'); return; }
    create.mutate(
      { subject: subject.trim(), category, body: body.trim() },
      {
        onSuccess: () => { toast.success('Ticket creado.'); setOpen(false); setSubject(''); setBody(''); setCategory('otro'); },
        onError: (e) => toast.error(e instanceof ApiError ? e.message : 'No se pudo crear'),
      },
    );
  };

  const rows = data ?? [];

  return (
    <main>
      <ThemeChanger />
      <Breadcrumbs breadcrumbTitle="Soporte" breadcrumbSubTitle="Mis tickets" />

      <section className="creator-area pt-130 pb-100">
        <div className="container">
          <div className="mt-toolbar">
            <h4 style={{ margin: 0 }}>Mis tickets de soporte</h4>
            <button className="mt-new" onClick={() => setOpen(true)}><i className="fas fa-plus" /> Nuevo ticket</button>
          </div>

          {isLoading && <p style={{ opacity: 0.6 }}>Cargando…</p>}
          {!isLoading && rows.length === 0 && <p style={{ opacity: 0.6 }}>No tienes tickets. Crea uno si necesitas ayuda.</p>}

          {rows.length > 0 && (
            <div className="mt-list">
              {rows.map((t) => (
                <Link key={t.ticket_id} href={`/soporte/tickets/${t.ticket_id}`} className="mt-card">
                  <div className="mt-card-main">
                    <span className={`mt-status mt-status-${t.status}`}>{STATUS_LABEL[t.status]}</span>
                    <span className="mt-subject">{t.subject}</span>
                  </div>
                  <div className="mt-card-meta">
                    <span className="mt-cat">{t.category}</span>
                    <span className="mt-date">{new Date(t.updated_at).toLocaleDateString('es-GT')}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {open && (
        <div className="mt-overlay" role="dialog" aria-modal="true">
          <div className="mt-modal">
            <h5>Nuevo ticket</h5>
            <label className="mt-label">Asunto</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Resumen de tu solicitud" />
            <label className="mt-label">Categoría</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c.v} value={c.v}>{c.l}</option>)}
            </select>
            <label className="mt-label">Descripción</label>
            <textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Cuéntanos en detalle…" />
            <div className="mt-modal-actions">
              <button className="mt-ghost" onClick={() => setOpen(false)}>Cancelar</button>
              <button className="mt-send" onClick={submit} disabled={create.isPending}>{create.isPending ? 'Creando…' : 'Crear ticket'}</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .mt-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; gap: 12px; }
        .mt-new { background: var(--clr-theme-1, #6c5ce7); color: #fff; border: none; padding: 10px 20px; border-radius: 24px; font-weight: 600; cursor: pointer; }
        .mt-list { display: flex; flex-direction: column; gap: 12px; }
        .mt-card { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 16px 18px; border: 1px solid var(--clr-common-border, #e0e2e5); border-radius: 12px; text-decoration: none; color: inherit; background: var(--clr-bg-white, #fff); transition: 0.2s; }
        .mt-card:hover { border-color: var(--clr-theme-1, #6c5ce7); }
        .mt-card-main { display: flex; align-items: center; gap: 12px; min-width: 0; }
        .mt-subject { font-weight: 600; }
        .mt-card-meta { display: flex; align-items: center; gap: 14px; font-size: 13px; opacity: 0.7; white-space: nowrap; }
        .mt-cat { text-transform: capitalize; }
        .mt-status { font-size: 11px; font-weight: 700; padding: 3px 11px; border-radius: 20px; white-space: nowrap; }
        .mt-status-open { background: rgba(245,158,11,0.18); color: #b8860b; }
        .mt-status-in_progress { background: rgba(59,130,246,0.16); color: #2563eb; }
        .mt-status-resolved { background: rgba(34,197,94,0.16); color: #16a34a; }
        .mt-status-closed { background: rgba(128,128,128,0.18); color: #777; }
        .mt-overlay { position: fixed; inset: 0; z-index: 9999; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; padding: 20px; }
        .mt-modal { background: var(--clr-bg-white, #fff); border-radius: 14px; padding: 24px; width: 100%; max-width: 480px; }
        .mt-modal h5 { margin: 0 0 8px; }
        .mt-label { display: block; font-weight: 600; margin: 12px 0 6px; font-size: 14px; }
        .mt-modal input, .mt-modal select, .mt-modal textarea { width: 100%; border: 1px solid rgba(128,128,128,0.3); border-radius: 8px; padding: 10px; }
        .mt-modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; }
        .mt-ghost { background: transparent; border: 1px solid rgba(128,128,128,0.4); padding: 9px 18px; border-radius: 24px; cursor: pointer; }
        .mt-send { background: var(--clr-theme-1, #6c5ce7); color: #fff; border: none; padding: 9px 18px; border-radius: 24px; font-weight: 600; cursor: pointer; }
        .mt-send:disabled { opacity: 0.6; }
      `}</style>
    </main>
  );
};

export default MyTicketsMain;
