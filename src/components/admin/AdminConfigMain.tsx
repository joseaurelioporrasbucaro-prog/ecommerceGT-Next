"use client";
import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';
import ThemeChanger from '@/components/home/ThemeChanger';
import Breadcrumbs from '@/utils/Breadcrumbs';
import { ApiError } from '@/utils/Api';
import { useAuth } from '@/utils/AuthContext';
import { usePricingConfig } from '@/hooks/api/usePricingConfig';
import { useDateFmt } from '@/utils/datetime';
import {
  useUpdatePlatformConfig,
  type UpdatePlatformConfigPayload,
} from '@/hooks/api/useUpdatePlatformConfig';

/**
 * Fase 19.7 — Portal admin de configuración de plataforma.
 *
 * Solo accesible para `cus_role='admin'`. Edita los 3 valores monetarios
 * de `ecom.platform_config` que controlan precios de la pauta sin redeploy.
 *
 * Cada tarjeta tiene input + botón Guardar individual: minimiza riesgo de
 * "guardar todo y un valor estaba mal". El backend valida que sea numérico
 * ≥ 0 y refresca el cache de 60s al recibir el update.
 */

interface ConfigField {
  key: UpdatePlatformConfigPayload['key'];
  labelKey: string;
  descriptionKey: string;
  prefix: string;
  step: number;
  min: number;
}

const FIELDS: ConfigField[] = [
  {
    key: 'ad_impression_cost',
    labelKey: 'config.fields.impression.label',
    descriptionKey: 'config.fields.impression.description',
    prefix: 'Q',
    step: 0.001,
    min: 0,
  },
  {
    key: 'ad_click_cost',
    labelKey: 'config.fields.click.label',
    descriptionKey: 'config.fields.click.description',
    prefix: 'Q',
    step: 0.05,
    min: 0,
  },
  {
    key: 'ad_min_budget',
    labelKey: 'config.fields.minBudget.label',
    descriptionKey: 'config.fields.minBudget.description',
    prefix: 'Q',
    step: 1,
    min: 0,
  },
];

