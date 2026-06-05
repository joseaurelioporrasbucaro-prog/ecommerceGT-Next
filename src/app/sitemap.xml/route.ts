import { routing } from "@/i18n/routing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kiosqui.gt";

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

export function GET() {
  const now = new Date().toISOString();
  const entries = routes.flatMap((route) =>
    routing.locales.map((locale) => {
      const url = localizedUrl(locale, route.path);
      const alternateLinks = [
        ...routing.locales.map((alternateLocale) => ({
          hreflang: alternateLocale,
          href: localizedUrl(alternateLocale, route.path),
        })),
        {
          hreflang: "x-default",
          href: localizedUrl(routing.defaultLocale, route.path),
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
<lastmod>${now}</lastmod>
<changefreq>${route.changeFrequency}</changefreq>
<priority>${route.priority.toFixed(1)}</priority>
</url>`;
    }),
  );

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join("\n")}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
