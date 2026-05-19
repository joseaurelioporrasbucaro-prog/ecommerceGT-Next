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
          @media (min-width: 1400px) {
            .app-layout.has-right-sidebar {
              padding-right: 275px;
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
        @media (min-width: 1400px) {
          .app-layout.has-left-sidebar {
            padding-left: 275px;
          }
          .app-layout.has-right-sidebar {
            padding-right: 275px;
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
