"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProfileBreadCamb from '@/components/Creator-Profile/ProfileBreadCamb';
import PublicationCard from '@/components/publications/PublicationCard';
import { useCompanyProfile } from '@/hooks/api/useCompanyProfile';
import { useCompanyPublications } from '@/hooks/api/useCompanyPublications';
import { getBackendUrl } from '@/utils/backendUrl';
import type { PublicationListItem, CompanyProfileEmployee } from '@/types/api';
import coverImg from '../../../public/assets/img/profile/profile-cover/profile-cover-big-1.jpg';

type TabKey = 'publicaciones' | 'empleados';

const fmtCount = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
};

const fmtJoinDate = (iso: string | null): string | null => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('es-GT', { month: 'long', year: 'numeric' });
};

const toInt = (v: number | string | null | undefined): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const CompanyProfileMain = ({ id }: { id: string }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('publicaciones');
  const profileQuery = useCompanyProfile(id);
  const pubsQuery = useCompanyPublications(id);
  const data = profileQuery.data;
  const company = data?.company;
  const employees = data?.employees ?? [];
  const publications = pubsQuery.data ?? [];

  const tradeName = company?.tradename || 'Empresa';
  const logoUrl = company?.logo ? getBackendUrl(company.logo) : null;
  const joinDate = fmtJoinDate(company?.joindate ?? null);

  return (
    <>
      <ProfileBreadCamb singleCreator={{ name: tradeName }} />

      <section className="creator-details-area company-profile pt-0 pb-90">
        <div className="creator-cover-img creator-details-cover-img pos-rel wow fadeInUp">
          <Image src={coverImg} alt="cover" />
        </div>

        <div className="container">
          {profileQuery.isLoading && <div className="alert alert-info mt-30">Cargando empresa…</div>}
          {profileQuery.isError && (
            <div className="alert alert-danger mt-30">No se pudo cargar el perfil de la empresa.</div>
          )}

          {company && (
            <div className="row">
              {/* Tarjeta de la empresa */}
              <div className="col-xl-3 col-lg-6 col-md-8">
                <div className="creator-about mb-40 wow fadeInUp">
                  <div className="profile-img pos-rel">
                    {logoUrl ? (
                      <Image
                        src={logoUrl}
                        alt={tradeName}
                        width={300}
                        height={300}
                        sizes="300px"
                        quality={90}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span className="profile-initials" aria-hidden>
                        {tradeName[0]?.toUpperCase() ?? 'E'}
                      </span>
                    )}
                  </div>

                  <h4 className="artist-name pos-rel">
                    {tradeName}
                    {company.verified && (
                      <span className="cp-gold-check" title="Empresa verificada">
                        <i className="fas fa-check" />
                      </span>
                    )}
                  </h4>

                  {company.name && <div className="artist-id">{company.name}</div>}

                  {company.verified && (
                    <div className="cp-badge-wrap">
                      <span className="cp-badge">
                        <i className="fas fa-check-circle" /> Empresa verificada
                      </span>
                    </div>
                  )}

                  {(company.address || joinDate) && (
                    <ul className="profile-detail-list">
                      {company.address && (
                        <li>
                          <i className="fas fa-map-marker-alt" />
                          {company.address}
                        </li>
                      )}
                      {joinDate && (
                        <li>
                          <i className="flaticon-calendar" />
                          Desde {joinDate}
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </div>

              {/* Stats + tabs (Publicaciones / Empleados) */}
              <div className="col-xl-9">
                <div className="creator-info-bar mb-30 wow fadeInUp">
                  <div className="artist-meta-info creator-details-meta-info">
                    <div className="artist-meta-item artist-meta-item-border">
                      <div className="artist-meta-type">Empleados</div>
                      <div className="artist-created">{fmtCount(toInt(company.membercount))}</div>
                    </div>
                    <div className="artist-meta-item">
                      <div className="artist-meta-type">Publicaciones</div>
                      <div className="artist-likes">{fmtCount(toInt(company.totalpublis))}</div>
                    </div>
                  </div>
                </div>

                <div className="creator-info-tab wow fadeInUp">
                  <div className="creator-info-tab-nav mb-30">
                    <nav>
                      <div className="nav nav-tabs" role="tablist">
                        <button
                          className={`nav-link ${activeTab === 'publicaciones' ? 'active' : ''}`}
                          type="button"
                          role="tab"
                          onClick={() => setActiveTab('publicaciones')}
                        >
                          <span className="profile-nav-button">
                            <span className="artist-meta-item artist-meta-item-border">
                              <span className="artist-meta-type">Publicaciones</span>
                              <span className="artist-created">{fmtCount(toInt(company.totalpublis))}</span>
                            </span>
                          </span>
                        </button>
                        <button
                          className={`nav-link ${activeTab === 'empleados' ? 'active' : ''}`}
                          type="button"
                          role="tab"
                          onClick={() => setActiveTab('empleados')}
                        >
                          <span className="profile-nav-button">
                            <span className="artist-meta-item">
                              <span className="artist-meta-type">Empleados</span>
                              <span className="artist-created">{fmtCount(toInt(company.membercount))}</span>
                            </span>
                          </span>
                        </button>
                      </div>
                    </nav>
                  </div>

                  <div className="creator-info-tab-contents mb-30">
                    {/* ── Tab Publicaciones: las de todos los empleados ── */}
                    {activeTab === 'publicaciones' && (
                      <div className="created-items-wrapper">
                        {pubsQuery.isLoading && <p style={{ opacity: 0.6 }}>Cargando publicaciones…</p>}
                        {!pubsQuery.isLoading && publications.length === 0 && (
                          <div className="profile-empty">
                            <i className="fal fa-folder-open" />
                            <p>Esta empresa todavía no tiene publicaciones activas.</p>
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
                      <div className="cp-employees">
                        {!company.showemployees ? (
                          <p className="cp-emp-note">Esta empresa no muestra a sus empleados.</p>
                        ) : employees.length === 0 ? (
                          <p className="cp-emp-note">Aún no hay empleados para mostrar.</p>
                        ) : (
                          <div className="cp-emp-grid">
                            {employees.map((e: CompanyProfileEmployee) => {
                              const name = `${e.firstname ?? ''} ${e.lastname ?? ''}`.trim() || 'Usuario';
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
            </div>
          )}
        </div>
      </section>

      <style jsx>{`
        /* La tarjeta centra su contenido (igual que el perfil personal). */
        .company-profile :global(.creator-about) {
          text-align: center;
        }
        /* Logo CUADRADO centrado con anillo dorado (no circular). El avatar
           personal usa inline-block para centrarse sin pelear contra el
           longhand margin-left:-10px del template; aquí aplica lo mismo. */
        .company-profile :global(.profile-img) {
          display: inline-block;
          width: 200px;
          height: 200px;
          max-width: 100%;
          padding: 4px;
          margin: -100px 0 20px;
          border-radius: 16px;
          overflow: hidden;
          background: linear-gradient(135deg, #d4af37, #f1c75b);
        }
        .company-profile :global(.profile-img img) {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 12px;
          border: 3px solid #fff;
        }
        .company-profile :global(.artist-name) {
          display: block;
          width: 100%;
          text-align: center;
          margin-bottom: 6px;
        }
        .company-profile :global(.artist-id) {
          text-align: center;
          margin-bottom: 12px;
        }
        .company-profile :global(.profile-detail-list) {
          display: inline-block;
          text-align: left;
          margin-top: 16px;
        }
        .company-profile :global(.profile-initials) {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          font-size: 80px;
          font-weight: 700;
          color: #fff;
          background: linear-gradient(135deg, #d4af37, #f1c75b);
          border-radius: 12px;
        }
        .cp-gold-check {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          margin-left: 8px;
          border-radius: 50%;
          background: #d4af37;
          color: #fff;
          font-size: 12px;
          vertical-align: middle;
        }
        /* Badge en su propia línea (antes quedaba al lado de la fecha). */
        .cp-badge-wrap {
          text-align: center;
          margin: 8px 0 4px;
        }
        .cp-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 14px;
          border-radius: 20px;
          background: rgba(212, 175, 55, 0.12);
          color: var(--clr-common-heading);
          font-weight: 600;
          font-size: 13px;
        }
        .cp-badge i {
          color: #d4af37;
        }
        /* Stats: juntar Empleados / Publicaciones (el template las separa con
           espacio amplio pensado para 5 columnas; aquí solo hay 2). */
        .company-profile :global(.creator-details-meta-info) {
          justify-content: flex-start;
          gap: 48px;
        }
        /* Tabs (Publicaciones / Empleados): juntar las pestañas y dar aire. */
        .creator-info-tab :global(.creator-info-tab-nav .nav-tabs) {
          justify-content: flex-start;
          gap: 36px;
        }
        .creator-info-tab :global(.creator-info-tab-nav .artist-meta-type) {
          margin-right: 7px;
        }
        /* Estado vacío de publicaciones. */
        .creator-info-tab :global(.profile-empty) {
          padding: 50px 20px;
          text-align: center;
          opacity: 0.6;
        }
        .creator-info-tab :global(.profile-empty i) {
          font-size: 36px;
          display: block;
          margin-bottom: 14px;
          color: var(--clr-theme-1, #6c5ce7);
        }
        .cp-employees {
          background: var(--clr-bg-white);
          border: 1px solid var(--clr-common-border);
          border-radius: 16px;
          padding: 26px 24px;
        }
        .cp-emp-title {
          font-size: 20px;
          margin-bottom: 18px;
        }
        .cp-emp-note {
          color: var(--clr-common-body-text);
        }
        .cp-emp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 14px;
        }
        .cp-emp-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border: 1px solid var(--clr-common-border);
          border-radius: 12px;
          text-decoration: none;
          transition: 0.3s;
        }
        .cp-emp-card:hover {
          border-color: #d4af37;
          transform: translateY(-2px);
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
          background: linear-gradient(135deg, #6c5ce7, #a29bfe);
          color: #fff;
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
          font-weight: 600;
          color: var(--clr-common-heading);
        }
        .cp-emp-admin {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 12px;
          background: var(--clr-theme-1);
          color: #fff;
        }
        .cp-emp-handle {
          display: block;
          font-size: 13px;
          color: var(--clr-common-body-text);
        }
      `}</style>
    </>
  );
};

export default CompanyProfileMain;
