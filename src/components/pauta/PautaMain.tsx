"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ThemeChanger from '@/components/home/ThemeChanger';
import Breadcrumbs from '@/utils/Breadcrumbs';
import { useAuth } from '@/utils/AuthContext';
import { toast } from 'react-toastify';
import { ApiError } from '@/utils/Api';
import { useMyPublications } from '@/hooks/api/useMyPublications';
import { useCities, useMunicipalities } from '@/hooks/api/useCatalogs';
import { useMyCampaigns, useCreateCampaign, useSetCampaignStatus, useAdCredit } from '@/hooks/api/useCampaigns';
import Pagination from '@/components/support/Pagination';
import type { CampaignStatus, CampaignObjective } from '@/types/api';

const GUATEMALA = 502; // cou_id
const MIN_BUDGET = 10;
const IMPRESSION_COST = 0.05; // Q por impresión (destacar)
const CLICK_COST = 0.50;      // Q por clic (mensajes)
const STATUS_LABEL: Record<CampaignStatus, string> = { active: 'Activa', paused: 'Pausada', finished: 'Finalizada' };
const OBJ_LABEL: Record<CampaignObjective, string> = { destacar: 'Destacar', mensajes: 'Mensajes' };

const daysBetween = (start: string, end: string | null): string => {
  if (!end) return 'Sin fecha de fin';
  const d = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (24 * 3600 * 1000));
  return d > 0 ? `${d} día${d !== 1 ? 's' : ''}` : '—';
};

const PAGE_SIZE = 10; // Fase 10.2: paginación de "Mis campañas"

// Fase 10.3: método de pago en el form. Los métodos con tarjeta son stub
// hasta que se integre la pasarela (Fase pendiente: método de pago en perfil).
type PaymentMethod = 'credit' | 'credit_plus_card' | 'card';

