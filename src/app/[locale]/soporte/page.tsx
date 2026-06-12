"use client";
import React from "react";
import Link from "next/link";
import Wrapper from "@/layout/DefaultWrapper";
import PageHead from "@/components/common/PageHead";

/**
 * Handoff #6 §2 — portal de soporte (/soporte no tenía página índice; solo
 * existían las subrutas de tickets/verificaciones). Topic cards que aterrizan
 * en las categorías reales del FAQ (?cat=) + banda para abrir ticket (flujo
 * real de Fase 8.5). El diseño original habla de "guías" — no existen como
 * contenido; se usa el FAQ como base de conocimiento (reportado en feedback).
 */
const TOPICS = [
  {
    icon: 'fas fa-user-circle',
    title: 'Mi cuenta',
    desc: 'Registro, verificación con DPI, contraseña y datos personales.',
    href: '/faq?cat=cuenta',
  },
  {
    icon: 'fas fa-building',
    title: 'Publicaciones',
    desc: 'Crear, editar y destacar tus propiedades en el marketplace.',
    href: '/faq?cat=publicar',
  },
  {
    icon: 'fas fa-cube',
    title: 'Modelo 3D',
    desc: 'Subí y compartí el modelo 3D de tu inmueble.',
    href: '/faq?cat=publicar',
  },
  {
    icon: 'fas fa-gem',
    title: 'Planes y pagos',
    desc: 'Suscripciones, límites de publicación y facturación.',
    href: '/pricing-plan',
  },
  {
    icon: 'fas fa-shield-alt',
    title: 'Seguridad',
    desc: 'Verificación de vendedores, denuncias y buenas prácticas.',
    href: '/faq?cat=verificacion',
  },
  {
    icon: 'fas fa-bullhorn',
    title: 'Pauta',
    desc: 'Promocioná tus publicaciones y gestioná tu inversión.',
    href: '/faq?cat=pauta',
  },
];

const SoportePage = () => {
  return (
    <Wrapper>
      <main>
        <section className="kq-support pb-100">
          <PageHead
            overline="Soporte"
            title="¿En qué te ayudamos?"
            sub="Explorá los temas más consultados o abrí un ticket y el equipo te responde."
          />

          <div className="container">
            <div className="kq-support-grid">
              {TOPICS.map((topic) => (
                <Link key={topic.title} href={topic.href} className="kq-topic-card">
                  <span className="kq-topic-icon">
                    <i className={topic.icon} />
                  </span>
                  <span className="kq-topic-title">{topic.title}</span>
                  <span className="kq-topic-desc">{topic.desc}</span>
                  <span className="kq-topic-link">
                    Ver respuestas <i className="fas fa-arrow-right" />
                  </span>
                </Link>
              ))}
            </div>

            {/* Banda de ticket — flujo real (Fase 8.5). */}
            <div className="kq-ticket-band">
              <span className="kq-ticket-icon">
                <i className="fas fa-life-ring" />
              </span>
              <div className="kq-ticket-text">
                <strong>¿No encontraste lo que buscabas?</strong>
                <span>Abrí un ticket y el equipo de soporte te responde en menos de 24 horas hábiles.</span>
              </div>
              <Link href="/soporte/tickets" className="fill-btn kq-ticket-btn">
                Abrir ticket
              </Link>
            </div>
          </div>

          <style jsx>{`
            .kq-support-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 18px;
              max-width: 980px;
              margin: 0 auto 26px;
            }
            .kq-support-grid :global(.kq-topic-card) {
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              gap: 10px;
              padding: 24px;
              background: var(--surface, #fff);
              border: 1px solid var(--border, #e6ddcf);
              border-radius: 20px;
              text-decoration: none;
              transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
            }
            .kq-support-grid :global(.kq-topic-card:hover) {
              transform: translateY(-2px);
              box-shadow: var(--shadow-md, 0 8px 24px rgba(30, 45, 74, 0.1));
              border-color: var(--lav-500, #b5acef);
            }
            .kq-support-grid :global(.kq-topic-icon) {
              width: 46px;
              height: 46px;
              border-radius: 14px;
              background: var(--accent-soft, #ebe8fb);
              color: var(--lav-700, #6d62cf);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 18px;
            }
            .kq-support-grid :global(.kq-topic-title) {
              font-family: var(--font-display);
              font-weight: 700;
              font-size: 17px;
              color: var(--fg-strong, #22252a);
            }
            .kq-support-grid :global(.kq-topic-desc) {
              font-size: 13.5px;
              line-height: 1.55;
              color: var(--fg-muted, #5c616a);
            }
            .kq-support-grid :global(.kq-topic-link) {
              display: inline-flex;
              align-items: center;
              gap: 7px;
              font-size: 13px;
              font-weight: 700;
              color: var(--accent-hover, #8a7fe3);
              margin-top: auto;
              transition: gap 0.15s;
            }
            .kq-support-grid :global(.kq-topic-card:hover .kq-topic-link) {
              gap: 11px;
            }
            .kq-support-grid :global(.kq-topic-link i) {
              font-size: 11px;
            }
            .kq-ticket-band {
              display: flex;
              align-items: center;
              gap: 18px;
              max-width: 980px;
              margin: 0 auto;
              padding: 22px 26px;
              border-radius: 20px;
              background: var(--green-100, #eef6df);
              border: 1px solid var(--green-300, #c8e297);
              flex-wrap: wrap;
            }
            :global([data-theme='dark']) .kq-ticket-band {
              background: rgba(155, 198, 74, 0.12);
              border-color: rgba(155, 198, 74, 0.25);
            }
            .kq-ticket-icon {
              width: 46px;
              height: 46px;
              border-radius: 999px;
              background: var(--green-500, #9bc64a);
              color: var(--navy-900, #161f33);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 18px;
              flex-shrink: 0;
            }
            .kq-ticket-text {
              flex: 1;
              min-width: 220px;
              display: flex;
              flex-direction: column;
              gap: 2px;
            }
            .kq-ticket-text strong {
              font-size: 15px;
              color: var(--fg-strong, #22252a);
            }
            .kq-ticket-text span {
              font-size: 13.5px;
              color: var(--fg-muted, #5c616a);
            }
            .kq-ticket-band :global(.kq-ticket-btn) {
              height: 46px;
              font-size: 14px;
              background: var(--navy-800, #1e2d4a);
              color: var(--cream, #f8f4ee);
            }
            .kq-ticket-band :global(.kq-ticket-btn:hover) {
              background: var(--navy-700, #283a5c);
              color: var(--cream, #f8f4ee);
            }
            @media (max-width: 900px) {
              .kq-support-grid {
                grid-template-columns: 1fr 1fr;
              }
            }
            @media (max-width: 600px) {
              .kq-support-grid {
                grid-template-columns: 1fr;
              }
            }
          `}</style>
        </section>
      </main>
    </Wrapper>
  );
};

export default SoportePage;
