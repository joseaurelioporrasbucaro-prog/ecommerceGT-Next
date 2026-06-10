import React from "react";
import Link from "next/link";
import logoOne from "../../../public/assets/img/logo/oction-logo.png";
import logoTwo from "../../../public/assets/img/logo/oction-logo-bw.png";
import Image from "next/image";

// Fase 22 — Footer KIOSQUI (Aurelio 2026-06-05).
//
// Reescribimos las 3 columnas del template ("Marketplace", "Explore Artworks",
// "Insight Community") porque tenían links a /forum, /explore-arts, /art-ranking
// con copy del template original (NFT marketplace).
//
// Fase 24 polish (2026-06-09): el template usaba pt-100 pb-50 que generaba
// ~150px de aire vertical innecesario con poco contenido. Compactamos a
// pt-60 pb-20 sin perder respiración entre secciones. Copyright bg unificado
// con el footer principal para que el color se extienda hasta el final del
// viewport (antes se notaba un escalón sutil entre footer1-bg y
// copyright1-area cuando el body bg era distinto).
//
// Estructura final del grid:
//   - Marca: col-lg-5 (logo + descripción + redes) — la columna más ancha
//     porque tiene texto largo y necesita aire.
//   - Legal: col-lg-3
//   - Explorar: col-lg-4
//   Total 12 ✓. Antes 4+4+4 dejaba aire vacío a la derecha de la marca.
const Footer = () => {
  return (
    <footer className="kiosqui-footer footer1-bg">
      <section className="footer-area footer-area1 footer-area1-bg pt-60 pb-20">
        <div className="container">
          <div className="row">
            {/* Columna 1 — Marca */}
            <div className="col-lg-5 col-md-6 col-sm-12">
              <div className="footer-widget footer1-widget footer1-widget1 mb-30">
                <div className="footer-logo mb-20">
                  <Link className="logo-bb" href="/">
                    <Image src={logoOne} alt="KIOSQUI" />
                  </Link>
                  <Link className="logo-bw" href="/">
                    <Image src={logoTwo} alt="KIOSQUI" />
                  </Link>
                </div>
                <p className="mb-25 kiosqui-footer-desc">
                  El marketplace inmobiliario de Guatemala. Casas, apartamentos
                  y terrenos publicados directamente por propietarios verificados —
                  sin intermediarios escondidos.
                </p>
                <div className="social__links footer__social">
                  <ul>
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
              </div>
            </div>

            {/* Columna 2 — Legal */}
            <div className="col-lg-3 col-md-6 col-sm-6">
              <div className="footer-widget footer1-widget footer1-widget2 mb-30">
                <div className="footer-widget-title">
                  <h4>Legal y ayuda</h4>
                </div>
                <ul>
                  <li><Link href="/terminos">Términos y Condiciones</Link></li>
                  <li><Link href="/privacidad">Política de Privacidad</Link></li>
                  <li><Link href="/contenido">Política de Contenido</Link></li>
                  <li><Link href="/faq">Preguntas frecuentes</Link></li>
                  <li><Link href="/soporte/tickets">Soporte</Link></li>
                </ul>
              </div>
            </div>

            {/* Columna 3 — Explorar */}
            <div className="col-lg-4 col-md-6 col-sm-6">
              <div className="footer-widget footer1-widget footer1-widget3 mb-30">
                <div className="footer-widget-title">
                  <h4>Explorar</h4>
                </div>
                <ul>
                  <li><Link href="/publications">Propiedades</Link></li>
                  <li>
                    {/* Fase 24 — Vendedores destacados + Mejor calificados
                        unificados en /ranking con tabs internas. */}
                    <Link href="/ranking?tab=destacados">Vendedores destacados</Link>
                  </li>
                  <li><Link href="/ranking?tab=calificados">Mejor calificados</Link></li>
                  <li><Link href="/pricing-plan">Planes</Link></li>
                  <li><Link href="/contact">Contacto</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Copyright: centrado y unificado al mismo bg del footer.
          Antes vivía en .copyright-area con clases que el template pintaba
          con un tono ligeramente distinto → quedaba un escalón visible.
          Acá lo dejamos como una banda final del mismo color. */}
      <div className="kiosqui-footer-copyright">
        <div className="container">
          <div className="text-center">
            <p className="mb-0">
              © {new Date().getFullYear()} KIOSQUI. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Fase 24 fix (2026-06-09): el approach previo con ::after { height:
           100vh } extendía el bg pero también el área scrolleable → la
           página tenía 100vh extra de scroll vacío. Lo quitamos. Si reaparece
           el "escalón de color" debajo del footer, la solución correcta es
           pintar el body con el mismo color del footer en globals.css en
           lugar de hackear el footer mismo. */
        /* Fase 24 polish (Aurelio reportó: "esta línea azul me disgusta"):
           el border-top en rgba(255,255,255,0.06) rendereaba con una
           tonalidad azulada por la mezcla con el navy del footer.
           Sustituido por margen superior puro — la separación visual entre
           las columnas y el copyright sigue siendo clara por el padding. */
        .kiosqui-footer-copyright {
          padding: 18px 0;
          margin-top: 8px;
          font-size: 13.5px;
          opacity: 0.78;
        }
        .kiosqui-footer-copyright p {
          margin: 0;
        }
        :global(.kiosqui-footer-desc) {
          line-height: 1.7;
          max-width: 480px;
          opacity: 0.88;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
