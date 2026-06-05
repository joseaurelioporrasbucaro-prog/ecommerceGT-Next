"use client";
import React from 'react';
import { useTranslations } from 'next-intl';

/**
 * Fase 16 — sección "Cómo funciona KIOSQUI".
 *
 * 4 pasos del flujo principal del usuario que llega a buscar propiedad:
 * Buscar → Contactar → Visitar → Cerrar. Diseño en grid de 4 con
 * conectores entre pasos para que se lea como un proceso.
 *
 * Es contenido estático — no consume backend.
 */
const STEPS: Array<{ icon: string; titleKey: string; textKey: string }> = [
  {
    icon: 'fa-search-location',
    titleKey: 'how.steps.search.title',
    textKey: 'how.steps.search.text',
  },
  {
    icon: 'fa-comments',
    titleKey: 'how.steps.contact.title',
    textKey: 'how.steps.contact.text',
  },
  {
    icon: 'fa-key',
    titleKey: 'how.steps.visit.title',
    textKey: 'how.steps.visit.text',
  },
  {
    icon: 'fa-handshake',
    titleKey: 'how.steps.close.title',
    textKey: 'how.steps.close.text',
  },
];

const HowItWorks: React.FC = () => {
  const t = useTranslations('home');
  return (
    <section className="kh-section hiw-section">
      <div className="container">
        <div className="kh-section-head">
          <h2>{t('how.title')}</h2>
          <p>{t('how.subtitle')}</p>
        </div>

        <div className="hiw-grid">
          {STEPS.map((s, idx) => (
            <div key={s.titleKey} className="hiw-step">
              <div className="hiw-step-num">{idx + 1}</div>
              <div className="hiw-step-icon">
                <i className={`fas ${s.icon}`} />
              </div>
              <h4>{t(s.titleKey)}</h4>
              <p>{t(s.textKey)}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .hiw-section { padding: 70px 0; }
        .hiw-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 24px;
          margin-top: 12px;
        }
        .hiw-step {
          position: relative;
          padding: 30px 22px;
          background: var(--clr-bg-white, #fff);
          border: 1px solid var(--clr-common-border, #e0e2e5);
          border-radius: 14px;
          text-align: center;
        }
        /* Número en navy (light) / lavanda (dark, vía --clr-theme-1), texto
           cream en light y navy oscuro en dark para contraste sobre lavanda. */
        .hiw-step-num {
          position: absolute;
          top: -14px;
          left: 50%;
          transform: translateX(-50%);
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: var(--clr-theme-1, #2785ff);
          color: var(--cream);
          font-family: var(--font-display);
          font-size: 13px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid var(--clr-bg-bodylight, #eff1f5);
        }
        :global([data-theme='dark']) .hiw-step-num { color: var(--navy-900); }
        /* Íconos con fondo alternado lavanda / verde / neutro / lavanda. */
        .hiw-step-icon {
          width: 64px;
          height: 64px;
          margin: 8px auto 18px;
          border-radius: 14px;
          background: var(--lav-200);
          color: var(--lav-700);
          font-size: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hiw-step:nth-child(2) .hiw-step-icon {
          background: var(--green-100);
          color: var(--green-700);
        }
        .hiw-step:nth-child(3) .hiw-step-icon {
          background: rgba(212, 200, 182, 0.35);
          color: var(--navy-700);
        }
        .hiw-step:nth-child(4) .hiw-step-icon {
          background: var(--lav-200);
          color: var(--lav-700);
        }
        :global([data-theme='dark']) .hiw-step-icon {
          background: rgba(181, 172, 239, 0.18);
          color: var(--lav-400);
        }
        :global([data-theme='dark']) .hiw-step:nth-child(2) .hiw-step-icon {
          background: rgba(155, 198, 74, 0.18);
          color: var(--green-400);
        }
        :global([data-theme='dark']) .hiw-step:nth-child(3) .hiw-step-icon {
          background: rgba(248, 244, 238, 0.06);
          color: var(--cream);
        }
        :global([data-theme='dark']) .hiw-step:nth-child(4) .hiw-step-icon {
          background: rgba(181, 172, 239, 0.18);
          color: var(--lav-400);
        }
        .hiw-step h4 {
          margin: 0 0 8px;
          font-family: var(--font-display);
          font-size: 18px;
          font-weight: 700;
          color: var(--clr-common-heading);
        }
        .hiw-step p {
          margin: 0;
          font-size: 13.5px;
          line-height: 1.55;
          color: var(--clr-common-body-text);
        }
      `}</style>
    </section>
  );
};

export default HowItWorks;
