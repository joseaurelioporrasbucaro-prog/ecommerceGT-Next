"use client";

// Fase 22 — Menú desktop limpio (Aurelio 2026-06-05).
// Lee de `desktopMenu` en src/data/menu-data.ts (lista plana, sin submenús
// del template). Si querés volver a la versión legacy, importá `MenuData`
// que sigue exportándose como alias.
import { desktopMenu } from "@/data/menu-data";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import React from "react";

const HeaderOneMenu = () => {
  const t = useTranslations("common.nav");
  // Map id → clave de traducción cuando exista, para no hardcodear strings.
  // Los ids que no estén acá caen al `title` literal del menu-data.
  const translatedTitles: Record<number, string> = {
    1: t("home"),
    2: t("publications"),
  };

  return (
    <ul>
      {desktopMenu.map((menuItem) => (
        <li key={menuItem.id}>
          <Link href={menuItem.link}>
            {translatedTitles[menuItem.id] ?? menuItem.title}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default HeaderOneMenu;
