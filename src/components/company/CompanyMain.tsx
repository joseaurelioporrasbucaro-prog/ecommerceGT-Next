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
            <div className="alert alert-info">
              {t('companySettings.loginPrefix')} <Link href="/login?from=/company">{t('companySettings.loginLink')}</Link> {t('companySettings.loginSuffix')}
            </div>
          )}

          {user && companyQuery.isLoading && (
            <div className="text-center pt-40">{t('company.loading')}</div>
          )}

          {user && companyQuery.isError && (
            <div className="cm-empty">
              <h3>{t('companySettings.noCompanyTitle')}</h3>
              <p>
                {t('companySettings.noCompanyText')}
              </p>
              <Link href="/pricing-plan" className="cm-btn">{t('companySettings.viewPlans')}</Link>
            </div>
          )}

          {user && company && (
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="cm-card">
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
                      <span className="cm-logo">
                        {logoPath ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={getBackendUrl(logoPath)} alt="logo" />
                        ) : (
                          (form.btname?.[0] ?? 'E').toUpperCase()
                        )}
                      </span>
                      {isAdmin && (
                        <label className="cm-btn cm-btn-file">
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
                      className="cm-input"
                      value={form.bname}
                      onChange={(e) => setForm({ ...form, bname: e.target.value })}
                      disabled={!isAdmin}
                      required
                    />
                    <label className="cm-label">{t('companySettings.tradeName')}</label>
                    <input
                      className="cm-input"
                      value={form.btname}
                      onChange={(e) => setForm({ ...form, btname: e.target.value })}
                      disabled={!isAdmin}
                      required
                    />
                    <label className="cm-label">{t('companySettings.address')}</label>
                    <input
                      className="cm-input"
                      value={form.baddress}
                      onChange={(e) => setForm({ ...form, baddress: e.target.value })}
                      disabled={!isAdmin}
                    />
                    <label className="cm-label">{t('companySettings.phone')}</label>
                    <input
                      className="cm-input"
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
                        className="cm-btn mt-20"
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
        .cm-card {
          background: var(--clr-bg-white);
          border: 1px solid var(--clr-common-border);
          border-radius: 16px;
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
          font-size: 22px;
          margin: 0;
        }
        .cm-link {
          font-weight: 600;
          color: var(--clr-theme-1);
          text-decoration: none;
        }
        .cm-link i {
          margin-right: 6px;
        }
        .cm-note {
          color: var(--clr-common-body-text);
          font-size: 14px;
          margin-bottom: 14px;
        }
        .cm-label {
          display: block;
          font-weight: 600;
          font-size: 14px;
          margin: 14px 0 6px;
          color: var(--clr-common-heading);
        }
        .cm-input {
          width: 100%;
          height: 48px;
          border: 1px solid var(--clr-common-border);
          border-radius: 10px;
          padding: 0 16px;
          background: var(--clr-bg-white);
          color: var(--clr-common-heading);
        }
        .cm-input:disabled {
          opacity: 0.7;
        }
        .cm-check {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 20px 0 4px;
          font-weight: 500;
          color: var(--clr-common-heading);
          cursor: pointer;
        }
        .cm-check input {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }
        .cm-logo-row {
          display: flex;
          align-items: center;
          gap: 18px;
          margin-bottom: 6px;
        }
        .cm-logo {
          width: 90px;
          height: 90px;
          border-radius: 12px;
          overflow: hidden;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #d4af37, #f1c75b);
          color: #fff;
          font-size: 34px;
          font-weight: 700;
        }
        .cm-logo :global(img) {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .cm-btn-file {
          cursor: pointer;
          margin: 0;
        }
        .cm-btn {
          display: inline-block;
          padding: 11px 26px;
          border-radius: 30px;
          background: var(--clr-theme-1);
          color: #fff !important;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: 0.3s;
          text-decoration: none;
        }
        .cm-btn:hover:not(:disabled) {
          opacity: 0.9;
        }
        .cm-btn:disabled {
          opacity: 0.6;
          cursor: default;
        }
        .cm-empty {
          text-align: center;
          padding: 60px 0;
        }
        .cm-empty h3 {
          margin-bottom: 12px;
        }
        .cm-empty p {
          color: var(--clr-common-body-text);
          max-width: 520px;
          margin: 0 auto 24px;
        }
      `}</style>
    </>
  );
};

export default CompanyMain;
