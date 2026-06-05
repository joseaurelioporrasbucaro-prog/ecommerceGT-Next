"use client";
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Modal from 'react-responsive-modal';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useAuth } from '@/utils/AuthContext';
import { useDeleteAccount } from '@/hooks/api/useDeleteAccount';
import { useDeactivateAccount } from '@/hooks/api/useDeactivateAccount';
import { ApiError } from '@/utils/Api';

/**
 * Fase 12.1 — Zona de peligro con DOS opciones distintas:
 *
 *   1. DESACTIVAR cuenta (amarillo, recuperable siempre)
 *      → status='inactive'. No anonimiza nada. Login normal la reactiva.
 *      Para usuarios que necesitan "tomar un descanso" sin perder datos.
 *
 *   2. ELIMINAR cuenta (rojo, 30 días gracia + anonimización)
 *      → status='pending_deletion'. Publicaciones se pausan. Si el usuario
 *      regresa con login dentro de los 30 días, todo se restaura. Pasado
 *      el plazo, cleanup lazy anonimiza definitivamente.
 *
 * Ambos flujos requieren confirmación con contraseña actual + checkbox
 * de aceptación. Diferenciamos visualmente:
 * - Desactivar: card amarilla, modal con foco en "tranquilo, podés volver".
 * - Eliminar: card roja, modal con lista completa de consecuencias.
 */
type Mode = null | 'deactivate' | 'delete';

