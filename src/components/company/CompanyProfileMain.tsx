"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import ProfileBreadCamb from '@/components/Creator-Profile/ProfileBreadCamb';
import PublicationCard from '@/components/publications/PublicationCard';
import { useCompanyProfile } from '@/hooks/api/useCompanyProfile';
import { useCompanyPublications } from '@/hooks/api/useCompanyPublications';
import { getBackendUrl } from '@/utils/backendUrl';
import { useDateFmt } from '@/utils/datetime';
import type { PublicationListItem, CompanyProfileEmployee } from '@/types/api';

type TabKey = 'publicaciones' | 'empleados';

const fmtCount = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
};

const toInt = (v: number | string | null | undefined): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const CompanyProfileMain = ({ id }: { id: string }) => {
  const t = useTranslations('profile');
  const dateFmt = useDateFmt();
  const [activeTab, setActiveTab] = useState<TabKey>('publicaciones');
  const profileQuery = useCompanyProfile(id);
  const pubsQuery = useCompanyPublications(id);
  const data = profileQuery.data;
  const company = data?.company;
  const employees = data?.employees ?? [];
  const publications = pubsQuery.data ?? [];

  const tradeName = company?.tradename || t('company.fallback');
  const logoUrl = company?.logo ? getBackendUrl(company.logo) : null;
  const joinDate = company?.joindate ? dateFmt.monthYear(company.joindate, '') : null;

  // ── Estilos inline (idioma del mockup CompanyScreen: inline + clases kq-* globales) ──
  const cardTitle: React.CSSProperties = {
    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22,
    color: 'var(--fg-strong)', margin: 0, lineHeight: 1.2,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  };
  const metaRow: React.CSSProperties = {
    display: 'flex', alignItems: 'flex-start', gap: 9,
    fontSize: 13.5, color: 'var(--fg-muted)', textAlign: 'left', lineHeight: 1.45,
  };
  const statNum: React.CSSProperties = {
    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26,
    color: 'var(--fg-strong)', lineHeight: 1.1,
  };
  const statLabel: React.CSSProperties = {
    fontSize: 12.5, color: 'var(--fg-muted)', marginTop: 3,
  };

  return (
    <>
      <ProfileBreadCamb singleCreator={{ name: tradeName }} />

      <section className="cp-area pb-90">
        {/* PORTADA decorativa (navy con halo lavanda, uniforme para toda empresa). */}
        <div className="cp-cover" aria-hidden />

        <div className="cp-container">
          {profileQuery.isLoading && <div className="alert alert-info mt-30">{t('company.loading')}</div>}
          {profileQuery.isError && (
            <div className="alert alert-danger mt-30">{t('company.loadError')}</div>
          )}

          {company && (
            <div className="cp-grid">
              {/* ── Columna izquierda: tarjeta de empresa (se superpone a la portada) ── */}
              <div className="cp-company-card kq-card" style={{ padding: 24, textAlign: 'center' }}>
                {/* Marco BLANCO de la foto: mantiene visible un logo navy sobre la portada navy. */}
                <div className="cp-photo-frame">
                  <div className="cp-photo">
                    {logoUrl ? (
                      <Image
                        src={logoUrl}
                        alt={tradeName}
                        width={300}
                        height={300}
                        sizes="150px"
                        quality={90}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span className="cp-photo-placeholder" aria-hidden>
                        <i className="fas fa-building" />
                      </span>
                    )}
                  </div>
                </div>

                <h4 style={cardTitle}>
                  {tradeName}
                  {company.verified && (
                    <i
                      className="fas fa-check-circle"
                      title={t('company.verified')}
                      style={{ color: 'var(--green-600)', fontSize: 18 }}
                    />
                  )}
                </h4>

                {company.name && (
                  <div style={{ fontSize: 13.5, color: 'var(--fg-muted)', marginTop: 4 }}>
                    {company.name}
                  </div>
                )}

                {company.verified && (
                  <div style={{ marginTop: 12 }}>
                    <span className="kq-badge kq-badge--green">
                      <i className="fas fa-shield-alt" /> {t('company.verified')}
                    </span>
                  </div>
                )}

                {(company.address || joinDate) && (
                  <div className="cp-meta-list">
                    {company.address && (
                      <div style={metaRow}>
                        <i className="fas fa-map-marker-alt cp-meta-icon" />
                        <span>{company.address}</span>
                      </div>
                    )}
                    {joinDate && (
                      <div style={metaRow}>
                        <i className="far fa-calendar-alt cp-meta-icon" />
                        <span>{t('company.since', { date: joinDate })}</span>
                      </div>
                    )}
                  </div>
                )}

                <Link
                  href="/messages"
                  className="kq-btn kq-btn--action cp-contact-btn"
                >
                  <i className="fas fa-paper-plane" /> {t('company.contact')}
                </Link>
              </div>

              {/* ── Columna derecha: stats + tabs (Publicaciones / Empleados) ── */}
              <div>
                <div className="cp-stats kq-card">
                  <div className="cp-stat cp-stat--border">
                    <div style={statNum}>{fmtCount(toInt(company.membercount))}</div>
                    <div style={statLabel}>{t('company.employees')}</div>
                  </div>
                  <div className="cp-stat">
                    <div style={statNum}>{fmtCount(toInt(company.totalpublis))}</div>
                    <div style={statLabel}>{t('stats.publications')}</div>
                  </div>
                </div>

                <div className="cp-tabs" role="tablist">
                  <button
                    className={`cp-tab ${activeTab === 'publicaciones' ? 'is-active' : ''}`}
                    type="button"
                    role="tab"
                    onClick={() => setActiveTab('publicaciones')}
                  >
                    {t('stats.publications')}
                    <span className="cp-tab-count">{fmtCount(toInt(company.totalpublis))}</span>
                  </button>
                  <button
                    className={`cp-tab ${activeTab === 'empleados' ? 'is-active' : ''}`}
                    type="button"
                    role="tab"
                    onClick={() => setActiveTab('empleados')}
                  >
                    {t('company.employees')}
                    <span className="cp-tab-count">{fmtCount(toInt(company.membercount))}</span>
                  </button>
                </div>

                <div className="cp-tab-content">
                  {/* ── Tab Publicaciones: las de todos los empleados ── */}
                  {activeTab === 'publicaciones' && (
                    <div className="created-items-wrapper">
                      {pubsQuery.isLoading && <p style={{ opacity: 0.6 }}>{t('seller.loadingPublications')}</p>}
                      {!pubsQuery.isLoading && publications.length === 0 && (
                        <div className="cp-empty">
                          <i className="fal fa-folder-open" />
                          <p>{t('company.noPublications')}</p>
                        </div>
                      )}
                      {publications.length > 0 && (
                        <div className="row">
                          {publications.map((pub: PublicationListItem) => (
                            <PublicationCard key={pub.id} publication={pub} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Tab Empleados: solo si la empresa lo habilitó ── */}
                  {activeTab === 'empleados' && (
                    <div>
                      {!company.showemployees ? (
                        <div className="cp-empty">
                          <i className="fal fa-user-lock" />
                          <p>{t('company.hiddenEmployees')}</p>
                        </div>
                      ) : employees.length === 0 ? (
                        <div className="cp-empty">
                          <i className="fal fa-users" />
                          <p>{t('company.noEmployees')}</p>
                        </div>
                      ) : (
                        <div className="cp-emp-grid">
                          {employees.map((e: CompanyProfileEmployee) => {
                            const name = `${e.firstname ?? ''} ${e.lastname ?? ''}`.trim() || t('seller.userFallback');
                            const avatar = e.imagenu ? getBackendUrl(e.imagenu) : null;
                            return (
                              <Link key={e.cusid} href={`/creator-profile/${e.cusid}`} className="cp-emp-card">
                                <div className="cp-emp-avatar">
                                  {avatar ? (
                                    <Image src={avatar} alt={name} width={64} height={64} />
                                  ) : (
                                    <span>{name[0]?.toUpperCase() ?? '?'}</span>
                                  )}
                                </div>
                                <div className="cp-emp-info">
                                  <span className="cp-emp-name">{name}</span>
                                  {e.handle && <span className="cp-emp-handle">@{e.handle}</span>}
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <style jsx>{`
        /* ── PORTADA: navy con halo lavanda, uniforme (sin imagen por empresa) ── */
        .cp-cover {
          height: 240px;
          background:
            radial-gradient(620px 360px at 84% -10%, rgba(181, 172, 239, 0.32), transparent 62%),
            linear-gradient(120deg, var(--navy-700, #283a5c), var(--navy-800, #1e2d4a) 55%, #45407e);
        }
        .cp-container {
          max-width: 1180px;
          margin: 0 auto;
          padding: 0 16px;
        }
        /* Grid 300px / 1fr, con la tarjeta de empresa superpuesta a la portada. */
        .cp-grid {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 32px;
          align-items: start;
        }
        /* ── Tarjeta de empresa (columna izquierda) ── */
        .cp-company-card {
          margin-top: -72px;
        }
        /* Marco BLANCO de la foto (requerido: un logo navy queda visible sobre
           la portada navy). El frame es surface; adentro la foto va con --r-md. */
        .cp-photo-frame {
          width: 150px;
          height: 150px;
          margin: 0 auto 16px;
          padding: 6px;
          background: var(--surface, #fff);
          border-radius: var(--r-lg, 16px);
          box-shadow: var(--shadow-md, 0 8px 24px rgba(30, 45, 74, 0.12));
        }
        .cp-photo {
          width: 100%;
          height: 100%;
          border-radius: var(--r-md, 12px);
          overflow: hidden;
        }
        .cp-photo-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          font-size: 56px;
          color: var(--cream, #f8f4ee);
          background: linear-gradient(135deg, var(--lav-500, #b5acef), var(--navy-800, #1e2d4a));
        }
        .cp-meta-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 18px;
          padding-top: 16px;
          border-top: 1px solid var(--border, #e6ddcf);
          text-align: left;
        }
        .cp-meta-icon {
          color: var(--lav-700, #6d62cf);
          font-size: 14px;
          margin-top: 2px;
          flex-shrink: 0;
          width: 16px;
          text-align: center;
        }
        /* Botón Contactar (ancho completo, verde). Es un Link: scope via :global. */
        .cp-company-card :global(.cp-contact-btn) {
          display: flex;
          width: 100%;
          margin-top: 18px;
        }
        /* ── Stats (columna derecha, arriba) ── */
        .cp-stats {
          display: flex;
          padding: 22px 26px;
          margin-bottom: 26px;
        }
        .cp-stat {
          flex: 1;
          text-align: center;
        }
        .cp-stat--border {
          border-right: 1px solid var(--border, #e6ddcf);
        }
        /* ── Tabs subrayado verde + pill de conteo ── */
        .cp-tabs {
          display: flex;
          gap: 28px;
          border-bottom: 1px solid var(--border, #e6ddcf);
          margin-bottom: 26px;
        }
        .cp-tab {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-display);
          font-size: 14px;
          font-weight: 600;
          color: var(--fg-subtle, #9aa0a8);
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          padding: 10px 2px 12px;
          cursor: pointer;
          transition: color 0.15s, border-color 0.15s;
        }
        .cp-tab.is-active {
          color: var(--fg-strong, #22252a);
          border-bottom-color: var(--green-500, #9bc64a);
        }
        .cp-tab-count {
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 700;
          padding: 1px 9px;
          border-radius: var(--r-pill, 999px);
          background: var(--surface-sunk, #f1ebe0);
          color: var(--fg-subtle, #9aa0a8);
        }
        .cp-tab.is-active .cp-tab-count {
          background: var(--lav-200, #ddd8f8);
          color: var(--lav-700, #6d62cf);
        }
        /* ── Estado vacío ── */
        .cp-empty {
          padding: 50px 20px;
          text-align: center;
          opacity: 0.7;
        }
        .cp-empty :global(i) {
          font-size: 36px;
          display: block;
          margin-bottom: 14px;
          color: var(--lav-700, #6d62cf);
        }
        .cp-empty p {
          margin: 0;
          color: var(--fg-muted, #5c616a);
        }
        /* ── Empleados ── */
        .cp-emp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 14px;
        }
        .cp-company-card,
        .cp-stats {
          box-shadow: var(--shadow-sm);
        }
        .cp-tab-content :global(.cp-emp-card) {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border: 1px solid var(--border, #e6ddcf);
          border-radius: var(--r-md, 12px);
          background: var(--surface, #fff);
          text-decoration: none;
          transition: border-color 0.18s, transform 0.18s, box-shadow 0.18s;
        }
        .cp-tab-content :global(.cp-emp-card:hover) {
          border-color: var(--lav-500, #b5acef);
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }
        .cp-emp-avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--navy-700, #283a5c), var(--navy-900, #161f33));
          color: var(--cream, #f8f4ee);
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 22px;
        }
        .cp-emp-avatar :global(img) {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .cp-emp-info {
          min-width: 0;
        }
        .cp-emp-name {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 14.5px;
          color: var(--fg-strong, #22252a);
        }
        .cp-emp-handle {
          display: block;
          font-size: 13px;
          color: var(--accent-hover, #8a7fe3);
          font-weight: 600;
        }
        /* ── Responsive: una sola columna en mobile ── */
        @media (max-width: 991px) {
          .cp-grid {
            grid-template-columns: 1fr;
            gap: 0;
          }
          .cp-company-card {
            max-width: 340px;
            margin-left: auto;
            margin-right: auto;
            margin-bottom: 26px;
          }
        }
      `}</style>
    </>
  );
};

export default CompanyProfileMain;
