"use client";
import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import LegalPageMain, { LegalSection } from './LegalPageMain';

const ContentPolicyMain: React.FC = () => {
  const t = useTranslations('legal.contentPolicy');
  const rich = {
    strong: (chunks: React.ReactNode) => <strong>{chunks}</strong>,
    terms: (chunks: React.ReactNode) => <Link href="/terminos#sanciones">{chunks}</Link>,
  };

  const sections: LegalSection[] = [
    {
      id: 'resumen',
      title: t('sections.summary.title'),
      body: <p>{t.rich('sections.summary.body', rich)}</p>,
    },
    {
      id: 'contenido-permitido',
      title: t('sections.allowed.title'),
      body: (
        <>
          <p>{t('sections.allowed.intro')}</p>
          <ul>
            <li>{t('sections.allowed.items.properties')}</li>
            <li>{t('sections.allowed.items.photos')}</li>
            <li>{t.rich('sections.allowed.items.renders', rich)}</li>
            <li>{t('sections.allowed.items.descriptions')}</li>
            <li>{t('sections.allowed.items.glb')}</li>
          </ul>
        </>
      ),
    },
    {
      id: 'contenido-prohibido',
      title: t('sections.prohibited.title'),
      body: (
        <>
          <p>{t('sections.prohibited.intro')}</p>
          <ul>
            <li>{t.rich('sections.prohibited.items.scams', rich)}</li>
            <li>{t.rich('sections.prohibited.items.noRights', rich)}</li>
            <li>{t.rich('sections.prohibited.items.discrimination', rich)}</li>
            <li>{t.rich('sections.prohibited.items.illegal', rich)}</li>
            <li>{t('sections.prohibited.items.crime')}</li>
            <li>{t('sections.prohibited.items.copyright')}</li>
          </ul>
        </>
      ),
    },
    {
      id: 'fotos',
      title: t('sections.photos.title'),
      body: (
        <ul>
          <li>{t.rich('sections.photos.items.own', rich)}</li>
          <li>{t('sections.photos.items.resolution')}</li>
          <li>{t('sections.photos.items.formats')}</li>
          <li>{t('sections.photos.items.watermarks')}</li>
          <li>{t('sections.photos.items.faces')}</li>
          <li>{t('sections.photos.items.edits')}</li>
        </ul>
      ),
    },
    {
      id: 'contacto',
      title: t('sections.contact.title'),
      body: (
        <>
          <p>{t.rich('sections.contact.intro', rich)}</p>
          <ul>
            <li>{t('sections.contact.items.payments')}</li>
            <li>{t('sections.contact.items.external')}</li>
            <li>{t('sections.contact.items.impersonation')}</li>
          </ul>
          <p>{t('sections.contact.note')}</p>
        </>
      ),
    },
    {
      id: 'manipulacion',
      title: t('sections.manipulation.title'),
      body: (
        <>
          <p>{t('sections.manipulation.intro')}</p>
          <ul>
            <li>{t('sections.manipulation.items.duplicates')}</li>
            <li>{t('sections.manipulation.items.unavailable')}</li>
            <li>{t('sections.manipulation.items.clickbait')}</li>
            <li>{t('sections.manipulation.items.automation')}</li>
          </ul>
        </>
      ),
    },
    {
      id: 'suplantacion',
      title: t('sections.impersonation.title'),
      body: <p>{t('sections.impersonation.body')}</p>,
    },
    {
      id: 'spam',
      title: t('sections.spam.title'),
      body: (
        <>
          <p>{t('sections.spam.intro')}</p>
          <ul>
            <li>{t('sections.spam.items.messages')}</li>
            <li>{t('sections.spam.items.comments')}</li>
            <li>{t('sections.spam.items.links')}</li>
            <li>{t('sections.spam.items.bots')}</li>
          </ul>
        </>
      ),
    },
    {
      id: 'reportar',
      title: t('sections.report.title'),
      body: (
        <>
          <p>{t.rich('sections.report.body', rich)}</p>
          <p>{t('sections.report.confidential')}</p>
        </>
      ),
    },
    {
      id: 'sanciones',
      title: t('sections.sanctions.title'),
      body: (
        <>
          <p>{t('sections.sanctions.intro')}</p>
          <ul>
            <li>{t.rich('sections.sanctions.items.hide', rich)}</li>
            <li>{t.rich('sections.sanctions.items.delete', rich)}</li>
            <li>{t.rich('sections.sanctions.items.suspend', rich)}</li>
            <li>{t.rich('sections.sanctions.items.ban', rich)}</li>
            <li>{t.rich('sections.sanctions.items.refund', rich)}</li>
          </ul>
          <p>{t.rich('sections.sanctions.terms', rich)}</p>
        </>
      ),
    },
    {
      id: 'apelaciones',
      title: t('sections.appeals.title'),
      body: <p>{t('sections.appeals.body')}</p>,
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

export default ContentPolicyMain;
