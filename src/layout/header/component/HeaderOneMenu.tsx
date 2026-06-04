"use client";

import { MenuData } from "@/data/menu-data";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import React from "react";

const HeaderOneMenu = () => {
  const t = useTranslations("common.nav");
  const translatedTitles: Record<number, string> = {
    1: t("home"),
    2: t("publications"),
  };

  return (
    <>
      <ul>
        {MenuData.map((menuItem) => (
          <li
            key={menuItem.id}
            className={menuItem.hasDropdown ? "menu-item-has-children" : ""}
          >
            <Link href={menuItem.link}>
              {translatedTitles[menuItem.id] ?? menuItem.title}
            </Link>
            {menuItem.submenus && (
              <ul className="sub-menu">
                {menuItem.submenus.map((submenuItem) => (
                  <li key={submenuItem.title}>
                    <Link href={submenuItem.link}>{submenuItem.title}</Link>
                  </li>
                ))}
              </ul>
            )}
            {menuItem.megaMenu === true && (
              <ul className="sub-menu">
                {menuItem.mega_menus.map((submenuItem) => (
                  <li key={submenuItem.title} className={submenuItem.hasDropdown ? "menu-item-has-children" : ""}>
                    <Link href={submenuItem.link}>{submenuItem.title}</Link>
                    {submenuItem.submenus && (
                      <ul className="sub-menu">
                        {submenuItem.submenus.map((submenuItem) => (
                          <li key={submenuItem.title}>
                            <Link href={submenuItem.link}>
                              {submenuItem.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </>
  );
};

export default HeaderOneMenu;
