"use client";
import React from 'react';
import Link from 'next/link';
import logoOne from "../../../public/assets/img/logo/oction-logo.png"
import logoTwo from "../../../public/assets/img/logo/oction-logo-bw.png"
import useSticky from '@/hooks/useSticky';
import useGlobalContext from '@/hooks/use-context';
import Image from 'next/image';
import HeaderOneMenu from './component/HeaderOneMenu';
import MobileMenu from '@/utils/MobileMenu';
import NotificationBell from '@/components/notifications/NotificationBell';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';

const HeaderOne = ({ HeaderStatic }:any) => {
 const {toggleSideMenu,sideMenuOpen} = useGlobalContext()
 const { setTheme } = useTheme();
 const { i18n, t } = useTranslation();

 const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
 };

   // sticky nav
   const { sticky } = useSticky();
   return (
      <>
         <header className={`header1 ${HeaderStatic ? HeaderStatic : ''}`}>
            <div id="header-sticky" className={sticky ? "sticky header-main header-main1" : "header-main header-main1"}>
               <div className="container header-container">
                  <div className="row align-items-center">
                     <div className="col-xl-2 col-lg-2 col-md-4 col-4">
                        <div className="header-main-left">
                           <div  className="header-logo header1-logo">
                              <Link className="logo-bb" href="/"><Image src={logoOne} alt="logo-img" /></Link>
                              <Link className="logo-bw" href="/"><Image src={logoTwo} alt="logo-img" /></Link>
                           </div>
                        </div>
                     </div>
                     <div className="col-xl-10 col-lg-10 col-md-8 col-8">
                        <div className="header-main-right">
                           {/* d-xl-block (no d-lg-block) para que el menú solo
                                aparezca desde 1200px. Abajo de eso se muestra el
                                hamburguesa (d-xl-none) y NO se solapan. */}
                           <div className="main-menu main-menu1 d-none d-xl-block">
                              <nav id="mobile-menu">
                                 <HeaderOneMenu/>
                              </nav>
                           </div>
                           <form action="#" className="filter-search-input header-search d-none d-xl-inline-block">
                              {/* El buscador ahora usa tu diccionario */}
                              <input type="text" placeholder={t('serchproducts') || "Buscar..."} />
                              <button><i className="fal fa-search"></i></button>
                           </form>

                           {/* --- SELECTOR DE IDIOMAS (ES | EN) --- */}
                           <div className="header-lang ml-20 d-none d-md-inline-block" style={{ fontWeight: '600', cursor: 'pointer', fontSize: '15px' }}>
                             <span 
                                onClick={() => changeLanguage('es')} 
                                style={{ color: i18n.language === 'es' ? '#5a5af2' : 'inherit', transition: '0.3s' }}
                             >
                                ES
                             </span>
                             <span className="mx-2" style={{ color: '#ccc' }}>|</span>
                             <span 
                                onClick={() => changeLanguage('en')}
                                style={{ color: i18n.language === 'en' ? '#5a5af2' : 'inherit', transition: '0.3s' }}
                             >
                                EN
                             </span>
                           </div>

                           {/* --- BELL DE NOTIFICACIONES (Fase 6.3) --- */}
                           <div className="ml-20 d-none d-md-inline-block">
                              <NotificationBell />
                           </div>

                           {/* --- BOTÓN DE TEMA (dark / light) — inline gracias a
                                la clase modificadora home3-mode-switch que
                                anula el position: fixed del wrapper base --- */}
                           <div className="mode-switch-wrapper my_switcher setting-option home3-mode-switch ml-20">
                              <input type="checkbox" className="checkbox" id="chk-header1" />
                              <label className="label" htmlFor="chk-header1">
                                 <i
                                    className="fas fa-moon setColor dark theme__switcher-btn"
                                    onClick={() => setTheme('dark')}
                                 />
                                 <i
                                    className="fas fa-sun setColor light theme__switcher-btn"
                                    onClick={() => setTheme('light')}
                                 />
                                 <span className="ball" />
                              </label>
                           </div>

                           <div className="menu-bar d-xl-none ml-20">
                              <Link className="side-toggle" href="" onClick={toggleSideMenu}>
                                 <div className="bar-icon">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                 </div>
                              </Link>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </header>

         <MobileMenu/>
         <div onClick={toggleSideMenu} className={sideMenuOpen ? "offcanvas-overlay overlay-open" : "offcanvas-overlay"}></div>
      </>
   );
};

export default HeaderOne;