"use client";
import React, { useState } from 'react';
import Modal from 'react-responsive-modal';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useAuth } from '@/utils/AuthContext';
import { useDeleteAccount } from '@/hooks/api/useDeleteAccount';
import { ApiError } from '@/utils/Api';

/**
 * Fase 11 — Zona de peligro: eliminar cuenta.
 *
 * Borrado lógico irreversible: anonimiza PII, anula publicaciones, finaliza
 * campañas activas (el crédito de pauta se pierde por política T&C), y
 * bloquea el login con `cus_account_status='deleted'`.
 *
 * Flujo: botón rojo → modal con (1) checkbox de aceptación, (2) campo de
 * contraseña actual, (3) botón "Eliminar definitivamente". Al éxito, hace
 * logout() del AuthContext (limpia caché de React Query) y redirige a /.
 */
const DangerZone: React.FC = () => {
  const router = useRouter();
  const { logout } = useAuth();
  const deleteMut = useDeleteAccount();
  const [open, setOpen] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [password, setPassword] = useState('');

  const close = () => {
    setOpen(false);
    setAcknowledged(false);
    setPassword('');
  };

  const confirm = () => {
    if (!acknowledged) { toast.error('Debes aceptar las consecuencias.'); return; }
    if (password.length < 4) { toast.error('Ingresa tu contraseña.'); return; }
    deleteMut.mutate(
      { password },
      {
        onSuccess: async (r) => {
          toast.success(r.message || 'Cuenta eliminada.');
          close();
          // El backend ya limpió la cookie; ahora limpiamos el cliente.
          await logout().catch(() => {});
          router.push('/');
        },
        onError: (e) => toast.error(e instanceof ApiError ? e.message : 'No se pudo eliminar la cuenta'),
      },
    );
  };

  return (
    <div className="danger-zone">
      <div className="dz-head">
        <h5><i className="fas fa-exclamation-triangle" /> Zona de peligro</h5>
        <p>Acciones irreversibles relacionadas con tu cuenta.</p>
      </div>
      <div className="dz-row">
        <div>
          <strong>Eliminar mi cuenta</strong>
          <p>
            Tu información personal se anonimizará, tus publicaciones se anularán y tus campañas activas se cerrarán sin reembolso.
            Esta acción es <strong>permanente</strong> y no se puede deshacer.
          </p>
        </div>
        <button type="button" className="dz-btn" onClick={() => setOpen(true)}>
          <i className="fas fa-trash" /> Eliminar cuenta
        </button>
      </div>

      <Modal
        open={open}
        onClose={close}
        center
        styles={{
          overlay: { background: 'rgba(0,0,0,0.55)' },
          modal: { maxWidth: 520, width: '92%', padding: '28px 26px', borderRadius: 14 },
          closeButton: { display: 'none' },
        }}
      >
        <div className="dz-modal-body">
          <div className="dz-modal-icon"><i className="fas fa-exclamation-triangle" /></div>
          <h4>¿Eliminar tu cuenta?</h4>
          <p className="dz-modal-text">Esta acción es <strong>irreversible</strong>. Al confirmar:</p>
          <ul className="dz-modal-list">
            <li>Tu nombre se reemplaza por &quot;Usuario eliminado&quot; en toda la plataforma.</li>
            <li>Tu correo, teléfono, dirección, fecha de nacimiento, fotos y DPI se eliminan.</li>
            <li>Tus publicaciones activas se anulan (no aparecerán más en el catálogo).</li>
            <li>Tus campañas activas se finalizan. <strong>El saldo de pauta no gastado se pierde</strong>; no se reembolsa a tarjeta ni a otra cuenta.</li>
            <li>No podrás iniciar sesión con esta cuenta. Si deseas regresar, deberás crear una nueva.</li>
          </ul>

          <label className="dz-modal-ack">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
            />
            <span>Entiendo que esta acción es permanente y acepto las consecuencias.</span>
          </label>

          <label className="dz-modal-pwd-label">Confirma con tu contraseña actual</label>
          <input
            type="password"
            className="dz-modal-pwd"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <div className="dz-modal-actions">
            <button type="button" className="border-btn" onClick={close} disabled={deleteMut.isPending}>
              Cancelar
            </button>
            <button
              type="button"
              className="dz-modal-confirm"
              onClick={confirm}
              disabled={!acknowledged || password.length < 4 || deleteMut.isPending}
            >
              {deleteMut.isPending ? 'Eliminando…' : 'Eliminar definitivamente'}
            </button>
          </div>
        </div>
      </Modal>

      <style jsx>{`
        .danger-zone { margin-top: 40px; border: 1px solid rgba(239,68,68,0.3); border-radius: 14px; padding: 20px 22px; background: rgba(239,68,68,0.03); }
        .dz-head h5 { display: flex; align-items: center; gap: 8px; color: #b91c1c; margin: 0 0 4px; }
        .dz-head h5 :global(i) { color: #ef4444; }
        .dz-head p { margin: 0 0 14px; font-size: 13px; opacity: 0.7; }
        .dz-row { display: flex; gap: 16px; align-items: center; justify-content: space-between; flex-wrap: wrap; padding-top: 12px; border-top: 1px solid rgba(239,68,68,0.18); }
        .dz-row > div { flex: 1; min-width: 240px; }
        .dz-row strong { color: #b91c1c; display: block; margin-bottom: 4px; }
        .dz-row p { font-size: 13px; opacity: 0.75; margin: 0; }
        .dz-btn { background: #ef4444; color: #fff; border: none; padding: 10px 18px; border-radius: 8px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 7px; white-space: nowrap; }
        .dz-btn:hover { background: #dc2626; }

        .dz-modal-body { text-align: center; }
        .dz-modal-body :global(h4) { margin: 0 0 10px; font-size: 22px; font-weight: 700; }
        .dz-modal-icon { width: 60px; height: 60px; margin: 0 auto 14px; border-radius: 50%; background: rgba(239,68,68,0.15); color: #ef4444; display: flex; align-items: center; justify-content: center; font-size: 26px; }
        .dz-modal-text { font-size: 14px; margin: 0 0 8px; opacity: 0.85; }
        .dz-modal-list { text-align: left; font-size: 13.5px; line-height: 1.55; margin: 0 0 18px; padding-left: 20px; opacity: 0.9; }
        .dz-modal-list li { margin-bottom: 4px; }
        .dz-modal-ack { display: flex; align-items: flex-start; gap: 8px; text-align: left; font-size: 13px; margin: 0 0 14px; padding: 10px 12px; background: rgba(239,68,68,0.06); border-radius: 8px; cursor: pointer; }
        .dz-modal-ack input { margin-top: 3px; cursor: pointer; }
        .dz-modal-pwd-label { display: block; text-align: left; font-size: 13px; font-weight: 600; margin: 0 0 6px; }
        .dz-modal-pwd { width: 100%; padding: 10px 12px; border: 1px solid rgba(128,128,128,0.3); border-radius: 8px; margin-bottom: 18px; font-size: 14px; box-sizing: border-box; }
        .dz-modal-actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
        .dz-modal-actions :global(.border-btn) { height: 42px; padding: 0 22px; font-size: 14px; }
        .dz-modal-confirm { background: #ef4444; color: #fff; border: none; padding: 0 22px; height: 42px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; }
        .dz-modal-confirm:disabled { opacity: 0.55; cursor: not-allowed; }
        .dz-modal-confirm:not(:disabled):hover { background: #dc2626; }
      `}</style>
    </div>
  );
};

export default DangerZone;
