"use client";
import React from "react";
import Link from "next/link";
import ContactFormSection from "@/form/ContactFormSection";
import PageHead from "@/components/common/PageHead";

/**
 * Handoff #6 §2 — /contact: PageHead + grid 1.5fr/1fr (card de formulario +
 * columna de tiles). El form (Formik + Turnstile) no se toca — se re-skinea
 * por CSS. El mapa de Google del template (apuntaba a Nueva York) se retira.
 */
// Handoff #8 §4 — correos confirmados por Aurelio.
const CONTACT_TILES = [
  {
    icon: 'fas fa-envelope',
    title: 'Correo de soporte',
    body: 'soporte@kiosqui.com',
    href: 'mailto:soporte@kiosqui.com',
  },
  {
    icon: 'fas fa-headset',
    title: 'Centro de ayuda',
    body: 'Guías y preguntas frecuentes',
    href: '/faq',
  },
  {
    icon: 'fas fa-bullhorn',
    title: 'Ventas y pauta',
    body: 'ventas@kiosqui.com',
    href: 'mailto:ventas@kiosqui.com',
  },
];

const ContactMain = () => {
  return (
    <section className="kq-contact pb-90">
      <PageHead
        overline="Contacto"
        title="¿Hablamos?"
        sub="Consultas, reportes o propuestas — nuestro equipo te responde en menos de 24 horas hábiles."
      />

      <div className="container">
        <div className="kq-contact-grid">
          {/* Card de formulario (lógica intacta) */}
          <div className="kq-contact-card">
            <ContactFormSection />
          </div>

          {/* Columna lateral: tiles + card navy de vendedor */}
          <aside className="kq-contact-side">
            {CONTACT_TILES.map((tile) => (
              <Link key={tile.title} href={tile.href} className="kq-contact-tile">
                <span className="kq-contact-tile-icon">
                  <i className={tile.icon} />
                </span>
                <span className="kq-contact-tile-text">
                  <span className="kq-contact-tile-title">{tile.title}</span>
                  <span className="kq-contact-tile-body">{tile.body}</span>
                </span>
              </Link>
            ))}

            <div className="kq-contact-seller">
              <h4>¿Sos vendedor?</h4>
              <p>Publicá tu propiedad y llegá a miles de compradores verificados.</p>
              <Link href="/upload" className="fill-btn kq-contact-seller-btn">
                Crear publicación
              </Link>
            </div>
          </aside>
        </div>
      </div>

      <style jsx>{`
        .kq-contact-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 26px;
          max-width: 980px;
          margin: 0 auto;
        }
        .kq-contact-card {
          background: var(--surface, #fff);
          border: 1px solid var(--border, #e6ddcf);
          border-radius: 20px;
          box-shadow: var(--shadow-sm, 0 2px 6px rgba(30, 45, 74, 0.08));
          padding: 28px 30px;
        }
        .kq-contact-side {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .kq-contact-side :global(.kq-contact-tile) {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 18px;
          background: var(--surface, #fff);
          border: 1px solid var(--border, #e6ddcf);
          border-radius: 14px;
          text-decoration: none;
          transition: border-color 0.15s, transform 0.15s;
        }
        .kq-contact-side :global(.kq-contact-tile:hover) {
          border-color: var(--lav-500, #b5acef);
          transform: translateY(-1px);
        }
        .kq-contact-side :global(.kq-contact-tile-icon) {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          flex-shrink: 0;
          background: var(--accent-soft, #ebe8fb);
          color: var(--lav-700, #6d62cf);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }
        .kq-contact-side :global(.kq-contact-tile-text) {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .kq-contact-side :global(.kq-contact-tile-title) {
          font-size: 13px;
          font-weight: 700;
          color: var(--fg-strong, #22252a);
        }
        .kq-contact-side :global(.kq-contact-tile-body) {
          font-size: 13px;
          color: var(--fg-muted, #5c616a);
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .kq-contact-seller {
          margin-top: 6px;
          padding: 22px;
          border-radius: 20px;
          background:
            radial-gradient(360px 220px at 95% -20%, rgba(181, 172, 239, 0.3), transparent 60%),
            var(--navy-800, #1e2d4a);
          color: var(--cream, #f8f4ee);
        }
        .kq-contact-seller h4 {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 18px;
          color: var(--cream, #f8f4ee);
          margin: 0 0 8px;
        }
        .kq-contact-seller p {
          font-size: 13.5px;
          line-height: 1.55;
          color: rgba(248, 244, 238, 0.8);
          margin: 0 0 16px;
        }
        .kq-contact-seller :global(.kq-contact-seller-btn) {
          width: 100%;
          height: 44px;
          font-size: 14px;
        }

        /* ── Re-skin del formulario legacy (Formik intacto) ── */
        .kq-contact-card :global(.contact-content h4) {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 22px;
          color: var(--fg-strong, #22252a);
          margin: 0 0 6px;
        }
        .kq-contact-card :global(.contact-content > p),
        .kq-contact-card :global(.contact-content .mb-35) {
          font-size: 14px;
          color: var(--fg-muted, #5c616a);
          margin-bottom: 22px !important;
        }
        .kq-contact-card :global(.single-input-unit) {
          margin-bottom: 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .kq-contact-card :global(.single-input-unit label) {
          font-size: 13px;
          font-weight: 600;
          color: var(--fg-strong, #22252a);
          margin: 0;
        }
        .kq-contact-card :global(.single-input-unit input),
        .kq-contact-card :global(.single-input-unit textarea),
        .kq-contact-card :global(textarea) {
          font-family: var(--font-body);
          font-size: 15px;
          color: var(--fg-strong, #22252a);
          background: var(--bg-elevated, #fffdf9);
          border: 1.5px solid var(--border-strong, #d4c8b6);
          border-radius: 10px;
          padding: 11px 14px;
          width: 100%;
          height: auto;
          line-height: 1.5;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .kq-contact-card :global(.single-input-unit input:focus),
        .kq-contact-card :global(textarea:focus) {
          outline: none;
          border-color: var(--accent, #b5acef);
          box-shadow: var(--shadow-focus, 0 0 0 3px rgba(181, 172, 239, 0.55));
        }
        .kq-contact-card :global(.nice-select) {
          background: var(--bg-elevated, #fffdf9);
          border: 1.5px solid var(--border-strong, #d4c8b6);
          border-radius: 10px;
          height: 46px;
          line-height: 44px;
        }
        .kq-contact-card :global(.fill-btn) {
          height: 48px;
          font-size: 15px;
          gap: 8px;
        }

        @media (max-width: 860px) {
          .kq-contact-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
};

export default ContactMain;
