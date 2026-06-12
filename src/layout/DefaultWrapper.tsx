//@refresh
"use client";
import React, { useEffect } from "react";
if (typeof window !== "undefined") {
  require("bootstrap/dist/js/bootstrap");
}
import { usePathname } from "next/navigation";
import Footer from "./footer/Footer";
import FooterTwo from "../layout/footer/footerTwo";
import HeaderTwo from "./header/HeaderTwo";
import { ThemeProvider } from "next-themes";
import BacktoTop from "@/utils/BacktoTop";
import useLoading from "@/hooks/useLoading";
import { animationCreate } from "@/utils/utils";
import Preloader from "@/utils/Preloader";
import { stripLocalePath } from "@/utils/stripLocalePath";

interface WrapperProps {
  children: React.ReactNode;
}

const AUTH_PAGES = ['/login', '/register', '/forgot', '/verify'];

/**
 * Rutas que usan el navbar horizontal arriba (HeaderOne) en lugar del
 * sidebar izquierdo fijo (HeaderTwo). Útil para pantallas que necesitan
 * el ancho completo, como /messages.
 */
const TOP_NAV_PAGES = ['/messages'];

/**
 * Rutas inmersivas que toman 100vw/100vh sin headers, sidebars ni footers.
 * El visor 3D (Fase 15.x) lo necesita porque los modelos requieren todo
 * el ancho para ser interactivos (rotate/zoom) y los sidebars tapaban los
 * controles. Patrón: `/publications/<id>/viewer`.
 */
const FULLSCREEN_PATTERNS = [
  /^\/publications\/[^/]+\/viewer/,
];

const Wrapper: React.FC<WrapperProps> = ({ children }) => {
  const pathName = stripLocalePath(usePathname());

  const isAuthPage = AUTH_PAGES.some((p) => pathName?.startsWith(p));
  const usesTopNav = TOP_NAV_PAGES.some((p) => pathName?.startsWith(p));
  const isFullscreenPage = FULLSCREEN_PATTERNS.some((re) => re.test(pathName ?? ''));
  const showRightSidebar = !isAuthPage && !isFullscreenPage;

  const isLoading = useLoading(true, 100);

  useEffect(() => {
    setTimeout(() => {
      animationCreate();
    }, 2000);
  }, []);

  if (isLoading) {
    return <Preloader />;
  }

  // Auth pages: sin header/footer/sidebars — flujo limpio.
  if (isAuthPage) {
    return (
      <ThemeProvider defaultTheme="dark">
        {children}
      </ThemeProvider>
    );
  }

  // Fullscreen pages (visor 3D): toman todo el viewport, sin chrome.
  // Comparten el mismo tratamiento que auth pages — solo ThemeProvider.
  if (isFullscreenPage) {
    return (
      <ThemeProvider defaultTheme="dark">
        {children}
      </ThemeProvider>
    );
  }

  // Handoff #4 §1.3 — un solo header en toda la app: /messages usa HeaderTwo
  // en variante `compact` (sin buscador, logo 32px) y sin footer (el chat
  // ocupa el viewport completo). HeaderOne y el riel derecho quedan retirados.
  if (usesTopNav) {
    return (
      <ThemeProvider defaultTheme="dark">
        <BacktoTop />
        <div className="app-layout no-footer">
          <HeaderTwo compact />
          {children}
        </div>

        <style jsx global>{`
          .app-layout.no-footer {
            overflow: hidden;
          }
        `}</style>
      </ThemeProvider>
    );
  }

  // Resto de la app: HeaderTwo (con sidebars laterales) + Footer.
  return (
    <ThemeProvider defaultTheme="dark">
      <BacktoTop />
      <div
        className={`app-layout has-left-sidebar ${showRightSidebar ? 'has-right-sidebar' : ''}`}
      >
        <HeaderTwo />
        {children}
        {pathName === '/home-three' ? <FooterTwo /> : <Footer />}
      </div>

      {/* Handoff #3 — se eliminó toda la compensación de rieles fijos
          (padding-top del header fixed, swap experimental 2026-05-28 y el
          calc(100% - 583px) del template): el header nuevo es sticky (en
          flujo) y los sidebars son drawers overlay en todos los anchos, así
          que el contenido vuelve a ancho completo sin reservas laterales. */}
    </ThemeProvider>
  );
};

export default Wrapper;
