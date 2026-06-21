"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import Breadcrumbs from '@/utils/Breadcrumbs';
import { useAuth } from '@/utils/AuthContext';
import { toast } from 'react-toastify';
import { useCompany, useUpdateCompany } from '@/hooks/api/useCompany';
import { uploadImage } from '@/utils/uploadImage';
import { getBackendUrl } from '@/utils/backendUrl';
import { ApiError } from '@/utils/Api';
import ImageCropperModal from '@/components/common/ImageCropperModal';

const CompanyMain = () => {
  const t = useTranslations('profile');
  const { user } = useAuth();
  const companyQuery = useCompany();
  const company = companyQuery.data;
  const updateCompany = useUpdateCompany();

  const isAdmin = Boolean(user?.isAdmin);

  const [form, setForm] = useState({ bname: '', btname: '', baddress: '', bphone: '' });
  const [showEmployees, setShowEmployees] = useState(false);
  const [logoPath, setLogoPath] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoCropSrc, setLogoCropSrc] = useState<string | null>(null);
  useEffect(() => {
    if (company) {
      setForm({
        bname: company.name ?? '',
        btname: company.tradeName ?? '',
        baddress: company.address ?? '',
        bphone: company.phone ?? '',
      });
      setShowEmployees(Boolean(company.showEmployees));
      setLogoPath(company.logo ?? '');
    }
  }, [company]);

  const handleLogoPick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error(t('companySettings.imageRequired'));
      return;
    }
    setLogoCropSrc(URL.createObjectURL(file));
  };

  const closeLogoCropper = () => {
    if (logoCropSrc) URL.revokeObjectURL(logoCropSrc);
    setLogoCropSrc(null);
  };

  const handleLogoCropped = async (file: File) => {
    setLogoUploading(true);
    try {
      const path = await uploadImage(file, 'card');
      setLogoPath(path);
      toast.info(t('companySettings.logoReady'));
      closeLogoCropper();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : t('companySettings.logoError'));
    } finally {
      setLogoUploading(false);
    }
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !isAdmin) return;
    updateCompany.mutate({
      busid: company.busid,
      bname: form.bname,
      btname: form.btname,
      baddress: form.baddress,
      bphone: form.bphone,
      busimg: logoPath || '',
      showEmployees,
    });
  };

  return (
    <>
      <Breadcrumbs breadcrumbTitle={t('companySettings.breadcrumbTitle')} breadcrumbSubTitle={t('companySettings.breadcrumbSubtitle')} />

      <section className="company-area pt-50 pb-80">
        <div className="container">
          {!user && (
            <div className="cm-info-note">
              {t('companySettings.loginPrefix')} <Link href="/login?from=/company">{t('companySettings.loginLink')}</Link> {t('companySettings.loginSuffix')}
            </div>
          )}

          {user && companyQuery.isLoading && (
            <div className="cm-state-msg">{t('company.loading')}</div>
          )}

          {user && companyQuery.isError && (
            <div className="cm-empty kq-card">
              <h3>{t('companySettings.noCompanyTitle')}</h3>
              <p>
                {t('companySettings.noCompanyText')}
              </p>
              <Link href="/pricing-plan" className="kq-btn kq-btn--action">{t('companySettings.viewPlans')}</Link>
            </div>
          )}

          {user && company && (
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="cm-card kq-card">
                  <div className="cm-head">
                    <h3 className="cm-title">{t('companySettings.title')}</h3>
                    {isAdmin && (
                      <Link href="/company/equipo" className="cm-link">
                        <i className="fal fa-users" /> {t('companySettings.manageTeam')}
                      </Link>
                    )}
                  </div>

                  {!isAdmin && (
                    <p className="cm-note">
                      {t('companySettings.adminOnly')}
                    </p>
                  )}

                  <form onSubmit={handleSaveCompany}>
                    <label className="cm-label">{t('companySettings.logo')}</label>
                    <div className="cm-logo-row">
                      <span className="cm-logo-frame">
                        <span className="cm-logo">
                          {logoPath ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={getBackendUrl(logoPath)} alt="logo" />
                          ) : (
                            (form.btname?.[0] ?? 'E').toUpperCase()
                          )}
                        </span>
                      </span>
                      {isAdmin && (
                        <label className="cm-btn-file kq-btn kq-btn--outline kq-btn--sm">
                          {logoUploading ? t('companySettings.uploading') : t('companySettings.changeLogo')}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoPick}
                            disabled={logoUploading}
                            style={{ display: 'none' }}
                          />
                        </label>
                      )}
                    </div>

                    <label className="cm-label">{t('companySettings.legalName')}</label>
                    <input
                      className="cm-input kq-input"
                      value={form.bname}
                      onChange={(e) => setForm({ ...form, bname: e.target.value })}
                      disabled={!isAdmin}
                      required
                    />
                    <label className="cm-label">{t('companySettings.tradeName')}</label>
                    <input
                      className="cm-input kq-input"
                      value={form.btname}
                      onChange={(e) => setForm({ ...form, btname: e.target.value })}
                      disabled={!isAdmin}
                      required
                    />
                    <label className="cm-label">{t('companySettings.address')}</label>
                    <input
                      className="cm-input kq-input"
                      value={form.baddress}
                      onChange={(e) => setForm({ ...form, baddress: e.target.value })}
                      disabled={!isAdmin}
                    />
                    <label className="cm-label">{t('companySettings.phone')}</label>
                    <input
                      className="cm-input kq-input"
                      value={form.bphone}
                      onChange={(e) => setForm({ ...form, bphone: e.target.value })}
                      disabled={!isAdmin}
                    />

                    <label className="cm-check">
                      <input
                        type="checkbox"
                        checked={showEmployees}
                        onChange={(e) => setShowEmployees(e.target.checked)}
                        disabled={!isAdmin}
                      />
                      <span>{t('companySettings.showEmployees')}</span>
                    </label>

                    {isAdmin && (
                      <button
                        type="submit"
                        className="cm-save kq-btn kq-btn--action mt-20"
                        disabled={updateCompany.isPending}
                      >
                        {updateCompany.isPending ? t('companySettings.saving') : t('companySettings.save')}
                      </button>
                    )}
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {logoCropSrc && (
        <ImageCropperModal
          imageSrc={logoCropSrc}
          aspect={1}
          cropShape="rect"
          title={t('companySettings.cropLogo')}
          busy={logoUploading}
          onCancel={closeLogoCropper}
          onConfirm={handleLogoCropped}
        />
      )}

      <style jsx>{`
        /* Estado de carga (texto centrado) y nota informativa de login. */
        .cm-state-msg {
          text-align: center;
          padding: 40px 0 0;
          color: var(--fg-muted, #5c616a);
        }
        .cm-info-note {
          background: var(--accent-soft);
          border: 1px solid var(--border, #e6ddcf);
          border-radius: var(--r-md, 12px);
          padding: 14px 18px;
          color: var(--fg-strong, #22252a);
          font-size: 14px;
        }
        .cm-info-note :global(a) {
          color: var(--accent-hover, #8a7fe3);
          font-weight: 600;
          text-decoration: none;
        }
        /* La superficie/borde/radio/sombra los aporta .kq-card; aquí solo el aire. */
        .cm-card {
          padding: 30px 28px;
        }
        .cm-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
          flex-wrap: wrap;
          gap: 10px;
        }
        .cm-title {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 22px;
          color: var(--fg-strong, #22252a);
          margin: 0;
        }
        .cm-link {
          font-weight: 600;
          color: var(--accent-hover, #8a7fe3);
          text-decoration: none;
        }
        .cm-link i {
          margin-right: 6px;
        }
        .cm-note {
          color: var(--fg-muted, #5c616a);
          font-size: 14px;
          margin-bottom: 14px;
        }
        .cm-label {
          display: block;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 14px;
          margin: 14px 0 6px;
          color: var(--fg-strong, #22252a);
        }
        /* Anchura/altura/estado disabled; el resto del estilo lo aporta .kq-input. */
        .cm-input {
          width: 100%;
        }
        .cm-input:disabled {
          opacity: 0.6;
          background: var(--surface-sunk, #f1ebe0);
        }
        .cm-check {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 20px 0 4px;
          font-weight: 500;
          color: var(--fg-strong, #22252a);
          cursor: pointer;
        }
        .cm-check input {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
          accent-color: var(--accent, #b5acef);
        }
        .cm-logo-row {
          display: flex;
          align-items: center;
          gap: 18px;
          margin-bottom: 6px;
        }
        /* Marco BLANCO del logo: mantiene visible un logo navy sobre la tarjeta. */
        .cm-logo-frame {
          width: 90px;
          height: 90px;
          padding: 5px;
          flex-shrink: 0;
          background: var(--surface, #fff);
          border-radius: var(--r-lg, 16px);
          box-shadow: var(--shadow-sm);
        }
        .cm-logo {
          width: 100%;
          height: 100%;
          border-radius: var(--r-md, 12px);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--lav-500, #b5acef), var(--navy-800, #1e2d4a));
          color: var(--cream, #f8f4ee);
          font-family: var(--font-display);
          font-size: 32px;
          font-weight: 700;
        }
        .cm-logo :global(img) {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        /* El botón cambiar-logo usa .kq-btn; solo neutralizamos el margen de label. */
        .cm-btn-file {
          margin: 0;
        }
        .cm-empty {
          text-align: center;
          padding: 48px 28px;
        }
        .cm-empty h3 {
          font-family: var(--font-display);
          color: var(--fg-strong, #22252a);
          margin-bottom: 12px;
        }
        .cm-empty p {
          color: var(--fg-muted, #5c616a);
          max-width: 520px;
          margin: 0 auto 24px;
        }
      `}</style>
    </>
  );
};

export default CompanyMain;
