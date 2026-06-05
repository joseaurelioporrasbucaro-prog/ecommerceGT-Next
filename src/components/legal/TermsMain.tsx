"use client";

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import LegalPageMain, { LegalSection } from './LegalPageMain';

const TermsMain: React.FC = () => {
  const t = useTranslations('legal.terms');
  const rich = {
    strong: (chunks: React.ReactNode) => <strong>{chunks}</strong>,
    code: (chunks: React.ReactNode) => <code>{chunks}</code>,
    privacy: (chunks: React.ReactNode) => <Link href="/privacidad">{chunks}</Link>,
    content: (chunks: React.ReactNode) => <Link href="/contenido">{chunks}</Link>,
    support: (chunks: React.ReactNode) => <Link href="/soporte/tickets">{chunks}</Link>,
    plans: (chunks: React.ReactNode) => <Link href="/pricing-plan">{chunks}</Link>,
    pauta: (chunks: React.ReactNode) => <Link href="/pauta">{chunks}</Link>,
  };

  const sections: LegalSection[] = [
    {
      id: 'aceptacion',
      title: t('sections.acceptance.title'),
      body: (
        <>
          <p>{t('sections.acceptance.p1')}</p>
          <p>{t.rich('sections.acceptance.p2', rich)}</p>
        </>
      ),
    },
    {
      id: 'quienes-somos',
      title: t('sections.about.title'),
      body: (
        <>
          <p>{t('sections.about.p1')}</p>
          <p>{t.rich('sections.about.p2', rich)}</p>
        </>
      ),
    },
    {
      id: 'cuenta',
      title: t('sections.account.title'),
      body: (
        <>
          <p>{t('sections.account.intro')}</p>
          <ul>
            <li>{t('sections.account.items.age')}</li>
            <li>{t('sections.account.items.truth')}</li>
            <li>{t('sections.account.items.password')}</li>
            <li>{t.rich('sections.account.items.unauthorized', rich)}</li>
          </ul>
          <p>{t('sections.account.p2')}</p>
        </>
      ),
    },
    {
      id: 'verificacion',
      title: t('sections.verification.title'),
      body: (
        <>
          <p>{t('sections.verification.intro')}</p>
          <ul>
            <li>{t('sections.verification.items.id')}</li>
            <li>{t('sections.verification.items.tax')}</li>
            <li>{t('sections.verification.items.selfie')}</li>
          </ul>
          <p>{t.rich('sections.verification.p2', rich)}</p>
        </>
      ),
    },
    {
      id: 'publicaciones',
      title: t('sections.listings.title'),
      body: (
        <>
          <p>{t('sections.listings.intro')}</p>
          <ul>
            <li>{t('sections.listings.items.rights')}</li>
            <li>{t('sections.listings.items.photos')}</li>
            <li>{t('sections.listings.items.truth')}</li>
            <li>{t.rich('sections.listings.items.status', rich)}</li>
            <li>{t.rich('sections.listings.items.policy', rich)}</li>
          </ul>
          <p>{t('sections.listings.p2')}</p>
        </>
      ),
    },
    {
      id: 'planes',
      title: t('sections.plans.title'),
      body: (
        <>
          <p>{t.rich('sections.plans.p1', rich)}</p>
          <ul>
            <li>{t('sections.plans.items.providers')}</li>
            <li>{t('sections.plans.items.renewal')}</li>
            <li>{t.rich('sections.plans.items.refunds', rich)}</li>
          </ul>
        </>
      ),
    },
    {
      id: 'pauta',
      title: t('sections.ads.title'),
      body: <p>{t.rich('sections.ads.body', rich)}</p>,
    },
    {
      id: 'sanciones',
      title: t('sections.sanctions.title'),
      body: (
        <>
          <p>{t('sections.sanctions.intro')}</p>
          <ul>
            <li>{t.rich('sections.sanctions.items.warning', rich)}</li>
            <li>{t.rich('sections.sanctions.items.hide', rich)}</li>
            <li>{t.rich('sections.sanctions.items.suspend', rich)}</li>
            <li>{t.rich('sections.sanctions.items.ban', rich)}</li>
          </ul>
          <p>{t.rich('sections.sanctions.p2', rich)}</p>
        </>
      ),
    },
    {
      id: 'propiedad-intelectual',
      title: t('sections.ip.title'),
      body: (
        <>
          <p>{t('sections.ip.p1')}</p>
          <p>{t.rich('sections.ip.p2', rich)}</p>
        </>
      ),
    },
    {
      id: 'limitacion',
      title: t('sections.liability.title'),
      body: (
        <>
          <p>{t.rich('sections.liability.intro', rich)}</p>
          <ul>
            <li>{t('sections.liability.items.availability')}</li>
            <li>{t('sections.liability.items.transactions')}</li>
            <li>{t('sections.liability.items.damages')}</li>
          </ul>
        </>
      ),
    },
    {
      id: 'modificaciones',
      title: t('sections.changes.title'),
      body: <p>{t.rich('sections.changes.body', rich)}</p>,
    },
    {
      id: 'jurisdiccion',
      title: t('sections.law.title'),
      body: <p>{t('sections.law.body')}</p>,
    },
  ];

  return (
    <LegalPageMain
      pageTitle={t('pageTitle')}
      breadcrumbSubTitle={t('breadcrumb')}
      lastUpdated={t('lastUpdated')}
      intro={<p>{t.rich('intro', rich)}</p>}
      sections={sections}
    />
  );
};

export default TermsMain;
