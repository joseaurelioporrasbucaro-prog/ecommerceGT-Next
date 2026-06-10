import { MobileMenuItemType } from "@/interFace/interFace";

// ============================================================================
// Fase 22 — Menús de navegación (Aurelio 2026-06-05).
//
// KIOSQUI tiene 3 puntos de entrada al menú principal:
//
//   - `desktopMenu`  → HeaderOneMenu (≥1200px, navbar superior en /messages).
//   - `mobileMenu`   → MobileMenu (hamburguesa derecha de HeaderOne) y
//                      SidebarMenuSection (sidebar derecho de HeaderTwo en
//                      el resto de la app).
//
// Antes los 3 leían `MenuData` / `menuItems` con basura del template (Home
// Style 1/2/3, Creator Profile, Wallet Connect, Activity, Forum, Pages con
// FAQ/Login/Terms/404 sueltos, etc.). Se eliminaron los exports legacy
// `menuItems` y `MenuData` (este último queda como alias retrocompatible
// por si quedaron imports sueltos).
//
// Los 7 items son consistentes entre desktop y mobile, así que tienen el
// mismo set:  Inicio · Propiedades · Vendedores · Ranking · Pauta · Planes
// · Contacto.
// ============================================================================

// Forma usada por HeaderOneMenu (campo `title`/`link`).
//
// Notas (Aurelio):
//   - Fase 22: "Pauta" salió del menú porque solo sirve para logueados
//     (acceso desde /pricing-plan, /my-publications y el FAB).
//   - Fase 24: "Directorio" (id=3) y "Ranking" (id=4) se unificaron en un
//     solo ítem "Ranking" → /ranking con tabs internas. Las URLs viejas
//     (/creators y /art-ranking) hacen redirect al nuevo path conservando
//     SEO de los links indexados. Ver src/components/ranking/.
export const desktopMenu = [
  { id: 1, hasDropdown: false, active: true, title: "Inicio", link: "/" },
  { id: 2, hasDropdown: false, title: "Propiedades", link: "/publications" },
  { id: 4, hasDropdown: false, title: "Ranking", link: "/ranking" },
  { id: 6, hasDropdown: false, title: "Planes", link: "/pricing-plan" },
  { id: 7, hasDropdown: false, title: "Contacto", link: "/contact" },
];

// Forma usada por MobileMenu y SidebarMenuSection (campo `label`/`href`).
// Los `id` matchean entre las dos listas para que las claves de traducción
// (TRANSLATION_KEY_BY_ID en cada consumidor) sirvan en ambas.
//
// IMPORTANTE: se conservan los huecos de ids 3 (sellers/Directorio) y 5 (ads
// /Pauta) para que las claves de traducción puedan reactivarse pegando la
// línea correspondiente — sin renumerar todo.
export const mobileMenu: MobileMenuItemType[] = [
  { id: 1, label: "Inicio", subMenu: false, href: "/" },
  { id: 2, label: "Propiedades", subMenu: false, href: "/publications" },
  { id: 4, label: "Ranking", subMenu: false, href: "/ranking" },
  { id: 6, label: "Planes", subMenu: false, href: "/pricing-plan" },
  { id: 7, label: "Contacto", subMenu: false, href: "/contact" },
];

// Alias retrocompatible — cualquier import legacy de `MenuData` sigue funcionando.
export const MenuData = desktopMenu;
