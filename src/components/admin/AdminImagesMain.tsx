"use client";
import React, { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import ThemeChanger from '@/components/home/ThemeChanger';
import Breadcrumbs from '@/utils/Breadcrumbs';
import { ApiFetch, ApiError } from '@/utils/Api';
import { useAuth } from '@/utils/AuthContext';
import { resolveAssetUrl } from '@/hooks/api/useSiteAssets';

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
      toast.success(`Imagen "${assetKey}" actualizada.`);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'No se pudo actualizar la imagen.');
    } finally {
      setUploadingKey(null);
    }
  };

  if (!isAdmin) {
    return (
      <main>
        <ThemeChanger />
        <Breadcrumbs breadcrumbTitle="Imágenes del sitio" breadcrumbSubTitle="Solo administradores" />
        <section className="creator-area pb-90" style={{ paddingTop: 40 }}>
          <div className="container">
            <p style={{ padding: '40px 20px', textAlign: 'center', opacity: 0.6 }}>
              <i className="fas fa-lock" /> Esta sección es solo para administradores de la plataforma.
            </p>
          </div>
        </section>
      </main>
    );
  }

  const rows = listQuery.data ?? [];

  return (
    <main>
      <ThemeChanger />
      <Breadcrumbs breadcrumbTitle="Imágenes del sitio" breadcrumbSubTitle="CMS de imágenes user-facing" />

      <section className="creator-area pb-90" style={{ paddingTop: 40 }}>
        <div className="container">
          <div className="ai-intro">
            <h5><i className="fas fa-image" /> Imágenes del sitio</h5>
            <p>
              Cambia las imágenes user-facing (404, hero, banners, logos, etc.) sin redeploy.
              Los cambios se propagan en ~10 minutos a todos los usuarios.
            </p>
          </div>

          {listQuery.isLoading && <p style={{ opacity: 0.6 }}>Cargando…</p>}
          {rows.length === 0 && !listQuery.isLoading && <p style={{ opacity: 0.6 }}>No hay imágenes registradas.</p>}

          <div className="ai-grid">
            {rows.map((row: SiteAssetRow) => {
              const previewUrl = resolveAssetUrl(row.asset_url);
              const isUploading = uploadingKey === row.asset_key;
              return (
                <div key={row.asset_key} className="ai-card">
                  <div className="ai-preview">
                    {previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previewUrl} alt={row.asset_label ?? row.asset_key} />
                    ) : (
                      <div className="ai-preview-empty"><i className="fas fa-image" /></div>
                    )}
                  </div>
                  <div className="ai-info">
                    <code className="ai-key">{row.asset_key}</code>
                    <strong>{row.asset_label ?? row.asset_key}</strong>
                    <span className="ai-dims">
                      {row.width && row.height ? `${row.width}×${row.height}` : 'Sin dimensiones'}
                    </span>
                    {row.updated_by_name && (
                      <span className="ai-meta">
                        Actualizado por {row.updated_by_name} el{' '}
                        {new Date(row.updated_at).toLocaleDateString('es-GT')}
                      </span>
                    )}
                  </div>
                  <div className="ai-actions">
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
                      className="ai-btn"
                      onClick={() => fileInputs.current[row.asset_key]?.click()}
                      disabled={isUploading || updateMut.isPending}
                    >
                      {isUploading ? <><i className="fas fa-spinner fa-spin" /> Subiendo…</> : <><i className="fas fa-upload" /> Cambiar imagen</>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <style jsx>{`
        .ai-intro { border: 1px solid var(--clr-common-border, #e0e2e5); border-radius: 14px; padding: 20px 22px; margin-bottom: 24px; background: rgba(108,92,231,0.04); }
        .ai-intro h5 { display: flex; align-items: center; gap: 9px; margin: 0 0 6px; }
        .ai-intro p { margin: 0; font-size: 14px; opacity: 0.85; }
        .ai-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
        .ai-card { border: 1px solid var(--clr-common-border, #e0e2e5); border-radius: 12px; padding: 14px; background: var(--clr-bg-white, #fff); display: flex; flex-direction: column; gap: 12px; }
        .ai-preview { aspect-ratio: 16/9; background: rgba(128,128,128,0.08); border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center; }
        .ai-preview img { width: 100%; height: 100%; object-fit: contain; }
        .ai-preview-empty { color: rgba(128,128,128,0.4); font-size: 36px; }
        .ai-info { display: flex; flex-direction: column; gap: 3px; }
        .ai-key { font-size: 11px; color: #b91c1c; background: rgba(239,68,68,0.08); padding: 2px 8px; border-radius: 6px; align-self: flex-start; font-family: monospace; }
        .ai-info strong { font-size: 14px; margin-top: 2px; }
        .ai-dims { font-size: 12px; opacity: 0.65; }
        .ai-meta { font-size: 11px; opacity: 0.55; margin-top: 2px; }
        .ai-actions { display: flex; }
        .ai-btn { flex: 1; background: var(--clr-theme-1, #6c5ce7); color: #fff; border: none; padding: 9px 14px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 13px; display: inline-flex; align-items: center; justify-content: center; gap: 7px; }
        .ai-btn:hover:not(:disabled) { opacity: 0.92; }
        .ai-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>
    </main>
  );
};

export default AdminImagesMain;
