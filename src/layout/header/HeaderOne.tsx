"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import logoOne from "../../../public/assets/img/logo/oction-logo.png"
import logoTwo from "../../../public/assets/img/logo/oction-logo-bw.png"
import logoThree from "../../../public/assets/img/profile/profile4.jpg"
import useSticky from '@/hooks/useSticky';
import useGlobalContext from '@/hooks/use-context';
import Image from 'next/image';
import HeaderOneMenu from './component/HeaderOneMenu';
import MobileMenu from '@/utils/MobileMenu';
import { ApiFetch } from '@/utils/Api';
import { useRouter } from 'next/navigation';

// --- NUEVAS IMPORTACIONES PARA LA MAGIA ---
import { useAuth } from '@/utils/AuthContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const HeaderOne = ({ HeaderStatic }:any) => {
 const {toggleSideMenu,sideMenuOpen} = useGlobalContext()
 const [isActive11, setActive11] = useState(false);

 // --- HOOKS DE AUTENTICACIÓN E IDIOMAS ---
 const { user, setUser } = useAuth(); // Ahora traemos setUser
 const { i18n, t } = useTranslation();
 const router = useRouter(); // Instanciamos el router de Next.js

 const handleToggle11 = () => {
    setActive11(!isActive11);
 };

 // Función para cambiar el idioma
 const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
 };

 const handleLogout = async (e: any) => {
    e.preventDefault();
    toast.info(t('auth.login.singout') + "...");
    
    // 1. Le avisamos al backend que destruya la cookie segura
    try {
        await ApiFetch.get("/logout"); 
    } catch (error) {
        // Ignoramos si el backend no tiene esta ruta configurada aún
    }

    // 2. Destruimos al usuario en el frontend para que la foto desaparezca INMEDIATAMENTE
    setUser(null);

    // 3. Redirección rápida usando Next.js (sin recargar toda la página)
    router.push('/login');
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
                           <div className="main-menu main-menu1 d-none d-lg-block">
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

                           {/* --- LÓGICA DE SESIÓN CONDICIONAL --- */}
                           {!user ? (
                              // Si NO hay usuario: Mostramos botón de Login
                              <div className="header-btn ml-20 d-none d-xxl-inline-block">
                                 <Link className="fill-btn" href="/login">{t('auth.login.submit') || "Login"}</Link>
                              </div>
                           ) : (
                              // Si SÍ hay usuario: Mostramos el Dropdown con su foto real
                              <div className="profile-item profile-item-header ml-20 d-md-inline-block pos-rel">
                                 <div className={`profile-img pos-rel ${isActive11 ? "show-element" : ""}`} onClick={handleToggle11}>
                                    <div className="profile-action"> 
                                       <ul>
                                          <li><Link href="/creator-profile-info-personal"><i className="fal fa-user"></i>{t('auth.login.myProfile') || 'Profile'}</Link></li>
                                          <li><a href="#" onClick={handleLogout}><i className="fal fa-sign-out"></i>{t('auth.login.singout') || 'Logout'}</a></li>
                                       </ul>
                                    </div>
                                    <Image 
                                       src={user?.imagenu ? (user.imagenu.startsWith('http') ? user.imagenu : `http://localhost:4000${user.imagenu}`) : logoThree} 
                                       alt="profile-img" 
                                       width={50} height={50} 
                                       style={{ objectFit: 'cover', borderRadius: '50%' }}
                                    />
                                    <div className="profile-verification verified">
                                       <i className="fas fa-check"></i>
                                    </div>
                                 </div>
                              </div>
                           )}

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