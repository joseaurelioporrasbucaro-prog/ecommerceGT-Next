"use client";
import React, { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';
import ThemeChanger from '@/components/home/ThemeChanger';
import Breadcrumbs from '@/utils/Breadcrumbs';
import StaffShell from '@/components/support/StaffShell';
import { ApiFetch, ApiError } from '@/utils/Api';
import { useAuth } from '@/utils/AuthContext';
import { resolveAssetUrl } from '@/hooks/api/useSiteAssets';
import { useDateFmt } from '@/utils/datetime';

/**
 * Fase 15 — Portal admin de gestión de imágenes (CMS-lite).
 *
 * Solo accesible para `cus_role='admin'`. Lista todos los `site_assets` con
 * preview y un botón "Cambiar" por cada uno. La subida pasa por
 * `/upload-site-asset` (preserva aspect ratio) y luego `/admin/site-assets`
 * actualiza la fila con la URL nueva.
 */

interface SiteAssetRow {
  asset_key: string;
  asset_url: string;
  asset_label: string | null;
  width: number | null;
  height: number | null;
  updated_at: string;
  updated_by_name: string | null;
}

const AdminImagesMain: React.FC = () => {
  const t = useTranslations('admin');
  const dateFmt = useDateFmt();
  const { user } = useAuth();
  const qc = useQueryClient();
  const isAdmin = user?.role === 'admin';

  const listQuery = useQuery({
    queryKey: ['adminSiteAssets'] as const,
    queryFn: () => ApiFetch.get<SiteAssetRow[]>('/admin/site-assets'),
    enabled: isAdmin,
    staleTime: 30_000,
  });

  const updateMut = useMutation({
    mutationFn: (payload: { asset_key: string; asset_url: string; width: number; height: number }) =>
      ApiFetch.post<{ message: string }>('/admin/site-assets', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminSiteAssets'] });
      qc.invalidateQueries({ queryKey: ['siteAssets'] });
    },
  });

  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFile = async (assetKey: string, file: File) => {
    setUploadingKey(assetKey);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('asset_key', assetKey);
      const r = await ApiFetch.post<{ path: string; width: number; height: number }>(
        '/upload-site-asset',
        fd,
      );
      await updateMut.mutateAsync({
        asset_key: assetKey,
        asset_url: r.path,
        width: r.width,
        height: r.height,
      });
      toast.success(t('images.updated', { key: assetKey }));
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : t('images.updateError'));
    } finally {
      setUploadingKey(null);
    }
  };

  if (!isAdmin) {
    return (
      <main>
        <ThemeChanger />
        <Breadcrumbs breadcrumbTitle={t('images.title')} breadcrumbSubTitle={t('common.adminOnly')} />
        <section className="creator-area pb-90" style={{ paddingTop: 40 }}>
          <div className="container">
            <p style={{ padding: '40px 20px', textAlign: 'center', opacity: 0.6 }}>
              <i className="fas fa-lock" /> {t('common.adminOnlyMessage')}
            </p>
          </div>
        </section>
      </main>
    );
  }

  const rows = listQuery.data ?? [];

  return (
    <>
      <ThemeChanger />
      <StaffShell active="images" title={t('images.title')} sub={t('images.subtitle')}>
        <div
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 11, padding: '14px 18px', marginBottom: 22,
            borderRadius: 'var(--r-md)', background: 'var(--accent-soft)', color: 'var(--fg)',
          }}
        >
          <i className="fas fa-circle-info" style={{ color: 'var(--lav-700)', marginTop: 2 }} aria-hidden />
          <span style={{ font: 'var(--text-body-sm)' }}>{t('images.banner')}</span>
        </div>

        {listQuery.isLoading && (
          <p style={{ font: 'var(--text-body-sm)', color: 'var(--fg-subtle)' }}>{t('common.loading')}</p>
        )}
        {rows.length === 0 && !listQuery.isLoading && (
          <p style={{ font: 'var(--text-body-sm)', color: 'var(--fg-subtle)' }}>{t('images.empty')}</p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
          {rows.map((row: SiteAssetRow) => {
            const previewUrl = resolveAssetUrl(row.asset_url);
            const isUploading = uploadingKey === row.asset_key;
            return (
              <div
                key={row.asset_key}
                style={{
                  border: '1px solid var(--border)', borderRadius: 'var(--r-lg)',
                  background: 'var(--surface)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
                  display: 'flex', flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    aspectRatio: '16 / 9', background: 'var(--surface-sunk)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--fg-subtle)', position: 'relative',
                  }}
                >
                  {previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewUrl}
                      alt={row.asset_label ?? row.asset_key}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <i className="fas fa-image" style={{ fontSize: 34 }} aria-hidden />
                      <div style={{ font: 'var(--text-caption)', marginTop: 6 }}>{t('images.noImage')}</div>
                    </div>
                  )}
                </div>
                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 5, flex: 1 }}>
                  <code
                    style={{
                      alignSelf: 'flex-start', font: 'var(--text-caption)', fontFamily: 'var(--font-mono)',
                      color: 'var(--lav-700)', background: 'var(--lav-100)', padding: '2px 8px',
                      borderRadius: 'var(--r-xs)',
                    }}
                  >
                    {row.asset_key}
                  </code>
                  <strong style={{ font: 'var(--text-body-sm)', color: 'var(--fg-strong)', marginTop: 2 }}>
                    {row.asset_label ?? row.asset_key}
                  </strong>
                  <span style={{ font: 'var(--text-caption)', color: 'var(--fg-muted)' }}>
                    {row.width && row.height
                      ? t('images.recommended', { w: row.width, h: row.height })
                      : t('images.noDimensions')}
                  </span>
                  <span style={{ font: 'var(--text-caption)', color: 'var(--fg-subtle)', marginTop: 'auto', paddingTop: 6 }}>
                    {row.updated_by_name
                      ? t('images.updatedBy', {
                          name: row.updated_by_name,
                          date: dateFmt.short(row.updated_at),
                        })
                      : t('images.neverUpdated')}
                  </span>
                </div>
                <div style={{ padding: '0 16px 16px' }}>
                  <input
                    type="file"
                    accept="image/*"
                    ref={(el) => { fileInputs.current[row.asset_key] = el; }}
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFile(row.asset_key, f);
                      e.target.value = ''; // reset
                    }}
                  />
                  <button
                    type="button"
                    className="kq-btn kq-btn--outline kq-btn--sm"
                    style={{ width: '100%', display: 'flex', gap: 8 }}
                    onClick={() => fileInputs.current[row.asset_key]?.click()}
                    disabled={isUploading || updateMut.isPending}
                  >
                    {isUploading ? (
                      <><i className="fas fa-spinner fa-spin" style={{ fontSize: 12 }} /> {t('images.uploading')}</>
                    ) : (
                      <><i className="fas fa-upload" style={{ fontSize: 12 }} /> {t('images.changeImage')}</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </StaffShell>
    </>
  );
};

export default AdminImagesMain;
