"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import profile4 from "../../../public/assets/img/profile/profile4.jpg";
import Image from "next/image";
import SidebarMenuSection from "../sidebar/SidebarMenuSection";
import CategoryFilter from "../sidebar/CategoryFilter";
import AccountRightSidebar from "../sidebar/AccountRightSidebar";

const ACCOUNT_PATHS = ["/favorites", "/my-publications"];

const HeaderTwo = () => {
  const [isActive13, setActive13] = useState(false);
  const handleToggle13 = () => {
    setActive13(!isActive13);
  };

  const { setTheme } = useTheme();
  const pathname = usePathname();
  const isAccountPage =
    ACCOUNT_PATHS.includes(pathname ?? "") ||
    (pathname?.startsWith("/messages") ?? false);

  const [menuOpen1, setMenuOpen1] = useState(false);
  const [menuOpen2, setMenuOpen2] = useState(false);
  
  return (
    <>
      <header className="header2">
        <div className="header-main header-main2">
          <div className="container c-container-1">
            <div className="header-main2-content">
              <div className="row align-items-center">
                <div className="col-xl-7 col-lg-7 col-md-7 col-7">
                  <div className="header-main-left">
                    <div className="menu-bar mr-20 d-xxl-none">
                      <a
                        className="side-toggle"
                        href="#!"
                        onClick={() => {
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
                    <form
                      action="#"
                      className="filter-search-input header-search d-none d-md-inline-block"
                    >
                      <input type="text" placeholder="Search keyword" />
                      <button>
                        <i className="fal fa-search"></i>
                      </button>
                    </form>
                  </div>
                </div>
                <div className="col-xl-5 col-lg-5 col-md-5 col-5">
                  <div className="header-main-right">
                    <div className="header-btn ml-20 d-none d-xxl-inline-block">
                      <Link className="fill-btn" href="/wallet-connect">
                        Connect Wallet
                      </Link>
                    </div>
                    <div className="profile-item profile-item-header ml-20 d-md-inline-block pos-rel">
                      <div
                        className={`profile-img pos-rel ${
                          isActive13 ? "show-element" : ""
                        }`}
                        onClick={handleToggle13}
                      >
                        <div className="profile-action">
                          <ul>
                            <li>
                              <Link href="/creator-profile-info-personal">
                                <i className="fal fa-user"></i>Profile
                              </Link>
                            </li>
                            <li>
                              <Link href="/login">
                                <i className="fal fa-sign-out"></i>Logout
                              </Link>
                            </li>
                          </ul>
                        </div>
                        <Image src={profile4} alt="profile-img" />
                        <div className="profile-verification verified">
                          <i className="fas fa-check"></i>
                        </div>
                      </div>
                    </div>
                    <div
                      className="product-filter-btn ml-20 d-xxl-none"
                      onClick={() => {
                        setMenuOpen2(!menuOpen2);
                      }}
                    >
                      <i className="flaticon-filter"></i>
                    </div>
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

      {isAccountPage ? (
        <AccountRightSidebar menuOpen2={menuOpen2} setMenuOpen2={setMenuOpen2} />
      ) : (
        <CategoryFilter menuOpen2={menuOpen2} setMenuOpen2={setMenuOpen2} />
      )}
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
