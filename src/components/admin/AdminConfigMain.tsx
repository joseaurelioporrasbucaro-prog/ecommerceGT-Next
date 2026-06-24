"use client";
import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';
import ThemeChanger from '@/components/home/ThemeChanger';
import StaffShell from '@/components/support/StaffShell';
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

  // WP-7 — moneda de display de los planes. Se guarda en platform_config como
  // número (0=US$, 1=Q) reusando el mismo endpoint numérico.
  const handleSetPlansCurrency = async (cur: 'GTQ' | 'USD') => {
    if (cur === current.plansCurrency) return;
    try {
      await updateMut.mutateAsync({ key: 'plans_currency', value: cur === 'GTQ' ? 1 : 0 });
      toast.success(
        `Planes ahora se muestran en ${cur === 'GTQ' ? 'quetzales (Q)' : 'dólares (US$)'}.`,
      );
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : t('config.saveError'));
    }
  };

  if (!isAdmin) {
    return (
      <main>
        <ThemeChanger />
        <StaffShell active="admin" title={t('config.shortTitle')} sub={t('common.adminOnly')}>
          <p
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--fg-muted)',
              display: 'flex',
              gap: 9,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <i className="fas fa-lock" /> {t('common.adminOnlyMessage')}
          </p>
        </StaffShell>
      </main>
    );
  }

  return (
    <main>
      <ThemeChanger />
      <StaffShell active="admin" title={t('config.title')} sub={t('config.subtitle')}>
        <div style={{ maxWidth: 680 }}>
          {/* Banner informativo: contexto de la propagación de cache. */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 11,
              padding: '14px 18px',
              marginBottom: 22,
              borderRadius: 'var(--r-md)',
              background: 'var(--accent-soft)',
              color: 'var(--fg)',
            }}
          >
            <i className="fas fa-circle-info" style={{ color: 'var(--lav-700)', marginTop: 2 }} />
            <span style={{ font: 'var(--text-body-sm)', lineHeight: 1.55 }}>{t('config.intro')}</span>
          </div>

          {/* Grupo: tarifas de pauta (los 3 campos numéricos reales). */}
          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-lg)',
              background: 'var(--surface)',
              boxShadow: 'var(--shadow-sm)',
              padding: 24,
              marginBottom: 20,
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 18,
                color: 'var(--fg-strong)',
                margin: '0 0 18px',
              }}
            >
              {t('config.shortTitle')}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {FIELDS.map((field) => {
                const liveValue = currentByKey[field.key];
                const draftValue = draft[field.key] ?? '';
                const isDirty = String(liveValue) !== draftValue;
                const isSaving =
                  updateMut.isPending && updateMut.variables?.key === field.key;

                return (
                  <div
                    key={field.key}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 16,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ font: 'var(--text-label)', color: 'var(--fg-strong)' }}>
                        {t(field.labelKey)}
                      </div>
                      <div
                        style={{
                          font: 'var(--text-caption)',
                          color: 'var(--fg-muted)',
                          marginTop: 4,
                          lineHeight: 1.5,
                        }}
                      >
                        {t(field.descriptionKey)}
                      </div>
                      <div
                        style={{
                          font: 'var(--text-caption)',
                          color: 'var(--fg-subtle)',
                          marginTop: 6,
                        }}
                      >
                        {t('config.current')}:{' '}
                        <strong style={{ color: 'var(--fg-strong)' }}>
                          Q{' '}
                          {dateFmt.number(liveValue, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 4,
                          })}
                        </strong>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: 10,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input
                          className="kq-input"
                          type="number"
                          step={field.step}
                          min={field.min}
                          value={draftValue}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, [field.key]: e.target.value }))
                          }
                          disabled={isSaving}
                          style={{ width: 130, height: 44, textAlign: 'right' }}
                        />
                        <span
                          style={{
                            font: 'var(--text-body-sm)',
                            color: 'var(--fg-muted)',
                            minWidth: 18,
                          }}
                        >
                          {field.prefix}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="kq-btn kq-btn--ghost kq-btn--sm"
                          onClick={() => handleReset(field)}
                          disabled={!isDirty || isSaving}
                        >
                          {t('config.discard')}
                        </button>
                        <button
                          type="button"
                          className="kq-btn kq-btn--action kq-btn--sm"
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
                  </div>
                );
              })}
            </div>
          </div>

          {/* WP-7 — moneda en que se muestran los precios de los planes. */}
          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-lg)',
              background: 'var(--surface)',
              boxShadow: 'var(--shadow-sm)',
              padding: 24,
              marginBottom: 20,
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 18,
                color: 'var(--fg-strong)',
                margin: '0 0 6px',
              }}
            >
              Moneda de los planes
            </h3>
            <p style={{ font: 'var(--text-body-sm)', color: 'var(--fg-muted)', margin: '0 0 16px', lineHeight: 1.55 }}>
              Define en qué moneda se muestran los precios en /pricing-plan. Cambia el símbolo
              mostrado; asegurate de que los montos de los planes estén cargados en esa moneda.
            </p>
            <div
              style={{
                font: 'var(--text-caption)',
                color: 'var(--fg-subtle)',
                marginBottom: 14,
              }}
            >
              {t('config.current')}:{' '}
              <strong style={{ color: 'var(--fg-strong)' }}>
                {current.plansCurrency === 'GTQ' ? 'Quetzales (Q)' : 'Dólares (US$)'}
              </strong>
            </div>
            <div
              role="group"
              aria-label="Moneda de los planes"
              style={{
                display: 'inline-flex',
                padding: 5,
                background: 'var(--surface-sunk)',
                border: '1.5px solid var(--border-strong)',
                borderRadius: 999,
              }}
            >
              {(
                [
                  ['USD', 'US$ Dólares'],
                  ['GTQ', 'Q Quetzales'],
                ] as Array<['USD' | 'GTQ', string]>
              ).map(([cur, label]) => {
                const on = current.plansCurrency === cur;
                return (
                  <button
                    key={cur}
                    type="button"
                    onClick={() => handleSetPlansCurrency(cur)}
                    disabled={updateMut.isPending}
                    style={{
                      border: 'none',
                      padding: '9px 20px',
                      borderRadius: 999,
                      fontWeight: 700,
                      font: 'var(--text-body-sm)',
                      cursor: updateMut.isPending ? 'not-allowed' : 'pointer',
                      opacity: updateMut.isPending ? 0.5 : 1,
                      background: on ? 'var(--navy-800)' : 'transparent',
                      color: on ? 'var(--cream)' : 'var(--fg-muted)',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <p
            style={{
              font: 'var(--text-caption)',
              color: 'var(--fg-subtle)',
              display: 'flex',
              gap: 7,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <i className="fal fa-info-circle" /> {t('config.footnotePrefix')}{' '}
            <code style={codeStyle}>ecom.platform_config.updated_by</code>{' '}
            {t('config.footnoteSuffix')} <code style={codeStyle}>cus_id</code>.
          </p>
        </div>
      </StaffShell>
    </main>
  );
};

const codeStyle: React.CSSProperties = {
  background: 'var(--surface-sunk)',
  padding: '1px 6px',
  borderRadius: 'var(--r-xs)',
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  color: 'var(--lav-700)',
};

export default AdminConfigMain;
