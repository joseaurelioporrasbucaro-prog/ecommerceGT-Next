import React from "react";
import Link from "next/link";
import KiosquiLogo from "@/components/common/KiosquiLogo";

// Handoff #4 §1.6 — footer Kiosqui definitivo (referencia: landing.html
// .footer). Fondo --ink-900 SIEMPRE (no cambia con el tema), logo cream
// transparente, grid 1.6fr 1fr 1fr 1fr (mobile 2 col → 1 col), links
// cream translúcido con hover cream, bottom bar con copyright +
// "Hecho en Guatemala 🇬🇹". Reemplaza el footer del template (Fase 22/24).
const Footer = () => {
  return (
    <footer className="kq-footer">
      <div className="container">
        <div className="kq-footer-grid">
          {/* Columna 1 — Marca */}
          <div>
            <div className="kq-footer-logo">
              <Link href="/">
                <KiosquiLogo height={40} variant="dark" />
              </Link>
            </div>
            <p className="kq-footer-tag">
              El marketplace inmobiliario de Guatemala. Casas, apartamentos y
              terrenos publicados directamente por propietarios verificados —
              sin intermediarios escondidos.
            </p>
            <ul className="kq-footer-social">
              <li>
                <Link href="https://facebook.com/kiosqui" aria-label="Facebook">
                  <i className="fab fa-facebook-f"></i>
                </Link>
              </li>
              <li>
                <Link href="https://instagram.com/kiosqui" aria-label="Instagram">
                  <i className="fab fa-instagram"></i>
                </Link>
              </li>
              <li>
                <Link href="https://twitter.com/kiosqui" aria-label="Twitter / X">
                  <i className="fab fa-twitter"></i>
                </Link>
              </li>
              <li>
                <Link href="https://wa.me/50200000000" aria-label="WhatsApp">
                  <i className="fab fa-whatsapp"></i>
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 2 — Explorar */}
          <div className="kq-footer-col">
            <h5>Explorar</h5>
            <Link href="/publications">Propiedades</Link>
            <Link href="/publications?propertie=1">Casas</Link>
            <Link href="/publications?propertie=2">Apartamentos</Link>
            <Link href="/publications?propertie=3">Terrenos</Link>
          </div>

          {/* Columna 3 — Kiosqui */}
          <div className="kq-footer-col">
            <h5>Kiosqui</h5>
            {/* Fase 24 — Vendedores destacados + Mejor calificados unificados
                en /ranking con tabs internas. */}
            <Link href="/ranking?tab=destacados">Vendedores destacados</Link>
            <Link href="/ranking?tab=calificados">Mejor calificados</Link>
            <Link href="/pricing-plan">Planes</Link>
            <Link href="/contact">Contacto</Link>
          </div>

          {/* Columna 4 — Soporte */}
          <div className="kq-footer-col">
            <h5>Soporte</h5>
            <Link href="/faq">Preguntas frecuentes</Link>
            <Link href="/soporte/tickets">Centro de ayuda</Link>
            <Link href="/terminos">Términos y Condiciones</Link>
            <Link href="/privacidad">Política de Privacidad</Link>
            <Link href="/contenido">Política de Contenido</Link>
          </div>
        </div>

        <div className="kq-footer-bottom">
          <span>© {new Date().getFullYear()} Kiosqui. Todos los derechos reservados.</span>
          <span>Hecho en Guatemala 🇬🇹</span>
        </div>
      </div>

      <style jsx>{`
        .kq-footer {
          background: var(--ink-900, #22252a);
          color: var(--cream, #f8f4ee);
          padding: 64px 0 0;
        }
        .kq-footer-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr 1fr 1fr;
          gap: 40px;
          margin-bottom: 44px;
        }
        .kq-footer-logo {
          margin-bottom: 16px;
        }
        .kq-footer-tag {
          font-size: 13.5px;
          line-height: 1.6;
          color: rgba(248, 244, 238, 0.65);
          max-width: 280px;
          margin: 0 0 18px;
        }
        .kq-footer-social {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          gap: 10px;
        }
        .kq-footer-social :global(a) {
          width: 36px;
          height: 36px;
          border-radius: 999px;
          border: 1px solid rgba(248, 244, 238, 0.16);
          color: rgba(248, 244, 238, 0.75);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          transition: all 0.15s;
        }
        .kq-footer-social :global(a:hover) {
          color: var(--navy-900, #161f33);
          background: var(--green-500, #9bc64a);
          border-color: var(--green-500, #9bc64a);
        }
        .kq-footer-col h5 {
          font-family: var(--font-display);
          font-size: 13px;
          font-weight: 700;
          color: var(--cream, #f8f4ee);
          margin: 0 0 16px;
        }
        .kq-footer-col :global(a) {
          display: block;
          font-size: 13.5px;
          color: rgba(248, 244, 238, 0.65);
          margin-bottom: 10px;
          text-decoration: none;
          transition: color 0.15s;
        }
        .kq-footer-col :global(a:hover) {
          color: var(--cream, #f8f4ee);
        }
        .kq-footer-bottom {
          border-top: 1px solid rgba(248, 244, 238, 0.14);
          padding: 18px 0;
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          font-size: 12px;
          color: rgba(248, 244, 238, 0.55);
        }
        @media (max-width: 900px) {
          .kq-footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 30px;
          }
        }
        @media (max-width: 600px) {
          .kq-footer-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
