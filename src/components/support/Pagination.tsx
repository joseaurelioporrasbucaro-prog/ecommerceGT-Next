"use client";
import React from 'react';

interface Props {
  page: number;          // 1-based
  pageSize: number;
  total: number;
  onPage: (p: number) => void;
}

/** Paginación client-side simple para las tablas de soporte (Fase 8.5). */
const Pagination: React.FC<Props> = ({ page, pageSize, total, onPage }) => {
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return (
    <div className="pg">
      <span className="pg-info">{from}–{to} de {total}</span>
      <div className="pg-controls">
        <button onClick={() => onPage(page - 1)} disabled={page <= 1}><i className="fas fa-chevron-left" /></button>
        <span className="pg-cur">{page} / {pages}</span>
        <button onClick={() => onPage(page + 1)} disabled={page >= pages}><i className="fas fa-chevron-right" /></button>
      </div>
      <style jsx>{`
        .pg { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 16px; flex-wrap: wrap; }
        .pg-info { font-size: 13px; opacity: 0.6; }
        .pg-controls { display: flex; align-items: center; gap: 12px; }
        .pg-controls button { width: 34px; height: 34px; border-radius: 8px; border: 1px solid rgba(128,128,128,0.3); background: transparent; cursor: pointer; }
        .pg-controls button:disabled { opacity: 0.4; cursor: default; }
        .pg-cur { font-weight: 600; font-size: 14px; }
      `}</style>
    </div>
  );
};

export default Pagination;
