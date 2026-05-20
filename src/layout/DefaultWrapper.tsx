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

const Wrapper: React.FC<WrapperProps> = ({ children }) => {
  const pathName = usePathname();

  const isAuthPage = AUTH_PAGES.some((p) => pathName?.startsWith(p));
  const usesTopNav = TOP_NAV_PAGES.some((p) => pathName?.startsWith(p));
  const showRightSidebar = !isAuthPage;

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
          /* Mismo override de HeaderOne en /messages — el menú horizontal con
             el bell se parte en 2 filas entre 1600-1851 si no apretamos. */
          @media (min-width: 1600px) and (max-width: 1851px) {
            .header1 .filter-search-input.header-search {
              width: 220px !important;
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

      <style jsx global>{`
        /* El template original abre los sidebars fijos a partir de 1400px,
           pero ahí el contenido queda con solo 817px (1400 - 583) — muy
           apretado. Bumpeamos el umbral a 1600px: entre 1400 y 1599 los
           sidebars quedan off-canvas (hamburguesa), arriba de 1600 se ven
           siempre. Cubre los tres lugares donde el template lo controla. */
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
          /* El template oculta el toggle del hamburguesa con d-xxl-none
             (xxl = 1400+), pero a 1400-1599 ya no hay sidebar fija, así
             que necesitamos el toggle visible de nuevo. */
          .menu-bar.d-xxl-none,
          .product-filter-btn.d-xxl-none {
            display: inline-block !important;
          }
        }
        @media (min-width: 1600px) {
          .app-layout.has-left-sidebar {
            padding-left: 275px;
          }
          .app-layout.has-right-sidebar {
            padding-right: 275px;
          }
          /* c-container-1 del template restaba 583px asumiendo que su padre
             es el viewport (sin padding). Pero ya estamos aplicando padding-left
             y padding-right al app-layout para pushear el contenido entre los
             sidebars — c-container-1 termina restando los 583px DOS veces y
             queda apretadísimo. Lo neutralizamos a 100% del padre padded. */
          .app-layout.has-left-sidebar .c-container-1,
          .app-layout.has-right-sidebar .c-container-1 {
            width: 100% !important;
          }
        }

        /* Entre 1600 y 1851 los sidebars ya ocupan 550px y el template define
           anchos fijos de búsqueda (600px en HeaderTwo, 330px en HeaderOne)
           + un margin-right enorme del menú (95px) que sobran espacio. El
           resultado: en HeaderTwo se ocultan/cortan los botones de la derecha
           (lang/bell/theme) y en HeaderOne el menú se parte en 2 filas. Acá
           apretamos los hardcoded del template a valores responsive. */
        @media (min-width: 1600px) and (max-width: 1851px) {
          .header-main2-content .filter-search-input.header-search {
            width: 380px !important;
          }
          .header-main2-content .filter-search-input.header-search input {
            width: 100% !important;
          }
          .header1 .filter-search-input.header-search {
            width: 220px !important;
          }
          .main-menu1 {
            margin-right: 30px !important;
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
