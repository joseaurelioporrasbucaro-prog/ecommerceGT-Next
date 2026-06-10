"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import logoOne from "../../public/assets/img/logo/oction-logo-bw.png";
import useGlobalContext from "@/hooks/use-context";
// Fase 22 — Menú hamburguesa derecho limpio (Aurelio 2026-06-05).
// Antes leía `menuItems` (compartido con SidebarMenuSection y lleno de basura
// del template: Home Style 1/2/3, Wallet Connect, Activity, Forum, Pages con
// FAQ/Login/Terms/404). Para no afectar el sidebar izquierdo (que se queda
// intacto) creamos `mobileMenu` aparte. Como esta lista es plana, el render
// se simplificó: ya no hay submenús ni acordeones.
import { mobileMenu } from "@/data/menu-data";


const MobileMenu = () => {
  const { sideMenuOpen, toggleSideMenu } = useGlobalContext();

  return (
    <>
      <div className="fix">
        <div className={sideMenuOpen ? "side-info info-open" : "side-info"}>
          <div className="side-info-content">
            <div className="offset-widget offset-logo mb-40">
              <div className="row align-items-center">
                <div className="col-9">
                  <Link href="/">
                    <Image src={logoOne} alt="Logo" />
                  </Link>
                </div>
                <div className="col-3 text-end">
                  <button className="side-info-close" onClick={toggleSideMenu}>
                    <i className="fal fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
            <div className="mm-menu mm-menu-1 mb-60 d-lg-none">
              <ul>
                {mobileMenu.map((menuItem) => (
                  <li key={menuItem.id}>
                    <Link href={menuItem.href} onClick={toggleSideMenu}>
                      {menuItem.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            {/* CTA persistente — el FAB cubre el caso desktop/scroll;
                este link sirve cuando la hamburguesa está abierta y el FAB
                queda detrás del overlay. */}
            <div className="offset-widget mb-40">
              <Link
                className="fill-btn"
                href="/upload"
                onClick={toggleSideMenu}
              >
                Crear publicación
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="offcanvas-overlay"></div>
      <div className="offcanvas-overlay-white"></div>
    </>
  );
};

export default MobileMenu;
