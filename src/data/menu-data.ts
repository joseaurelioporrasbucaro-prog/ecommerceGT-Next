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
// Notas Fase 22 (Aurelio):
//   - "Directorio" (id=3) reemplaza al label "Vendedores" porque coexiste con
//     "Ranking" (id=4) y ambos llevan a listados de vendedores con criterios
//     distintos. "Directorio" = score compuesto (`getTopSellers`), "Ranking"
//     = AVG(rating) estricto (`getSellerRanking`). Detalles en
//     config/connPostgresDB.js línea 2228 del backend.
//   - "Pauta" (/pauta) se saca del menú público — solo es útil para usuarios
//     logueados, no para visitantes. El acceso para logueados sigue
//     disponible desde /pricing-plan, /my-publications y el FAB.
export const desktopMenu = [
  { id: 1, hasDropdown: false, active: true, title: "Inicio", link: "/" },
  { id: 2, hasDropdown: false, title: "Propiedades", link: "/publications" },
  { id: 3, hasDropdown: false, title: "Directorio", link: "/creators" },
  { id: 4, hasDropdown: false, title: "Ranking", link: "/art-ranking" },
  { id: 6, hasDropdown: false, title: "Planes", link: "/pricing-plan" },
  { id: 7, hasDropdown: false, title: "Contacto", link: "/contact" },
];

// Forma usada por MobileMenu y SidebarMenuSection (campo `label`/`href`).
// Los `id` matchean entre las dos listas para que las claves de traducción
// (TRANSLATION_KEY_BY_ID en cada consumidor) sirvan en ambas.
//
// IMPORTANTE: se conserva el hueco del id=5 (Pauta) para que las claves de
// traducción `nav.ads` puedan reactivarse pegando la línea nuevamente — sin
// renumerar todo. Misma razón para mantener `nav.sellers` aunque ahora se
// muestre como "Directorio" (en algún momento futuro podríamos volver).
export const mobileMenu: MobileMenuItemType[] = [
  { id: 1, label: "Inicio", subMenu: false, href: "/" },
  { id: 2, label: "Propiedades", subMenu: false, href: "/publications" },
  { id: 3, label: "Directorio", subMenu: false, href: "/creators" },
  { id: 4, label: "Ranking", subMenu: false, href: "/art-ranking" },
  { id: 6, label: "Planes", subMenu: false, href: "/pricing-plan" },
  { id: 7, label: "Contacto", subMenu: false, href: "/contact" },
];

// Alias retrocompatible — cualquier import legacy de `MenuData` sigue funcionando.
export const MenuData = desktopMenu;
