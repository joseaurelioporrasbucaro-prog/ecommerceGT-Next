"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export interface LegalSection {
  id: string;
  title: string;
  body: React.ReactNode;
}

interface LegalPageMainProps {
  pageTitle: string;
  breadcrumbSubTitle: string;
  /** Texto plano tipo "2026-06-02" — se muestra como "Última actualización". */
  lastUpdated: string;
  /** Bloque introductorio (1-2 párrafos). Usar <p> directamente. */
  intro: React.ReactNode;
  /** Lista ordenada de secciones. El TOC izquierdo se genera de aquí. */
  sections: LegalSection[];
}

/**
 * Fase 12 + Handoff #6 §3 — plantilla tipográfica única de legales
 * (Términos, Privacidad, Política de Contenido): grid 230px/1fr max 980,
 * TOC sticky con scrollspy (activo lavanda + borde izquierdo), prosa con
 * overline "Legal" + H1 display + fecha con borde inferior.
 */
const LegalPageMain: React.FC<LegalPageMainProps> = ({
  pageTitle,
  breadcrumbSubTitle,
  lastUpdated,
  intro,
  sections,
}) => {
  const t = useTranslations('legal.common');
  void breadcrumbSubTitle; // la plantilla nueva no usa breadcrumb; se conserva la prop por compatibilidad.
  const [activeId, setActiveId] = useState<string | null>(sections[0]?.id ?? null);

  // Scrollspy simple: resalta en el TOC la sección visible.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-90px 0px -65% 0px' },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  return (
    <section className="kq-legal pb-100">
      <div className="container">
        <div className="kq-legal-grid">
          {/* TOC sticky (≥lg). */}
          <nav className="kq-legal-toc d-none d-lg-block" aria-label={t('tocAria')}>
            <span className="kq-legal-toc-title">{t('tocTitle')}</span>
            <ol>
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className={activeId === s.id ? 'is-active' : ''}>
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="kq-legal-prose">
            <span className="kq-legal-overline">Legal</span>
            <h1 className="kq-legal-title">{pageTitle}</h1>
            <p className="kq-legal-updated">
              {t('lastUpdated')} <strong>{lastUpdated}</strong>
            </p>
            <div className="kq-legal-intro">{intro}</div>

            {sections.map((s) => (
              <section key={s.id} id={s.id} className="kq-legal-section">
                <h2>{s.title}</h2>
                <div className="kq-legal-body">{s.body}</div>
              </section>
            ))}

            <div className="kq-legal-foot">
              {t.rich('contactFooter', {
                support: (chunks) => <Link href="/soporte/tickets">{chunks}</Link>,
                email: (chunks) => <a href="mailto:soporte@kiosqui.gt">{chunks}</a>,
              })}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .kq-legal {
          padding-top: 48px;
        }
        .kq-legal-grid {
          display: grid;
          grid-template-columns: 230px 1fr;
          gap: 44px;
          max-width: 980px;
          margin: 0 auto;
        }
        .kq-legal-toc {
          position: sticky;
          top: 108px;
          align-self: start;
        }
        .kq-legal-toc-title {
          display: block;
          font-family: var(--font-display);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--fg-subtle, #9aa0a8);
          margin-bottom: 12px;
        }
        .kq-legal-toc ol {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .kq-legal-toc a {
          display: block;
          padding: 7px 12px;
          font-size: 14px;
          color: var(--fg-muted, #5c616a);
          text-decoration: none;
          border-left: 2.5px solid transparent;
          border-radius: 0 10px 10px 0;
          transition: all 0.15s;
        }
        .kq-legal-toc a:hover {
          color: var(--lav-700, #6d62cf);
        }
        .kq-legal-toc a.is-active {
          color: var(--lav-700, #6d62cf);
          font-weight: 700;
          background: var(--accent-soft, #ebe8fb);
          border-left-color: var(--lav-500, #b5acef);
        }
        :global([data-theme='dark']) .kq-legal-toc a.is-active {
          color: var(--lav-300, #ddd8f8);
        }
        .kq-legal-overline {
          display: block;
          font-family: var(--font-display);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--accent-hover, #8a7fe3);
          margin-bottom: 8px;
        }
        .kq-legal-title {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: clamp(26px, 4vw, 34px);
          letter-spacing: -0.02em;
          color: var(--fg-strong, #22252a);
          margin: 0 0 10px;
        }
        .kq-legal-updated {
          font-size: 13px;
          color: var(--fg-subtle, #9aa0a8);
          margin: 0 0 26px;
          padding-bottom: 18px;
          border-bottom: 1px solid var(--border, #e6ddcf);
        }
        .kq-legal-prose {
          font-size: 16px;
          line-height: 1.7;
          color: var(--fg-muted, #5c616a);
          min-width: 0;
        }
        .kq-legal-intro :global(p) {
          margin-bottom: 14px;
        }
        .kq-legal-section {
          margin-top: 36px;
          scroll-margin-top: 100px;
        }
        .kq-legal-section h2 {
          font-family: var(--font-display);
          font-size: 21px;
          font-weight: 700;
          margin-bottom: 14px;
          color: var(--fg-strong, #22252a);
        }
        .kq-legal-body :global(h4) {
          font-family: var(--font-display);
          font-size: 16px;
          margin: 22px 0 10px;
          color: var(--fg-strong, #22252a);
          font-weight: 700;
        }
        .kq-legal-body :global(p) {
          margin-bottom: 14px;
        }
        .kq-legal-body :global(ul),
        .kq-legal-body :global(ol) {
          padding-left: 22px;
          margin: 10px 0 14px;
        }
        .kq-legal-body :global(li) {
          margin-bottom: 6px;
        }
        .kq-legal-body :global(code) {
          background: var(--surface-sunk, #f1ebe1);
          padding: 1px 6px;
          border-radius: 6px;
          font-size: 13.5px;
          font-family: var(--font-mono, ui-monospace, monospace);
        }
        .kq-legal-body :global(strong) {
          color: var(--fg-strong, #22252a);
        }
        .kq-legal-body :global(a) {
          color: var(--accent-hover, #8a7fe3);
          font-weight: 600;
        }
        /* Callouts informativos (el copy puede traer .legal-callout). */
        .kq-legal-body :global(.legal-callout) {
          display: flex;
          gap: 11px;
          padding: 13px 15px;
          background: var(--accent-soft, #ebe8fb);
          border-radius: 14px;
          font-size: 14px;
          line-height: 1.55;
          margin: 14px 0;
        }
        .kq-legal-foot {
          margin-top: 44px;
          padding-top: 22px;
          border-top: 1px solid var(--border, #e6ddcf);
          font-size: 14px;
        }
        .kq-legal-foot :global(a) {
          color: var(--accent-hover, #8a7fe3);
          font-weight: 600;
        }
        @media (max-width: 991px) {
          .kq-legal-grid {
            grid-template-columns: 1fr;
            gap: 0;
          }
        }
      `}</style>
    </section>
  );
};

export default LegalPageMain;
