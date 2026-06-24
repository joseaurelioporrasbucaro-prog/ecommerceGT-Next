"use client";
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import ThemeChanger from '@/components/home/ThemeChanger';
import Breadcrumbs from '@/utils/Breadcrumbs';
import { useAuth } from '@/utils/AuthContext';
import { toast } from 'react-toastify';
import { ApiError } from '@/utils/Api';
import { useSupportUsers, useBanUser, useUnbanUser, useUnlockPassword } from '@/hooks/api/useSupportUsers';
import { useDateFmt } from '@/utils/datetime';
import Pagination from './Pagination';
import StaffShell from '@/components/support/StaffShell';
import { DataTable, Row, Cell, StatusChip, RoleBadge, Av, FilterTabs, initialsOf } from '@/components/support/staffUi';
import type { SupportUserRow, AccountStatus } from '@/types/api';

const PAGE_SIZE = 15;

const SupportUsersMain = () => {
  const t = useTranslations('support');
  const dateFmt = useDateFmt();
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
      toast.error(t('common.reasonRequired'));
      return;
    }
    banUser.mutate(
      { cusId: banTarget.cus_id, status: banStatus, reason: reason.trim(), days: banStatus === 'suspended' ? banDays : undefined },
      {
        onSuccess: (r) => {
          toast.success(r.message || t('common.done'));
          setBanTarget(null);
        },
        onError: (e) => toast.error(e instanceof ApiError ? e.message : t('common.sanctionError')),
      },
    );
  };

  const reactivate = (u: SupportUserRow) =>
    unbanUser.mutate(u.cus_id, {
      onSuccess: (r) => toast.success(r.message || t('users.reactivated')),
      onError: (e) => toast.error(e instanceof ApiError ? e.message : t('users.reactivateError')),
    });

  const unlockPwd = (u: SupportUserRow) =>
    unlockPassword.mutate(u.cus_id, {
      onSuccess: (r) => toast.success(r.message || t('users.passwordUnlocked')),
      onError: (e) => toast.error(e instanceof ApiError ? e.message : t('users.unlockError')),
    });

  const rows = data ?? [];
  const paged = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <main>
      <ThemeChanger />
      <Breadcrumbs breadcrumbTitle={t('breadcrumbs.support')} breadcrumbSubTitle={t('breadcrumbs.users')} />

      {!isSupport ? (
        <section className="creator-area pb-90" style={{ paddingTop: 40 }}>
          <div className="container">
            <div className="alert alert-danger">{t('common.restricted')}</div>
          </div>
        </section>
      ) : (
        <StaffShell
          active="users"
          title={t('breadcrumbs.users')}
          actions={
            <label
              style={{
                display: 'flex', alignItems: 'center', gap: 10, height: 44, padding: '0 16px',
                background: 'var(--surface)', border: '1.5px solid var(--border-strong)',
                borderRadius: '999px', minWidth: 260,
              }}
            >
              <i className="fas fa-search" style={{ fontSize: 13, color: 'var(--fg-subtle)' }} aria-hidden />
              <input
                className="su-search"
                placeholder={t('users.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          }
        >
          <div style={{ marginBottom: 18 }}>
            <FilterTabs
              active={statusFilter}
              onSelect={(k) => setStatusFilter(k as '' | AccountStatus)}
              tabs={[
                ['', t('filters.all')],
                ['active', t('users.statusFilter.active')],
                ['suspended', t('users.statusFilter.suspended')],
                ['banned', t('users.statusFilter.banned')],
              ]}
            />
          </div>

          {isLoading && <p style={{ color: 'var(--fg-subtle)' }}>{t('common.loading')}</p>}
          {!isLoading && rows.length === 0 && <p style={{ color: 'var(--fg-subtle)' }}>{t('users.empty')}</p>}

          {rows.length > 0 && (
            <>
              <DataTable
                cols={[
                  { label: t('table.user') },
                  { label: t('table.email') },
                  { label: t('table.role') },
                  { label: t('table.status') },
                  { label: t('table.actions'), right: true },
                ]}
              >
                {paged.map((u: SupportUserRow) => {
                  const name = `${u.firstname ?? ''} ${u.lastname ?? ''}`.trim() || t('common.user');
                  const isStaff = u.role === 'support' || u.role === 'admin';
                  // Fase 8.3.3 — bloqueo por intentos fallidos (passta_id=2).
                  // Ortogonal a `status`: puede coexistir con 'active'.
                  const pwLocked = u.passtaid === 2;
                  const pwBannedUntil = u.passwordbanneduntil ? new Date(u.passwordbanneduntil) : null;
                  const pwInWindow = pwBannedUntil && pwBannedUntil > new Date();
                  return (
                    <Row key={u.cus_id}>
                      <Cell>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 11 }}>
                          <Av init={initialsOf(name)} sm />
                          <span>
                            <span style={{ display: 'block', fontWeight: 600, color: 'var(--fg-strong)' }}>{name}</span>
                            {u.handle && (
                              <span style={{ color: 'var(--accent-hover)', fontSize: 12 }}>@{u.handle}</span>
                            )}
                          </span>
                        </span>
                      </Cell>
                      <Cell muted>{u.email}</Cell>
                      <Cell>
                        <RoleBadge r={u.role} />
                      </Cell>
                      <Cell>
                        {/* Fase 8.3.3 fix: cuando hay pwLocked en cuenta 'active',
                            ocultamos el chip "Activo" porque la cuenta NO está
                            realmente activa (no puede entrar). Si está suspended/
                            banned, el chip del estado de soporte sigue mostrándose
                            porque ese es el estado dominante.  */}
                        <span style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
                          {!(pwLocked && u.status === 'active') && (
                            <span title={u.banreason || ''}>
                              <StatusChip s={u.status}>{t(`accountStatus.${u.status}`)}</StatusChip>
                            </span>
                          )}
                          {u.status === 'suspended' && u.banneduntil && (
                            <span className="su-until">{t('users.until', { date: dateFmt.short(u.banneduntil) })}</span>
                          )}
                          {pwLocked && (
                            <>
                              <span title={t('users.failedAttempts', { count: u.failcount })}>
                                <StatusChip s="suspended">
                                  <i className="fas fa-lock" style={{ fontSize: 10 }} /> {t('users.passwordLock')}
                                </StatusChip>
                              </span>
                              <span className="su-until">
                                {pwInWindow
                                  ? t('users.waitUntil', { time: dateFmt.time(pwBannedUntil) })
                                  : t('users.requiresReset')}
                              </span>
                            </>
                          )}
                        </span>
                      </Cell>
                      <Cell right>
                        <span style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' }}>
                          {/* Sanciones de soporte solo aplican a usuarios no-staff. */}
                          {!isStaff && u.status === 'active' && (
                            <button className="su-btn su-ban" onClick={() => openBan(u)} disabled={banUser.isPending}>
                              <i className="fas fa-ban" /> {t('common.sanction')}
                            </button>
                          )}
                          {!isStaff && u.status !== 'active' && (
                            <button className="su-btn su-unban" onClick={() => reactivate(u)} disabled={unbanUser.isPending}>
                              <i className="fas fa-undo" /> {t('users.reactivate')}
                            </button>
                          )}
                          {/* Fase 8.3.3 fix: bloqueo por contraseña aplica también
                              a staff. Si pwLocked, mostramos el botón sin importar
                              el rol. */}
                          {pwLocked && (
                            <button className="su-btn su-unlock" onClick={() => unlockPwd(u)} disabled={unlockPassword.isPending}>
                              <i className="fas fa-key" /> {t('users.unlockPassword')}
                            </button>
                          )}
                          {/* Placeholder "—" solo si no hay ninguna acción disponible. */}
                          {isStaff && !pwLocked && (
                            <span style={{ color: 'var(--fg-subtle)' }}>—</span>
                          )}
                        </span>
                      </Cell>
                    </Row>
                  );
                })}
              </DataTable>
              <Pagination page={page} pageSize={PAGE_SIZE} total={rows.length} onPage={setPage} />
            </>
          )}
        </StaffShell>
      )}

      {banTarget && (
        <div className="su-overlay" role="dialog" aria-modal="true">
          <div className="su-modal">
            <h5>{t('users.sanctionUser')}</h5>
            <p className="su-modal-sub">{`${banTarget.firstname ?? ''} ${banTarget.lastname ?? ''}`.trim()}{banTarget.handle ? ` · @${banTarget.handle}` : ''}</p>

            <div className="su-radio-row">
              <label className={banStatus === 'suspended' ? 'active' : ''}>
                <input type="radio" name="banstatus" checked={banStatus === 'suspended'} onChange={() => setBanStatus('suspended')} />
                {t('common.suspendTemporary')}
              </label>
              <label className={banStatus === 'banned' ? 'active' : ''}>
                <input type="radio" name="banstatus" checked={banStatus === 'banned'} onChange={() => setBanStatus('banned')} />
                {t('common.banPermanent')}
              </label>
            </div>

            {banStatus === 'suspended' && (
              <div className="su-days">
                <label>{t('common.duration')}</label>
                {[7, 15, 30].map((d) => (
                  <button key={d} type="button" className={`su-day ${banDays === d ? 'active' : ''}`} onClick={() => setBanDays(d)}>{t('common.days', { count: d })}</button>
                ))}
                <input type="number" min={1} max={3650} value={banDays} onChange={(e) => setBanDays(Math.max(1, Number(e.target.value) || 1))} />
              </div>
            )}

            <textarea
              placeholder={t('users.sanctionReasonPlaceholder')}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              autoFocus
            />
            <div className="su-modal-actions">
              <button className="su-btn su-ghost" onClick={() => setBanTarget(null)}>{t('common.cancel')}</button>
              <button className="su-btn su-ban-full" onClick={confirmBan} disabled={banUser.isPending}>
                {banUser.isPending ? t('common.applying') : (banStatus === 'banned' ? t('common.ban') : t('common.suspend'))}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        /* Buscador-pill: el input vive dentro del label-pill del slot actions. */
        .su-search { flex: 1; min-width: 0; border: none; background: transparent; outline: none; font: var(--text-body-sm); color: var(--fg); }
        .su-search::placeholder { color: var(--fg-subtle); }
        /* Subtexto bajo el chip de estado (suspensión / bloqueo). */
        .su-until { font: var(--text-caption); color: var(--fg-subtle); }
        /* Botones de acción de fila, en tono Kiosqui. */
        .su-btn {
          border: none;
          cursor: pointer;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 999px;
          font: var(--text-body-sm);
          font-weight: 600;
          white-space: nowrap;
          line-height: 1;
        }
        .su-btn:disabled { opacity: 0.6; cursor: default; }
        .su-ban { background: var(--danger-bg); color: var(--danger); }
        .su-unban { background: var(--green-100); color: var(--green-800); }
        .su-unlock { background: var(--warning-bg); color: #9a5a12; }
        .su-overlay { position: fixed; inset: 0; z-index: 9999; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; padding: 20px; }
        .su-modal { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 24px; width: 100%; max-width: 460px; box-shadow: var(--shadow-lg); }
        .su-modal h5 { margin: 0 0 4px; font-family: var(--font-display); color: var(--fg-strong); }
        .su-modal-sub { color: var(--fg-muted); font: var(--text-body-sm); margin: 0 0 14px; }
        .su-radio-row { display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
        .su-radio-row label { flex: 1; min-width: 150px; border: 1px solid var(--border-strong); border-radius: var(--r-md); padding: 10px 12px; cursor: pointer; font: var(--text-body-sm); color: var(--fg); display: flex; align-items: center; gap: 8px; }
        .su-radio-row label.active { border-color: var(--lav-500); background: var(--lav-100); }
        .su-days { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
        .su-days label { font: var(--text-label); color: var(--fg-strong); }
        .su-day { padding: 6px 12px; border-radius: 999px; border: 1px solid var(--border-strong); background: var(--surface); color: var(--fg-muted); cursor: pointer; font: var(--text-body-sm); }
        .su-day.active { background: var(--navy-800); color: var(--cream); border-color: transparent; }
        .su-days input { width: 80px; border: 1px solid var(--border-strong); border-radius: var(--r-md); padding: 7px 10px; background: var(--surface); color: var(--fg); }
        .su-modal textarea { width: 100%; border: 1px solid var(--border-strong); border-radius: var(--r-md); padding: 10px; resize: vertical; background: var(--surface); color: var(--fg); }
        .su-modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px; }
        .su-ghost { background: transparent; border: 1px solid var(--border-strong); color: var(--fg-muted); padding: 9px 18px; border-radius: 999px; }
        .su-ban-full { background: var(--danger); color: #fff; padding: 9px 18px; border-radius: 999px; }
      `}</style>
    </main>
  );
};

export default SupportUsersMain;
