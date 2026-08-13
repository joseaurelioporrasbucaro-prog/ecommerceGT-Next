"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Breadcrumbs from '@/utils/Breadcrumbs';
import { useAuth } from '@/utils/AuthContext';
import { toast } from 'react-toastify';
import { ApiError } from '@/utils/Api';
import { useMyPublications } from '@/hooks/api/useMyPublications';
import { useCities, useMunicipalities } from '@/hooks/api/useCatalogs';
import { useMyCampaigns, useCreateCampaign, useSetCampaignStatus, useAdCredit } from '@/hooks/api/useCampaigns';
import { usePricingConfig } from '@/hooks/api/usePricingConfig';
import Pagination from '@/components/support/Pagination';
import { useDateFmt } from '@/utils/datetime';
import type { CampaignStatus, CampaignObjective, Campaign, MyPublicationItem, City, Municipality } from '@/types/api';

const GUATEMALA = 502; // cou_id
// Fase 10.7: las tarifas se leen de ecom.platform_config vía usePricingConfig().
const daysBetween = (start: string, end: string | null): number | null => {
  if (!end) return null;
  const d = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (24 * 3600 * 1000));
  return d > 0 ? d : 0;
};

const PAGE_SIZE = 10; // Fase 10.2: paginación de "Mis campañas"

// Fase 10.3: método de pago en el form. Los métodos con tarjeta son stub
// hasta que se integre la pasarela (Fase pendiente: método de pago en perfil).
type PaymentMethod = 'credit' | 'credit_plus_card' | 'card';

