"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import logoOne from "../../public/assets/img/logo/oction-logo-bw.png";
import useGlobalContext from "@/hooks/use-context";
import { menuItems } from "@/data/menu-data";


const MobileMenu = () => {
  const { sideMenuOpen, toggleSideMenu, setSideMenuOpen } = useGlobalContext();
  const [activeMenu, setActiveMenu] = useState(false);
  const [menuId, setmenuId] = useState(0);
  const openMobileMenu = (menuLabel: number) => {
    setmenuId(menuLabel);
    setActiveMenu(!activeMenu)
  };

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
                { menuItems.map((menuItem, index) => (
                  <li
                    key={index}
                    className={menuId === menuItem.id && menuItem.subMenu === true && activeMenu  ? "has-droupdown active" : menuItem.subMenu === false ? "" : "has-droupdown" }>
                    <Link
                      href={menuItem.subMenu ? "" : menuItem.href }
                      onClick={() => {
                        if (menuItem.subMenu) {
                          openMobileMenu(menuItem.id);
                        }else{
                            setSideMenuOpen(!sideMenuOpen)
                        }
                      }}                      
                      >
                      {menuItem.label}
                    </Link>
                    <ul
                      className={
                        menuId === menuItem.id
                          ? "sub-menu active"
                          : "sub-menu"
                      }
                    >
                      {menuItem.subMenuItems?.length &&
                        menuItem.subMenuItems.map((subMenuItem, subIndex) => (
                          <li key={subIndex}>
                            <Link onClick={toggleSideMenu} href={subMenuItem.href}>
                              {subMenuItem.label}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </li>
                ))}

                   
              </ul>
            </div>
            <div className="offset-profile-action d-md-none">
              <div className="offset-widget mb-40">
                
              </div>
            </div>
            <div className="offset-widget offset_searchbar mb-30">
              <form action="#" className="filter-search-input">
                <input type="text" placeholder="Search keyword" />
                <button>
                  <i className="fal fa-search"></i>
                </button>
              </form>
            </div>
            <div className="offset-widget mb-40">
              <Link className="fill-btn" href="/upload-category">
                Upload Items
              </Link>
            </div>
            <div className="offset-widget mb-40 d-none d-lg-block">
              <div className="info-widget">
                <h4 className="offset-title mb-20 d-none">Contact Info</h4>
                <p className="mb-30">
                  Non-fungible tokens and their smart contracts allow for
                  detailed attributes to be added, like the identity of the
                  owner, rich metadata, or secure file links.
                </p>
                <Link className="fill-btn" href="/contact">
                  Contact Us
                </Link>
              </div>
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
