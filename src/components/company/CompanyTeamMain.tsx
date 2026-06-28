"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import Breadcrumbs from '@/utils/Breadcrumbs';
import { useAuth } from '@/utils/AuthContext';
import { useCompanyTeam, useSetEmployeeLimit, useRemoveEmployee, useCancelInvitation } from '@/hooks/api/useCompanyTeam';
import { useInviteExistingUser, useAddEmployee } from '@/hooks/api/useCompany';
import { useSearchBuyers } from '@/hooks/api/useSearchBuyers';
import { useMySubscription } from '@/hooks/api/useSubscription';
import type { CompanyTeamMember, CompanyPendingInvite, BuyerSearchResult } from '@/types/api';

const CompanyTeamMain = () => {
  const t = useTranslations('profile');
  const { user } = useAuth();
  const teamQuery = useCompanyTeam();
  const subQuery = useMySubscription();

  const setLimit = useSetEmployeeLimit();
  const removeEmployee = useRemoveEmployee();
  const cancelInvitation = useCancelInvitation();
  const inviteExisting = useInviteExistingUser();
  const addEmployee = useAddEmployee(undefined);

  const team = teamQuery.data;
  const isAdmin = Boolean(team?.isAdmin) && Boolean(user?.isAdmin);
  const members = team?.members ?? [];
  const pending = team?.pending ?? [];

  const userLimit = subQuery.data?.userLimit ?? 1;
  const canInviteMore = members.length < userLimit;

  // Edición de límite por usuario (valor local por fila).
  const [editLimits, setEditLimits] = useState<Record<number, string>>({});
  const valueFor = (cusid: number, publimit: number | null) =>
    editLimits[cusid] !== undefined ? editLimits[cusid] : (publimit ?? '').toString();

  // Búsqueda de usuarios existentes.
  const [search, setSearch] = useState('');
  const buyersQuery = useSearchBuyers(search);
  const buyers = buyersQuery.data ?? [];

  // Invitar cuenta nueva.
  const [emp, setEmp] = useState({ firstName: '', lastName: '', email: '' });

  const handleSaveLimit = (cusid: number) => {
    const raw = editLimits[cusid];
    const limit = raw === undefined || raw.trim() === '' ? null : Number(raw);
    setLimit.mutate({ cusId: cusid, limit });
  };

  const handleInviteExisting = (cusId: number) => {
    if (!canInviteMore) return;
    inviteExisting.mutate(cusId, { onSuccess: () => setSearch('') });
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emp.firstName || !emp.lastName || !emp.email) return;
    addEmployee.mutate(emp, { onSuccess: () => setEmp({ firstName: '', lastName: '', email: '' }) });
  };

  return (
    <>
      <Breadcrumbs breadcrumbTitle={t('team.breadcrumbTitle')} breadcrumbSubTitle={t('team.breadcrumbSubtitle')} />

      <section className="team-area pt-50 pb-80">
        <div className="container">
          {!user && (
            <div className="alert alert-info">
              {t('team.loginPrefix')} <Link href="/login?from=/company/equipo">{t('team.loginLink')}</Link>.
            </div>
          )}

          {user && teamQuery.isLoading && (
            <div className="text-center pt-40">{t('team.loading')}</div>
          )}

          {user && teamQuery.isError && (
            <div className="tm-empty">
              <h3>{t('companySettings.noCompanyTitle')}</h3>
              <Link href="/pricing-plan" className="kq-btn kq-btn--action">{t('companySettings.viewPlans')}</Link>
            </div>
          )}

          {user && team && (
            <>
              <div className="tm-top">
                <Link href="/company" className="tm-back">
                  <i className="fal fa-arrow-left" /> {t('companySettings.title')}
                </Link>
                <span className="tm-slots">
                  <i className="fas fa-users" aria-hidden /> {t('team.slots', { used: members.length, limit: userLimit })}
                </span>
              </div>

              {/* Miembros (tabla densa en desktop, cards en mobile) */}
              <div className="tm-card kq-card">
                <div className="tm-card-head">
                  <h3 className="tm-title">{t('team.members')}</h3>
                </div>
                {isAdmin && (
                  <div className="tm-thead">
                    <span>{t('team.members')}</span>
                    <span>{t('stats.publications')}</span>
                    <span className="tm-thead-end">{t('team.remove')}</span>
                  </div>
                )}
                <div className="tm-table">
                  {members.map((m: CompanyTeamMember) => {
                    const isSelf = m.cusid === user?.id;
                    const initial = (m.firstname || m.lastname || '?').charAt(0).toUpperCase();
                    return (
                      <div key={m.cusid} className={`tm-row${isAdmin ? '' : ' tm-row--read'}`}>
                        <div className="tm-person">
                          <span className="tm-avatar" aria-hidden>{initial}</span>
                          <div className="tm-person-text">
                            <span className="tm-name">
                              {m.firstname} {m.lastname}
                              {m.isadmin && <span className="kq-badge kq-badge--lav tm-tag-admin">{t('team.admin')}</span>}
                              <span className={`kq-badge ${/activ/i.test(m.status) ? 'kq-badge--green' : 'kq-badge--navy'}`}>{m.status}</span>
                            </span>
                            <span className="tm-email">{m.email}</span>
                          </div>
                        </div>

                        {isAdmin ? (
                          <>
                            <div className="tm-limit">
                              <label className="tm-limit-label">{t('stats.publications')}</label>
                              <div className="tm-limit-row">
                                <input
                                  type="number"
                                  min={0}
                                  className="kq-input tm-limit-input"
                                  placeholder={t('team.plan')}
                                  value={valueFor(m.cusid, m.publimit)}
                                  onChange={(e) =>
                                    setEditLimits({ ...editLimits, [m.cusid]: e.target.value })
                                  }
                                />
                                <button
                                  type="button"
                                  className="kq-btn kq-btn--outline kq-btn--sm tm-mini-btn"
                                  onClick={() => handleSaveLimit(m.cusid)}
                                  disabled={setLimit.isPending}
                                >
                                  {t('team.save')}
                                </button>
                                {!m.isadmin && !isSelf && (
                                  <button
                                    type="button"
                                    className="kq-btn kq-btn--ghost kq-btn--sm tm-remove-mobile"
                                    onClick={() => removeEmployee.mutate(m.cusid)}
                                    disabled={removeEmployee.isPending}
                                    title={t('team.removeFromCompany')}
                                    aria-label={t('team.remove')}
                                  >
                                    <i className="fal fa-user-times" />
                                  </button>
                                )}
                              </div>
                              <span className="tm-used">
                                {t('team.used')}: {m.pubused}
                                {m.publimit != null ? ` / ${m.publimit}` : ''}
                              </span>
                            </div>
                            <div className="tm-action">
                              {!m.isadmin && !isSelf ? (
                                <button
                                  type="button"
                                  className="kq-btn kq-btn--ghost kq-btn--sm tm-remove"
                                  onClick={() => removeEmployee.mutate(m.cusid)}
                                  disabled={removeEmployee.isPending}
                                  title={t('team.removeFromCompany')}
                                >
                                  <i className="fal fa-user-times" /> {t('team.remove')}
                                </button>
                              ) : (
                                <span className="tm-dash" aria-hidden>—</span>
                              )}
                            </div>
                          </>
                        ) : (
                          <span className="tm-used tm-used--read">
                            {t('team.publicationUsage', { used: m.pubused, limit: m.publimit != null ? ` / ${m.publimit}` : '' })}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pendientes */}
              {pending.length > 0 && (
                <div className="tm-card kq-card">
                  <div className="tm-card-head">
                    <h3 className="tm-title">{t('team.pendingInvitations')}</h3>
                  </div>
                  <div className="tm-table">
                    {pending.map((p: CompanyPendingInvite) => {
                      const pInitial = (p.firstname || p.lastname || '?').charAt(0).toUpperCase();
                      return (
                      <div key={p.invid} className="tm-row tm-row--pending">
                        <div className="tm-person">
                          <span className="tm-avatar tm-avatar-pending" aria-hidden>{pInitial}</span>
                          <div className="tm-person-text">
                            <span className="tm-name">
                              {p.firstname} {p.lastname}
                              <span className="kq-badge kq-badge--warn tm-tag-pending">{t('team.pending')}</span>
                            </span>
                            <span className="tm-email">{p.email}</span>
                          </div>
                        </div>
                        <div className="tm-action tm-action--pending">
                          {isAdmin && (
                            <button
                              type="button"
                              className="kq-btn kq-btn--ghost kq-btn--sm tm-remove"
                              onClick={() => cancelInvitation.mutate(p.invid)}
                              disabled={cancelInvitation.isPending}
                            >
                              <i className="fal fa-times" /> {t('team.cancel')}
                            </button>
                          )}
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sumar miembros (solo admin): dos columnas en desktop, apilado en mobile */}
              {isAdmin && (
                <div className="tm-card kq-card">
                  <div className="tm-card-head">
                    <h3 className="tm-title">{t('team.inviteExisting')}</h3>
                  </div>
                  {!canInviteMore && (
                    <p className="tm-note">
                      {t('team.limitReached')}{' '}
                      <Link href="/pricing-plan">{t('team.upgrade')}</Link> {t('team.addMore')}
                    </p>
                  )}
                  <div className="tm-invite-grid">
                    {/* Columna izquierda: buscar usuario existente */}
                    <div className="tm-invite-col">
                      <h4 className="tm-subtitle">{t('team.inviteExisting')}</h4>
                      <div className="tm-search-wrap">
                        <input
                          className="kq-input tm-input"
                          placeholder={t('team.searchPlaceholder')}
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          disabled={!canInviteMore}
                        />
                        {search.trim().length >= 2 && (
                          <ul className="tm-search-results">
                            {buyersQuery.isLoading && <li className="tm-search-empty">{t('team.searching')}</li>}
                            {!buyersQuery.isLoading && buyers.length === 0 && (
                              <li className="tm-search-empty">{t('team.noResults')}</li>
                            )}
                            {buyers.map((b: BuyerSearchResult) => (
                              <li key={b.cusId} className="tm-search-item">
                                <div className="tm-person-text">
                                  <span className="tm-name">{b.firstName} {b.lastName}</span>
                                  <span className="tm-email">{b.email}</span>
                                </div>
                                <button
                                  type="button"
                                  className="kq-btn kq-btn--outline kq-btn--sm tm-mini-btn"
                                  onClick={() => handleInviteExisting(b.cusId)}
                                  disabled={!canInviteMore || inviteExisting.isPending}
                                >
                                  {t('team.invite')}
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    {/* Columna derecha: invitar por correo */}
                    <div className="tm-invite-col">
                      <form onSubmit={handleAddEmployee}>
                        <h4 className="tm-subtitle">{t('team.inviteByEmail')}</h4>
                        <div className="tm-row2">
                          <input
                            className="kq-input tm-input"
                            placeholder={t('team.firstName')}
                            value={emp.firstName}
                            onChange={(e) => setEmp({ ...emp, firstName: e.target.value })}
                            disabled={!canInviteMore}
                            required
                          />
                          <input
                            className="kq-input tm-input"
                            placeholder={t('team.lastName')}
                            value={emp.lastName}
                            onChange={(e) => setEmp({ ...emp, lastName: e.target.value })}
                            disabled={!canInviteMore}
                            required
                          />
                        </div>
                        <input
                          className="kq-input tm-input"
                          type="email"
                          placeholder={t('team.email')}
                          value={emp.email}
                          onChange={(e) => setEmp({ ...emp, email: e.target.value })}
                          disabled={!canInviteMore}
                          required
                        />
                        <button
                          type="submit"
                          className="kq-btn kq-btn--action tm-btn"
                          disabled={!canInviteMore || addEmployee.isPending}
                        >
                          <i className="fal fa-paper-plane" /> {addEmployee.isPending ? t('team.sending') : t('team.inviteEmployee')}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <style jsx>{`
        .team-area :global(.container) {
          max-width: 960px;
        }
        /* ── Top: link "Mi empresa" + badge de slots navy ── */
        .tm-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 22px;
          flex-wrap: wrap;
          gap: 10px;
        }
        .tm-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-display);
          font-weight: 600;
          color: var(--lav-700, #6d62cf);
          text-decoration: none;
        }
        .tm-back:hover {
          color: var(--lav-600, #8076e0);
        }
        .tm-slots {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: var(--navy-800, #1e2d4a);
          color: var(--cream, #f8f4ee);
          font-family: var(--font-display);
          font-size: 13px;
          font-weight: 700;
          padding: 6px 15px;
          border-radius: var(--r-pill, 999px);
        }
        .tm-slots i {
          font-size: 12px;
          color: var(--green-400, #b6d96a);
        }
        /* ── Tarjetas: head hundido (overline) + cuerpo ── */
        .tm-card {
          padding: 0;
          margin-bottom: 24px;
          overflow: hidden;
        }
        .tm-card-head {
          padding: 16px 22px;
          border-bottom: 1px solid var(--border, #e6ddcf);
          background: var(--surface-sunk, #f1ebe0);
        }
        .tm-title {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 18px;
          color: var(--fg-strong, #22252a);
          margin: 0;
        }
        .tm-subtitle {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 15px;
          color: var(--fg-strong, #22252a);
          margin: 0 0 12px;
        }
        /* ── Cabecera de columnas (overline) ── */
        .tm-thead {
          display: grid;
          grid-template-columns: 1fr 200px 110px;
          gap: 16px;
          padding: 10px 22px;
          background: var(--surface-sunk, #f1ebe0);
          border-bottom: 1px solid var(--border, #e6ddcf);
          font-family: var(--font-display);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: var(--tracking-overline, 0.08em);
          text-transform: uppercase;
          color: var(--fg-subtle, #9aa0a8);
        }
        .tm-thead-end {
          text-align: right;
        }
        .tm-table {
          padding: 0 22px;
        }
        /* ── Fila = grid denso en desktop ── */
        .tm-row {
          display: grid;
          grid-template-columns: 1fr 200px 110px;
          gap: 16px;
          align-items: center;
          padding: 15px 0;
          border-bottom: 1px solid var(--border, #e6ddcf);
        }
        .tm-row--read {
          grid-template-columns: 1fr auto;
        }
        .tm-row--pending {
          grid-template-columns: 1fr auto;
        }
        .tm-row:last-child {
          border-bottom: none;
        }
        .tm-person {
          display: flex;
          align-items: center;
          gap: 13px;
          min-width: 0;
        }
        .tm-person-text {
          min-width: 0;
        }
        .tm-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--navy-700, #283a5c), var(--navy-900, #161f33));
          color: var(--cream, #f8f4ee);
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 16px;
        }
        .tm-avatar-pending {
          background: var(--surface-sunk, #f1ebe0);
          color: var(--fg-muted, #5c616a);
        }
        .tm-name {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-display);
          font-weight: 600;
          color: var(--fg-strong, #22252a);
          flex-wrap: wrap;
        }
        .tm-email {
          display: block;
          font-size: 13px;
          color: var(--fg-muted, #5c616a);
          margin-top: 2px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .tm-limit {
          min-width: 0;
        }
        .tm-limit-label {
          display: none;
        }
        .tm-action {
          display: flex;
          justify-content: flex-end;
          align-items: center;
        }
        .tm-limit-row {
          display: flex;
          gap: 7px;
          align-items: center;
        }
        .tm-limit-input.tm-limit-input {
          width: 84px;
          height: 40px;
          margin-bottom: 0;
          padding: 0 10px;
        }
        .tm-used {
          display: block;
          font-size: 12px;
          color: var(--fg-subtle, #9aa0a8);
          margin-top: 5px;
        }
        .tm-used--read {
          margin-top: 0;
          text-align: right;
          font-size: 13px;
          color: var(--fg-muted, #5c616a);
        }
        .tm-mini-btn {
          flex-shrink: 0;
        }
        /* Botón "Quitar" ghost rojo (desktop) y su variante icono (mobile, oculta en desktop). */
        .tm-remove.tm-remove {
          color: var(--danger, #c0392b);
        }
        .tm-remove.tm-remove:hover:not(:disabled) {
          background: var(--warning-bg, #faecd4);
        }
        .tm-remove i {
          margin-right: 5px;
        }
        .tm-remove-mobile {
          display: none;
        }
        .tm-remove-mobile.tm-remove-mobile {
          color: var(--danger, #c0392b);
        }
        .tm-remove-mobile i {
          margin: 0;
        }
        .tm-dash {
          color: var(--fg-subtle, #9aa0a8);
          font-size: 13px;
        }
        .tm-note {
          color: var(--fg-muted, #5c616a);
          font-size: 14px;
          margin: 16px 22px 0;
        }
        .tm-note :global(a) {
          color: var(--lav-700, #6d62cf);
          font-weight: 600;
        }
        /* ── Bloque invitar: dos columnas en desktop ── */
        .tm-invite-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          padding: 22px;
        }
        .tm-invite-col {
          min-width: 0;
        }
        .tm-search-wrap {
          margin-bottom: 0;
        }
        .tm-input.tm-input {
          margin-bottom: 12px;
        }
        .tm-row2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .tm-btn.tm-btn {
          width: 100%;
          justify-content: center;
        }
        .tm-search-results {
          list-style: none;
          margin: -2px 0 0;
          padding: 6px;
          border: 1px solid var(--border, #e6ddcf);
          border-radius: var(--r-md, 12px);
          background: var(--surface, #fff);
          max-height: 240px;
          overflow-y: auto;
        }
        .tm-search-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 8px 10px;
          border-radius: var(--r-sm, 8px);
        }
        .tm-search-item:hover {
          background: var(--surface-sunk, #f1ebe0);
        }
        .tm-search-empty {
          padding: 10px;
          color: var(--fg-muted, #5c616a);
          font-size: 14px;
        }
        .tm-empty {
          text-align: center;
          padding: 60px 0;
        }
        .tm-empty h3 {
          font-family: var(--font-display);
          font-weight: 700;
          color: var(--fg-strong, #22252a);
          margin-bottom: 20px;
        }

        /* ════════ MOBILE (≤480): tabla → cards apiladas, invitar apilado ════════ */
        @media (max-width: 480px) {
          .tm-slots {
            margin: 0 auto;
          }
          .tm-top {
            justify-content: center;
          }
          /* Cabecera de columnas no aplica a cards. */
          .tm-thead {
            display: none;
          }
          .tm-table {
            padding: 14px 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          /* Cada miembro = card apilada (cabecera + divisor + control de límite). */
          .tm-row {
            display: block;
            border: 1px solid var(--border, #e6ddcf);
            border-radius: var(--r-md, 12px);
            box-shadow: var(--shadow-xs, 0 1px 2px rgba(30, 45, 74, 0.05));
            padding: 14px 16px;
          }
          .tm-row:last-child {
            border-bottom: 1px solid var(--border, #e6ddcf);
          }
          .tm-person {
            margin-bottom: 12px;
          }
          .tm-email {
            font-size: 12px;
          }
          /* Bloque de límite separado por divisor superior. */
          .tm-limit {
            padding-top: 12px;
            border-top: 1px solid var(--border, #e6ddcf);
          }
          .tm-limit-label {
            display: block;
            font-size: 12px;
            color: var(--fg-muted, #5c616a);
            margin-bottom: 5px;
          }
          .tm-limit-row {
            align-items: stretch;
          }
          .tm-limit-input.tm-limit-input {
            flex: 1;
            width: auto;
            height: 42px;
          }
          /* En mobile el "Quitar" textual de la columna acción se oculta:
             se usa el botón-icono dentro del bloque de límite. */
          .tm-action {
            display: none;
          }
          .tm-remove-mobile {
            display: inline-flex;
            flex-shrink: 0;
          }
          /* Fila de solo lectura (no-admin): uso de publicaciones bajo el nombre. */
          .tm-row--read {
            display: block;
          }
          .tm-row--read .tm-person {
            margin-bottom: 8px;
          }
          .tm-used--read {
            text-align: left;
          }
          /* Pendientes como card; acción visible. */
          .tm-row--pending {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .tm-row--pending .tm-person {
            flex: 1;
            margin-bottom: 0;
          }
          .tm-action--pending {
            display: flex;
          }
          .tm-note {
            margin: 14px 16px 0;
          }
          /* Invitar: una sola columna (buscar arriba, correo abajo). */
          .tm-invite-grid {
            grid-template-columns: 1fr;
            gap: 22px;
            padding: 18px 16px;
          }
        }
      `}</style>
    </>
  );
};

export default CompanyTeamMain;
