import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import AppProvider from '@/contextApi/AppProvider';
import CookieConsentBanner from '@/components/legal/CookieConsentBanner';
import { AuthProvider } from '@/utils/AuthContext';
import QueryProvider from '@/utils/QueryProvider';
import { isAppLocale, locales } from '@/i18n/routing';
import { ToastContainer } from 'react-toastify';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kiosqui.gt';
const SITE_NAME = 'KIOSQUI';
const DEFAULT_TITLE = 'KIOSQUI — Marketplace de bienes raíces en Guatemala';
const DEFAULT_DESC =
  'Casas, apartamentos y terrenos publicados directamente por propietarios verificados en Guatemala. Sin intermediarios escondidos.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESC,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  keywords: [
    'bienes raíces Guatemala',
    'casas en venta Guatemala',
    'apartamentos en alquiler',
    'terrenos en venta',
    'propiedades verificadas',
    'marketplace inmobiliario',
    'KIOSQUI',
  ],
  robots: { index: true, follow: true },
  alternates: {
    canonical: '/es',
    languages: {
      es: '/es',
      en: '/en',
      'x-default': '/es',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_GT',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
    images: [
      {
        url: '/assets/img/og-default.jpg',
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
    images: ['/assets/img/og-default.jpg'],
  },
  icons: {
    icon: '/favicon.png',
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;

  if (!isAppLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
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
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AppProvider>
            <QueryProvider>
              <AuthProvider>{children}</AuthProvider>
            </QueryProvider>
          </AppProvider>
          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            theme="dark"
          />
          <CookieConsentBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
