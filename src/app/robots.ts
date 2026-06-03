import type { MetadataRoute } from "next";

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

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/publications",
          "/pricing-plan",
          "/pauta",
          "/faq",
          "/terminos",
          "/privacidad",
          "/contenido",
        ],
        disallow: [
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
          "/api/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
