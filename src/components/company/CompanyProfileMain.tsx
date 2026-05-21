"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProfileBreadCamb from '@/components/Creator-Profile/ProfileBreadCamb';
import { useCompanyProfile } from '@/hooks/api/useCompanyProfile';
import { getBackendUrl } from '@/utils/backendUrl';
import coverImg from '../../../public/assets/img/profile/profile-cover/profile-cover-big-1.jpg';

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
  const profileQuery = useCompanyProfile(id);
  const data = profileQuery.data;
  const company = data?.company;
  const employees = data?.employees ?? [];

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
                    <span className="cp-gold-check" title="Empresa verificada">
                      <i className="fas fa-check" />
                    </span>
                  </h4>

                  {company.name && <div className="artist-id">{company.name}</div>}

                  <span className="cp-badge">
                    <i className="fas fa-check-circle" /> Empresa verificada
                  </span>

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

              {/* Stats + empleados */}
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

                <div className="cp-employees">
                  <h4 className="cp-emp-title">Empleados</h4>
                  {!company.showemployees ? (
                    <p className="cp-emp-note">Esta empresa no muestra a sus empleados.</p>
                  ) : employees.length === 0 ? (
                    <p className="cp-emp-note">Aún no hay empleados para mostrar.</p>
                  ) : (
                    <div className="cp-emp-grid">
                      {employees.map((e) => {
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
                              <span className="cp-emp-name">
                                {name}
                                {e.isadmin && <span className="cp-emp-admin">Admin</span>}
                              </span>
                              {e.handle && <span className="cp-emp-handle">@{e.handle}</span>}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <style jsx>{`
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
          border-radius: 10px;
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
        .cp-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 8px;
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
