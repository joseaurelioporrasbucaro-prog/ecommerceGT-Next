import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { AbstractIntlMessages } from 'use-intl';

import { defaultLocale, isAppLocale } from './routing';

const namespaces = [
  'common',
  'auth',
  'messages',
  'support',
  'pauta',
  'profile',
  'notifications',
  'admin',
  'home',
  'publications',
  'legal',
  'danger',
  'footer',
] as const;

type Namespace = (typeof namespaces)[number];
type Messages = Record<Namespace, AbstractIntlMessages>;

async function loadNamespace(locale: string, namespace: Namespace) {
  const messages = (await import(`../../messages/${locale}/${namespace}.json`))
    .default as AbstractIntlMessages;

  return [namespace, messages] as const;
}

async function loadMessages(locale: string): Promise<Messages> {
  const entries = await Promise.all(
    namespaces.map((namespace) => loadNamespace(locale, namespace))
  );

  return Object.fromEntries(entries) as Messages;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;
  const locale = requestedLocale ?? defaultLocale;

  if (!isAppLocale(locale)) {
    notFound();
  }

  return {
    locale,
    messages: await loadMessages(locale),
  };
});