const DangerZone: React.FC = () => {
  const t = useTranslations('danger');
  const router = useRouter();
  const { logout } = useAuth();
  const deactivateMut = useDeactivateAccount();
  const deleteMut = useDeleteAccount();

  const [mode, setMode] = useState<Mode>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [password, setPassword] = useState('');

  const pending = deactivateMut.isPending || deleteMut.isPending;
  const rich = {
    strong: (chunks: React.ReactNode) => <strong>{chunks}</strong>,
  };

  const close = () => {
    if (pending) return;          // no cerramos a mitad de request
    setMode(null);
    setAcknowledged(false);
    setPassword('');
  };

  const finish = async (message: string) => {
    toast.success(message);
    setMode(null);
    setAcknowledged(false);
    setPassword('');
    // El backend ya limpió la cookie; ahora limpiamos el cliente.
    await logout().catch(() => { });
    router.push('/');
  };

  const confirmDeactivate = () => {
    if (!acknowledged) { toast.error(t('validation.ackDeactivate')); return; }
    if (password.length < 4) { toast.error(t('validation.password')); return; }
    deactivateMut.mutate(
      { password },
      {
        onSuccess: (r) => finish(r.message || t('toast.deactivated')),
        onError: (e) => toast.error(e instanceof ApiError ? e.message : t('toast.deactivateError')),
      },
    );
  };

  const confirmDelete = () => {
    if (!acknowledged) { toast.error(t('validation.ackDelete')); return; }
    if (password.length < 4) { toast.error(t('validation.password')); return; }
    deleteMut.mutate(
      { password },
      {
        onSuccess: (r) => finish(r.message || t('toast.deleteScheduled')),
        onError: (e) => toast.error(e instanceof ApiError ? e.message : t('toast.deleteError')),
      },
    );
  };

  return (
    <div className="danger-zone">
      <div className="dz-head">
        <h5><i className="fas fa-exclamation-triangle" /> {t('header.title')}</h5>
        <p>{t('header.body')}</p>
      </div>

      {/* Opción 1: DESACTIVAR */}
      <div className="dz-row dz-row-warning">
        <div>
          <strong>{t('deactivate.cardTitle')}</strong>
          <p>
            {t('deactivate.cardBody')}
          </p>
        </div>
        <button
          type="button"
          className="dz-btn dz-btn-warning"
          onClick={() => setMode('deactivate')}
        >
          <i className="fas fa-pause" /> {t('deactivate.button')}
        </button>
      </div>

      {/* Opción 2: ELIMINAR */}
      <div className="dz-row dz-row-danger">
        <div>
          <strong>{t('delete.cardTitle')}</strong>
          <p>
            {t('delete.cardBody')}
          </p>
        </div>
        <button
          type="button"
          className="dz-btn dz-btn-danger"
          onClick={() => setMode('delete')}
        >
          <i className="fas fa-trash" /> {t('delete.button')}
        </button>
      </div>

      {/* ───── Modal Desactivar ───── */}
      <Modal
        open={mode === 'deactivate'}
        onClose={close}
        center
        styles={{
          overlay: { background: 'rgba(0,0,0,0.55)' },
          modal: { maxWidth: 520, width: '92%', padding: '28px 26px', borderRadius: 14 },
          closeButton: { display: 'none' },
        }}
      >
        <div className="dz-modal-body">
          <div className="dz-modal-icon dz-modal-icon-warning">
            <i className="fas fa-pause" />
          </div>
          <h4>{t('deactivate.modalTitle')}</h4>
          <p className="dz-modal-text">{t.rich('deactivate.modalIntro', rich)}</p>
          <ul className="dz-modal-list">
            <li>{t('deactivate.items.paused')}</li>
            <li>{t('deactivate.items.kept')}</li>
            <li>{t('deactivate.items.return')}</li>
            <li>{t('deactivate.items.noLimit')}</li>
          </ul>

          <label className="dz-modal-ack">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
            />
            <span>{t('deactivate.ack')}</span>
          </label>

          <label className="dz-modal-pwd-label">{t('passwordLabel')}</label>
          <input
            type="password"
            className="dz-modal-pwd"
            placeholder={t('passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <div className="dz-modal-actions">
            <button type="button" className="border-btn" onClick={close} disabled={pending}>
              {t('cancel')}
            </button>
            <button
              type="button"
              className="dz-modal-confirm dz-modal-confirm-warning"
              onClick={confirmDeactivate}
              disabled={!acknowledged || password.length < 4 || pending}
            >
              {deactivateMut.isPending ? t('deactivate.pending') : t('deactivate.confirm')}
            </button>
          </div>
        </div>
      </Modal>

      {/* ───── Modal Eliminar ───── */}
      <Modal
        open={mode === 'delete'}
        onClose={close}
        center
        styles={{
          overlay: { background: 'rgba(0,0,0,0.55)' },
          modal: { maxWidth: 540, width: '92%', padding: '28px 26px', borderRadius: 14 },
          closeButton: { display: 'none' },
        }}
      >
        <div className="dz-modal-body">
          <div className="dz-modal-icon dz-modal-icon-danger">
            <i className="fas fa-exclamation-triangle" />
          </div>
          <h4>{t('delete.modalTitle')}</h4>
          <p className="dz-modal-text">
            {t.rich('delete.modalIntro', rich)}
          </p>
          <ul className="dz-modal-list">
            <li>{t('delete.items.pauseListings')}</li>
            <li>{t('delete.items.pauseCampaigns')}</li>
            <li>{t.rich('delete.items.cancelWindow', rich)}</li>
            <li>
              {t.rich('delete.items.anonymize', rich)}
            </li>
            <li>{t('delete.items.noLogin')}</li>
          </ul>

          <label className="dz-modal-ack">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
            />
            <span>
              {t('delete.ack')}
            </span>
          </label>

          <label className="dz-modal-pwd-label">{t('passwordLabel')}</label>
          <input
            type="password"
            className="dz-modal-pwd"
            placeholder={t('passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <div className="dz-modal-actions">
            <button type="button" className="border-btn" onClick={close} disabled={pending}>
              {t('cancel')}
            </button>
            <button
              type="button"
              className="dz-modal-confirm dz-modal-confirm-danger"
              onClick={confirmDelete}
              disabled={!acknowledged || password.length < 4 || pending}
            >
              {deleteMut.isPending ? t('delete.pending') : t('delete.confirm')}
            </button>
          </div>
        </div>
      </Modal>

      <style jsx>{`
        .danger-zone {
          margin-top: 40px;
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: 14px;
          padding: 20px 22px;
          background: rgba(239, 68, 68, 0.025);
        }
        .dz-head h5 {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #b91c1c;
          margin: 0 0 4px;
        }
        .dz-head h5 :global(i) { color: #ef4444; }
        .dz-head p { margin: 0 0 14px; font-size: 13px; opacity: 0.7; }
        .dz-row {
          display: flex;
          gap: 16px;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          padding: 14px 0;
        }
        .dz-row + .dz-row { border-top: 1px solid rgba(239, 68, 68, 0.15); }
        .dz-row > div { flex: 1; min-width: 240px; }
        .dz-row strong { display: block; margin-bottom: 4px; font-size: 14.5px; }
        .dz-row p { font-size: 13px; opacity: 0.75; margin: 0; line-height: 1.5; }
        .dz-row-warning strong { color: #b45309; }
        .dz-row-danger strong { color: #b91c1c; }

        .dz-btn {
          border: none;
          padding: 10px 18px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          white-space: nowrap;
          color: #fff;
          transition: background 0.15s;
        }
        .dz-btn-warning { background: #d97706; }
        .dz-btn-warning:hover { background: #b45309; }
        .dz-btn-danger { background: #ef4444; }
        .dz-btn-danger:hover { background: #dc2626; }

        .dz-modal-body { text-align: center; }
        .dz-modal-body :global(h4) { margin: 0 0 10px; font-size: 22px; font-weight: 700; }
        .dz-modal-icon {
          width: 60px;
          height: 60px;
          margin: 0 auto 14px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
        }
        .dz-modal-icon-warning { background: rgba(217, 119, 6, 0.15); color: #d97706; }
        .dz-modal-icon-danger { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
        .dz-modal-text { font-size: 14px; margin: 0 0 8px; opacity: 0.9; }
        .dz-modal-list {
          text-align: left;
          font-size: 13.5px;
          line-height: 1.55;
          margin: 0 0 18px;
          padding-left: 20px;
          opacity: 0.9;
        }
        .dz-modal-list li { margin-bottom: 4px; }
        .dz-modal-ack {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          text-align: left;
          font-size: 13px;
          margin: 0 0 14px;
          padding: 10px 12px;
          background: rgba(128, 128, 128, 0.08);
          border-radius: 8px;
          cursor: pointer;
        }
        .dz-modal-ack input { margin-top: 3px; cursor: pointer; }
        .dz-modal-pwd-label {
          display: block;
          text-align: left;
          font-size: 13px;
          font-weight: 600;
          margin: 0 0 6px;
        }
        .dz-modal-pwd {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid rgba(128, 128, 128, 0.3);
          border-radius: 8px;
          margin-bottom: 18px;
          font-size: 14px;
          box-sizing: border-box;
        }
        .dz-modal-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .dz-modal-actions :global(.border-btn) { height: 42px; padding: 0 22px; font-size: 14px; }
        .dz-modal-confirm {
          border: none;
          padding: 0 22px;
          height: 42px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          color: #fff;
          transition: background 0.15s;
        }
        .dz-modal-confirm:disabled { opacity: 0.55; cursor: not-allowed; }
        .dz-modal-confirm-warning { background: #d97706; }
        .dz-modal-confirm-warning:not(:disabled):hover { background: #b45309; }
        .dz-modal-confirm-danger { background: #ef4444; }
        .dz-modal-confirm-danger:not(:disabled):hover { background: #dc2626; }
      `}</style>
    </div>
  );
};

export default DangerZone;
