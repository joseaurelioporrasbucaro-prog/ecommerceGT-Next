import React from "react";
import Link from "next/link";
import logoOne from "../../../public/assets/img/logo/oction-logo.png";
import logoTwo from "../../../public/assets/img/logo/oction-logo-bw.png";
import Image from "next/image";

// Fase 22 — Footer KIOSQUI (Aurelio 2026-06-05).
//
// Reescribimos las 3 columnas del template ("Marketplace", "Explore Artworks",
// "Insight Community") porque tenían links a /forum, /explore-arts, /art-ranking
// con copy del template original (NFT marketplace). Ahora son:
//
//   1. Marca + redes sociales (sin copy generado por IT placeholder).
//   2. Legal (Términos, Privacidad, Contenido, Soporte, FAQ).
//   3. Explorar (Propiedades, Vendedores, Ranking, Pauta, Planes, Contacto).
//
// Copyright/Subscribe se quitan los placeholders inventados del template
// (teléfono ficticio, email subscribe sin endpoint detrás).
const Footer = () => {
  return (
    <footer className="footer1-bg">
      <section className="footer-area footer-area1 footer-area1-bg pt-100 pb-50">
        <div className="container">
          <div className="row">
            {/* Columna 1 — Marca */}
            <div className="col-lg-4 col-md-6 col-sm-6">
              <div className="footer-widget footer1-widget footer1-widget1 mb-40">
                <div className="footer-logo mb-30">
                  <Link className="logo-bb" href="/">
                    <Image src={logoOne} alt="KIOSQUI" />
                  </Link>
                  <Link className="logo-bw" href="/">
                    <Image src={logoTwo} alt="KIOSQUI" />
                  </Link>
                </div>
                <p className="mb-35">
                  El marketplace inmobiliario de Guatemala. Casas, apartamentos
                  y terrenos publicados directamente por propietarios verificados.
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
            <div className="col-lg-4 col-md-6 col-sm-6">
              <div className="footer-widget footer1-widget footer1-widget2 mb-40">
                <div className="footer-widget-title">
                  <h4>Legal y ayuda</h4>
                </div>
                <ul>
                  <li>
                    <Link href="/terminos">Términos y Condiciones</Link>
                  </li>
                  <li>
                    <Link href="/privacidad">Política de Privacidad</Link>
                  </li>
                  <li>
                    <Link href="/contenido">Política de Contenido</Link>
                  </li>
                  <li>
                    <Link href="/faq">Preguntas frecuentes</Link>
                  </li>
                  <li>
                    <Link href="/soporte/tickets">Soporte</Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Columna 3 — Explorar */}
            <div className="col-lg-4 col-md-6 col-sm-6">
              <div className="footer-widget footer1-widget footer1-widget3 mb-40">
                <div className="footer-widget-title">
                  <h4>Explorar</h4>
                </div>
                <ul>
                  <li>
                    <Link href="/publications">Propiedades</Link>
                  </li>
                  <li>
                    {/* Fase 24 — Directorio + Ranking unificados en /ranking
                        con tabs internas (?tab=directorio | ?tab=calificados).
                        Las URLs viejas hacen redirect. */}
                    <Link href="/ranking?tab=directorio">Directorio de vendedores</Link>
                  </li>
                  <li>
                    <Link href="/ranking?tab=calificados">Mejor calificados</Link>
                  </li>
                  <li>
                    <Link href="/pricing-plan">Planes</Link>
                  </li>
                  <li>
                    <Link href="/contact">Contacto</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="copyright-area copyright1-area">
        <div className="container">
          <div className="copyright1-inner">
            <div className="row align-items-center">
              <div className="col-lg-12 text-center">
                <div className="copyright-text copyright1-text">
                  © {new Date().getFullYear()} KIOSQUI. Todos los derechos
                  reservados.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
