import "./globals.css";
import "../style/index.scss";
import type { Metadata } from "next";
import AppProvider from "@/contextApi/AppProvider";
import { ToastContainer } from "react-toastify";
// Importamos tu nuevo AuthProvider
import { AuthProvider } from "@/utils/AuthContext";
import QueryProvider from "@/utils/QueryProvider";
import CookieConsentBanner from "@/components/legal/CookieConsentBanner";
import 'react-toastify/dist/ReactToastify.css';

// Fase 18 — metadata root: queda como default para todas las páginas que
// no exporten su propio `metadata`. Las páginas que sí lo declaren
// (page.tsx con `export const metadata`) lo sobreescriben heredando lo
// que no especifiquen. Incluye OpenGraph + Twitter Card para que al
// compartir cualquier ruta en redes salga la preview de marca.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://kiosqui.gt";
const SITE_NAME = "KIOSQUI";
const DEFAULT_TITLE = "KIOSQUI — Marketplace de bienes raíces en Guatemala";
const DEFAULT_DESC =
  "Casas, apartamentos y terrenos publicados directamente por propietarios verificados en Guatemala. Sin intermediarios escondidos.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: "%s | " + SITE_NAME,
  },
  description: DEFAULT_DESC,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  keywords: [
    "bienes raíces Guatemala",
    "casas en venta Guatemala",
    "apartamentos en alquiler",
    "terrenos en venta",
    "propiedades verificadas",
    "marketplace inmobiliario",
    "KIOSQUI",
  ],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "es_GT",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
    images: [
      {
        url: "/assets/img/og-default.jpg", // 1200x630 recomendado — reemplazable cuando haya imagen de marca
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
    images: ["/assets/img/og-default.jpg"],
  },
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <link rel="stylesheet" href="/assets/css/fontAwesome5Pro.css" />
        <link
          href="https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>

      <body className="body-bg" suppressHydrationWarning={true}>
        <AppProvider>
          {/* QueryProvider envuelve a AuthProvider para que los hooks de React Query
              (incluido el futuro useCurrentUser de Fase 1) tengan QueryClient disponible. */}
          <QueryProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </QueryProvider>
        </AppProvider>
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          theme="dark"
        />
        {/* Fase 12 — banner de cookies. Aparece UNA vez por navegador
            hasta que el usuario acepte. Se oculta automáticamente en el
            visor 3D fullscreen (componente lo detecta por URL). */}
        <CookieConsentBanner />
      </body>
    </html>
  );
}