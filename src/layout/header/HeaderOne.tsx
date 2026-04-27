"use client"
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

const HeaderOne = ({ HeaderStatic }:any) => {
 const {toggleSideMenu,sideMenuOpen} = useGlobalContext()
 const [menuOpen, setMenuOpen] = useState(false)
 const [isActive11, setActive11] = useState(false);
 const handleToggle11 = () => {
    setActive11(!isActive11);
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
                              <input type="text" placeholder="Search keyword" />
                              <button><i className="fal fa-search"></i></button>
                           </form>
                           <div className="header-btn ml-20 d-none d-xxl-inline-block">
                              <Link className="fill-btn" href="/wallet-connect">Connect Wallet</Link>
                           </div>
                           <div className="profile-item profile-item-header ml-20 d-md-inline-block pos-rel">
                              <div className={`profile-img pos-rel ${isActive11 ? "show-element" : ""}`} onClick={handleToggle11}>
                                 <div className="profile-action"> 
                                    <ul>
                                       <li><Link href="/creator-profile-info-personal"><i className="fal fa-user"></i>Profile</Link></li>
                                       <li><Link href="/login"><i className="fal fa-sign-out"></i>Logout</Link></li>
                                    </ul>
                                 </div>
                                 <Image src={logoThree} alt="profile-img" />
                                 <div className="profile-verification verified">
                                    <i className="fas fa-check"></i>
                                 </div>
                              </div>
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