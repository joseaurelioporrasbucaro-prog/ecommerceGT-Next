import { routing } from "@/i18n/routing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kiosqui.gt";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type ChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

const routes: Array<{
  path: string;
  priority: number;
  changeFrequency: ChangeFrequency;
}> = [
  { path: "", priority: 1.0, changeFrequency: "daily" },
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

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function localizedUrl(locale: string, path: string) {
  return `${SITE_URL}/${locale}${path}`;
}

/** Construye una entrada <url> por locale, con alternates hreflang + x-default. */
function buildEntries(
  path: string,
  lastmod: string,
  changeFrequency: ChangeFrequency,
  priority: number,
) {
  return routing.locales.map((locale) => {
    const url = localizedUrl(locale, path);
    const alternateLinks = [
      ...routing.locales.map((alternateLocale) => ({
        hreflang: alternateLocale,
        href: localizedUrl(alternateLocale, path),
      })),
      {
        hreflang: "x-default",
        href: localizedUrl(routing.defaultLocale, path),
      },
    ]
      .map(
        (alternate) =>
          `<xhtml:link rel="alternate" hreflang="${escapeXml(alternate.hreflang)}" href="${escapeXml(alternate.href)}" />`,
      )
      .join("\n");

    return `<url>
<loc>${escapeXml(url)}</loc>
${alternateLinks}
<lastmod>${lastmod}</lastmod>
<changefreq>${changeFrequency}</changefreq>
<priority>${priority.toFixed(1)}</priority>
</url>`;
  });
}

/**
 * Fase 18 — publicaciones individuales en el sitemap.
 * Trae {id, slug} del endpoint público del backend (`/sitemap-data`). La URL
 * canónica de una publicación es su slug (Fase 22). Si el backend falla, el
 * sitemap sigue saliendo solo con rutas estáticas (no lo rompemos por una caída
 * del API).
 */
async function fetchPublicationPaths(): Promise<string[]> {
  try {
    const res = await fetch(`${API_URL}/sitemap-data`, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const rows = (await res.json()) as Array<{ slug: string | null }>;
    if (!Array.isArray(rows)) return [];
    return rows
      .map((row) => row?.slug)
      .filter((slug): slug is string => typeof slug === "string" && slug.length > 0)
      .map((slug) => `/publications/${encodeURIComponent(slug)}`);
  } catch {
    return [];
  }
}

export async function GET() {
  const now = new Date().toISOString();

  const staticEntries = routes.flatMap((route) =>
    buildEntries(route.path, now, route.changeFrequency, route.priority),
  );

  const publicationPaths = await fetchPublicationPaths();
  const publicationEntries = publicationPaths.flatMap((path) =>
    buildEntries(path, now, "weekly", 0.7),
  );

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${[...staticEntries, ...publicationEntries].join("\n")}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
