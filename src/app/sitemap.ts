import type { MetadataRoute } from "next";

/**
 * Fase 18 — sitemap.xml para Google Search Console.
 *
 * Por ahora declaramos solo las rutas estáticas públicas que queremos
 * que Google indexe. Las publicaciones individuales son MUY dinámicas
 * (se crean/anulan a diario) — incluirlas requeriría fetch al backend
 * en cada generación, y como /publications no es público (requiere
 * authMiddlewareAux) preferimos esperar a un endpoint `/sitemap-data`
 * dedicado. Por ahora, `/publications` (el listado) ya cubre el caso:
 * Google entra, encuentra los anuncios, los indexa.
 *
 * Para retomar dinámico:
 *   1. Backend: GET /sitemap-data → devuelve `[{ id, updatedAt }]`
 *      de publicaciones activas, sin PII.
 *   2. Acá: añadir un `for (const p of data) sitemap.push(...)`.
 */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://kiosqui.gt";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes: Array<{
    path: string;
    priority: number;
    changeFrequency:
      | "always"
      | "hourly"
      | "daily"
      | "weekly"
      | "monthly"
      | "yearly"
      | "never";
  }> = [
    { path: "/", priority: 1.0, changeFrequency: "daily" },
    { path: "/publications", priority: 0.9, changeFrequency: "hourly" },
    { path: "/publications?propertie=1", priority: 0.8, changeFrequency: "daily" },
    { path: "/publications?propertie=2", priority: 0.8, changeFrequency: "daily" },
    { path: "/publications?propertie=3", priority: 0.8, changeFrequency: "daily" },
    { path: "/pricing-plan", priority: 0.7, changeFrequency: "monthly" },
    { path: "/pauta", priority: 0.6, changeFrequency: "monthly" },
    { path: "/faq", priority: 0.5, changeFrequency: "monthly" },
    { path: "/terminos", priority: 0.4, changeFrequency: "yearly" },
    { path: "/privacidad", priority: 0.4, changeFrequency: "yearly" },
    { path: "/contenido", priority: 0.4, changeFrequency: "yearly" },
    { path: "/login", priority: 0.3, changeFrequency: "monthly" },
    { path: "/register", priority: 0.3, changeFrequency: "monthly" },
  ];

  return routes.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
