'use client';

import React from 'react';

/* ============================================================
   Batch F — Primitivas del portal staff (soporte + admin).
   Tono interno/utilitario pero on-brand. Light + dark por tokens.
   Estilos inline (como el mockup) para esquivar el scope de styled-jsx;
   los :hover / responsive viven en src/style/kiosqui/staff.css (global).
   ============================================================ */

/* ---------- Mapeo de estados a tokens (DECISIÓN DE DISEÑO, handoff #17) ----------
   Ticket:        open=warn · in_progress=lav · resolved=green · closed=neutral
   Verificación:  pending=warn · verified=green · rejected=danger
   Cuenta:        active=green · suspended=warn · banned=danger                  */
export const STATUS: Record<string, { bg: string; fg: string; label: string }> = {
  open: { bg: 'var(--warning-bg)', fg: '#9a5a12', label: 'Abierto' },
  in_progress: { bg: 'var(--lav-200)', fg: 'var(--lav-700)', label: 'En progreso' },
  resolved: { bg: 'var(--green-100)', fg: 'var(--green-800)', label: 'Resuelto' },
  closed: { bg: 'var(--surface-sunk)', fg: 'var(--fg-muted)', label: 'Cerrado' },
  dismissed: { bg: 'var(--surface-sunk)', fg: 'var(--fg-muted)', label: 'Descartado' },
  pending: { bg: 'var(--warning-bg)', fg: '#9a5a12', label: 'Pendiente' },
  verified: { bg: 'var(--green-100)', fg: 'var(--green-800)', label: 'Aprobado' },
  rejected: { bg: 'var(--danger-bg)', fg: 'var(--danger)', label: 'Rechazado' },
  active: { bg: 'var(--green-100)', fg: 'var(--green-800)', label: 'Activo' },
  suspended: { bg: 'var(--warning-bg)', fg: '#9a5a12', label: 'Suspendido' },
  banned: { bg: 'var(--danger-bg)', fg: 'var(--danger)', label: 'Baneado' },
};

export function StatusChip({ s, children }: { s: string; children?: React.ReactNode }) {
  const v = STATUS[s] || STATUS.closed;
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 11px',
        borderRadius: '999px', background: v.bg, color: v.fg, font: 'var(--text-caption)',
        fontWeight: 700, whiteSpace: 'nowrap',
      }}
    >
      {children || v.label}
    </span>
  );
}

export const ROLE: Record<string, { bg: string; fg: string; label: string }> = {
  admin: { bg: 'var(--navy-800)', fg: 'var(--cream)', label: 'Admin' },
  support: { bg: 'var(--lav-500)', fg: '#fff', label: 'Agente' },
  user: { bg: 'var(--surface-sunk)', fg: 'var(--fg-muted)', label: 'Usuario' },
};

export function RoleBadge({ r, label }: { r: string; label?: string }) {
  const v = ROLE[r] || ROLE.user;
  return (
    <span
      style={{
        display: 'inline-flex', padding: '2px 10px', borderRadius: '999px',
        background: v.bg, color: v.fg, font: 'var(--text-caption)', fontWeight: 700,
      }}
    >
      {label || v.label}
    </span>
  );
}

/* Avatar de gradiente navy con iniciales */
export function Av({ init, sm }: { init: string; sm?: boolean }) {
  const d = sm ? 30 : 38;
  return (
    <div
      style={{
        width: d, height: d, borderRadius: '999px', flexShrink: 0,
        background: 'linear-gradient(135deg,var(--navy-700),var(--navy-900))',
        color: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: sm ? 11 : 13,
      }}
    >
      {init}
    </div>
  );
}

export function initialsOf(name?: string | null): string {
  if (!name) return '?';
  return name.trim().split(/\s+/).slice(0, 2).map((x) => x[0]).join('').toUpperCase() || '?';
}

/* ---------- DataTable densa ---------- */
export interface DataTableCol { label: React.ReactNode; right?: boolean; }

export function DataTable({ cols, children, minWidth = 760 }: { cols: DataTableCol[]; children: React.ReactNode; minWidth?: number }) {
  return (
    <div
      style={{
        border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden',
        background: 'var(--surface)', boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth }}>
          <thead>
            <tr>
              {cols.map((c, i) => (
                <th
                  key={i}
                  style={{
                    textAlign: c.right ? 'right' : 'left', font: 'var(--text-overline)',
                    letterSpacing: 'var(--tracking-overline)', textTransform: 'uppercase',
                    color: 'var(--fg-subtle)', padding: '13px 16px', whiteSpace: 'nowrap',
                    borderBottom: '1px solid var(--border)', background: 'var(--surface-sunk)',
                  }}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function Row({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <tr className="f-row" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      {children}
    </tr>
  );
}

export function Cell({
  children, right, mono, strong, muted, w, colSpan,
}: {
  children?: React.ReactNode; right?: boolean; mono?: boolean; strong?: boolean;
  muted?: boolean; w?: number | string; colSpan?: number;
}) {
  return (
    <td
      colSpan={colSpan}
      style={{
        padding: '13px 16px', borderBottom: '1px solid var(--border)', font: 'var(--text-body-sm)',
        textAlign: right ? 'right' : 'left', width: w,
        fontVariantNumeric: mono ? 'tabular-nums' : 'normal', fontWeight: strong ? 600 : 400,
        color: strong ? 'var(--fg-strong)' : muted ? 'var(--fg-subtle)' : 'var(--fg)',
        whiteSpace: mono ? 'nowrap' : 'normal',
      }}
    >
      {children}
    </td>
  );
}

/* ---------- Filtros segmentados (interactivos) ---------- */
export function FilterTabs({
  tabs, active, onSelect,
}: {
  tabs: Array<[string, React.ReactNode]>; active: string; onSelect?: (key: string) => void;
}) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      {tabs.map(([k, label]) => {
        const on = active === k;
        return (
          <button
            key={k}
            type="button"
            onClick={onSelect ? () => onSelect(k) : undefined}
            style={{
              padding: '7px 15px', borderRadius: '999px', cursor: 'pointer',
              font: 'var(--text-body-sm)', fontWeight: 600, whiteSpace: 'nowrap',
              border: on ? '1.5px solid transparent' : '1.5px solid var(--border-strong)',
              background: on ? 'var(--navy-800)' : 'var(--surface)',
              color: on ? 'var(--cream)' : 'var(--fg-muted)',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
