//@refresh
"use client";
import React, { useEffect, useState } from "react";
if (typeof window !== "undefined") {
  require("bootstrap/dist/js/bootstrap");
}
import { usePathname } from "next/navigation";
import Footer from "./footer/Footer";
import FooterTwo from "../layout/footer/footerTwo";
import HeaderOne from "./header/HeaderOne";
import HeaderTwo from "./header/HeaderTwo";
import AccountRightSidebar from "./sidebar/AccountRightSidebar";
import PublicCategoriesSidebar from "./sidebar/PublicCategoriesSidebar";
import { ThemeProvider } from "next-themes";
import BacktoTop from "@/utils/BacktoTop";
import useLoading from "@/hooks/useLoading";
import { animationCreate } from "@/utils/utils";
import Preloader from "@/utils/Preloader";
import { useAuth } from "@/utils/AuthContext";
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

  // Rutas con navbar arriba (ej. /messages): HeaderOne + sidebar derecho,
  // sin footer (la pantalla del chat ocupa todo el viewport, sin scroll).
  // El sidebar izquierdo se omite para aprovechar el ancho completo.
  if (usesTopNav) {
    return (
      <ThemeProvider defaultTheme="dark">
        <BacktoTop />
        <div className={`app-layout no-footer ${showRightSidebar ? 'has-right-sidebar' : ''}`}>
          <HeaderOne HeaderStatic="" />
          {children}
          <RightSidebarSlot />
        </div>

        <style jsx global>{`
          .app-layout.no-footer {
            overflow: hidden;
          }
          /* Handoff #3: ya no hay rieles fijos — los sidebars son drawers
             overlay en todos los anchos (ver _header.scss), así que no se
             reserva espacio lateral. En /messages el drawer de cuenta queda
             sin disparador (HeaderOne no tiene avatar): TODO(design). */
          /* HeaderOne en /messages — el menú horizontal de 4 ítems + búsqueda
             + idioma/bell/tema se parte en 2 filas si la búsqueda crece antes
             de que haya ancho. A 1600px entra el padding-right:275 (sidebar) y
             el área cae a ~1325px; mantenemos la búsqueda angosta (180px) hasta
             1699 y recién a 1700+ —donde ya sobra espacio— la ensanchamos. */
          @media (min-width: 1200px) and (max-width: 1699px) {
            .header1 .filter-search-input.header-search {
              width: 180px !important;
              max-width: 180px !important;
            }
            .main-menu1 {
              margin-right: 20px !important;
            }
          }
          @media (min-width: 1700px) and (max-width: 1851px) {
            .header1 .filter-search-input.header-search {
              width: 220px !important;
              max-width: 220px !important;
            }
            .main-menu1 {
              margin-right: 30px !important;
            }
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

/**
 * Renderiza el sidebar derecho cuando se usa HeaderOne (que no lo incluye).
 * Local state porque HeaderOne no tiene un toggle para él — en pantallas
 * ≥1400px se ve siempre; abajo de eso queda oculto (acceptable porque
 * la pantalla de mensajes prioriza el chat en móvil).
 */
const RightSidebarSlot: React.FC = () => {
  const { user } = useAuth();
  const [menuOpen2, setMenuOpen2] = useState(false);
  const SidebarComponent = user ? AccountRightSidebar : PublicCategoriesSidebar;
  return <SidebarComponent menuOpen2={menuOpen2} setMenuOpen2={setMenuOpen2} />;
};

export default Wrapper;
