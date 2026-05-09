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

interface WrapperProps {
  children: React.ReactNode;
}

const AUTH_PAGES = ['/login', '/register', '/forgot', '/verify'];

const Wrapper: React.FC<WrapperProps> = ({ children }) => {
  const pathName = usePathname();

  const isAuthPage = AUTH_PAGES.some((p) => pathName?.startsWith(p));
  // Sidebar derecho ahora SIEMPRE se muestra (excepto en auth pages):
  // - Logueado: AccountRightSidebar (Mi cuenta)
  // - No logueado: PublicCategoriesSidebar (Categorías + CTA login/registro)
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

  // Auth pages: sin header/footer/sidebars — flujo limpio
  if (isAuthPage) {
    return (
      <ThemeProvider defaultTheme="dark">
        {children}
      </ThemeProvider>
    );
  }

  // Resto de la app: HeaderTwo (con sidebars laterales) + FooterTwo
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

      {/* Padding global para que el contenido respete el espacio de los sidebars
          fijos (.menu2-side-bar-wrapper a la izquierda y
          .sidebar-category-filter-wrapper a la derecha). Los sidebars usan
          position: fixed con left: 0 / right: 0 cuando hay viewport ≥1400px;
          este padding evita que el contenido quede tapado debajo. */}
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

export default Wrapper;
