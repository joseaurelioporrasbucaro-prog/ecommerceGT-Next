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

      <section className="company-area">
        {!user && (
          <div className="cm-shell">
            <div className="cm-info-note">
              {t('companySettings.loginPrefix')} <Link href="/login?from=/company">{t('companySettings.loginLink')}</Link> {t('companySettings.loginSuffix')}
            </div>
          </div>
        )}

        {user && companyQuery.isLoading && (
          <div className="cm-shell">
            <div className="cm-state-msg">{t('company.loading')}</div>
          </div>
        )}

        {user && companyQuery.isError && (
          <div className="cm-shell">
            <div className="cm-empty">
              <span className="cm-empty-icon" aria-hidden>
                <i className="fas fa-building" />
              </span>
              <h3>{t('companySettings.noCompanyTitle')}</h3>
              <p>{t('companySettings.noCompanyText')}</p>
              <Link href="/pricing-plan" className="kq-btn kq-btn--action kq-btn--lg cm-empty-cta">
                <i className="fas fa-gem" /> {t('companySettings.viewPlans')}
              </Link>
            </div>
          </div>
        )}

        {user && company && (
          <>
            {/* Portada navy -> lavanda (misma identidad del perfil publico). */}
            <div className="cm-cover" aria-hidden />

            <div className="cm-container">
              {/* Encabezado: foto enmarcada en blanco superpuesta a la portada. */}
              <div className="cm-header">
                <div className="cm-photo-frame">
                  <span className="cm-photo">
                    {logoPath ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={getBackendUrl(logoPath)} alt={form.btname || t('companySettings.logo')} />
                    ) : (
                      <i className="fas fa-building" aria-hidden />
                    )}
                  </span>
                  {isAdmin && (
                    <label
                      className="cm-photo-cam"
                      title={logoUploading ? t('companySettings.uploading') : t('companySettings.changeLogo')}
                    >
                      <i className="fas fa-camera" aria-hidden />
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
                <div className="cm-header-text">
                  <div className="cm-header-name">
                    <h1>{form.btname || t('companySettings.title')}</h1>
                    {/* Sin check de verificado: useCompany (tipo Company) no expone `verified`
                        — el dato vive en useCompanyProfile (perfil público), no acá. No se
                        renderiza un check incondicional para no afirmar verificación falsa. */}
                  </div>
                  {form.bname && <div className="cm-header-legal">{form.bname}</div>}
                </div>
              </div>

              {/* Tarjeta "Datos de la empresa". */}
              <div className="cm-card kq-card">
                <div className="cm-head">
                  <h3 className="cm-title">{t('companySettings.title')}</h3>
                  {isAdmin && (
                    <Link href="/company/equipo" className="cm-link">
                      <i className="fas fa-users" /> {t('companySettings.manageTeam')}
                    </Link>
                  )}
                </div>

                {!isAdmin && (
                  <div className="cm-banner">
                    <i className="fas fa-lock" aria-hidden /> {t('companySettings.adminOnly')}
                  </div>
                )}

                <form onSubmit={handleSaveCompany}>
                  <div className="cm-grid">
                    <div className="cm-grid-full">
                      <label className="cm-label">{t('companySettings.logo')}</label>
                      <div className="cm-logo-row">
                        <span className="cm-logo">
                          {logoPath ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={getBackendUrl(logoPath)} alt="logo" />
                          ) : (
                            <i className="fas fa-building" aria-hidden />
                          )}
                        </span>
                        {isAdmin && (
                          <label className="cm-btn-file kq-btn kq-btn--outline kq-btn--sm">
                            <i className="fas fa-upload" aria-hidden /> {logoUploading ? t('companySettings.uploading') : t('companySettings.changeLogo')}
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
                    </div>

                    <div className="cm-field">
                      <label className="cm-label">{t('companySettings.legalName')}</label>
                      <input
                        className="cm-input kq-input"
                        value={form.bname}
                        onChange={(e) => setForm({ ...form, bname: e.target.value })}
                        disabled={!isAdmin}
                        required
                      />
                    </div>
                    <div className="cm-field">
                      <label className="cm-label">{t('companySettings.tradeName')}</label>
                      <input
                        className="cm-input kq-input"
                        value={form.btname}
                        onChange={(e) => setForm({ ...form, btname: e.target.value })}
                        disabled={!isAdmin}
                        required
                      />
                    </div>
                    <div className="cm-field">
                      <label className="cm-label">{t('companySettings.address')}</label>
                      <input
                        className="cm-input kq-input"
                        value={form.baddress}
                        onChange={(e) => setForm({ ...form, baddress: e.target.value })}
                        disabled={!isAdmin}
                      />
                    </div>
                    <div className="cm-field">
                      <label className="cm-label">{t('companySettings.phone')}</label>
                      <input
                        className="cm-input kq-input"
                        value={form.bphone}
                        onChange={(e) => setForm({ ...form, bphone: e.target.value })}
                        disabled={!isAdmin}
                      />
                    </div>
                  </div>

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
                      className="cm-save kq-btn kq-btn--action"
                      disabled={updateCompany.isPending}
                    >
                      {updateCompany.isPending ? t('companySettings.saving') : t('companySettings.save')}
                    </button>
                  )}
                </form>
              </div>
            </div>
          </>
        )}
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
        /* ── Shell para estados sin empresa (login / cargando / vacío) ── */
        .cm-shell {
          max-width: 860px;
          margin: 0 auto;
          padding: 40px 28px 64px;
        }
        .cm-state-msg {
          text-align: center;
          color: var(--fg-muted);
        }
        /* Nota informativa de login (reusa el patrón de alerta existente). */
        .cm-info-note {
          background: var(--accent-soft);
          border: 1px solid var(--border);
          border-radius: var(--r-md);
          padding: 14px 18px;
          color: var(--fg-strong);
          font: var(--text-body-sm);
        }
        .cm-info-note :global(a) {
          color: var(--lav-700);
          font-weight: 600;
          text-decoration: none;
        }
        /* ── Estado vacío: sin empresa (isError) ── */
        .cm-empty {
          text-align: center;
          padding: 40px 8px;
        }
        .cm-empty-icon {
          width: 88px;
          height: 88px;
          border-radius: var(--r-pill);
          margin: 0 auto 20px;
          background: var(--accent-soft);
          color: var(--lav-700);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
        }
        .cm-empty h3 {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 28px;
          color: var(--fg-strong);
          margin: 0 0 10px;
        }
        .cm-empty p {
          font: var(--text-body);
          color: var(--fg-muted);
          max-width: 420px;
          margin: 0 auto 26px;
        }
        .cm-empty :global(.cm-empty-cta) {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        /* ── Portada navy → lavanda (misma identidad del perfil público) ── */
        .cm-cover {
          height: 200px;
          background:
            radial-gradient(circle at 80% 20%, rgba(181, 172, 239, 0.3), transparent 55%),
            linear-gradient(120deg, var(--navy-700, #283a5c), var(--navy-800, #1e2d4a) 55%, #45407e);
        }
        .cm-container {
          max-width: 860px;
          margin: 0 auto;
          padding: 0 28px 64px;
        }

        /* ── Encabezado: foto enmarcada que se monta sobre la portada ── */
        .cm-header {
          display: flex;
          align-items: flex-end;
          gap: 22px;
          margin-top: -58px;
          margin-bottom: 18px;
        }
        /* Marco BLANCO del logo: un logo navy queda visible sobre la portada navy.
           overflow visible para que el badge de cámara sobresalga del marco. */
        .cm-photo-frame {
          position: relative;
          width: 140px;
          height: 140px;
          flex-shrink: 0;
          padding: 6px;
          background: var(--surface);
          border-radius: var(--r-lg);
          box-shadow: var(--shadow-sm);
          overflow: visible;
        }
        .cm-photo {
          width: 100%;
          height: 100%;
          border-radius: var(--r-md);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--lav-500, #b5acef), var(--navy-800, #1e2d4a));
          color: var(--cream, #f8f4ee);
          font-size: 44px;
        }
        .cm-photo :global(img) {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        /* Badge de cámara verde para abrir el cropper. */
        .cm-photo-cam {
          position: absolute;
          right: -6px;
          bottom: -6px;
          width: 38px;
          height: 38px;
          border-radius: var(--r-pill);
          background: var(--green-500);
          color: var(--navy-900);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: 3px solid var(--surface);
          font-size: 14px;
          margin: 0;
        }
        .cm-header-text {
          padding-bottom: 8px;
          min-width: 0;
        }
        .cm-header-name {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .cm-header-name h1 {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 26px;
          color: var(--fg-strong);
          margin: 0;
        }
        .cm-verified {
          color: var(--green-600);
          font-size: 15px;
        }
        .cm-header-legal {
          font: var(--text-body-sm);
          color: var(--fg-muted);
        }

        /* ── Tarjeta "Datos de la empresa" (.kq-card aporta superficie/borde/radio/sombra) ── */
        .cm-card {
          padding: 28px;
        }
        .cm-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 6px;
        }
        .cm-title {
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 20px;
          color: var(--fg-strong);
          margin: 0;
        }
        .cm-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font: var(--text-label);
          color: var(--lav-700);
          text-decoration: none;
        }
        /* Banner solo-lectura (no-admin) en --warning-bg, texto #9a5a12. */
        .cm-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 15px;
          margin-top: 14px;
          border-radius: var(--r-md);
          background: var(--warning-bg);
          color: #9a5a12;
          font: var(--text-body-sm);
        }
        /* Form: 2 columnas en desktop. */
        .cm-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0 18px;
        }
        .cm-grid-full {
          grid-column: 1 / -1;
        }
        .cm-label {
          display: block;
          font: var(--text-label);
          color: var(--fg-strong);
          margin: 16px 0 7px;
        }
        /* Anchura/altura/disabled; el resto lo aporta .kq-input. */
        .cm-input {
          width: 100%;
          height: 50px;
        }
        .cm-input:disabled {
          opacity: 0.6;
          background: var(--surface-sunk);
        }
        /* ── Logo dentro del form (placeholder lavanda → navy) ── */
        .cm-logo-row {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .cm-logo {
          width: 64px;
          height: 64px;
          flex-shrink: 0;
          border-radius: var(--r-md);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--lav-500, #b5acef), var(--navy-800, #1e2d4a));
          color: #fff;
          font-size: 24px;
        }
        .cm-logo :global(img) {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        /* El botón cambiar-logo usa .kq-btn; neutralizamos el margen de label. */
        .cm-btn-file {
          margin: 0;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        /* ── Checkbox "Mostrar empleados" (accent-color lav-600) ── */
        .cm-check {
          display: flex;
          align-items: center;
          gap: 11px;
          margin: 20px 0 0;
          font: var(--text-body-sm);
          color: var(--fg);
          cursor: pointer;
        }
        .cm-check input {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
          accent-color: var(--lav-600);
        }
        .cm-save {
          margin-top: 24px;
        }

        /* ── Responsive mobile (≤480px) ── */
        @media (max-width: 480px) {
          .cm-cover {
            height: 120px;
          }
          .cm-container {
            padding: 0 18px 40px;
          }
          /* Foto centrada sobre la franja. */
          .cm-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 12px;
            margin-top: -52px;
          }
          .cm-photo-frame {
            width: 104px;
            height: 104px;
            padding: 5px;
          }
          .cm-photo {
            font-size: 36px;
          }
          .cm-photo-cam {
            right: -4px;
            bottom: -4px;
            width: 34px;
            height: 34px;
            font-size: 13px;
          }
          .cm-header-text {
            padding-bottom: 0;
          }
          .cm-header-name {
            justify-content: center;
          }
          .cm-header-name h1 {
            font-size: 20px;
          }
          .cm-card {
            padding: 20px;
          }
          /* Link "Gestionar equipo" como botón full-width. */
          .cm-head {
            flex-direction: column;
            align-items: stretch;
          }
          .cm-link {
            justify-content: center;
            padding: 12px;
            border-radius: var(--r-md);
            background: var(--accent-soft);
          }
          /* Form a una sola columna. */
          .cm-grid {
            grid-template-columns: 1fr;
          }
          .cm-check {
            align-items: flex-start;
          }
          .cm-check input {
            margin-top: 2px;
          }
          /* Guardar full-width. */
          .cm-save {
            width: 100%;
            justify-content: center;
          }
        }
        /* A partir de ~720px vuelve a 2 columnas (regla general del handoff §3). */
      `}</style>
    </>
  );
};

export default CompanyMain;