const PautaMain = () => {
  const t = useTranslations('pauta');
  const dateFmt = useDateFmt();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const myPubs = useMyPublications(user?.id);
  const campaigns = useMyCampaigns();
  const credit = useAdCredit(); // Fase 10.2
  const pricing = usePricingConfig(); // Fase 10.7
  const MIN_BUDGET = pricing.adMinBudget;
  const IMPRESSION_COST = pricing.adImpressionCost;
  const CLICK_COST = pricing.adClickCost;
  const createMut = useCreateCampaign();
  const statusMut = useSetCampaignStatus();

  const [pubId, setPubId] = useState('');
  const [objective, setObjective] = useState<CampaignObjective>('destacar');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [citId, setCitId] = useState('');
  const [towId, setTowId] = useState('');
  const [ageMin, setAgeMin] = useState('');
  const [ageMax, setAgeMax] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card'); // Fase 10.3
  const [page, setPage] = useState(1); // Fase 10.2

  const formatMoney = (value: number) =>
    `Q${dateFmt.number(value, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatMoneyShort = (value: number) =>
    `Q${dateFmt.number(value, { maximumFractionDigits: 0 })}`;
  const formatCount = (value: number) =>
    dateFmt.number(value, { maximumFractionDigits: 0 });

  const availableCredit = Number(credit.data?.credit || 0);
  const budgetNum = Number(budget) || 0;
  // Crédito que se aplicaría a la campaña según el método elegido.
  const creditApplied = paymentMethod === 'card'
    ? 0
    : paymentMethod === 'credit'
      ? Math.min(availableCredit, budgetNum)
      : Math.min(availableCredit, budgetNum); // credit_plus_card
  const cardCharge = Math.max(0, budgetNum - creditApplied);
  // 'credit' (solo crédito) requiere que alcance — sino lo bloqueamos.
  const creditCoversAll = availableCredit >= budgetNum;
  const paymentValid = paymentMethod === 'card'
    ? true
    : paymentMethod === 'credit'
      ? creditCoversAll
      : true;

  // Slider de inversión: rango sobre el mismo estado `budget`.
  // El tope crece si el usuario teclea un valor mayor, para no recortar.
  const SLIDER_MAX = Math.max(500, Math.ceil(budgetNum / 100) * 100);
  const sliderStep = MIN_BUDGET >= 10 ? 10 : 5;
  // Estimado en vivo (rango ±15%) usando los costos reales de pricing.
  const estimateUnitCost = objective === 'destacar' ? IMPRESSION_COST : CLICK_COST;
  const estimateMid = estimateUnitCost > 0 ? budgetNum / estimateUnitCost : 0;
  const estimateLo = Math.floor(estimateMid * 0.85);
  const estimateHi = Math.ceil(estimateMid * 1.15);

  // Fase 10.3: prefill desde /mis-publicaciones (?pub=ID).
  useEffect(() => {
    const fromUrl = searchParams?.get('pub');
    if (fromUrl) setPubId(fromUrl);
  }, [searchParams]);

  // Si el usuario gana saldo, sugerimos usar crédito por defecto.
  useEffect(() => {
    if (availableCredit > 0 && paymentMethod === 'card') {
      setPaymentMethod('credit_plus_card');
    }
  }, [availableCredit]); // eslint-disable-line react-hooks/exhaustive-deps

  const cities = useCities(GUATEMALA);
  const munis = useMunicipalities(citId || null);

  // Resumen de segmentación para la columna sticky.
  const selectedCity = (cities.data ?? []).find((c: City) => String(c.city) === citId);
  const selectedMuni = (munis.data ?? []).find((m: Municipality) => String(m.municipality) === towId);
  const segmentationParts: string[] = [];
  if (selectedCity) segmentationParts.push(selectedMuni ? `${selectedCity.description} · ${selectedMuni.description}` : selectedCity.description);
  if (ageMin || ageMax) segmentationParts.push(`${ageMin || '0'}–${ageMax || '120'} ${t('summary.years')}`);
  const segmentationSummary = segmentationParts.length ? segmentationParts.join(' · ') : t('summary.everyone');

  // Fase 10.4: pub_ids con campaña no terminada (active/paused) — no se pueden duplicar.
  const lockedPubIds = React.useMemo(() => {
    const s = new Set<number>();
    (campaigns.data ?? []).forEach((c: Campaign) => {
      if (c.camp_status === 'active' || c.camp_status === 'paused') s.add(Number(c.pub_id));
    });
    return s;
  }, [campaigns.data]);

  // Solo publicaciones PUBLICADAS (pubsta 2) y sin campaña activa.
  //
  // Antes esto excluía 1 (Creada) y 4 (Anulada), pero dejaba pasar 3 (Vendida)
  // y 5 (Pausada): se podía pagar una campaña para algo que ya se vendió. El
  // backend ahora lo rechaza (createCampaign), así que este filtro es para que
  // el usuario no llegue a elegirla y se coma un error después de armar toda la
  // campaña. Lista blanca a propósito, igual que en el backend: un estado nuevo
  // debe caer en "no promocionable" por defecto.
  const allActivePubs = (myPubs.data ?? []).filter((p: MyPublicationItem) => p.pubsta_id === 2);
  const activePubs = allActivePubs.filter((p: MyPublicationItem) => !lockedPubIds.has(p.pub_id));
  const lockedCount = allActivePubs.length - activePubs.length;

  const submit = () => {
    if (!pubId) { toast.error(t('validation.publication')); return; }
    if ((Number(budget) || 0) < MIN_BUDGET) { toast.error(t('validation.minBudget', { amount: MIN_BUDGET })); return; }
    if (paymentMethod === 'credit' && !creditCoversAll) {
      toast.error(t('validation.creditInsufficient', { credit: formatMoney(availableCredit) }));
      return;
    }
    createMut.mutate(
      {
        pubId: Number(pubId),
        objective,
        budget: budgetNum,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        targetCitId: citId ? Number(citId) : null,
        targetTowId: towId ? Number(towId) : null,
        targetAgeMin: ageMin ? Number(ageMin) : null,
        targetAgeMax: ageMax ? Number(ageMax) : null,
        useCredit: paymentMethod !== 'card' && availableCredit > 0, // Fase 10.3
      },
      {
        onSuccess: (r) => {
          toast.success(r.message || t('toast.created'));
          setPubId(''); setBudget(''); setStartDate(''); setEndDate(''); setCitId(''); setTowId(''); setAgeMin(''); setAgeMax(''); setObjective('destacar');
          setPaymentMethod(availableCredit > 0 ? 'credit_plus_card' : 'card');
        },
        onError: (e) => toast.error(e instanceof ApiError ? e.message : t('toast.createError')),
      },
    );
  };

  const changeStatus = (campId: number, status: CampaignStatus) =>
    statusMut.mutate({ campId, status }, {
      onSuccess: (r: { message?: string; refunded?: number }) => {
        if (r?.refunded && r.refunded > 0) toast.success(r.message ?? t('toast.finished'));
      },
      onError: () => toast.error(t('toast.updateError')),
    });

  const rows = campaigns.data ?? [];
  // Fase 10.2: paginación 10/página
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <main>
      <Breadcrumbs breadcrumbTitle={t('breadcrumbs.title')} breadcrumbSubTitle={t('breadcrumbs.subtitle')} />

      <section className="creator-area pb-90" style={{ paddingTop: 40 }}>
        <div className="container">
          {/* Explicador estilo Meta */}
          <div className="pa-explain">
            <h5><i className="fas fa-bullhorn" /> {t('explain.title')}</h5>
            <p>{t('explain.body')}</p>
            <div className="pa-obj-cards">
              <div className="pa-obj-card">
                <strong><i className="fas fa-bolt" /> {t('objectives.destacar.title', { cost: formatMoney(IMPRESSION_COST) })}</strong>
                <span>{t('objectives.destacar.description', {
                  cost: formatMoney(IMPRESSION_COST),
                  small: formatCount(Math.floor(10 / IMPRESSION_COST)),
                  large: formatCount(Math.floor(1000 / IMPRESSION_COST)),
                })}</span>
              </div>
              <div className="pa-obj-card">
                <strong><i className="fas fa-paper-plane" /> {t('objectives.mensajes.title', { cost: formatMoney(CLICK_COST) })}</strong>
                <span>{t('objectives.mensajes.description', {
                  cost: formatMoney(CLICK_COST),
                  small: formatCount(Math.floor(10 / CLICK_COST)),
                  large: formatCount(Math.floor(1000 / CLICK_COST)),
                })}</span>
              </div>
            </div>
            <ul className="pa-explain-list">
              <li><i className="fas fa-info-circle" /><span>{t('explain.reach', { minBudget: formatMoney(MIN_BUDGET) })}</span></li>
              <li><i className="fas fa-undo" /><span>{t('explain.creditReturn')}</span></li>
              <li><i className="fas fa-exclamation-circle" /><span>{t('explain.refundPolicy')}</span></li>
            </ul>
          </div>

          {/* Constructor ambicioso: izquierda = pasos, derecha = saldo + resumen sticky (handoff #11 §8) */}
          <div className="pa-builder">
            {/* IZQUIERDA — constructor */}
            <div className="pa-build-col">
              {/* 1 · Publicación */}
              <div className="pa-step">
                <div className="pa-step-head"><span className="pa-step-num">1</span>{t('builder.stepPublication')}</div>
                <select value={pubId} onChange={(e) => setPubId(e.target.value)}>
                  <option value="">{t('common.select')}</option>
                  {activePubs.map((p: MyPublicationItem) => <option key={p.pub_id} value={p.pub_id}>{p.pub_title}</option>)}
                </select>
                {activePubs.length === 0 && lockedCount === 0 && <p className="pa-hint">{t('form.noPublications')}</p>}
                {lockedCount > 0 && (
                  <p className="pa-hint">
                    <i className="fas fa-lock" />{' '}
                    {lockedCount === 1
                      ? t('form.lockedOne')
                      : t('form.lockedMany', { count: lockedCount })}
                    {' '}{t('form.finishCurrent')}
                  </p>
                )}
              </div>

              {/* 2 · Objetivo */}
              <div className="pa-step">
                <div className="pa-step-head"><span className="pa-step-num">2</span>{t('builder.stepObjective')}</div>
                <div className="pa-objective">
                  <button type="button" className={objective === 'destacar' ? 'active' : ''} onClick={() => setObjective('destacar')}>
                    <span className="pa-obj-tile"><i className="fas fa-bolt" /></span>
                    <span className="pa-obj-text">
                      <strong>{t('objectiveLabel.destacar')}</strong>
                      <small>{t('builder.objDestacar')}</small>
                    </span>
                  </button>
                  <button type="button" className={objective === 'mensajes' ? 'active' : ''} onClick={() => setObjective('mensajes')}>
                    <span className="pa-obj-tile"><i className="fas fa-paper-plane" /></span>
                    <span className="pa-obj-text">
                      <strong>{t('objectiveLabel.mensajes')}</strong>
                      <small>{t('builder.objMensajes')}</small>
                    </span>
                  </button>
                </div>
              </div>

              {/* 3 · Inversión — slider + estimado en vivo */}
              <div className="pa-step">
                <div className="pa-step-head"><span className="pa-step-num">3</span>{t('builder.stepInvestment')}</div>
                <div className="pa-budget-amount">
                  <span className="pa-budget-cur">Q</span>
                  <span className="pa-budget-num">{budgetNum > 0 ? formatCount(budgetNum) : MIN_BUDGET}</span>
                </div>
                <input
                  className="pa-slider"
                  type="range"
                  min={MIN_BUDGET}
                  max={SLIDER_MAX}
                  step={sliderStep}
                  value={Math.min(Math.max(budgetNum, MIN_BUDGET), SLIDER_MAX)}
                  onChange={(e) => setBudget(e.target.value)}
                />
                <div className="pa-slider-range">
                  <span>{formatMoneyShort(MIN_BUDGET)}</span>
                  <span>{formatMoneyShort(SLIDER_MAX)}</span>
                </div>
                {/* Entrada precisa opcional (mantiene la lógica de presupuesto exacto) */}
                <label className="pa-label">{t('form.budget', { min: MIN_BUDGET })}</label>
                <input type="number" min={MIN_BUDGET} step="0.01" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder={`${MIN_BUDGET}.00`} />

                {budgetNum >= MIN_BUDGET && (
                  <div className="pa-estimate">
                    <i className="fas fa-bolt" />
                    <div>
                      <div className="pa-estimate-label">{t('builder.estimateWith', { budget: formatMoneyShort(budgetNum) })}</div>
                      <div className="pa-estimate-value">
                        {objective === 'destacar'
                          ? t('builder.estimateImpressions', { lo: formatCount(estimateLo), hi: formatCount(estimateHi) })
                          : t('builder.estimateReached', { lo: formatCount(estimateLo), hi: formatCount(estimateHi) })}
                      </div>
                    </div>
                  </div>
                )}
                {budgetNum >= MIN_BUDGET && <p className="pa-estimate-note">{t('builder.estimateNote')}</p>}

                {/* Fase 10.3 — método de pago */}
                {budgetNum >= MIN_BUDGET && (
                  <>
                    <label className="pa-label">{t('payment.title')}</label>
                    <div className="pa-pay-methods">
                      <label className={`pa-pay-opt ${paymentMethod === 'credit' ? 'active' : ''} ${!creditCoversAll ? 'disabled' : ''}`}>
                        <input
                          type="radio"
                          name="pay"
                          checked={paymentMethod === 'credit'}
                          onChange={() => creditCoversAll && setPaymentMethod('credit')}
                          disabled={!creditCoversAll}
                        />
                        <div>
                          <strong><i className="fas fa-wallet" /> {t('payment.creditOnly')}</strong>
                          <span>
                            {creditCoversAll
                              ? t('payment.creditCovers', { budget: formatMoney(budgetNum), credit: formatMoney(availableCredit) })
                              : t('payment.creditInsufficient', { credit: formatMoney(availableCredit) })}
                          </span>
                        </div>
                      </label>

                      <label className={`pa-pay-opt ${paymentMethod === 'credit_plus_card' ? 'active' : ''} ${availableCredit <= 0 ? 'disabled' : ''}`}>
                        <input
                          type="radio"
                          name="pay"
                          checked={paymentMethod === 'credit_plus_card'}
                          onChange={() => availableCredit > 0 && setPaymentMethod('credit_plus_card')}
                          disabled={availableCredit <= 0}
                        />
                        <div>
                          <strong><i className="fas fa-layer-group" /> {t('payment.creditPlusCard')}</strong>
                          <span>
                            {availableCredit > 0
                              ? t('payment.creditPlusCardDetail', {
                                credit: formatMoney(Math.min(availableCredit, budgetNum)),
                                card: formatMoney(cardCharge),
                              })
                              : t('payment.noCredit')}
                          </span>
                        </div>
                      </label>

                      <label className={`pa-pay-opt ${paymentMethod === 'card' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="pay"
                          checked={paymentMethod === 'card'}
                          onChange={() => setPaymentMethod('card')}
                        />
                        <div>
                          <strong><i className="fas fa-credit-card" /> {t('payment.cardOnly')}</strong>
                          <span>{t('payment.cardOnlyDetail', { budget: formatMoney(budgetNum) })}</span>
                        </div>
                      </label>
                    </div>

                    {paymentMethod !== 'credit' && cardCharge > 0 && (
                      <p className="pa-pay-stub">
                        <i className="fas fa-info-circle" /> {t('payment.stub')}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* 4 · Segmentación */}
              <div className="pa-step">
                <div className="pa-step-head"><span className="pa-step-num">4</span>{t('builder.stepSegmentation')}</div>
                <p className="pa-step-sub">{t('builder.segmentationSub')}</p>

                <div className="pa-grid2">
                  <div>
                    <label className="pa-label">{t('form.department')}</label>
                    <select value={citId} onChange={(e) => { setCitId(e.target.value); setTowId(''); }}>
                      <option value="">{t('common.all')}</option>
                      {(cities.data ?? []).map((c: City) => <option key={c.city} value={String(c.city)}>{c.description}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="pa-label">{t('form.municipality')}</label>
                    <select value={towId} onChange={(e) => setTowId(e.target.value)} disabled={!citId}>
                      <option value="">{t('common.all')}</option>
                      {(munis.data ?? []).map((m: Municipality) => <option key={m.municipality} value={String(m.municipality)}>{m.description}</option>)}
                    </select>
                  </div>
                </div>

                <div className="pa-grid2">
                  <div>
                    <label className="pa-label">{t('form.ageMin')}</label>
                    <input type="number" min={0} max={120} value={ageMin} onChange={(e) => setAgeMin(e.target.value)} placeholder="-" />
                  </div>
                  <div>
                    <label className="pa-label">{t('form.ageMax')}</label>
                    <input type="number" min={0} max={120} value={ageMax} onChange={(e) => setAgeMax(e.target.value)} placeholder="-" />
                  </div>
                </div>

                <div className="pa-grid2">
                  <div>
                    <label className="pa-label">{t('form.starts')}</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="pa-label">{t('form.ends')}</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            {/* DERECHA — saldo + resumen sticky */}
            <aside className="pa-sticky-col">
              {/* Saldo — navy con halo lavanda (mock handoff #10) */}
              <div className="pa-credit-card">
                <div className="pa-credit-card-icon"><i className="fas fa-wallet" /></div>
                <div className="pa-credit-card-body">
                  <div className="pa-credit-card-label">{t('credit.label')}</div>
                  <div className="pa-credit-card-amount">{formatMoney(availableCredit)}</div>
                  <div className="pa-credit-card-note">
                    {availableCredit > 0 ? t('credit.available') : t('credit.empty')}
                  </div>
                  <div className="pa-credit-card-gift"><i className="fas fa-gift" /> {t('credit.gift')}</div>
                </div>
                <button
                  type="button"
                  className="pa-credit-recharge"
                  onClick={() => toast.info(t('credit.rechargeSoon'))}
                >
                  <i className="fas fa-plus" /> {t('credit.recharge')}
                </button>
              </div>

              {/* Resumen */}
              <div className="pa-summary">
                <div className="pa-summary-title">{t('summary.title')}</div>
                <div className="pa-summary-row">
                  <span>{t('form.objective')}</span>
                  <strong>{t(`objectiveLabel.${objective}`)}</strong>
                </div>
                <div className="pa-summary-row">
                  <span>{t('summary.investment')}</span>
                  <strong>{formatMoney(budgetNum)}</strong>
                </div>
                <div className="pa-summary-row">
                  <span>{t('summary.segmentation')}</span>
                  <strong>{segmentationSummary}</strong>
                </div>
                <div className="pa-summary-row">
                  <span>{t('summary.availableBalance')}</span>
                  <strong className="pos">{formatMoney(creditApplied)}</strong>
                </div>
                <div className="pa-summary-total">
                  <span>{t('summary.payWithCard')}</span>
                  <strong>{formatMoney(cardCharge)}</strong>
                </div>
                <button className="pa-create" onClick={submit} disabled={createMut.isPending || !paymentValid}>
                  {createMut.isPending ? t('form.creating') : t('summary.activate')}
                </button>
                <div className="pa-summary-secure"><i className="far fa-credit-card" /> {t('summary.secure')}</div>
              </div>
            </aside>
          </div>

          {/* Mis campañas — full width bajo el constructor */}
          <div className="pa-campaigns">
            <h5 style={{ marginBottom: 16 }}>{t('campaigns.title')}</h5>
            {campaigns.isLoading && <p style={{ opacity: 0.6 }}>{t('common.loading')}</p>}
            {!campaigns.isLoading && rows.length === 0 && <p style={{ opacity: 0.6 }}>{t('campaigns.empty')}</p>}
            <div className="pa-list">
              {pageRows.map((c: Campaign) => (
                <div key={c.camp_id} className="pa-camp">
                  <div className="pa-camp-main">
                    <span className={`pa-status pa-status-${c.camp_status}`}>{t(`campaignStatus.${c.camp_status}`)}</span>
                    <span className="pa-obj-tag">{t(`objectiveLabel.${c.camp_objective}`)}</span>
                    <span className="pa-camp-title">{c.title}</span>
                  </div>
                  <div className="pa-metrics">
                    <span><i className="fas fa-eye" /> {c.impressions}</span>
                    <span><i className="fas fa-mouse-pointer" /> {c.clicks}</span>
                    <span><i className="fas fa-coins" /> {formatMoney(Number(c.spent))} / {formatMoney(Number(c.budget))}</span>
                    <span><i className="fas fa-wallet" /> {t('campaigns.remaining', { amount: formatMoney(Math.max(0, Number(c.budget) - Number(c.spent))) })}</span>
                    <span><i className="fas fa-clock" /> {(() => {
                      const days = daysBetween(c.start_date, c.end_date);
                      if (days === null) return t('campaigns.noEndDate');
                      if (days === 0) return '-';
                      return t('campaigns.days', { count: days });
                    })()}</span>
                  </div>
                  <div className="pa-progress"><div className="pa-progress-bar" style={{ width: `${Math.min(100, (Number(c.spent) / Math.max(1, Number(c.budget))) * 100)}%` }} /></div>
                  <div className="pa-camp-actions">
                    {c.camp_status === 'active' && <button onClick={() => changeStatus(c.camp_id, 'paused')}>{t('campaigns.pause')}</button>}
                    {c.camp_status === 'paused' && <button onClick={() => changeStatus(c.camp_id, 'active')}>{t('campaigns.resume')}</button>}
                    {c.camp_status !== 'finished' && <button className="pa-finish" onClick={() => changeStatus(c.camp_id, 'finished')}>{t('campaigns.finish')}</button>}
                  </div>
                </div>
              ))}
            </div>
            <Pagination page={safePage} pageSize={PAGE_SIZE} total={rows.length} onPage={setPage} />
          </div>
        </div>
      </section>

      <style jsx>{`
        .pa-explain { border: 1px solid var(--border); border-radius: 16px; padding: 20px 22px; margin-bottom: 24px; background: var(--accent-soft); }
        .pa-explain h5 { display: flex; align-items: center; gap: 9px; margin: 0 0 8px; font-family: var(--font-display); color: var(--fg-strong); }
        .pa-explain h5 :global(i) { color: var(--lav-700); }
        .pa-explain p { margin: 0 0 12px; font-size: 14px; color: var(--fg-muted); }
        .pa-obj-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
        @media (max-width: 575px) { .pa-obj-cards { grid-template-columns: 1fr; } }
        .pa-obj-card { border: 1px solid var(--border); border-radius: 12px; padding: 12px 14px; background: var(--surface); }
        .pa-obj-card strong { display: flex; align-items: center; gap: 7px; margin-bottom: 5px; color: var(--fg-strong); }
        .pa-obj-card strong :global(i) { color: var(--lav-700); }
        .pa-obj-card span { font-size: 13px; color: var(--fg-muted); }
        .pa-explain-list { list-style: none; padding: 0; margin: 4px 0 0; display: flex; flex-direction: column; gap: 10px; }
        .pa-explain-list li { display: flex; gap: 10px; align-items: flex-start; font-size: 13px; line-height: 1.55; color: var(--fg-muted); }
        .pa-explain-list li :global(i) { color: var(--lav-700); margin-top: 3px; flex-shrink: 0; width: 16px; text-align: center; }
        .pa-explain-list li span { flex: 1; }
        /* Constructor 2 columnas: izquierda pasos · derecha sticky saldo+resumen */
        .pa-builder { display: grid; grid-template-columns: 1.5fr 1fr; gap: 24px; align-items: start; }
        @media (max-width: 991px) { .pa-builder { grid-template-columns: 1fr; } }
        .pa-build-col { display: flex; flex-direction: column; gap: 18px; }
        .pa-step { border: 1px solid var(--border); border-radius: var(--r-lg, 20px); padding: 18px 20px; background: var(--surface); box-shadow: var(--shadow-xs); }
        .pa-step-head { display: flex; align-items: center; gap: 10px; font-family: var(--font-display); font-weight: 700; font-size: 15px; color: var(--fg-strong); margin-bottom: 14px; }
        .pa-step-num { width: 24px; height: 24px; flex-shrink: 0; border-radius: 999px; background: var(--accent-soft); color: var(--lav-700); display: inline-flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; }
        .pa-step-sub { font-size: 13px; color: var(--fg-muted); margin: -8px 0 14px; }
        .pa-label { display: block; font-weight: 600; font-size: 13px; margin: 12px 0 5px; color: var(--fg-strong); }
        .pa-step select, .pa-step input, .pa-summary select, .pa-summary input { width: 100%; border: 1.5px solid var(--border-strong); border-radius: 10px; padding: 10px 12px; background: var(--bg-elevated); color: var(--fg-strong); font-family: var(--font-body); font-size: 14px; transition: border-color .15s ease, box-shadow .15s ease; }
        .pa-step select:focus, .pa-step input:focus { outline: none; border-color: var(--accent); box-shadow: var(--shadow-focus); }
        .pa-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 479px) { .pa-grid2 { grid-template-columns: 1fr; } }
        .pa-hint { font-size: 12px; color: var(--fg-subtle); margin-top: 6px; }
        .pa-hint :global(i) { color: var(--lav-700); }
        /* Inversión — número + slider + estimado en vivo */
        .pa-budget-amount { display: flex; align-items: baseline; gap: 8px; margin-bottom: 12px; }
        .pa-budget-cur { font-family: var(--font-display); font-weight: 500; font-size: 18px; color: var(--fg-subtle); }
        .pa-budget-num { font-family: var(--font-display); font-weight: 800; font-size: 38px; line-height: 1; letter-spacing: -0.02em; color: var(--fg-strong); }
        .pa-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 6px; padding: 0 !important; border: none !important; border-radius: 999px; background: var(--surface-sunk) !important; accent-color: var(--green-600); cursor: pointer; margin: 4px 0 8px; }
        .pa-slider:focus { outline: none; box-shadow: none !important; }
        .pa-slider-range { display: flex; justify-content: space-between; font-size: 12px; color: var(--fg-subtle); margin-bottom: 6px; }
        .pa-estimate { display: flex; align-items: center; gap: 13px; margin-top: 14px; padding: 14px 16px; background: var(--lav-100); border-radius: var(--r-md, 14px); }
        .pa-estimate :global(i) { color: var(--lav-700); font-size: 18px; flex-shrink: 0; }
        .pa-estimate-label { font-size: 13px; color: var(--fg-muted); }
        .pa-estimate-value { font-family: var(--font-display); font-weight: 700; font-size: 17px; color: var(--fg-strong); line-height: 1.2; }
        .pa-estimate-note { font-size: 12px; color: var(--fg-subtle); margin-top: 8px; }
        /* Columna sticky — saldo + resumen */
        .pa-sticky-col { position: sticky; top: 24px; display: flex; flex-direction: column; gap: 16px; }
        @media (max-width: 991px) { .pa-sticky-col { position: static; } }
        /* Saldo — tarjeta navy con halo lavanda (mock handoff #10). */
        .pa-credit-card { position: relative; overflow: hidden; display: flex; align-items: center; gap: 16px; border-radius: 20px; padding: 20px 22px; flex-wrap: wrap;
          background: radial-gradient(360px 200px at 92% -40%, rgba(181, 172, 239, 0.38), transparent 60%), var(--navy-800);
          color: var(--cream); border: none; box-shadow: var(--shadow-sm); }
        .pa-credit-card-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; background: rgba(248, 244, 238, 0.12); color: var(--cream); }
        .pa-credit-card-body { display: flex; flex-direction: column; gap: 3px; flex: 1; min-width: 180px; }
        .pa-credit-card-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(248, 244, 238, 0.7); font-weight: 600; }
        .pa-credit-card-amount { font-family: var(--font-display); font-size: 30px; font-weight: 800; line-height: 1.05; letter-spacing: -0.01em; color: var(--cream); }
        .pa-credit-card-note { font-size: 12.5px; color: rgba(248, 244, 238, 0.75); }
        .pa-credit-card-gift { display: inline-flex; align-items: center; gap: 7px; font-size: 12.5px; font-weight: 600; color: var(--green-300); margin-top: 3px; }
        .pa-credit-recharge { display: inline-flex; align-items: center; gap: 8px; background: var(--green-500); color: var(--navy-900); border: none; border-radius: 999px; padding: 10px 18px; font-family: var(--font-display); font-weight: 700; font-size: 13px; cursor: pointer; transition: background .15s ease; flex-shrink: 0; }
        .pa-credit-recharge:hover { background: var(--green-600); }
        /* Fase 10.3 — método de pago */
        .pa-pay-methods { display: flex; flex-direction: column; gap: 8px; }
        .pa-pay-opt { display: flex; gap: 10px; align-items: flex-start; border: 1.5px solid var(--border-strong); border-radius: 12px; padding: 11px 13px; cursor: pointer; transition: all 0.15s; }
        .pa-pay-opt.active { border-color: var(--lav-500); background: var(--accent-soft); }
        .pa-pay-opt.disabled { opacity: 0.5; cursor: not-allowed; }
        .pa-pay-opt input[type="radio"] { width: 18px !important; height: 18px; margin-top: 2px; cursor: inherit; flex-shrink: 0; accent-color: var(--lav-600); }
        .pa-pay-opt > div { display: flex; flex-direction: column; gap: 2px; }
        .pa-pay-opt strong { display: flex; align-items: center; gap: 7px; font-size: 13.5px; color: var(--fg-strong); }
        .pa-pay-opt strong :global(i) { color: var(--lav-700); }
        .pa-pay-opt span { font-size: 12px; color: var(--fg-muted); }
        .pa-pay-stub { font-size: 12px; color: var(--fg-subtle); margin-top: 8px; display: flex; gap: 6px; align-items: flex-start; }
        .pa-pay-stub :global(i) { color: var(--lav-700); margin-top: 2px; }
        /* Objetivo — cards lavanda (icon-tile + título + descripción). */
        .pa-objective { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 575px) { .pa-objective { grid-template-columns: 1fr; } }
        .pa-objective button { display: flex; gap: 13px; align-items: flex-start; text-align: left; border: 1.5px solid var(--border); background: var(--surface); border-radius: var(--r-md, 14px); padding: 16px; cursor: pointer; transition: all 0.15s; }
        .pa-obj-tile { width: 42px; height: 42px; flex-shrink: 0; border-radius: var(--r-md, 14px); background: var(--surface-sunk); color: var(--fg-muted); display: inline-flex; align-items: center; justify-content: center; font-size: 16px; transition: all 0.15s; }
        .pa-objective button.active { border-color: var(--lav-500); border-width: 2px; background: var(--lav-100); padding: 15px; }
        .pa-objective button.active .pa-obj-tile { background: var(--lav-500); color: #fff; }
        .pa-obj-text { display: flex; flex-direction: column; gap: 2px; }
        .pa-obj-text strong { font-family: var(--font-display); font-weight: 700; font-size: 14.5px; color: var(--fg-strong); }
        .pa-obj-text small { font-size: 12.5px; line-height: 1.4; color: var(--fg-muted); }
        /* Resumen sticky */
        .pa-summary { border: 1px solid var(--border); border-radius: var(--r-lg, 20px); padding: 20px 22px; background: var(--surface); box-shadow: var(--shadow-sm); }
        .pa-summary-title { font-family: var(--font-display); font-weight: 700; font-size: 16px; color: var(--fg-strong); margin-bottom: 12px; }
        .pa-summary-row { display: flex; justify-content: space-between; gap: 12px; padding: 7px 0; font-size: 13px; }
        .pa-summary-row span { color: var(--fg-muted); flex-shrink: 0; }
        .pa-summary-row strong { color: var(--fg-strong); font-weight: 600; text-align: right; }
        .pa-summary-row .pos { color: var(--green-700); }
        .pa-summary-total { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding-top: 11px; margin-top: 6px; border-top: 1px solid var(--border); }
        .pa-summary-total span { font-weight: 700; color: var(--fg-strong); }
        .pa-summary-total strong { font-family: var(--font-display); font-weight: 700; font-size: 17px; color: var(--fg-strong); }
        .pa-summary-secure { display: flex; align-items: center; justify-content: center; gap: 7px; margin-top: 12px; font-size: 12px; color: var(--fg-subtle); }
        .pa-create { margin-top: 14px; width: 100%; background: var(--green-500); color: var(--navy-900); border: none; padding: 13px; border-radius: 999px; font-family: var(--font-display); font-weight: 700; cursor: pointer; transition: background .15s ease; }
        .pa-create:hover:not(:disabled) { background: var(--green-600); }
        .pa-create:disabled { opacity: 0.6; cursor: not-allowed; }
        .pa-campaigns { margin-top: 36px; }
        .pa-list { display: flex; flex-direction: column; gap: 12px; }
        .pa-camp { border: 1px solid var(--border); border-radius: 14px; padding: 14px 16px; background: var(--surface); box-shadow: var(--shadow-xs); }
        .pa-camp-main { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; flex-wrap: wrap; }
        .pa-camp-title { font-weight: 600; color: var(--fg-strong); }
        .pa-status { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; }
        .pa-status-active { background: var(--green-100); color: var(--green-700); }
        .pa-status-paused { background: rgba(245, 158, 11, 0.18); color: #b8860b; }
        .pa-status-finished { background: var(--surface-sunk); color: var(--fg-subtle); }
        .pa-obj-tag { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; background: var(--accent-soft); color: var(--lav-700); }
        .pa-metrics { display: flex; gap: 16px; font-size: 13px; color: var(--fg-muted); margin-bottom: 8px; flex-wrap: wrap; }
        .pa-progress { height: 6px; border-radius: 4px; background: var(--surface-sunk); overflow: hidden; margin-bottom: 10px; }
        .pa-progress-bar { height: 100%; background: var(--green-500); }
        .pa-camp-actions { display: flex; gap: 8px; }
        .pa-camp-actions button { border: 1.5px solid var(--border-strong); background: transparent; color: var(--fg-strong); border-radius: 999px; padding: 6px 14px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all .15s ease; }
        .pa-camp-actions button:hover { border-color: var(--lav-500); color: var(--lav-700); }
        .pa-camp-actions .pa-finish { color: var(--danger); border-color: var(--danger-bg, rgba(239, 68, 68, 0.35)); }
        .pa-camp-actions .pa-finish:hover { color: var(--danger); border-color: var(--danger); }
        /* Dark — los lavanda fijos (--lav-100) quedarían casi blancos: usar el soft dark-aware. */
        :global([data-theme='dark']) .pa-estimate { background: var(--accent-soft); }
        :global([data-theme='dark']) .pa-objective button.active { background: var(--accent-soft); }
      `}</style>
    </main>
  );
};

export default PautaMain;