const AdminConfigMain: React.FC = () => {
  const t = useTranslations('admin');
  const dateFmt = useDateFmt();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const current = usePricingConfig();
  const updateMut = useUpdatePlatformConfig();

  // Estado local del form. Se sincroniza con el hook cuando llega data nueva.
  const [draft, setDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    setDraft({
      ad_impression_cost: String(current.adImpressionCost),
      ad_click_cost: String(current.adClickCost),
      ad_min_budget: String(current.adMinBudget),
    });
  }, [current.adImpressionCost, current.adClickCost, current.adMinBudget]);

  // Mapeo key del backend → valor actual del hook tipado.
  const currentByKey: Record<string, number> = {
    ad_impression_cost: current.adImpressionCost,
    ad_click_cost: current.adClickCost,
    ad_min_budget: current.adMinBudget,
  };

  const handleSave = async (field: ConfigField) => {
    const raw = draft[field.key];
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed < field.min) {
      toast.error(t('config.invalidValue', { label: t(field.labelKey) }));
      return;
    }
    try {
      await updateMut.mutateAsync({ key: field.key, value: parsed });
      toast.success(t('config.updated', {
        label: t(field.labelKey),
        value: dateFmt.number(parsed, { minimumFractionDigits: 2, maximumFractionDigits: 4 }),
      }));
    } catch (e) {
      toast.error(
        e instanceof ApiError ? e.message : t('config.saveError'),
      );
    }
  };

  const handleReset = (field: ConfigField) => {
    setDraft((d) => ({ ...d, [field.key]: String(currentByKey[field.key]) }));
  };

  if (!isAdmin) {
    return (
      <main>
        <ThemeChanger />
        <Breadcrumbs breadcrumbTitle={t('config.shortTitle')} breadcrumbSubTitle={t('common.adminOnly')} />
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

  return (
    <main>
      <ThemeChanger />
      <Breadcrumbs
        breadcrumbTitle={t('config.title')}
        breadcrumbSubTitle={t('config.subtitle')}
      />
      <section className="creator-area pb-90" style={{ paddingTop: 40 }}>
        <div className="container">
          <div className="ac-intro mb-30">
            <p>
              {t('config.intro')}
            </p>
          </div>

          <div className="ac-grid">
            {FIELDS.map((field) => {
              const liveValue = currentByKey[field.key];
              const draftValue = draft[field.key] ?? '';
              const isDirty = String(liveValue) !== draftValue;
              const isSaving =
                updateMut.isPending && updateMut.variables?.key === field.key;

              return (
                <div key={field.key} className={`ac-card ${isDirty ? 'is-dirty' : ''}`}>
                  <div className="ac-card-head">
                    <h3>{t(field.labelKey)}</h3>
                    <span className="ac-current">
                      {t('config.current')}: <strong>Q {dateFmt.number(liveValue, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</strong>
                    </span>
                  </div>

                  <p className="ac-desc">{t(field.descriptionKey)}</p>

                  <div className="ac-input-row">
                    <span className="ac-prefix">{field.prefix}</span>
                    <input
                      type="number"
                      step={field.step}
                      min={field.min}
                      value={draftValue}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, [field.key]: e.target.value }))
                      }
                      disabled={isSaving}
                    />
                  </div>

                  <div className="ac-actions">
                    <button
                      type="button"
                      className="ac-btn ac-btn-ghost"
                      onClick={() => handleReset(field)}
                      disabled={!isDirty || isSaving}
                    >
                      {t('config.discard')}
                    </button>
                    <button
                      type="button"
                      className="ac-btn ac-btn-primary"
                      onClick={() => handleSave(field)}
                      disabled={!isDirty || isSaving}
                    >
                      {isSaving ? (
                        <>
                          <i className="fal fa-spinner fa-spin" /> {t('config.saving')}
                        </>
                      ) : (
                        <>
                          <i className="fal fa-save" /> {t('config.saveChange')}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="ac-footnote mt-30">
            <p>
              <i className="fal fa-info-circle" /> {t('config.footnotePrefix')}{' '}
              <code>ecom.platform_config.updated_by</code> {t('config.footnoteSuffix')}{' '}
              <code>cus_id</code>.
            </p>
          </div>
        </div>
      </section>

      <style jsx>{`
        .ac-intro {
          background: var(--clr-bg-gray, #f9f9f9);
          border-left: 3px solid var(--clr-theme-1, #2785ff);
          padding: 14px 18px;
          border-radius: 6px;
          font-size: 14px;
          line-height: 1.55;
        }
        .ac-intro p {
          margin: 0;
        }
        .ac-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 18px;
        }
        .ac-card {
          background: var(--clr-bg-white, #fff);
          border: 1px solid var(--clr-common-border, #e0e2e5);
          border-radius: 12px;
          padding: 22px;
          transition: border-color 0.2s;
        }
        .ac-card.is-dirty {
          border-color: var(--clr-theme-1, #2785ff);
          box-shadow: 0 0 0 3px rgba(39, 133, 255, 0.1);
        }
        .ac-card-head {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 12px;
          margin-bottom: 8px;
          flex-wrap: wrap;
        }
        .ac-card h3 {
          font-size: 16px;
          font-weight: 700;
          margin: 0;
          color: var(--clr-common-heading);
        }
        .ac-current {
          font-size: 12px;
          color: var(--clr-common-body-text);
          opacity: 0.85;
        }
        .ac-current strong {
          color: var(--clr-common-heading);
        }
        .ac-desc {
          font-size: 13px;
          line-height: 1.55;
          color: var(--clr-common-body-text);
          margin: 0 0 18px;
        }
        .ac-input-row {
          display: flex;
          align-items: center;
          gap: 0;
          margin-bottom: 14px;
        }
        .ac-prefix {
          background: var(--clr-bg-gray, #f0f1f3);
          border: 1px solid var(--clr-common-border, #e0e2e5);
          border-right: none;
          border-radius: 8px 0 0 8px;
          padding: 10px 14px;
          font-weight: 700;
          color: var(--clr-common-heading);
        }
        .ac-input-row input {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid var(--clr-common-border, #e0e2e5);
          border-radius: 0 8px 8px 0;
          font-size: 15px;
          background: var(--clr-bg-white, #fff);
          color: var(--clr-common-heading);
          font-weight: 600;
        }
        .ac-input-row input:focus {
          outline: none;
          border-color: var(--clr-theme-1, #2785ff);
        }
        .ac-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }
        .ac-btn {
          padding: 8px 16px;
          border-radius: 7px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid transparent;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.15s;
        }
        .ac-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .ac-btn-ghost {
          background: transparent;
          border-color: var(--clr-common-border, #e0e2e5);
          color: var(--clr-common-body-text);
        }
        .ac-btn-ghost:hover:not(:disabled) {
          border-color: #ef4444;
          color: #ef4444;
        }
        .ac-btn-primary {
          background: var(--clr-theme-1, #2785ff);
          color: #fff;
        }
        .ac-btn-primary:hover:not(:disabled) {
          filter: brightness(1.05);
        }
        .ac-footnote {
          font-size: 12.5px;
          opacity: 0.7;
        }
        .ac-footnote code {
          background: var(--clr-bg-gray, #f0f1f3);
          padding: 1px 6px;
          border-radius: 4px;
          font-size: 12px;
        }
      `}</style>
    </main>
  );
};

export default AdminConfigMain;
