"use client";

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import LegalPageMain, { LegalSection } from './LegalPageMain';

const PrivacyMain: React.FC = () => {
  const t = useTranslations('legal.privacy');
  const rich = {
    strong: (chunks: React.ReactNode) => <strong>{chunks}</strong>,
    terms: (chunks: React.ReactNode) => <Link href="/terminos">{chunks}</Link>,
    profile: (chunks: React.ReactNode) => <Link href="/creator-profile-info-personal">{chunks}</Link>,
    support: (chunks: React.ReactNode) => <Link href="/soporte/tickets">{chunks}</Link>,
    privacyEmail: (chunks: React.ReactNode) => <a href="mailto:privacidad@kiosqui.gt">{chunks}</a>,
    securityEmail: (chunks: React.ReactNode) => <a href="mailto:seguridad@kiosqui.gt">{chunks}</a>,
    br: () => <br />,
  };

  const sections: LegalSection[] = [
    {
      id: 'alcance',
      title: t('sections.scope.title'),
      body: <p>{t.rich('sections.scope.body', rich)}</p>,
    },
    {
      id: 'datos-recolectados',
      title: t('sections.data.title'),
      body: (
        <>
          <h4>{t('sections.data.accountTitle')}</h4>
          <p>{t('sections.data.account')}</p>
          <h4>{t('sections.data.profileTitle')}</h4>
          <p>{t('sections.data.profile')}</p>
          <h4>{t('sections.data.sensitiveTitle')}</h4>
          <p>{t('sections.data.sensitiveIntro')}</p>
          <ul>
            <li>{t.rich('sections.data.sensitiveItems.encrypted', rich)}</li>
            <li>{t('sections.data.sensitiveItems.supportOnly')}</li>
            <li>{t.rich('sections.data.sensitiveItems.neverPublic', rich)}</li>
          </ul>
          <h4>{t('sections.data.listingsTitle')}</h4>
          <p>{t('sections.data.listings')}</p>
          <h4>{t('sections.data.paymentsTitle')}</h4>
          <p>{t.rich('sections.data.payments', rich)}</p>
          <h4>{t('sections.data.technicalTitle')}</h4>
          <p>{t('sections.data.technical')}</p>
          <h4>{t('sections.data.communicationsTitle')}</h4>
          <p>{t('sections.data.communications')}</p>
        </>
      ),
    },
    {
      id: 'como-usamos',
      title: t('sections.use.title'),
      body: (
        <>
          <p>{t('sections.use.intro')}</p>
          <ul>
            <li>{t('sections.use.items.operate')}</li>
            <li>{t('sections.use.items.verify')}</li>
            <li>{t('sections.use.items.payments')}</li>
            <li>{t('sections.use.items.notifications')}</li>
            <li>{t('sections.use.items.support')}</li>
            <li>{t('sections.use.items.legal')}</li>
            <li>{t('sections.use.items.analytics')}</li>
          </ul>
        </>
      ),
    },
    {
      id: 'compartimos',
      title: t('sections.sharing.title'),
      body: (
        <>
          <p>{t.rich('sections.sharing.intro', rich)}</p>
          <ul>
            <li>{t.rich('sections.sharing.items.infrastructure', rich)}</li>
            <li>{t.rich('sections.sharing.items.payments', rich)}</li>
            <li>{t.rich('sections.sharing.items.authorities', rich)}</li>
            <li>{t.rich('sections.sharing.items.users', rich)}</li>
          </ul>
        </>
      ),
    },
    {
      id: 'cookies',
      title: t('sections.cookies.title'),
      body: (
        <>
          <p>{t('sections.cookies.intro')}</p>
          <ul>
            <li>{t.rich('sections.cookies.items.session', rich)}</li>
            <li>{t('sections.cookies.items.preferences')}</li>
            <li>{t('sections.cookies.items.banner')}</li>
            <li>{t('sections.cookies.items.analytics')}</li>
          </ul>
          <p>{t('sections.cookies.note')}</p>
        </>
      ),
    },
    {
      id: 'derechos',
      title: t('sections.rights.title'),
      body: (
        <>
          <p>{t('sections.rights.intro')}</p>
          <ul>
            <li>{t.rich('sections.rights.items.access', rich)}</li>
            <li>{t.rich('sections.rights.items.rectification', rich)}</li>
            <li>{t.rich('sections.rights.items.deactivate', rich)}</li>
            <li>{t.rich('sections.rights.items.delete', rich)}</li>
            <li>{t.rich('sections.rights.items.objection', rich)}</li>
            <li>{t.rich('sections.rights.items.portability', rich)}</li>
          </ul>
          <p>{t.rich('sections.rights.contact', rich)}</p>
        </>
      ),
    },
    {
      id: 'retencion',
      title: t('sections.retention.title'),
      body: (
        <>
          <p>{t('sections.retention.intro')}</p>
          <ul>
            <li>{t('sections.retention.items.active')}</li>
            <li>{t('sections.retention.items.accounting')}</li>
            <li>{t('sections.retention.items.disputes')}</li>
          </ul>
          <p>{t('sections.retention.afterDelete')}</p>
          <h4>{t('sections.retention.auditTitle')}</h4>
          <p>{t.rich('sections.retention.auditIntro', rich)}</p>
          <ul>
            <li>{t('sections.retention.auditItems.email')}</li>
            <li>{t('sections.retention.auditItems.id')}</li>
            <li>{t('sections.retention.auditItems.phone')}</li>
            <li>{t('sections.retention.auditItems.reason')}</li>
          </ul>
          <p>{t.rich('sections.retention.auditNote', rich)}</p>
        </>
      ),
    },
    {
      id: 'seguridad',
      title: t('sections.security.title'),
      body: (
        <>
          <p>{t('sections.security.intro')}</p>
          <ul>
            <li>{t('sections.security.items.encryption')}</li>
            <li>{t('sections.security.items.passwords')}</li>
            <li>{t('sections.security.items.documents')}</li>
            <li>{t('sections.security.items.roles')}</li>
            <li>{t('sections.security.items.monitoring')}</li>
          </ul>
          <p>{t.rich('sections.security.report', rich)}</p>
        </>
      ),
    },
    {
      id: 'menores',
      title: t('sections.minors.title'),
      body: <p>{t('sections.minors.body')}</p>,
    },
    {
      id: 'cambios',
      title: t('sections.changes.title'),
      body: <p>{t('sections.changes.body')}</p>,
    },
    {
      id: 'contacto',
      title: t('sections.contact.title'),
      body: <p>{t.rich('sections.contact.body', rich)}</p>,
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

export default PrivacyMain;
