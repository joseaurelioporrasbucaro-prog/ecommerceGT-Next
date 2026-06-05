import type { MetadataRoute } from "next";
import { locales } from "@/i18n/routing";

/**
 * Fase 18 — robots.txt para Google y otros crawlers.
 *
 * Permite el catálogo público pero bloquea:
 *   - /soporte/* — paneles internos de soporte
 *   - /admin/*   — CMS-lite de imágenes y configuración
 *   - /messages — bandeja de mensajes privados
 *   - /favorites — listado privado del usuario
 *   - /my-publications — listado privado del usuario
 *   - /creator-profile-info* — paneles de configuración del perfil
 *   - /verify, /forgot, /invite — flujos transaccionales
 *
 * Apuntamos al sitemap dinámico generado por sitemap.ts.
 */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://kiosqui.gt";

const withLocales = (paths: string[]) =>
  locales.flatMap((locale) =>
    paths.map((path) => `/${locale}${path}`),
  );

export default function robots(): MetadataRoute.Robots {
  const publicPaths = [
    "",
    "/publications",
    "/pricing-plan",
    "/pauta",
    "/faq",
    "/terminos",
    "/privacidad",
    "/contenido",
  ];
  const privatePaths = [
    "/soporte/",
    "/admin/",
    "/messages",
    "/favorites",
    "/my-publications",
    "/creator-profile-info",
    "/creator-profile-info-personal",
    "/verify",
    "/forgot",
    "/invite",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", ...withLocales(publicPaths)],
        disallow: [
          ...withLocales(privatePaths),
          "/api/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
