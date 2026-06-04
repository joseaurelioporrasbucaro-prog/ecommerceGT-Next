"use client";
import React, { useState } from 'react';
import ThemeChanger from '@/components/home/ThemeChanger';
import Breadcrumbs from '@/utils/Breadcrumbs';
import { useAuth } from '@/utils/AuthContext';
import { toast } from 'react-toastify';
import { ApiError } from '@/utils/Api';
import { useSupportUsers, useBanUser, useUnbanUser, useUnlockPassword } from '@/hooks/api/useSupportUsers';
import Pagination from './Pagination';
import type { SupportUserRow, AccountStatus } from '@/types/api';

const STATUS_LABEL: Record<AccountStatus, string> = {
  active: 'Activo',
  suspended: 'Suspendido',
  banned: 'Baneado',
};
const PAGE_SIZE = 15;

const SupportUsersMain = () => {
  const { user } = useAuth();
  const [search, setSearchRaw] = useState('');
  const [statusFilter, setStatusFilterRaw] = useState<'' | AccountStatus>('');
  const [page, setPage] = useState(1);
  const setSearch = (s: string) => { setSearchRaw(s); setPage(1); };
  const setStatusFilter = (s: '' | AccountStatus) => { setStatusFilterRaw(s); setPage(1); };
  const { data, isLoading } = useSupportUsers(search, statusFilter);
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();
  const unlockPassword = useUnlockPassword();

  // Modal de sanción.
  const [banTarget, setBanTarget] = useState<SupportUserRow | null>(null);
  const [banStatus, setBanStatus] = useState<'suspended' | 'banned'>('suspended');
  const [reason, setReason] = useState('');
  const [banDays, setBanDays] = useState(7);

  const isSupport = user?.role === 'support' || user?.role === 'admin';

  const openBan = (u: SupportUserRow) => {
    setBanTarget(u);
    setBanStatus('suspended');
    setReason('');
  };

  const confirmBan = () => {
    if (!banTarget) return;
    if (reason.trim().length < 4) {
      toast.error('Escribe un motivo.');
      return;
    }
    banUser.mutate(
      { cusId: banTarget.cus_id, status: banStatus, reason: reason.trim(), days: banStatus === 'suspended' ? banDays : undefined },
      {
        onSuccess: (r) => {
          toast.success(r.message || 'Hecho.');
          setBanTarget(null);
        },
        onError: (e) => toast.error(e instanceof ApiError ? e.message : 'No se pudo sancionar'),
      },
    );
  };

  const reactivate = (u: SupportUserRow) =>
    unbanUser.mutate(u.cus_id, {
      onSuccess: (r) => toast.success(r.message || 'Reactivado.'),
      onError: (e) => toast.error(e instanceof ApiError ? e.message : 'No se pudo reactivar'),
    });

  const unlockPwd = (u: SupportUserRow) =>
    unlockPassword.mutate(u.cus_id, {
      onSuccess: (r) => toast.success(r.message || 'Contraseña desbloqueada.'),
      onError: (e) => toast.error(e instanceof ApiError ? e.message : 'No se pudo desbloquear'),
    });

  const rows = data ?? [];
  const paged = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <main>
      <ThemeChanger />
      <Breadcrumbs breadcrumbTitle="Soporte" breadcrumbSubTitle="Usuarios" />

      <section className="creator-area pb-90" style={{ paddingTop: 40 }}>
        <div className="container">
          {!isSupport ? (
            <div className="alert alert-danger">Acceso restringido. Solo el equipo de soporte puede ver esta página.</div>
          ) : (
            <>
              <div className="su-toolbar">
                <input
                  className="su-search"
                  placeholder="Buscar por nombre, @handle o email…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div className="su-filter">
                  {([['', 'Todos'], ['active', 'Activos'], ['suspended', 'Suspendidos'], ['banned', 'Baneados']] as const).map(([v, label]) => (
                    <button key={v} className={`su-tab ${statusFilter === v ? 'active' : ''}`} onClick={() => setStatusFilter(v)}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {isLoading && <p style={{ opacity: 0.6 }}>Cargando…</p>}
              {!isLoading && rows.length === 0 && <p style={{ opacity: 0.6 }}>No hay usuarios que coincidan.</p>}

              {rows.length > 0 && (
                <div className="su-table-wrap">
                  <table className="su-table">
                    <thead>
                      <tr>
                        <th>Usuario</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th className="su-th-actions">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paged.map((u: SupportUserRow) => {
                        const name = `${u.firstname ?? ''} ${u.lastname ?? ''}`.trim() || 'Usuario';
                        const isStaff = u.role === 'support' || u.role === 'admin';
                        // Fase 8.3.3 — bloqueo por intentos fallidos (passta_id=2).
                        // Ortogonal a `status`: puede coexistir con 'active'.
                        const pwLocked = u.passtaid === 2;
                        const pwBannedUntil = u.passwordbanneduntil ? new Date(u.passwordbanneduntil) : null;
                        const pwInWindow = pwBannedUntil && pwBannedUntil > new Date();
                        return (
                          <tr key={u.cus_id}>
                            <td>
                              <div className="su-name">{name}</div>
                              {u.handle && <div className="su-handle">@{u.handle}</div>}
                            </td>
                            <td className="su-email">{u.email}</td>
                            <td>
                              <span className={`su-role su-role-${u.role}`}>{u.role}</span>
                            </td>
                            <td>
                              {/* Fase 8.3.3 fix: cuando hay pwLocked en cuenta 'active',
                                  ocultamos el chip "Activo" porque la cuenta NO está
                                  realmente activa (no puede entrar). Si está suspended/
                                  banned, el chip del estado de soporte sigue mostrándose
                                  porque ese es el estado dominante.  */}
                              <div className="su-status-stack">
                                {!(pwLocked && u.status === 'active') && (
                                  <span className={`su-chip su-chip-${u.status}`} title={u.banreason || ''}>
                                    {STATUS_LABEL[u.status]}
                                  </span>
                                )}
                                {u.status === 'suspended' && u.banneduntil && (
                                  <span className="su-until">hasta {new Date(u.banneduntil).toLocaleDateString('es-GT')}</span>
                                )}
                                {pwLocked && (
                                  <>
                                    <span className="su-chip su-chip-pwlocked" title={`Intentos fallidos: ${u.failcount}`}>
                                      <i className="fas fa-lock" /> Bloqueo por contraseña
                                    </span>
                                    <span className="su-until">
                                      {pwInWindow
                                        ? `Espera hasta ${pwBannedUntil!.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })}`
                                        : 'Requiere restablecer contraseña'}
                                    </span>
                                  </>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="su-actions">
                                {/* Sanciones de soporte solo aplican a usuarios no-staff. */}
                                {!isStaff && u.status === 'active' && (
                                  <button className="su-btn su-ban" onClick={() => openBan(u)} disabled={banUser.isPending}>
                                    <i className="fas fa-ban" /> Sancionar
                                  </button>
                                )}
                                {!isStaff && u.status !== 'active' && (
                                  <button className="su-btn su-unban" onClick={() => reactivate(u)} disabled={unbanUser.isPending}>
                                    <i className="fas fa-undo" /> Reactivar
                                  </button>
                                )}
                                {/* Fase 8.3.3 fix: bloqueo por contraseña aplica también
                                    a staff. Si pwLocked, mostramos el botón sin importar
                                    el rol. */}
                                {pwLocked && (
                                  <button className="su-btn su-unlock" onClick={() => unlockPwd(u)} disabled={unlockPassword.isPending}>
                                    <i className="fas fa-key" /> Desbloquear contraseña
                                  </button>
                                )}
                                {/* Placeholder "—" solo si no hay ninguna acción disponible. */}
                                {isStaff && !pwLocked && (
                                  <span className="su-muted">—</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <Pagination page={page} pageSize={PAGE_SIZE} total={rows.length} onPage={setPage} />
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {banTarget && (
        <div className="su-overlay" role="dialog" aria-modal="true">
          <div className="su-modal">
            <h5>Sancionar usuario</h5>
            <p className="su-modal-sub">{`${banTarget.firstname ?? ''} ${banTarget.lastname ?? ''}`.trim()}{banTarget.handle ? ` · @${banTarget.handle}` : ''}</p>

            <div className="su-radio-row">
              <label className={banStatus === 'suspended' ? 'active' : ''}>
                <input type="radio" name="banstatus" checked={banStatus === 'suspended'} onChange={() => setBanStatus('suspended')} />
                Suspender (temporal)
              </label>
              <label className={banStatus === 'banned' ? 'active' : ''}>
                <input type="radio" name="banstatus" checked={banStatus === 'banned'} onChange={() => setBanStatus('banned')} />
                Banear (permanente)
              </label>
            </div>

            {banStatus === 'suspended' && (
              <div className="su-days">
                <label>Duración:</label>
                {[7, 15, 30].map((d) => (
                  <button key={d} type="button" className={`su-day ${banDays === d ? 'active' : ''}`} onClick={() => setBanDays(d)}>{d} días</button>
                ))}
                <input type="number" min={1} max={3650} value={banDays} onChange={(e) => setBanDays(Math.max(1, Number(e.target.value) || 1))} />
              </div>
            )}

            <textarea
              placeholder="Motivo (el usuario lo verá al intentar iniciar sesión)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              autoFocus
            />
            <div className="su-modal-actions">
              <button className="su-btn su-ghost" onClick={() => setBanTarget(null)}>Cancelar</button>
              <button className="su-btn su-ban-full" onClick={confirmBan} disabled={banUser.isPending}>
                {banUser.isPending ? 'Aplicando…' : (banStatus === 'banned' ? 'Banear' : 'Suspender')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .su-toolbar { display: flex; gap: 16px; align-items: center; margin-bottom: 24px; flex-wrap: wrap; }
        .su-search { flex: 1; min-width: 240px; padding: 11px 16px; border: 1px solid rgba(128,128,128,0.3); border-radius: 24px; }
        .su-filter { display: flex; gap: 8px; flex-wrap: wrap; }
        .su-tab { padding: 8px 16px; border-radius: 24px; border: 1px solid rgba(128,128,128,0.3); background: transparent; cursor: pointer; font-weight: 600; font-size: 13px; }
        .su-tab.active { background: var(--clr-theme-1, #6c5ce7); color: #fff; border-color: transparent; }
        .su-table-wrap { overflow-x: auto; border: 1px solid var(--clr-common-border, #e0e2e5); border-radius: 12px; }
        .su-table { width: 100%; border-collapse: collapse; min-width: 720px; background: var(--clr-bg-white, #fff); }
        .su-table thead th { text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; opacity: 0.6; padding: 14px 16px; border-bottom: 1px solid var(--clr-common-border, #e0e2e5); }
        .su-table tbody td { padding: 14px 16px; border-bottom: 1px solid rgba(128,128,128,0.12); vertical-align: middle; font-size: 14px; }
        .su-table tbody tr:hover { background: rgba(108,92,231,0.04); }
        .su-table tbody tr:last-child td { border-bottom: none; }
        .su-name { font-weight: 600; }
        .su-handle { font-size: 13px; color: #3b82f6; }
        .su-email { opacity: 0.8; }
        .su-muted { opacity: 0.4; }
        .su-role { font-size: 11px; font-weight: 700; padding: 2px 9px; border-radius: 14px; text-transform: capitalize; background: rgba(128,128,128,0.15); }
        .su-role-support, .su-role-admin { background: rgba(108,92,231,0.16); color: #6c5ce7; }
        /* Fase 8.3.3 polish: stack vertical de chips + subtexto en la celda
           de estado. align-items: flex-start mantiene chips pegados a la
           izquierda sin estirarlos al ancho de la columna. */
        .su-status-stack { display: flex; flex-direction: column; gap: 6px; align-items: flex-start; }
        .su-until { font-size: 12px; opacity: 0.7; }
        /* Chips ahora con padding vertical mayor para igualar altura visual
           de los botones de acción y verse balanceados en la misma fila. */
        .su-chip {
          font-size: 12px;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
          line-height: 1;
        }
        .su-chip-active { background: rgba(34,197,94,0.15); color: #16a34a; }
        .su-chip-suspended { background: rgba(245,158,11,0.18); color: #b8860b; }
        .su-chip-banned { background: rgba(239,68,68,0.16); color: #dc2626; }
        .su-chip-pwlocked { background: rgba(245,158,11,0.18); color: #b8860b; }
        /* Acciones: alineadas verticalmente con flex; align-items: center
           para que un único botón quede centrado respecto a la fila. */
        .su-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
        .su-btn {
          border: none;
          cursor: pointer;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 13px;
          white-space: nowrap;
          line-height: 1;
        }
        .su-btn:disabled { opacity: 0.6; cursor: default; }
        .su-ban { background: rgba(239,68,68,0.12); color: #dc2626; }
        .su-unban { background: rgba(34,197,94,0.12); color: #16a34a; }
        .su-unlock { background: rgba(245,158,11,0.15); color: #b8860b; }
        .su-overlay { position: fixed; inset: 0; z-index: 9999; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; padding: 20px; }
        .su-modal { background: var(--clr-bg-white, #fff); border-radius: 14px; padding: 24px; width: 100%; max-width: 460px; }
        .su-modal h5 { margin: 0 0 4px; }
        .su-modal-sub { opacity: 0.7; font-size: 14px; margin: 0 0 14px; }
        .su-radio-row { display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
        .su-radio-row label { flex: 1; min-width: 150px; border: 1px solid rgba(128,128,128,0.3); border-radius: 8px; padding: 10px 12px; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 8px; }
        .su-radio-row label.active { border-color: var(--clr-theme-1, #6c5ce7); background: rgba(108,92,231,0.06); }
        .su-days { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
        .su-days label { font-size: 14px; font-weight: 600; }
        .su-day { padding: 6px 12px; border-radius: 20px; border: 1px solid rgba(128,128,128,0.3); background: transparent; cursor: pointer; font-size: 13px; }
        .su-day.active { background: var(--clr-theme-1, #6c5ce7); color: #fff; border-color: transparent; }
        .su-days input { width: 80px; border: 1px solid rgba(128,128,128,0.3); border-radius: 8px; padding: 7px 10px; }
        .su-modal textarea { width: 100%; border: 1px solid rgba(128,128,128,0.3); border-radius: 8px; padding: 10px; resize: vertical; }
        .su-modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px; }
        .su-ghost { background: transparent; border: 1px solid rgba(128,128,128,0.4); padding: 9px 18px; border-radius: 24px; }
        .su-ban-full { background: #dc2626; color: #fff; padding: 9px 18px; border-radius: 24px; }
      `}</style>
    </main>
  );
};

export default SupportUsersMain;
