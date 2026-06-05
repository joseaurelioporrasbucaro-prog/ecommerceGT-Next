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
              <Link href="/pricing-plan" className="tm-btn">{t('companySettings.viewPlans')}</Link>
            </div>
          )}

          {user && team && (
            <>
              <div className="tm-top">
                <Link href="/company" className="tm-back">
                  <i className="fal fa-arrow-left" /> {t('companySettings.title')}
                </Link>
                <span className="tm-slots">{t('team.slots', { used: members.length, limit: userLimit })}</span>
              </div>

              {/* Miembros */}
              <div className="tm-card">
                <h3 className="tm-title">{t('team.members')}</h3>
                <div className="tm-table">
                  {members.map((m: CompanyTeamMember) => {
                    const isSelf = m.cusid === user?.id;
                    return (
                      <div key={m.cusid} className="tm-row">
                        <div className="tm-person">
                          <span className="tm-name">
                            {m.firstname} {m.lastname}
                            {m.isadmin && <span className="tm-tag tm-tag-admin">{t('team.admin')}</span>}
                            <span className="tm-tag">{m.status}</span>
                          </span>
                          <span className="tm-email">{m.email}</span>
                        </div>

                        {isAdmin ? (
                          <>
                            <div className="tm-limit">
                              <label>{t('stats.publications')}</label>
                              <div className="tm-limit-row">
                                <input
                                  type="number"
                                  min={0}
                                  className="tm-limit-input"
                                  placeholder={t('team.plan')}
                                  value={valueFor(m.cusid, m.publimit)}
                                  onChange={(e) =>
                                    setEditLimits({ ...editLimits, [m.cusid]: e.target.value })
                                  }
                                />
                                <button
                                  type="button"
                                  className="tm-mini-btn"
                                  onClick={() => handleSaveLimit(m.cusid)}
                                  disabled={setLimit.isPending}
                                >
                                  {t('team.save')}
                                </button>
                              </div>
                              <span className="tm-used">
                                {t('team.used')}: {m.pubused}
                                {m.publimit != null ? ` / ${m.publimit}` : ''}
                              </span>
                            </div>
                            <div className="tm-action">
                              {!m.isadmin && !isSelf && (
                                <button
                                  type="button"
                                  className="tm-remove"
                                  onClick={() => removeEmployee.mutate(m.cusid)}
                                  disabled={removeEmployee.isPending}
                                  title={t('team.removeFromCompany')}
                                >
                                  <i className="fal fa-user-times" /> {t('team.remove')}
                                </button>
                              )}
                            </div>
                          </>
                        ) : (
                          <span className="tm-used">
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
                <div className="tm-card">
                  <h3 className="tm-title">{t('team.pendingInvitations')}</h3>
                  <div className="tm-table">
                    {pending.map((p: CompanyPendingInvite) => (
                      <div key={p.invid} className="tm-row">
                        <div className="tm-person">
                          <span className="tm-name">
                            {p.firstname} {p.lastname}
                            <span className="tm-tag tm-tag-pending">{t('team.pending')}</span>
                          </span>
                          <span className="tm-email">{p.email}</span>
                        </div>
                        <div className="tm-action">
                          {isAdmin && (
                            <button
                              type="button"
                              className="tm-remove"
                              onClick={() => cancelInvitation.mutate(p.invid)}
                              disabled={cancelInvitation.isPending}
                            >
                              <i className="fal fa-times" /> {t('team.cancel')}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Agregar miembros (solo admin) */}
              {isAdmin && (
                <div className="tm-card">
                  <h3 className="tm-title">{t('team.inviteExisting')}</h3>
                  {!canInviteMore && (
                    <p className="tm-note">
                      {t('team.limitReached')}{' '}
                      <Link href="/pricing-plan">{t('team.upgrade')}</Link> {t('team.addMore')}
                    </p>
                  )}
                  <div className="tm-search-wrap">
                    <input
                      className="tm-input"
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
                            <div>
                              <span className="tm-name">{b.firstName} {b.lastName}</span>
                              <span className="tm-email">{b.email}</span>
                            </div>
                            <button
                              type="button"
                              className="tm-mini-btn"
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

                  <form onSubmit={handleAddEmployee}>
                    <h4 className="tm-subtitle">{t('team.inviteByEmail')}</h4>
                    <div className="tm-row2">
                      <input
                        className="tm-input"
                        placeholder={t('team.firstName')}
                        value={emp.firstName}
                        onChange={(e) => setEmp({ ...emp, firstName: e.target.value })}
                        disabled={!canInviteMore}
                        required
                      />
                      <input
                        className="tm-input"
                        placeholder={t('team.lastName')}
                        value={emp.lastName}
                        onChange={(e) => setEmp({ ...emp, lastName: e.target.value })}
                        disabled={!canInviteMore}
                        required
                      />
                    </div>
                    <input
                      className="tm-input"
                      type="email"
                      placeholder={t('team.email')}
                      value={emp.email}
                      onChange={(e) => setEmp({ ...emp, email: e.target.value })}
                      disabled={!canInviteMore}
                      required
                    />
                    <button
                      type="submit"
                      className="tm-btn mt-10"
                      disabled={!canInviteMore || addEmployee.isPending}
                    >
                      {addEmployee.isPending ? t('team.sending') : t('team.inviteEmployee')}
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <style jsx>{`
        .tm-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 10px;
        }
        .tm-back {
          font-weight: 600;
          color: var(--clr-theme-1);
          text-decoration: none;
        }
        .tm-back i {
          margin-right: 6px;
        }
        .tm-slots {
          background: var(--clr-theme-1);
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          padding: 5px 14px;
          border-radius: 20px;
        }
        .tm-card {
          background: var(--clr-bg-white);
          border: 1px solid var(--clr-common-border);
          border-radius: 16px;
          padding: 26px 24px;
          margin-bottom: 26px;
        }
        .tm-title {
          font-size: 20px;
          margin-bottom: 16px;
        }
        .tm-subtitle {
          font-size: 16px;
          margin: 22px 0 12px;
        }
        .tm-row {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 16px 0;
          border-bottom: 1px solid var(--clr-common-border);
          flex-wrap: wrap;
        }
        .tm-row:last-child {
          border-bottom: none;
        }
        .tm-person {
          flex: 1 1 220px;
          min-width: 200px;
        }
        .tm-name {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: var(--clr-common-heading);
        }
        .tm-email {
          display: block;
          font-size: 13px;
          color: var(--clr-common-body-text);
        }
        .tm-tag {
          font-size: 11px;
          padding: 2px 9px;
          border-radius: 14px;
          background: var(--clr-common-border);
          color: var(--clr-common-heading);
          font-weight: 600;
        }
        .tm-tag-admin {
          background: var(--clr-theme-1);
          color: #fff;
        }
        .tm-tag-pending {
          background: var(--rating);
          color: #fff;
        }
        .tm-limit {
          width: 230px;
          flex-shrink: 0;
        }
        .tm-action {
          width: 130px;
          flex-shrink: 0;
          display: flex;
          justify-content: flex-end;
        }
        .tm-limit label {
          display: block;
          font-size: 12px;
          color: var(--clr-common-body-text);
          margin-bottom: 4px;
        }
        .tm-limit-row {
          display: flex;
          gap: 8px;
        }
        .tm-limit-input {
          width: 90px;
          height: 40px;
          border: 1px solid var(--clr-common-border);
          border-radius: 8px;
          padding: 0 10px;
          background: var(--clr-bg-white);
          color: var(--clr-common-heading);
        }
        .tm-used {
          display: block;
          font-size: 12px;
          color: var(--clr-common-body-text);
          margin-top: 4px;
        }
        .tm-mini-btn {
          flex-shrink: 0;
          padding: 8px 16px;
          border-radius: 8px;
          background: var(--clr-theme-1);
          color: #fff;
          font-weight: 600;
          font-size: 13px;
          border: none;
          cursor: pointer;
          transition: 0.3s;
        }
        .tm-mini-btn:hover:not(:disabled) {
          opacity: 0.9;
        }
        .tm-mini-btn:disabled {
          opacity: 0.6;
          cursor: default;
        }
        .tm-remove {
          background: transparent;
          border: 1px solid #e74c3c;
          color: #e74c3c;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: 0.3s;
        }
        .tm-remove i {
          margin-right: 5px;
        }
        .tm-remove:hover:not(:disabled) {
          background: #e74c3c;
          color: #fff;
        }
        .tm-remove:disabled {
          opacity: 0.6;
          cursor: default;
        }
        .tm-note {
          color: var(--clr-common-body-text);
          font-size: 14px;
          margin-bottom: 14px;
        }
        .tm-search-wrap {
          margin-bottom: 14px;
        }
        .tm-input {
          width: 100%;
          height: 48px;
          border: 1px solid var(--clr-common-border);
          border-radius: 10px;
          padding: 0 16px;
          background: var(--clr-bg-white);
          color: var(--clr-common-heading);
          margin-bottom: 12px;
        }
        .tm-row2 {
          display: flex;
          gap: 12px;
        }
        .tm-search-results {
          list-style: none;
          margin: -4px 0 0;
          padding: 6px;
          border: 1px solid var(--clr-common-border);
          border-radius: 10px;
          background: var(--clr-bg-white);
          max-height: 240px;
          overflow-y: auto;
        }
        .tm-search-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 10px;
          border-radius: 8px;
        }
        .tm-search-item:hover {
          background: var(--clr-common-border);
        }
        .tm-search-empty {
          padding: 10px;
          color: var(--clr-common-body-text);
          font-size: 14px;
        }
        .tm-btn {
          display: inline-block;
          padding: 11px 26px;
          border-radius: 30px;
          background: var(--clr-theme-1);
          color: #fff !important;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: 0.3s;
          text-decoration: none;
        }
        .tm-btn:hover:not(:disabled) {
          opacity: 0.9;
        }
        .tm-btn:disabled {
          opacity: 0.6;
          cursor: default;
        }
        .tm-empty {
          text-align: center;
          padding: 60px 0;
        }
        .tm-empty h3 {
          margin-bottom: 20px;
        }
      `}</style>
    </>
  );
};

export default CompanyTeamMain;
