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
  const pathName = usePathname();

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
          /* Mismo bump de breakpoint que en la rama principal — ver comentario abajo. */
          @media (min-width: 1400px) and (max-width: 1599px) {
            .sidebar-category-filter-wrapper {
              right: -300px !important;
            }
            .sidebar-category-filter-wrapper.open {
              right: 0 !important;
            }
            .c-container-1 {
              width: 100% !important;
            }
          }
          @media (min-width: 1600px) {
            .app-layout.has-right-sidebar {
              padding-right: 275px;
            }
            /* Mismo override que la rama principal — ver comentario allá. */
            .app-layout.has-right-sidebar .c-container-1 {
              width: 100% !important;
            }
          }
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

      {/* Replica el mecanismo del template para los sidebars fijos. El template
          corre el contenido con `.c-container-1 { width: calc(100% - 583px) }`
          centrado, pero eso asume que TODO el contenido usa esa clase — acá la
          mayoría de páginas usan `.container` normal. Por eso padeamos el
          .app-layout 275px por lado (= ancho del sidebar) y neutralizamos el
          calc del template a 100%: si no, el header restaría el ancho de los
          sidebars DOS veces (padding + calc) y col-xl-5 quedaría tapado. Sin
          hacks de proporción de columnas — el 58/42 del template alcanza. */}
      <style jsx global>{`
        /* El header de estas páginas (.header-main2) es position:fixed;top:0,
           por lo que sale del flujo y NO reserva alto. Sin esto, el primer
           bloque de cada página (el breadcrumb .page-title-area) queda DEBAJO
           del header y se ve tapado. Reservamos el alto real del header
           (padding 20+20 + input 50 = 90px) en el contenido en-flujo del
           layout; el header, al ser fixed, se ancla al viewport y no se mueve.
           En xs el header es un poco más bajo (sin buscador), basta con menos. */
        .app-layout.has-left-sidebar {
          padding-top: 90px;
        }
        @media (max-width: 767px) {
          .app-layout.has-left-sidebar {
            padding-top: 80px;
          }
        }
        /* 1400-1599: sidebars off-canvas (hamburguesa) para no apretar el
           contenido; desde 1600 se ven fijos siempre. */
        @media (min-width: 1400px) and (max-width: 1599px) {
          .menu2-side-bar-wrapper {
            left: -300px !important;
          }
          .menu2-side-bar-wrapper.open {
            left: 0 !important;
          }
          .sidebar-category-filter-wrapper {
            right: -300px !important;
          }
          .sidebar-category-filter-wrapper.open {
            right: 0 !important;
          }
          .c-container-1 {
            width: 100% !important;
          }
          .menu-bar.d-xxl-none,
          .product-filter-btn.d-xxl-none {
            display: inline-block !important;
          }
        }
        @media (min-width: 1600px) {
          /* Mecanismo EXACTO del template: en vez de padear el .app-layout
             (que dejaba el borde del contenido pegado al sidebar y el ícono
             de tema se metía debajo), encogemos el contenedor a
             calc(100% - 583px) CENTRADO — 583 = los dos sidebars de 275px +
             ~16px de aire a cada lado. El template lo hace solo con
             .c-container-1; acá lo extendemos a .container porque la mayoría
             de páginas lo usan, así todo (header, cards, footer) queda
             librando los sidebars con el mismo aire que la plantilla. */
          .app-layout.has-left-sidebar .container,
          .app-layout.has-right-sidebar .container {
            width: calc(100% - 583px) !important;
            max-width: none !important;
            margin-left: auto !important;
            margin-right: auto !important;
          }
        }
      `}</style>
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
