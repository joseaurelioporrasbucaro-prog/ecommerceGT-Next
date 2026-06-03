"use client";
import React, { useState } from 'react';
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
  const router = useRouter();
  const { logout } = useAuth();
  const deactivateMut = useDeactivateAccount();
  const deleteMut = useDeleteAccount();

  const [mode, setMode] = useState<Mode>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [password, setPassword] = useState('');

  const pending = deactivateMut.isPending || deleteMut.isPending;

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
    if (!acknowledged) { toast.error('Confirmá que entendés la acción.'); return; }
    if (password.length < 4) { toast.error('Ingresá tu contraseña.'); return; }
    deactivateMut.mutate(
      { password },
      {
        onSuccess: (r) => finish(r.message || 'Cuenta desactivada.'),
        onError: (e) => toast.error(e instanceof ApiError ? e.message : 'No se pudo desactivar la cuenta'),
      },
    );
  };

  const confirmDelete = () => {
    if (!acknowledged) { toast.error('Confirmá que aceptás las consecuencias.'); return; }
    if (password.length < 4) { toast.error('Ingresá tu contraseña.'); return; }
    deleteMut.mutate(
      { password },
      {
        onSuccess: (r) => finish(r.message || 'Eliminación programada.'),
        onError: (e) => toast.error(e instanceof ApiError ? e.message : 'No se pudo programar la eliminación'),
      },
    );
  };

  return (
    <div className="danger-zone">
      <div className="dz-head">
        <h5><i className="fas fa-exclamation-triangle" /> Zona sensible</h5>
        <p>Acciones que afectan el estado de tu cuenta. Elegí la que corresponda.</p>
      </div>

      {/* Opción 1: DESACTIVAR */}
      <div className="dz-row dz-row-warning">
        <div>
          <strong>Desactivar mi cuenta (recuperable)</strong>
          <p>
            Pausa tu cuenta sin perder nada — publicaciones, mensajes, fotos
            y configuración quedan intactas. Podés regresar haciendo login
            cuando quieras y todo se reactiva automáticamente.
          </p>
        </div>
        <button
          type="button"
          className="dz-btn dz-btn-warning"
          onClick={() => setMode('deactivate')}
        >
          <i className="fas fa-pause" /> Desactivar
        </button>
      </div>

      {/* Opción 2: ELIMINAR */}
      <div className="dz-row dz-row-danger">
        <div>
          <strong>Eliminar mi cuenta (30 días de gracia)</strong>
          <p>
            Programa tu cuenta para eliminación en 30 días. Durante ese plazo
            podés cambiar de opinión iniciando sesión. Pasados los 30 días,
            tu información personal se anonimiza de forma definitiva y la
            cuenta no se puede recuperar.
          </p>
        </div>
        <button
          type="button"
          className="dz-btn dz-btn-danger"
          onClick={() => setMode('delete')}
        >
          <i className="fas fa-trash" /> Eliminar cuenta
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
          <h4>¿Desactivar tu cuenta?</h4>
          <p className="dz-modal-text">Esta opción es <strong>reversible</strong>. Al confirmar:</p>
          <ul className="dz-modal-list">
            <li>Tu cuenta queda pausada y no podés iniciar sesión normalmente.</li>
            <li>Tus publicaciones y mensajes se conservan tal como están.</li>
            <li>Cuando quieras regresar, iniciá sesión con tu correo y contraseña y la cuenta se reactiva sola.</li>
            <li>No hay límite de tiempo para volver.</li>
          </ul>

          <label className="dz-modal-ack">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
            />
            <span>Entiendo que mi cuenta queda pausada y que puedo recuperarla en cualquier momento iniciando sesión.</span>
          </label>

          <label className="dz-modal-pwd-label">Confirmá con tu contraseña actual</label>
          <input
            type="password"
            className="dz-modal-pwd"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <div className="dz-modal-actions">
            <button type="button" className="border-btn" onClick={close} disabled={pending}>
              Cancelar
            </button>
            <button
              type="button"
              className="dz-modal-confirm dz-modal-confirm-warning"
              onClick={confirmDeactivate}
              disabled={!acknowledged || password.length < 4 || pending}
            >
              {deactivateMut.isPending ? 'Desactivando…' : 'Desactivar cuenta'}
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
          <h4>¿Eliminar tu cuenta?</h4>
          <p className="dz-modal-text">
            Esta acción inicia un <strong>plazo de 30 días</strong>. Al confirmar:
          </p>
          <ul className="dz-modal-list">
            <li>Tus publicaciones se pausan inmediatamente (no aparecen en el catálogo).</li>
            <li>Tus campañas activas se pausan (el crédito de pauta se perderá si pasan los 30 días sin recuperar).</li>
            <li>Durante 30 días podés <strong>cancelar la eliminación</strong> iniciando sesión con tu correo y contraseña — todo vuelve a la normalidad.</li>
            <li>
              Pasados los 30 días, tu nombre se reemplaza por &quot;Usuario eliminado&quot;,
              tu correo, teléfono, dirección, fotos, DPI y handle se borran
              de forma <strong>definitiva e irreversible</strong>.
            </li>
            <li>Después del plazo no podrás iniciar sesión con esta cuenta. Si querés regresar, deberás crear una nueva.</li>
          </ul>

          <label className="dz-modal-ack">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
            />
            <span>
              Entiendo que tengo 30 días para arrepentirme y que pasado ese plazo
              la eliminación es permanente.
            </span>
          </label>

          <label className="dz-modal-pwd-label">Confirmá con tu contraseña actual</label>
          <input
            type="password"
            className="dz-modal-pwd"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <div className="dz-modal-actions">
            <button type="button" className="border-btn" onClick={close} disabled={pending}>
              Cancelar
            </button>
            <button
              type="button"
              className="dz-modal-confirm dz-modal-confirm-danger"
              onClick={confirmDelete}
              disabled={!acknowledged || password.length < 4 || pending}
            >
              {deleteMut.isPending ? 'Procesando…' : 'Programar eliminación'}
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
