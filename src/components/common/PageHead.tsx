"use client";
import React from 'react';

interface PageHeadProps {
  /** Overline lavanda en uppercase (ej. "Soporte"). */
  overline: string;
  title: string;
  sub?: string;
}

/**
 * Handoff #6 §2 — cabecera compartida de páginas de contenido
 * (/contact, /faq, /soporte, legales): overline lavanda + título display +
 * subtítulo muted centrados.
 */
const PageHead = ({ overline, title, sub }: PageHeadProps) => (
  <div className="kq-page-head">
    <span className="kq-page-overline">{overline}</span>
    <h1 className="kq-page-title">{title}</h1>
    {sub && <p className="kq-page-sub">{sub}</p>}

    <style jsx>{`
      .kq-page-head {
        text-align: center;
        padding: 52px 20px 40px;
      }
      .kq-page-overline {
        display: block;
        font-family: var(--font-display);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--accent-hover, #8a7fe3);
        margin-bottom: 10px;
      }
      .kq-page-title {
        font-family: var(--font-display);
        font-weight: 700;
        font-size: clamp(28px, 4vw, 36px);
        letter-spacing: -0.02em;
        color: var(--fg-strong, #22252a);
        margin: 0 0 10px;
      }
      .kq-page-sub {
        font-size: 15px;
        line-height: 1.55;
        color: var(--fg-muted, #5c616a);
        max-width: 520px;
        margin: 0 auto;
      }
    `}</style>
  </div>
);

export default PageHead;
