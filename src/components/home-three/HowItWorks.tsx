"use client";
import React from 'react';

/**
 * Fase 16 — sección "Cómo funciona KIOSQUI".
 *
 * 4 pasos del flujo principal del usuario que llega a buscar propiedad:
 * Buscar → Contactar → Visitar → Cerrar. Diseño en grid de 4 con
 * conectores entre pasos para que se lea como un proceso.
 *
 * Es contenido estático — no consume backend.
 */
const STEPS: Array<{ icon: string; title: string; text: string }> = [
  {
    icon: 'fa-search-location',
    title: 'Buscás',
    text: 'Filtrá por tipo, zona, presupuesto. Cada anuncio muestra fotos reales y, si está disponible, recorrido 3D.',
  },
  {
    icon: 'fa-comments',
    title: 'Contactás',
    text: 'Enviá mensajes directamente al propietario verificado. Sin intermediarios escondidos ni comisiones.',
  },
  {
    icon: 'fa-key',
    title: 'Visitás',
    text: 'Coordiná visita por chat o teléfono. Llevá tus dudas y conocé la propiedad de primera mano.',
  },
  {
    icon: 'fa-handshake',
    title: 'Cerrás',
    text: 'Cerrá la negociación directamente con el propietario y firmá con tu asesor de confianza.',
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section className="kh-section hiw-section">
      <div className="container">
        <div className="kh-section-head">
          <h2>Cómo funciona KIOSQUI</h2>
          <p>
            Del primer clic a las llaves en tu mano — un proceso simple y
            transparente.
          </p>
        </div>

        <div className="hiw-grid">
          {STEPS.map((s, idx) => (
            <div key={s.title} className="hiw-step">
              <div className="hiw-step-num">{idx + 1}</div>
              <div className="hiw-step-icon">
                <i className={`fas ${s.icon}`} />
              </div>
              <h4>{s.title}</h4>
              <p>{s.text}</p>
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
        .hiw-step-num {
          position: absolute;
          top: -14px;
          left: 50%;
          transform: translateX(-50%);
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--clr-theme-1, #2785ff);
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid var(--clr-bg-bodylight, #eff1f5);
        }
        .hiw-step-icon {
          width: 64px;
          height: 64px;
          margin: 8px auto 18px;
          border-radius: 14px;
          background: rgba(39, 133, 255, 0.1);
          color: var(--clr-theme-1, #2785ff);
          font-size: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hiw-step h4 {
          margin: 0 0 8px;
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
