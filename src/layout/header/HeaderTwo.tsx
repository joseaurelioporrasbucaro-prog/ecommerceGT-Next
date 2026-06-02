"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import SidebarMenuSection from "../sidebar/SidebarMenuSection";
import AccountRightSidebar from "../sidebar/AccountRightSidebar";
import PublicCategoriesSidebar from "../sidebar/PublicCategoriesSidebar";
import NotificationBell from "@/components/notifications/NotificationBell";
import HeaderSearch from "./component/HeaderSearch";
import { useAuth } from "@/utils/AuthContext";

const HeaderTwo = () => {
  const { setTheme } = useTheme();
  const { user } = useAuth();
  // useTranslation suscribe el componente a cambios de idioma — sin esto,
  // el botón ES/EN cambia el lenguaje pero no se re-renderiza el resaltado.
  const { i18n } = useTranslation();

  const [menuOpen1, setMenuOpen1] = useState(false);
  const [menuOpen2, setMenuOpen2] = useState(false);

  // El sidebar derecho ahora SIEMPRE existe.
  // - Si hay sesión → AccountRightSidebar (Mi cuenta).
  // - Si NO hay sesión → PublicCategoriesSidebar (categorías + CTA login/registro).
  const RightSidebar = user ? AccountRightSidebar : PublicCategoriesSidebar;

  // Cambio de idioma (ES / EN)
  const changeLanguage = (lng: 'es' | 'en') => {
    i18n.changeLanguage(lng);
  };

  return (
    <>
      <header className="header2">
        <div className="header-main header-main2">
          <div className="container c-container-1">
            <div className="header-main2-content">
              <div className="row align-items-center">
                <div className="col-xl-7 col-lg-7 col-md-7 col-7">
                  <div className="header-main-left">
                    {/* Swap (2026-06-02): el botón "Mi cuenta / Categorías"
                        vive ahora a la izquierda — abre el sidebar derecho
                        del template que tras el swap experimental quedó
                        del lado izquierdo. La hamburguesa de nav se mueve
                        al borde derecho (ver header-main-right). */}
                    <div
                      className="product-filter-btn mr-20 d-xxl-none"
                      onClick={() => {
                        setMenuOpen2(!menuOpen2);
                      }}
                      title={user ? 'Mi cuenta' : 'Categorías'}
                      style={{ cursor: 'pointer' }}
                    >
                      <i className={user ? 'fal fa-user-circle' : 'flaticon-filter'}></i>
                    </div>
                    <HeaderSearch className="d-none d-md-inline-block" />
                  </div>
                </div>
                <div className="col-xl-5 col-lg-5 col-md-5 col-5">
                  <div className="header-main-right">
                    {/* SELECTOR DE IDIOMAS (ES | EN) — reemplaza el avatar
                        dropdown. El avatar y el logout viven ahora en el
                        sidebar derecho de "Mi cuenta". */}
                    <div
                      className="header-lang ml-20 d-none d-md-inline-block"
                      style={{ fontWeight: 600, cursor: 'pointer', fontSize: '15px' }}
                    >
                      <span
                        onClick={() => changeLanguage('es')}
                        style={{
                          color: i18n.language === 'es' ? 'var(--tp-theme-1, #5a5af2)' : 'inherit',
                          transition: '0.3s',
                        }}
                      >
                        ES
                      </span>
                      <span className="mx-2" style={{ color: '#ccc' }}>|</span>
                      <span
                        onClick={() => changeLanguage('en')}
                        style={{
                          color: i18n.language === 'en' ? 'var(--tp-theme-1, #5a5af2)' : 'inherit',
                          transition: '0.3s',
                        }}
                      >
                        EN
                      </span>
                    </div>

                    {/* Si NO hay sesión, mostrar botón "Iniciar sesión"
                        en el header (en lugar del avatar logueado). */}
                    {!user && (
                      <div className="header-btn ml-20 d-md-inline-block">
                        <Link className="fill-btn" href="/login">
                          Iniciar sesión
                        </Link>
                      </div>
                    )}

                    {/* Bell de notificaciones (Fase 6.3) — solo para usuarios logueados */}
                    {user && (
                      <div className="ml-20">
                        <NotificationBell />
                      </div>
                    )}

                    <div className="mode-switch-wrapper my_switcher setting-option home3-mode-switch ml-25">
                      <input type="checkbox" className="checkbox" id="chk" />
                      <label className="label" htmlFor="chk">
                        <i
                          className="fas fa-moon setColor dark theme__switcher-btn"
                          onClick={() => setTheme("dark")}
                        ></i>
                        <i
                          className="fas fa-sun setColor light theme__switcher-btn"
                          onClick={() => setTheme("light")}
                        ></i>
                        <span className="ball"></span>
                      </label>
                    </div>

                    {/* Swap (2026-06-02): la hamburguesa de nav vive ahora
                        en el borde derecho del header — donde está el sidebar
                        de nav después del swap experimental. */}
                    <div className="menu-bar ml-20 d-xxl-none">
                      <a
                        className="side-toggle"
                        href="#!"
                        onClick={(e) => {
                          e.preventDefault();
                          setMenuOpen1(!menuOpen1);
                        }}
                      >
                        <div className="bar-icon left-bar-icon">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <SidebarMenuSection menuOpen1={menuOpen1} setMenuOpen1={setMenuOpen1} />
      <div
        onClick={() => setMenuOpen1(false)}
        className={
          menuOpen1 ? "offcanvas-overlay overlay-open" : "offcanvas-overlay"
        }
      ></div>

      {/* Sidebar derecho — SIEMPRE existe. Su contenido depende de la sesión. */}
      <RightSidebar menuOpen2={menuOpen2} setMenuOpen2={setMenuOpen2} />
      <div
        onClick={() => setMenuOpen2(false)}
        className={
          menuOpen2 ? "offcanvas-overlay overlay-open" : "offcanvas-overlay"
        }
      ></div>
    </>
  );
};

export default HeaderTwo;
