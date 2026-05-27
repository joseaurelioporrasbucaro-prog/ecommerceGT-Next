"use client";
import React, { useState } from 'react';
import ThemeChanger from '@/components/home/ThemeChanger';
import Breadcrumbs from '@/utils/Breadcrumbs';
import { useAuth } from '@/utils/AuthContext';
import { toast } from 'react-toastify';
import { ApiError } from '@/utils/Api';
import { useMyPublications } from '@/hooks/api/useMyPublications';
import { useCities, useMunicipalities } from '@/hooks/api/useCatalogs';
import { useMyCampaigns, useCreateCampaign, useSetCampaignStatus } from '@/hooks/api/useCampaigns';
import type { CampaignStatus, CampaignObjective } from '@/types/api';

const GUATEMALA = 502; // cou_id
const MIN_BUDGET = 10;
const STATUS_LABEL: Record<CampaignStatus, string> = { active: 'Activa', paused: 'Pausada', finished: 'Finalizada' };
const OBJ_LABEL: Record<CampaignObjective, string> = { destacar: 'Destacar', mensajes: 'Mensajes' };

const daysBetween = (start: string, end: string | null): string => {
  if (!end) return 'Sin fecha de fin';
  const d = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (24 * 3600 * 1000));
  return d > 0 ? `${d} día${d !== 1 ? 's' : ''}` : '—';
};

const PautaMain = () => {
  const { user } = useAuth();
  const myPubs = useMyPublications(user?.id);
  const campaigns = useMyCampaigns();
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

  const cities = useCities(GUATEMALA);
  const munis = useMunicipalities(citId || null);

  // Solo publicaciones activas (no borrador=1, no anulada=4).
  const activePubs = (myPubs.data ?? []).filter((p) => p.pubsta_id !== 1 && p.pubsta_id !== 4);

  const submit = () => {
    if (!pubId) { toast.error('Selecciona una publicación.'); return; }
    if ((Number(budget) || 0) < MIN_BUDGET) { toast.error(`El presupuesto mínimo es Q${MIN_BUDGET}.`); return; }
    createMut.mutate(
      {
        pubId: Number(pubId),
        objective,
        budget: Number(budget) || 0,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        targetCitId: citId ? Number(citId) : null,
        targetTowId: towId ? Number(towId) : null,
        targetAgeMin: ageMin ? Number(ageMin) : null,
        targetAgeMax: ageMax ? Number(ageMax) : null,
      },
      {
        onSuccess: (r) => {
          toast.success(r.message || 'Campaña creada.');
          setPubId(''); setBudget(''); setStartDate(''); setEndDate(''); setCitId(''); setTowId(''); setAgeMin(''); setAgeMax(''); setObjective('destacar');
        },
        onError: (e) => toast.error(e instanceof ApiError ? e.message : 'No se pudo crear'),
      },
    );
  };

  const changeStatus = (campId: number, status: CampaignStatus) =>
    statusMut.mutate({ campId, status }, { onError: () => toast.error('No se pudo actualizar') });

  const rows = campaigns.data ?? [];

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
                <strong><i className="fas fa-bolt" /> Destacar</strong>
                <span>Se muestra arriba con el sello "Patrocinado". El presupuesto se consume por <em>impresiones</em> (cada vez que se muestra a alguien del público objetivo).</span>
              </div>
              <div className="pa-obj-card">
                <strong><i className="fas fa-paper-plane" /> Mensajes</strong>
                <span>Igual de destacada, pero pensada para recibir contactos: el presupuesto se consume por <em>clic</em> en "Enviar mensaje".</span>
              </div>
            </div>
            <p className="pa-explain-note"><i className="fas fa-info-circle" /> El cobro real se habilitará al integrar la pasarela de pago. Por ahora la campaña se activa al crearse (sin cobro). Presupuesto mínimo: <strong>Q{MIN_BUDGET}</strong>.</p>
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
                {activePubs.length === 0 && <p className="pa-hint">No tienes publicaciones activas para promocionar.</p>}

                <label className="pa-label">Objetivo</label>
                <div className="pa-objective">
                  <button type="button" className={objective === 'destacar' ? 'active' : ''} onClick={() => setObjective('destacar')}><i className="fas fa-bolt" /> Destacar</button>
                  <button type="button" className={objective === 'mensajes' ? 'active' : ''} onClick={() => setObjective('mensajes')}><i className="fas fa-paper-plane" /> Mensajes</button>
                </div>

                <label className="pa-label">Presupuesto (Q, mín. {MIN_BUDGET})</label>
                <input type="number" min={MIN_BUDGET} step="0.01" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder={`${MIN_BUDGET}.00`} />

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

                <button className="pa-create" onClick={submit} disabled={createMut.isPending}>
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
                {rows.map((c) => (
                  <div key={c.camp_id} className="pa-camp">
                    <div className="pa-camp-main">
                      <span className={`pa-status pa-status-${c.camp_status}`}>{STATUS_LABEL[c.camp_status]}</span>
                      <span className="pa-obj-tag">{OBJ_LABEL[c.camp_objective]}</span>
                      <span className="pa-camp-title">{c.title}</span>
                    </div>
                    <div className="pa-metrics">
                      <span><i className="fas fa-eye" /> {c.impressions}</span>
                      <span><i className="fas fa-mouse-pointer" /> {c.clicks}</span>
                      <span><i className="fas fa-coins" /> Q{Number(c.budget).toFixed(2)}</span>
                      <span><i className="fas fa-clock" /> {daysBetween(c.start_date, c.end_date)}</span>
                    </div>
                    <div className="pa-camp-actions">
                      {c.camp_status === 'active' && <button onClick={() => changeStatus(c.camp_id, 'paused')}>Pausar</button>}
                      {c.camp_status === 'paused' && <button onClick={() => changeStatus(c.camp_id, 'active')}>Reanudar</button>}
                      {c.camp_status !== 'finished' && <button className="pa-finish" onClick={() => changeStatus(c.camp_id, 'finished')}>Finalizar</button>}
                    </div>
                  </div>
                ))}
              </div>
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
        .pa-explain-note { font-size: 12.5px; opacity: 0.7; display: flex; gap: 7px; align-items: flex-start; }
        .pa-card { border: 1px solid var(--clr-common-border, #e0e2e5); border-radius: 14px; padding: 22px; background: var(--clr-bg-white, #fff); }
        .pa-card h5 { margin: 0 0 6px; }
        .pa-label { display: block; font-weight: 600; font-size: 13px; margin: 12px 0 5px; }
        .pa-card select, .pa-card input { width: 100%; border: 1px solid rgba(128,128,128,0.3); border-radius: 8px; padding: 9px 11px; }
        .pa-hint { font-size: 12px; color: #b8860b; margin-top: 6px; }
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
        .pa-metrics { display: flex; gap: 16px; font-size: 13px; opacity: 0.75; margin-bottom: 10px; flex-wrap: wrap; }
        .pa-camp-actions { display: flex; gap: 8px; }
        .pa-camp-actions button { border: 1px solid rgba(128,128,128,0.3); background: transparent; border-radius: 8px; padding: 6px 14px; cursor: pointer; font-size: 13px; font-weight: 600; }
        .pa-camp-actions .pa-finish { color: #dc2626; border-color: rgba(239,68,68,0.4); }
      `}</style>
    </main>
  );
};

export default PautaMain;
