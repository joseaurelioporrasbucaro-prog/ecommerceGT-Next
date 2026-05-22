"use client";
import React, { useState } from 'react';
import ThemeChanger from '@/components/home/ThemeChanger';
import Breadcrumbs from '@/utils/Breadcrumbs';
import { useAuth } from '@/utils/AuthContext';
import { getBackendUrl } from '@/utils/backendUrl';
import { toast } from 'react-toastify';
import { ApiError } from '@/utils/Api';
import { useVerificationRequests, useResolveVerification } from '@/hooks/api/useVerification';
import type { VerificationRequestRow } from '@/types/api';

const docUrl = (verId: number, side: 'front' | 'back') =>
  getBackendUrl(`/verification/document/${verId}/${side}`);

const RequestCard = ({ req }: { req: VerificationRequestRow }) => {
  const resolve = useResolveVerification();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');

  const name = `${req.firstname ?? ''} ${req.lastname ?? ''}`.trim() || 'Usuario';
  const isPersonal = req.ver_type === 'personal';

  const approve = () =>
    resolve.mutate(
      { verId: req.ver_id, action: 'approve' },
      {
        onSuccess: (r) => toast.success(r.message || 'Aprobada.'),
        onError: (e) => toast.error(e instanceof ApiError ? e.message : 'No se pudo aprobar'),
      },
    );

  const reject = () => {
    if (reason.trim().length < 4) {
      toast.error('Escribe un motivo de rechazo.');
      return;
    }
    resolve.mutate(
      { verId: req.ver_id, action: 'reject', reason: reason.trim() },
      {
        onSuccess: (r) => {
          toast.success(r.message || 'Rechazada.');
          setRejecting(false);
          setReason('');
        },
        onError: (e) => toast.error(e instanceof ApiError ? e.message : 'No se pudo rechazar'),
      },
    );
  };

  return (
    <div className="sv-card">
      <div className="sv-head">
        <div>
          <span className={`sv-chip sv-chip-${isPersonal ? 'personal' : 'business'}`}>
            {isPersonal ? 'DPI · Personal' : 'RTU · Empresa'}
          </span>
          <h5 className="sv-name">
            {isPersonal ? name : (req.companyname || 'Empresa')}
            {req.handle && <span className="sv-handle"> @{req.handle}</span>}
          </h5>
          <div className="sv-doc">{isPersonal ? 'DPI' : 'NIT'}: <strong>{req.ver_document}</strong></div>
        </div>
        <span className="sv-date">{new Date(req.created_at).toLocaleDateString('es-GT')}</span>
      </div>

      <div className="sv-docs">
        {isPersonal ? (
          <>
            <a className="sv-doc-thumb" href={docUrl(req.ver_id, 'front')} target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={docUrl(req.ver_id, 'front')} alt="DPI frente" />
              <span>Frente</span>
            </a>
            <a className="sv-doc-thumb" href={docUrl(req.ver_id, 'back')} target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={docUrl(req.ver_id, 'back')} alt="DPI reverso" />
              <span>Reverso</span>
            </a>
          </>
        ) : (
          <a className="sv-rtu-link" href={docUrl(req.ver_id, 'front')} target="_blank" rel="noopener noreferrer">
            <i className="fas fa-file-pdf" /> Abrir RTU
          </a>
        )}
      </div>

      {!rejecting ? (
        <div className="sv-actions">
          <button className="sv-btn sv-approve" onClick={approve} disabled={resolve.isPending}>
            <i className="fas fa-check" /> Aprobar
          </button>
          <button className="sv-btn sv-reject" onClick={() => setRejecting(true)} disabled={resolve.isPending}>
            <i className="fas fa-times" /> Rechazar
          </button>
        </div>
      ) : (
        <div className="sv-reject-box">
          <textarea
            placeholder="Motivo del rechazo (lo verá el usuario)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
          />
          <div className="sv-actions">
            <button className="sv-btn sv-reject" onClick={reject} disabled={resolve.isPending}>
              Confirmar rechazo
            </button>
            <button className="sv-btn sv-ghost" onClick={() => { setRejecting(false); setReason(''); }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .sv-card { border: 1px solid var(--clr-common-border, #e0e2e5); border-radius: 14px; padding: 20px; background: var(--clr-bg-white, #fff); }
        .sv-head { display: flex; justify-content: space-between; gap: 12px; }
        .sv-chip { display: inline-block; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; margin-bottom: 8px; }
        .sv-chip-personal { background: rgba(59,130,246,0.14); color: #2563eb; }
        .sv-chip-business { background: rgba(212,175,55,0.18); color: #b8860b; }
        .sv-name { margin: 0 0 4px; font-size: 17px; }
        .sv-handle { color: #3b82f6; font-weight: 400; font-size: 14px; }
        .sv-doc { font-size: 14px; opacity: 0.8; }
        .sv-date { font-size: 12px; opacity: 0.55; white-space: nowrap; }
        .sv-docs { display: flex; gap: 12px; margin: 16px 0; flex-wrap: wrap; }
        .sv-doc-thumb { display: block; width: 150px; text-decoration: none; color: inherit; }
        .sv-doc-thumb img { width: 150px; height: 95px; object-fit: cover; border-radius: 8px; border: 1px solid rgba(128,128,128,0.25); display: block; }
        .sv-doc-thumb span { display: block; text-align: center; font-size: 12px; margin-top: 4px; opacity: 0.7; }
        .sv-rtu-link { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 8px; background: rgba(239,68,68,0.1); color: #dc2626; font-weight: 600; text-decoration: none; }
        .sv-actions { display: flex; gap: 10px; }
        .sv-btn { padding: 9px 18px; border-radius: 24px; border: none; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 7px; }
        .sv-btn:disabled { opacity: 0.6; cursor: default; }
        .sv-approve { background: #16a34a; color: #fff; }
        .sv-reject { background: #dc2626; color: #fff; }
        .sv-ghost { background: transparent; border: 1px solid rgba(128,128,128,0.4); }
        .sv-reject-box textarea { width: 100%; border: 1px solid rgba(128,128,128,0.3); border-radius: 8px; padding: 10px; margin-bottom: 10px; resize: vertical; }
      `}</style>
    </div>
  );
};

const SupportVerificationsMain = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<'pending' | 'verified' | 'rejected'>('pending');
  const { data, isLoading } = useVerificationRequests(status);

  const isSupport = user?.role === 'support' || user?.role === 'admin';

  return (
    <main>
      <ThemeChanger />
      <Breadcrumbs breadcrumbTitle="Soporte" breadcrumbSubTitle="Verificaciones" />

      <section className="creator-area pt-130 pb-100">
        <div className="container">
          {!isSupport ? (
            <div className="alert alert-danger">Acceso restringido. Solo el equipo de soporte puede ver esta página.</div>
          ) : (
            <>
              <div className="sv-filter">
                {(['pending', 'verified', 'rejected'] as const).map((s) => (
                  <button
                    key={s}
                    className={`sv-tab ${status === s ? 'active' : ''}`}
                    onClick={() => setStatus(s)}
                  >
                    {s === 'pending' ? 'Pendientes' : s === 'verified' ? 'Aprobadas' : 'Rechazadas'}
                  </button>
                ))}
              </div>

              {isLoading && <p style={{ opacity: 0.6 }}>Cargando…</p>}
              {!isLoading && (data?.length ?? 0) === 0 && (
                <p style={{ opacity: 0.6 }}>No hay solicitudes {status === 'pending' ? 'pendientes' : status === 'verified' ? 'aprobadas' : 'rechazadas'}.</p>
              )}

              <div className="sv-grid">
                {data?.map((req) => <RequestCard key={req.ver_id} req={req} />)}
              </div>
            </>
          )}
        </div>
      </section>

      <style jsx>{`
        .sv-filter { display: flex; gap: 10px; margin-bottom: 26px; }
        .sv-tab { padding: 8px 20px; border-radius: 24px; border: 1px solid rgba(128,128,128,0.3); background: transparent; cursor: pointer; font-weight: 600; }
        .sv-tab.active { background: var(--clr-theme-1, #6c5ce7); color: #fff; border-color: transparent; }
        .sv-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 18px; }
      `}</style>
    </main>
  );
};

export default SupportVerificationsMain;
