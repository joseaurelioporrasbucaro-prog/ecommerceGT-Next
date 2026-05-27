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
import type { CampaignStatus } from '@/types/api';

const GUATEMALA = 502; // cou_id
const STATUS_LABEL: Record<CampaignStatus, string> = { active: 'Activa', paused: 'Pausada', finished: 'Finalizada' };

const PautaMain = () => {
  const { user } = useAuth();
  const myPubs = useMyPublications(user?.id);
  const campaigns = useMyCampaigns();
  const createMut = useCreateCampaign();
  const statusMut = useSetCampaignStatus();

  const [pubId, setPubId] = useState('');
  const [budget, setBudget] = useState('');
  const [endDate, setEndDate] = useState('');
  const [citId, setCitId] = useState('');
  const [towId, setTowId] = useState('');
  const [ageMin, setAgeMin] = useState('');
  const [ageMax, setAgeMax] = useState('');

  const cities = useCities(GUATEMALA);
  const munis = useMunicipalities(citId || null);

  const submit = () => {
    if (!pubId) { toast.error('Selecciona una publicación.'); return; }
    createMut.mutate(
      {
        pubId: Number(pubId),
        budget: Number(budget) || 0,
        endDate: endDate || undefined,
        targetCitId: citId ? Number(citId) : null,
        targetTowId: towId ? Number(towId) : null,
        targetAgeMin: ageMin ? Number(ageMin) : null,
        targetAgeMax: ageMax ? Number(ageMax) : null,
      },
      {
        onSuccess: (r) => {
          toast.success(r.message || 'Campaña creada.');
          setPubId(''); setBudget(''); setEndDate(''); setCitId(''); setTowId(''); setAgeMin(''); setAgeMax('');
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
          <div className="row">
            {/* Crear campaña */}
            <div className="col-lg-5">
              <div className="pa-card">
                <h5>Nueva campaña</h5>
                <p className="pa-note"><i className="fas fa-info-circle" /> El cobro se habilitará pronto. Por ahora la campaña se activa al crearse.</p>

                <label className="pa-label">Publicación</label>
                <select value={pubId} onChange={(e) => setPubId(e.target.value)}>
                  <option value="">Selecciona…</option>
                  {(myPubs.data ?? []).map((p: any) => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>

                <label className="pa-label">Presupuesto (Q)</label>
                <input type="number" min={0} value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="0.00" />

                <label className="pa-label">Finaliza (opcional)</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

                <div className="pa-section-title">Segmentación (opcional)</div>

                <label className="pa-label">Departamento</label>
                <select value={citId} onChange={(e) => { setCitId(e.target.value); setTowId(''); }}>
                  <option value="">Todos</option>
                  {(cities.data ?? []).map((c: any) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>

                <label className="pa-label">Municipio</label>
                <select value={towId} onChange={(e) => setTowId(e.target.value)} disabled={!citId}>
                  <option value="">Todos</option>
                  {(munis.data ?? []).map((m: any) => <option key={m.value} value={m.value}>{m.label}</option>)}
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
                      <span className="pa-camp-title">{c.title}</span>
                    </div>
                    <div className="pa-metrics">
                      <span><i className="fas fa-eye" /> {c.impressions}</span>
                      <span><i className="fas fa-mouse-pointer" /> {c.clicks}</span>
                      <span><i className="fas fa-coins" /> Q{Number(c.budget).toFixed(2)}</span>
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
        .pa-card { border: 1px solid var(--clr-common-border, #e0e2e5); border-radius: 14px; padding: 22px; background: var(--clr-bg-white, #fff); }
        .pa-card h5 { margin: 0 0 6px; }
        .pa-note { font-size: 12px; opacity: 0.65; margin-bottom: 14px; display: flex; gap: 7px; }
        .pa-label { display: block; font-weight: 600; font-size: 13px; margin: 12px 0 5px; }
        .pa-card select, .pa-card input { width: 100%; border: 1px solid rgba(128,128,128,0.3); border-radius: 8px; padding: 9px 11px; }
        .pa-section-title { font-weight: 700; margin: 18px 0 4px; font-size: 14px; }
        .pa-age { display: flex; gap: 12px; }
        .pa-age > div { flex: 1; }
        .pa-create { margin-top: 18px; width: 100%; background: var(--clr-theme-1, #6c5ce7); color: #fff; border: none; padding: 11px; border-radius: 24px; font-weight: 600; cursor: pointer; }
        .pa-create:disabled { opacity: 0.6; }
        .pa-list { display: flex; flex-direction: column; gap: 12px; }
        .pa-camp { border: 1px solid var(--clr-common-border, #e0e2e5); border-radius: 12px; padding: 14px 16px; background: var(--clr-bg-white, #fff); }
        .pa-camp-main { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
        .pa-camp-title { font-weight: 600; }
        .pa-status { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; }
        .pa-status-active { background: rgba(34,197,94,0.16); color: #16a34a; }
        .pa-status-paused { background: rgba(245,158,11,0.18); color: #b8860b; }
        .pa-status-finished { background: rgba(128,128,128,0.18); color: #777; }
        .pa-metrics { display: flex; gap: 16px; font-size: 13px; opacity: 0.75; margin-bottom: 10px; }
        .pa-camp-actions { display: flex; gap: 8px; }
        .pa-camp-actions button { border: 1px solid rgba(128,128,128,0.3); background: transparent; border-radius: 8px; padding: 6px 14px; cursor: pointer; font-size: 13px; font-weight: 600; }
        .pa-camp-actions .pa-finish { color: #dc2626; border-color: rgba(239,68,68,0.4); }
      `}</style>
    </main>
  );
};

export default PautaMain;