const PautaMain = () => {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const myPubs = useMyPublications(user?.id);
  const campaigns = useMyCampaigns();
  const credit = useAdCredit(); // Fase 10.2
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

  // Fase 10.4: pub_ids con campaña no terminada (active/paused) — no se pueden duplicar.
  const lockedPubIds = React.useMemo(() => {
    const s = new Set<number>();
    (campaigns.data ?? []).forEach((c) => {
      if (c.camp_status === 'active' || c.camp_status === 'paused') s.add(Number(c.pub_id));
    });
    return s;
  }, [campaigns.data]);

  // Solo publicaciones activas (no borrador=1, no anulada=4) y sin campaña activa.
  const allActivePubs = (myPubs.data ?? []).filter((p) => p.pubsta_id !== 1 && p.pubsta_id !== 4);
  const activePubs = allActivePubs.filter((p) => !lockedPubIds.has(p.pub_id));
  const lockedCount = allActivePubs.length - activePubs.length;

  const submit = () => {
    if (!pubId) { toast.error('Selecciona una publicación.'); return; }
    if ((Number(budget) || 0) < MIN_BUDGET) { toast.error(`El presupuesto mínimo es Q${MIN_BUDGET}.`); return; }
    if (paymentMethod === 'credit' && !creditCoversAll) {
      toast.error(`Tu crédito (Q${availableCredit.toFixed(2)}) no cubre el presupuesto. Elige otro método.`);
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
          toast.success(r.message || 'Campaña creada.');
          setPubId(''); setBudget(''); setStartDate(''); setEndDate(''); setCitId(''); setTowId(''); setAgeMin(''); setAgeMax(''); setObjective('destacar');
          setPaymentMethod(availableCredit > 0 ? 'credit_plus_card' : 'card');
        },
        onError: (e) => toast.error(e instanceof ApiError ? e.message : 'No se pudo crear'),
      },
    );
  };

  const changeStatus = (campId: number, status: CampaignStatus) =>
    statusMut.mutate({ campId, status }, {
      onSuccess: (r: { message?: string; refunded?: number }) => {
        if (r?.refunded && r.refunded > 0) toast.success(r.message ?? 'Campaña finalizada.');
      },
      onError: () => toast.error('No se pudo actualizar'),
    });

  const rows = campaigns.data ?? [];
  // Fase 10.2: paginación 10/página
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <main>
      <ThemeChanger />
      <Breadcrumbs breadcrumbTitle="Pauta" breadcrumbSubTitle="Promociona tus publicaciones" />

      <section className="creator-area pb-90" style={{ paddingTop: 40 }}>
        <div className="container">
          {/* Explicador estilo Meta */}
          <div className="pa-explain">
            <h5><i className="fas fa-bullhorn" /> ¿Cómo funciona la pauta?</h5>
            <p>Promociona una de tus publicaciones para que aparezca en <strong>Destacados</strong>, segmentada por <strong>ubicación y edad</strong> (igual que en plataformas como Meta Ads). Eliges un <strong>objetivo</strong>, un <strong>presupuesto</strong> y por <strong>cuánto tiempo</strong> corre.</p>
            <div className="pa-obj-cards">
              <div className="pa-obj-card">
                <strong><i className="fas fa-bolt" /> Destacar — Q0.05 / impresión</strong>
                <span>Se muestra arriba con el sello "Patrocinado". Cada vez que se muestra a alguien del público objetivo se descuenta Q0.05. Ej: Q10 ≈ 200 vistas, Q1000 ≈ 20,000 vistas.</span>
              </div>
              <div className="pa-obj-card">
                <strong><i className="fas fa-paper-plane" /> Mensajes — Q0.50 / clic</strong>
                <span>Muestra un botón "Enviar mensaje". Solo se descuenta cuando alguien hace clic. Ej: Q10 ≈ 20 contactos, Q1000 ≈ 2,000 contactos.</span>
              </div>
            </div>
            <ul className="pa-explain-list">
              <li><i className="fas fa-info-circle" /><span>A más presupuesto, <strong>más alcance y prioridad</strong>: las campañas con más saldo se muestran primero. Al agotarse, la campaña finaliza sola. Mínimo <strong>Q{MIN_BUDGET}</strong>. El cobro real se habilitará con la pasarela; por ahora se activa sin cobro.</span></li>
              <li><i className="fas fa-undo" /><span>Si tu campaña <strong>termina antes de gastar todo</strong> (por fecha o porque la finalizas manualmente), el saldo no gastado se devuelve como <strong>crédito reutilizable</strong> en próximas campañas.</span></li>
            </ul>
          </div>

          {/* Fase 10.2/10.3 — tarjeta de saldo siempre visible */}
          <div className={`pa-credit-card ${availableCredit > 0 ? 'has' : 'empty'}`}>
            <div className="pa-credit-card-icon"><i className="fas fa-wallet" /></div>
            <div className="pa-credit-card-body">
              <div className="pa-credit-card-label">Mi saldo de pauta</div>
              <div className="pa-credit-card-amount">Q{availableCredit.toFixed(2)}</div>
              <div className="pa-credit-card-note">
                {availableCredit > 0
                  ? 'Disponible para usar en tu próxima campaña.'
                  : 'Aún no tienes saldo. Se genera del presupuesto no gastado al finalizar campañas.'}
              </div>
            </div>
          </div>

          <div className="row">
            {/* Crear campaña */}
            <div className="col-lg-5">
              <div className="pa-card">
                <h5>Nueva campaña</h5>

                <label className="pa-label">Publicación</label>
                <select value={pubId} onChange={(e) => setPubId(e.target.value)}>
                  <option value="">Selecciona…</option>
                  {activePubs.map((p) => <option key={p.pub_id} value={p.pub_id}>{p.pub_title}</option>)}
                </select>
                {activePubs.length === 0 && lockedCount === 0 && <p className="pa-hint">No tienes publicaciones activas para promocionar.</p>}
                {lockedCount > 0 && (
                  <p className="pa-hint">
                    <i className="fas fa-lock" />{' '}
                    {lockedCount === 1
                      ? '1 publicación ya tiene una campaña activa y no aparece aquí.'
                      : `${lockedCount} publicaciones ya tienen una campaña activa y no aparecen aquí.`}
                    {' '}Finaliza la actual desde "Mis campañas" si quieres crear otra.
                  </p>
                )}

                <label className="pa-label">Objetivo</label>
                <div className="pa-objective">
                  <button type="button" className={objective === 'destacar' ? 'active' : ''} onClick={() => setObjective('destacar')}><i className="fas fa-bolt" /> Destacar</button>
                  <button type="button" className={objective === 'mensajes' ? 'active' : ''} onClick={() => setObjective('mensajes')}><i className="fas fa-paper-plane" /> Mensajes</button>
                </div>

                <label className="pa-label">Presupuesto (Q, mín. {MIN_BUDGET})</label>
                <input type="number" min={MIN_BUDGET} step="0.01" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder={`${MIN_BUDGET}.00`} />
                {(Number(budget) || 0) >= MIN_BUDGET && (
                  <div className="pa-estimate">
                    <i className="fas fa-chart-line" />
                    {objective === 'destacar'
                      ? <>Alcance estimado: <strong>~{Math.floor(Number(budget) / IMPRESSION_COST).toLocaleString('es-GT')} personas</strong> verán tu anuncio (impresiones).</>
                      : <>Estimado: <strong>~{Math.floor(Number(budget) / CLICK_COST).toLocaleString('es-GT')} contactos</strong> (clics en "Enviar mensaje").</>}
                  </div>
                )}

                {/* Fase 10.3 — método de pago */}
                {budgetNum >= MIN_BUDGET && (
                  <>
                    <label className="pa-label">¿Cómo pagas esta campaña?</label>
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
                          <strong><i className="fas fa-wallet" /> Solo mi saldo</strong>
                          <span>
                            {creditCoversAll
                              ? `Descuenta Q${budgetNum.toFixed(2)} de tu saldo (Q${availableCredit.toFixed(2)} disponibles).`
                              : `Tu saldo (Q${availableCredit.toFixed(2)}) no cubre el presupuesto.`}
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
                          <strong><i className="fas fa-layer-group" /> Saldo + tarjeta</strong>
                          <span>
                            {availableCredit > 0
                              ? <>Usa Q{Math.min(availableCredit, budgetNum).toFixed(2)} de saldo y cobra Q{cardCharge.toFixed(2)} a tu tarjeta.</>
                              : 'No tienes saldo disponible.'}
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
                          <strong><i className="fas fa-credit-card" /> Solo con tarjeta</strong>
                          <span>Cobra Q{budgetNum.toFixed(2)} a tu tarjeta y conserva tu saldo para después.</span>
                        </div>
                      </label>
                    </div>

                    {/* Resumen del pago */}
                    <div className="pa-pay-summary">
                      <div><span>Presupuesto</span><strong>Q{budgetNum.toFixed(2)}</strong></div>
                      <div><span>Desde tu saldo</span><strong className="pos">-Q{creditApplied.toFixed(2)}</strong></div>
                      <div className="total"><span>A cobrar con tarjeta</span><strong>Q{cardCharge.toFixed(2)}</strong></div>
                    </div>

                    {paymentMethod !== 'credit' && cardCharge > 0 && (
                      <p className="pa-pay-stub">
                        <i className="fas fa-info-circle" /> El cobro con tarjeta se habilitará al integrar la pasarela. Por ahora la campaña se activa sin cobro.
                      </p>
                    )}
                  </>
                )}

                <div className="pa-age">
                  <div>
                    <label className="pa-label">Inicia</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="pa-label">Finaliza</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>

                <div className="pa-section-title">Segmentación (opcional)</div>

                <label className="pa-label">Departamento</label>
                <select value={citId} onChange={(e) => { setCitId(e.target.value); setTowId(''); }}>
                  <option value="">Todos</option>
                  {(cities.data ?? []).map((c) => <option key={c.city} value={String(c.city)}>{c.description}</option>)}
                </select>

                <label className="pa-label">Municipio</label>
                <select value={towId} onChange={(e) => setTowId(e.target.value)} disabled={!citId}>
                  <option value="">Todos</option>
                  {(munis.data ?? []).map((m) => <option key={m.municipality} value={String(m.municipality)}>{m.description}</option>)}
                </select>

                <div className="pa-age">
                  <div>
                    <label className="pa-label">Edad mín.</label>
                    <input type="number" min={0} max={120} value={ageMin} onChange={(e) => setAgeMin(e.target.value)} placeholder="—" />
                  </div>
                  <div>
                    <label className="pa-label">Edad máx.</label>
                    <input type="number" min={0} max={120} value={ageMax} onChange={(e) => setAgeMax(e.target.value)} placeholder="—" />
                  </div>
                </div>

                <button className="pa-create" onClick={submit} disabled={createMut.isPending || !paymentValid}>
                  {createMut.isPending ? 'Creando…' : 'Crear campaña'}
                </button>
              </div>
            </div>

            {/* Mis campañas */}
            <div className="col-lg-7">
              <h5 style={{ marginBottom: 16 }}>Mis campañas</h5>
              {campaigns.isLoading && <p style={{ opacity: 0.6 }}>Cargando…</p>}
              {!campaigns.isLoading && rows.length === 0 && <p style={{ opacity: 0.6 }}>Aún no tienes campañas.</p>}
              <div className="pa-list">
                {pageRows.map((c) => (
                  <div key={c.camp_id} className="pa-camp">
                    <div className="pa-camp-main">
                      <span className={`pa-status pa-status-${c.camp_status}`}>{STATUS_LABEL[c.camp_status]}</span>
                      <span className="pa-obj-tag">{OBJ_LABEL[c.camp_objective]}</span>
                      <span className="pa-camp-title">{c.title}</span>
                    </div>
                    <div className="pa-metrics">
                      <span><i className="fas fa-eye" /> {c.impressions}</span>
                      <span><i className="fas fa-mouse-pointer" /> {c.clicks}</span>
                      <span><i className="fas fa-coins" /> Q{Number(c.spent).toFixed(2)} / Q{Number(c.budget).toFixed(2)}</span>
                      <span><i className="fas fa-wallet" /> Resta Q{Math.max(0, Number(c.budget) - Number(c.spent)).toFixed(2)}</span>
                      <span><i className="fas fa-clock" /> {daysBetween(c.start_date, c.end_date)}</span>
                    </div>
                    <div className="pa-progress"><div className="pa-progress-bar" style={{ width: `${Math.min(100, (Number(c.spent) / Math.max(1, Number(c.budget))) * 100)}%` }} /></div>
                    <div className="pa-camp-actions">
                      {c.camp_status === 'active' && <button onClick={() => changeStatus(c.camp_id, 'paused')}>Pausar</button>}
                      {c.camp_status === 'paused' && <button onClick={() => changeStatus(c.camp_id, 'active')}>Reanudar</button>}
                      {c.camp_status !== 'finished' && <button className="pa-finish" onClick={() => changeStatus(c.camp_id, 'finished')}>Finalizar</button>}
                    </div>
                  </div>
                ))}
              </div>
              <Pagination page={safePage} pageSize={PAGE_SIZE} total={rows.length} onPage={setPage} />
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .pa-explain { border: 1px solid var(--clr-common-border, #e0e2e5); border-radius: 14px; padding: 20px 22px; margin-bottom: 24px; background: rgba(108,92,231,0.04); }
        .pa-explain h5 { display: flex; align-items: center; gap: 9px; margin: 0 0 8px; }
        .pa-explain p { margin: 0 0 12px; font-size: 14px; opacity: 0.85; }
        .pa-obj-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
        @media (max-width: 575px) { .pa-obj-cards { grid-template-columns: 1fr; } }
        .pa-obj-card { border: 1px solid rgba(128,128,128,0.2); border-radius: 10px; padding: 12px 14px; background: var(--clr-bg-white, #fff); }
        .pa-obj-card strong { display: flex; align-items: center; gap: 7px; margin-bottom: 5px; }
        .pa-obj-card span { font-size: 13px; opacity: 0.75; }
        .pa-explain-list { list-style: none; padding: 0; margin: 4px 0 0; display: flex; flex-direction: column; gap: 10px; }
        .pa-explain-list li { display: flex; gap: 10px; align-items: flex-start; font-size: 13px; line-height: 1.55; opacity: 0.85; }
        .pa-explain-list li :global(i) { color: var(--clr-theme-1, #6c5ce7); margin-top: 3px; flex-shrink: 0; width: 16px; text-align: center; }
        .pa-explain-list li span { flex: 1; }
        .pa-card { border: 1px solid var(--clr-common-border, #e0e2e5); border-radius: 14px; padding: 22px; background: var(--clr-bg-white, #fff); }
        .pa-card h5 { margin: 0 0 6px; }
        .pa-label { display: block; font-weight: 600; font-size: 13px; margin: 12px 0 5px; }
        .pa-card select, .pa-card input { width: 100%; border: 1px solid rgba(128,128,128,0.3); border-radius: 8px; padding: 9px 11px; }
        .pa-hint { font-size: 12px; color: #b8860b; margin-top: 6px; }
        .pa-estimate { display: flex; align-items: flex-start; gap: 8px; margin-top: 8px; font-size: 13px; background: rgba(34,197,94,0.1); color: #16a34a; padding: 9px 12px; border-radius: 8px; }
        /* Fase 10.2/10.3 — tarjeta de saldo */
        .pa-credit-card { display: flex; align-items: center; gap: 14px; border-radius: 14px; padding: 16px 20px; margin-bottom: 22px; border: 1px solid; }
        .pa-credit-card.has { border-color: rgba(34,197,94,0.4); background: linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.04)); color: #15803d; }
        .pa-credit-card.empty { border-color: rgba(128,128,128,0.2); background: rgba(128,128,128,0.04); color: inherit; }
        .pa-credit-card-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
        .pa-credit-card.has .pa-credit-card-icon { background: rgba(34,197,94,0.18); color: #15803d; }
        .pa-credit-card.empty .pa-credit-card-icon { background: rgba(128,128,128,0.15); opacity: 0.6; }
        .pa-credit-card-body { display: flex; flex-direction: column; gap: 2px; }
        .pa-credit-card-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.65; font-weight: 600; }
        .pa-credit-card-amount { font-size: 24px; font-weight: 700; line-height: 1.1; }
        .pa-credit-card-note { font-size: 12.5px; opacity: 0.75; }
        /* Fase 10.3 — método de pago */
        .pa-pay-methods { display: flex; flex-direction: column; gap: 8px; }
        .pa-pay-opt { display: flex; gap: 10px; align-items: flex-start; border: 1px solid rgba(128,128,128,0.25); border-radius: 10px; padding: 11px 13px; cursor: pointer; transition: all 0.15s; }
        .pa-pay-opt.active { border-color: var(--clr-theme-1, #6c5ce7); background: rgba(108,92,231,0.06); }
        .pa-pay-opt.disabled { opacity: 0.5; cursor: not-allowed; }
        .pa-pay-opt input[type="radio"] { width: 18px !important; height: 18px; margin-top: 2px; cursor: inherit; flex-shrink: 0; }
        .pa-pay-opt > div { display: flex; flex-direction: column; gap: 2px; }
        .pa-pay-opt strong { display: flex; align-items: center; gap: 7px; font-size: 13.5px; }
        .pa-pay-opt strong :global(i) { color: var(--clr-theme-1, #6c5ce7); }
        .pa-pay-opt span { font-size: 12px; opacity: 0.7; }
        .pa-pay-summary { margin-top: 12px; background: rgba(128,128,128,0.06); border-radius: 10px; padding: 11px 14px; display: flex; flex-direction: column; gap: 4px; font-size: 13px; }
        .pa-pay-summary > div { display: flex; justify-content: space-between; }
        .pa-pay-summary .pos { color: #16a34a; }
        .pa-pay-summary .total { padding-top: 6px; border-top: 1px solid rgba(128,128,128,0.18); margin-top: 2px; font-weight: 600; }
        .pa-pay-stub { font-size: 12px; opacity: 0.7; margin-top: 8px; display: flex; gap: 6px; align-items: flex-start; }
        .pa-pay-stub :global(i) { color: var(--clr-theme-1, #6c5ce7); margin-top: 2px; }
        .pa-objective { display: flex; gap: 10px; }
        .pa-objective button { flex: 1; border: 1px solid rgba(128,128,128,0.3); background: transparent; border-radius: 10px; padding: 10px; cursor: pointer; font-weight: 600; display: inline-flex; align-items: center; justify-content: center; gap: 7px; }
        .pa-objective button.active { border-color: var(--clr-theme-1, #6c5ce7); background: rgba(108,92,231,0.08); color: var(--clr-theme-1, #6c5ce7); }
        .pa-section-title { font-weight: 700; margin: 18px 0 4px; font-size: 14px; }
        .pa-age { display: flex; gap: 12px; }
        .pa-age > div { flex: 1; }
        .pa-create { margin-top: 18px; width: 100%; background: var(--clr-theme-1, #6c5ce7); color: #fff; border: none; padding: 11px; border-radius: 24px; font-weight: 600; cursor: pointer; }
        .pa-create:disabled { opacity: 0.6; }
        .pa-list { display: flex; flex-direction: column; gap: 12px; }
        .pa-camp { border: 1px solid var(--clr-common-border, #e0e2e5); border-radius: 12px; padding: 14px 16px; background: var(--clr-bg-white, #fff); }
        .pa-camp-main { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; flex-wrap: wrap; }
        .pa-camp-title { font-weight: 600; }
        .pa-status { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; }
        .pa-status-active { background: rgba(34,197,94,0.16); color: #16a34a; }
        .pa-status-paused { background: rgba(245,158,11,0.18); color: #b8860b; }
        .pa-status-finished { background: rgba(128,128,128,0.18); color: #777; }
        .pa-obj-tag { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; background: rgba(108,92,231,0.12); color: #6c5ce7; }
        .pa-metrics { display: flex; gap: 16px; font-size: 13px; opacity: 0.75; margin-bottom: 8px; flex-wrap: wrap; }
        .pa-progress { height: 6px; border-radius: 4px; background: rgba(128,128,128,0.18); overflow: hidden; margin-bottom: 10px; }
        .pa-progress-bar { height: 100%; background: var(--clr-theme-1, #6c5ce7); }
        .pa-camp-actions { display: flex; gap: 8px; }
        .pa-camp-actions button { border: 1px solid rgba(128,128,128,0.3); background: transparent; border-radius: 8px; padding: 6px 14px; cursor: pointer; font-size: 13px; font-weight: 600; }
        .pa-camp-actions .pa-finish { color: #dc2626; border-color: rgba(239,68,68,0.4); }
      `}</style>
    </main>
  );
};

export default PautaMain;
