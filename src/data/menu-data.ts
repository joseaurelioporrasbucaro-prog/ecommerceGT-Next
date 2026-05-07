import { MobileMenuItemType } from "@/interFace/interFace";

export const MenuData = [
  {
    id: 1,
    hasDropdown: true,
    active: true,
    title: "Home",
    link: "/",
    submenus: [
      { title: "Home Style 1", link: "/" },
      { title: "Home Style 2", link: "/home-two" },
      { title: "Home Style 3", link: "/home-three" },
    ],
  },

  {
    id: 2,
    hasDropdown: false,
    title: "Propiedades",
    link: "/publications",
    pluseInco: false,
  },
  {
    id: 3,
    hasDropdown: false,
    title: "Creators",
    link: "/creators",
  },

  {
    id: 4,
    title: "Pages",
    hasDropdown: true,
    megaMenu: true,
    link: "",
    pages: true,
    mega_menus: [
      {
        id: 5,
        title: "Creator",
        link: "/creator-profile",
        hasDropdown: true,
        submenus: [
          { id: 6, title: "Creator Profile", link: "/creator-profile" },
          {
            id: 7,
            title: "Creator Personal Info",
            link: "/creator-profile-info-personal",
          },
        ],
      },
      {
        id: 8,
        title: "Publicaciones",
        link: "/publications",
        hasDropdown: true,
        submenus: [
          { id: 9, title: "Catálogo público", link: "/publications" },
          { id: 10, title: "Upload Category", link: "/upload-category" },
          { id: 11, title: "Upload", link: "/upload" },
        ],
      },
      {
        id: 12,
        hasDropdown: false,
        title: "FAQ",
        link: "/faq",
      },
      {
        id: 13,
        hasDropdown: false,
        title: "Register",
        link: "/register",
      },
      {
        id: 14,
        hasDropdown: false,
        title: "Login",
        link: "/login",
      },
      {
        id: 15,
        hasDropdown: false,
        title: "Terms",
        link: "/terms",
      },
      {
        id: 16,
        hasDropdown: false,
        title: "Wallet Connect",
        link: "/wallet-connect",
      },
      {
        id: 17,
        hasDropdown: false,
        title: "Activity",
        link: "/activity",
      },
      {
        id: 18,
        hasDropdown: false,
        title: "Ranking",
        link: "/art-ranking",
      },
      {
        id: 19,
        hasDropdown: false,
        title: "404 page",
        link: "/error-404",
      },
    ],
  },

  {
    id: 20,
    hasDropdown: false,
    title: "Forum",
    link: "/forum",
  },

  {
    id: 21,
    hasDropdown: false,
    title: "Contact",
    link: "/contact",
  },
];

// mobile menu

export const menuItems: MobileMenuItemType[] = [
  {
    id: 1,
    label: "Home",
    subMenu: true,
    href: "",
    subMenuItems: [
      { label: "Home Style 1", href: "/" },
      { label: "Home Style 2", href: "/home-two" },
      { label: "Home Style 3", href: "/home-three" },
    ],
  },
  { id: 2, label: "Propiedades", subMenu: false, href: "/publications" },
  {
    id: 3,
    href: "",
    label: "Creator",
    subMenu: true,
    subMenuItems: [
      { label: "Creators", href: "/creators" },
      { label: "Creator Profile", href: "/creator-profile" },
      {
        label: "Creator Personal Info",
        href: "/creator-profile-info-personal",
      },
    ],
  },
  {
    id: 4,
    href: "",
    label: "Publicaciones",
    subMenu: true,
    subMenuItems: [
      { label: "Upload Category", href: "/upload-category" },
      { label: "Upload", href: "/upload" },
      { label: "Catálogo público", href: "/publications" },
    ],
  },
  {
    id: 5,
    href: "",
    subMenu: true,
    label: "Pages",
    subMenuItems: [
      { label: "FAQ", href: "/faq" },
      { label: "Register", href: "/register" },
      { label: "Login", href: "/login" },
      { label: "Terms", href: "/terms" },
      { label: "Wallet Connect", href: "/wallet-connect" },
      { label: "Activity", href: "/activity" },
      { label: "Ranking", href: "/art-ranking" },
      { label: "404 page", href: "/error-404" },
    ],
  },
  { id: 6, label: "Forum", href: "/forum", subMenu: false },
  { id: 7, label: "Contact", href: "/contact", subMenu: false },
];
