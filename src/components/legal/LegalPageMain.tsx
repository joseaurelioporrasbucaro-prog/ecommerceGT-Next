"use client";
import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import Breadcrumbs from '@/utils/Breadcrumbs';

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
 * Fase 12 — wrapper común para las tres páginas legales (Términos,
 * Privacidad, Política de Contenido). Garantiza estética consistente:
 * breadcrumb + fecha de actualización + TOC sticky (≥lg) + cuerpo con
 * tipografía legal + nota de contacto al final.
 *
 * Diseño intencionalmente sobrio: lectura fácil, sin componentes
 * elaborados — el contenido es la sustancia.
 */
const LegalPageMain: React.FC<LegalPageMainProps> = ({
  pageTitle,
  breadcrumbSubTitle,
  lastUpdated,
  intro,
  sections,
}) => {
  const t = useTranslations('legal.common');

  return (
    <>
      <Breadcrumbs breadcrumbTitle={pageTitle} breadcrumbSubTitle={breadcrumbSubTitle} />

      <section className="legal-area pt-80 pb-100">
        <div className="container">
          <div className="row">
            {/* TOC sticky a la izquierda en desktop. En móvil se oculta
                porque el listado completo de secciones quedaría apretado;
                el usuario puede hacer scroll natural. */}
            <div className="col-lg-3 d-none d-lg-block">
              <nav className="legal-toc" aria-label={t('tocAria')}>
                <h6>{t('tocTitle')}</h6>
                <ol>
                  {sections.map((s) => (
                    <li key={s.id}>
                      <a href={`#${s.id}`}>{s.title}</a>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>

            <div className="col-lg-9">
              <div className="legal-content">
                <p className="legal-last-updated">
                  {t('lastUpdated')} <strong>{lastUpdated}</strong>
                </p>
                <div className="legal-intro">{intro}</div>

                {sections.map((s) => (
                  <section key={s.id} id={s.id} className="legal-section">
                    <h3>{s.title}</h3>
                    <div className="legal-section-body">{s.body}</div>
                  </section>
                ))}

                <div className="legal-footer-note">
                  {t.rich('contactFooter', {
                    support: (chunks) => <Link href="/soporte/tickets">{chunks}</Link>,
                    email: (chunks) => <a href="mailto:soporte@kiosqui.gt">{chunks}</a>,
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .legal-area {
            background-color: var(--clr-bg-bodylight);
          }
          .legal-toc {
            position: sticky;
            top: 110px;
            padding: 18px 20px;
            background: var(--clr-bg-white, #fff);
            border-radius: 10px;
            border: 1px solid var(--clr-common-border, #e0e2e5);
          }
          .legal-toc h6 {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            opacity: 0.7;
            margin: 0 0 12px;
            font-weight: 700;
            color: var(--clr-common-heading);
          }
          .legal-toc ol {
            padding-left: 18px;
            margin: 0;
            font-size: 13.5px;
            line-height: 1.7;
          }
          .legal-toc li {
            margin-bottom: 4px;
          }
          .legal-toc a {
            color: var(--clr-common-heading);
            text-decoration: none;
            transition: color 0.15s;
          }
          .legal-toc a:hover {
            color: var(--clr-theme-1, #2785ff);
          }
          .legal-content {
            background: var(--clr-bg-white, #fff);
            padding: 36px 40px;
            border-radius: 10px;
            border: 1px solid var(--clr-common-border, #e0e2e5);
            font-size: 15px;
            line-height: 1.75;
            color: var(--clr-common-body-text);
          }
          .legal-last-updated {
            font-size: 13px;
            opacity: 0.75;
            margin-bottom: 24px;
            padding-bottom: 14px;
            border-bottom: 1px solid var(--clr-common-border, #e0e2e5);
          }
          .legal-intro :global(p) {
            font-size: 16px;
            margin-bottom: 14px;
          }
          .legal-section {
            margin-top: 36px;
            scroll-margin-top: 100px;
          }
          .legal-section h3 {
            font-size: 20px;
            margin-bottom: 14px;
            color: var(--clr-common-heading);
            font-weight: 700;
          }
          .legal-section-body :global(h4) {
            font-size: 16px;
            margin: 22px 0 10px;
            color: var(--clr-common-heading);
            font-weight: 700;
          }
          .legal-section-body :global(p) {
            margin-bottom: 14px;
          }
          .legal-section-body :global(ul),
          .legal-section-body :global(ol) {
            padding-left: 22px;
            margin: 10px 0 14px;
          }
          .legal-section-body :global(li) {
            margin-bottom: 6px;
          }
          .legal-section-body :global(code) {
            background: rgba(128, 128, 128, 0.14);
            padding: 1px 6px;
            border-radius: 4px;
            font-size: 13.5px;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
          }
          .legal-section-body :global(strong) {
            color: var(--clr-common-heading);
          }
          .legal-section-body :global(a) {
            color: var(--clr-theme-1, #2785ff);
            font-weight: 600;
          }
          .legal-footer-note {
            margin-top: 44px;
            padding-top: 22px;
            border-top: 1px solid var(--clr-common-border, #e0e2e5);
            font-size: 14px;
            opacity: 0.9;
          }
          .legal-footer-note :global(a) {
            color: var(--clr-theme-1, #2785ff);
            font-weight: 600;
          }
          @media (max-width: 991px) {
            .legal-content {
              padding: 24px 22px;
            }
          }
        `}</style>
      </section>
    </>
  );
};

export default LegalPageMain;
