"use client";
import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import Breadcrumbs from '@/utils/Breadcrumbs';
import { useAuth } from '@/utils/AuthContext';
import {
  usePlans,
  useMySubscription,
  useChangeSubscription,
} from '@/hooks/api/useSubscription';
import type { Plan } from '@/types/api';

const fmtPrice = (price: number) =>
  price === 0 ? 'Gratis' : `$${price.toFixed(price % 1 === 0 ? 0 : 2)}`;

const PricingPlanMain = () => {
  const { user } = useAuth();
  const plansQuery = usePlans();
  const mySubQuery = useMySubscription();
  const changeSub = useChangeSubscription();

  const [interval, setInterval] = useState<'Mensual' | 'Anual'>('Mensual');

  const plans = plansQuery.data ?? [];
  const intervals = useMemo(
    () => Array.from(new Set(plans.map((p: Plan) => p.interval))),
    [plans]
  );
  const hasAnnual = intervals.includes('Anual');

  const visiblePlans: Plan[] = useMemo(
    () => plans.filter((p: Plan) => p.interval === interval),
    [plans, interval]
  );

  const currentSubId = mySubQuery.data?.subId;
  const busId = user?.busId;

  const handleChoose = (plan: Plan) => {
    if (!user) return;
    if (plan.id === currentSubId) return;
    changeSub.mutate(plan.id);
  };

  return (
    <>
      <Breadcrumbs breadcrumbTitle="Planes y precios" breadcrumbSubTitle="Planes" />

      <section className="pricing-plan-area pt-50 pb-80">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-8 text-center">
              <h2 className="pp-heading">Elige el plan ideal para ti</h2>
              <p className="pp-sub">
                Publica más propiedades y gestiona tu equipo. Cambia o cancela
                cuando quieras.
              </p>
            </div>
          </div>

          {/* Toggle Mensual / Anual — solo si hay planes anuales */}
          {hasAnnual && (
            <div className="pp-toggle">
              <button
                type="button"
                className={interval === 'Mensual' ? 'active' : ''}
                onClick={() => setInterval('Mensual')}
              >
                Mensual
              </button>
              <button
                type="button"
                className={interval === 'Anual' ? 'active' : ''}
                onClick={() => setInterval('Anual')}
              >
                Anual
              </button>
            </div>
          )}

          {plansQuery.isLoading && (
            <div className="text-center pt-40">Cargando planes…</div>
          )}
          {plansQuery.isError && (
            <div className="alert alert-danger mt-30">
              No se pudieron cargar los planes. Intenta de nuevo.
            </div>
          )}

          <div className="row pp-grid">
            {visiblePlans.map((plan) => {
              const isCurrent = plan.id === currentSubId;
              const isPersonalized = plan.personalized;
              const isBusId = plan.busid === busId;

              if (isPersonalized && !isBusId) {
                return null;
              }

              const isBusiness = plan.userLimit > 1;
              return (
                <div className="col-xl-3 col-lg-4 col-md-6" key={plan.id}>
                  {isPersonalized && isBusId ? (
                    <div className={`pp-card border border-warning border-4 ${isCurrent ? 'is-current' : ''}`}>
                      {isCurrent && <span className="pp-badge">Tu plan</span>}
                      <h3 className="pp-name">{plan.description}</h3>
                      <div className="pp-price">
                        <span className="pp-amount">{fmtPrice(plan.price)}</span>
                        {plan.price > 0 && (
                          <span className="pp-interval">/ {plan.interval.toLowerCase()}</span>
                        )}
                      </div>
                      {plan.msg && <p className="pp-msg">{plan.msg}</p>}

                      <ul className="pp-features">
                        <li>
                          <i className="fal fa-check" />{' '}
                          {plan.userLimit} {plan.userLimit === 1 ? 'usuario' : 'usuarios'}
                        </li>
                        <li>
                          <i className="fal fa-check" />{' '}
                          {plan.pubPerUser} publicaciones por usuario
                        </li>
                        <li>
                          <i className="fal fa-check" />{' '}
                          {isBusiness ? 'Cuenta de empresa' : 'Cuenta individual'}
                        </li>
                      </ul>

                      {!user ? (
                        <Link href="/login?from=/pricing-plan" className="pp-btn">
                          Inicia sesión para elegir
                        </Link>
                      ) : isCurrent ? (
                        <button type="button" className="pp-btn pp-btn-current" disabled>
                          Plan actual
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="pp-btn"
                          onClick={() => handleChoose(plan)}
                          disabled={changeSub.isPending}
                        >
                          {changeSub.isPending && changeSub.variables === plan.id
                            ? 'Cambiando…'
                            : 'Elegir plan'}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className={`pp-card ${isCurrent ? 'is-current' : ''}`}>
                      {isCurrent && <span className="pp-badge">Tu plan</span>}
                      <h3 className="pp-name">{plan.description}</h3>
                      <div className="pp-price">
                        <span className="pp-amount">{fmtPrice(plan.price)}</span>
                        {plan.price > 0 && (
                          <span className="pp-interval">/ {plan.interval.toLowerCase()}</span>
                        )}
                      </div>
                      {plan.msg && <p className="pp-msg">{plan.msg}</p>}

                      <ul className="pp-features">
                        <li>
                          <i className="fal fa-check" />{' '}
                          {plan.userLimit} {plan.userLimit === 1 ? 'usuario' : 'usuarios'}
                        </li>
                        <li>
                          <i className="fal fa-check" />{' '}
                          {plan.pubPerUser} publicaciones por usuario
                        </li>
                        <li>
                          <i className="fal fa-check" />{' '}
                          {isBusiness ? 'Cuenta de empresa' : 'Cuenta individual'}
                        </li>
                      </ul>

                      {!user ? (
                        <Link href="/login?from=/pricing-plan" className="pp-btn">
                          Inicia sesión para elegir
                        </Link>
                      ) : isCurrent ? (
                        <button type="button" className="pp-btn pp-btn-current" disabled>
                          Plan actual
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="pp-btn"
                          onClick={() => handleChoose(plan)}
                          disabled={changeSub.isPending}
                        >
                          {changeSub.isPending && changeSub.variables === plan.id
                            ? 'Cambiando…'
                            : 'Elegir plan'}
                        </button>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {visiblePlans.length === 0 && !plansQuery.isLoading && (
            <div className="text-center pt-40">No hay planes en este intervalo.</div>
          )}
        </div>
      </section>

      <style jsx>{`
        .pp-heading {
          font-size: 36px;
          margin-bottom: 12px;
        }
        .pp-sub {
          color: var(--clr-common-body-text);
          margin-bottom: 30px;
        }
        .pp-toggle {
          display: flex;
          justify-content: center;
          gap: 0;
          margin-bottom: 40px;
        }
        .pp-toggle button {
          border: 1px solid var(--clr-common-border);
          background: var(--clr-bg-white);
          color: var(--clr-common-heading);
          padding: 10px 28px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.3s;
        }
        .pp-toggle button:first-child {
          border-radius: 30px 0 0 30px;
        }
        .pp-toggle button:last-child {
          border-radius: 0 30px 30px 0;
          border-left: 0;
        }
        .pp-toggle button.active {
          background: var(--clr-theme-1);
          color: #fff;
          border-color: var(--clr-theme-1);
        }
        .pp-grid {
          margin-top: 10px;
          justify-content: center;
        }
        .pp-card {
          position: relative;
          background: var(--clr-bg-white);
          border: 1px solid var(--clr-common-border);
          border-radius: 16px;
          padding: 32px 26px;
          margin-top: 30px;
          height: calc(100% - 30px);
          display: flex;
          flex-direction: column;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .pp-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
        }
        .pp-card.is-current {
          border-color: var(--clr-theme-1);
          box-shadow: 0 0 0 2px var(--clr-theme-1) inset;
        }
        .pp-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          background: var(--clr-theme-1);
          color: #fff;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 20px;
        }
        .pp-name {
          font-size: 20px;
          margin-bottom: 14px;
        }
        .pp-price {
          display: flex;
          align-items: baseline;
          gap: 6px;
          margin-bottom: 8px;
        }
        .pp-amount {
          font-size: 34px;
          font-weight: 700;
          color: var(--clr-common-heading);
        }
        .pp-interval {
          color: var(--clr-common-body-text);
          font-size: 14px;
        }
        .pp-msg {
          color: var(--clr-common-body-text);
          font-size: 14px;
          margin-bottom: 18px;
          min-height: 40px;
        }
        .pp-features {
          list-style: none;
          padding: 0;
          margin: 0 0 26px 0;
          flex: 1;
        }
        .pp-features li {
          padding: 7px 0;
          color: var(--clr-common-body-text);
          font-size: 15px;
        }
        .pp-features i {
          color: var(--clr-theme-1);
          margin-right: 6px;
        }
        .pp-btn {
          display: inline-block;
          width: 100%;
          text-align: center;
          padding: 12px 20px;
          border-radius: 30px;
          background: var(--clr-theme-1);
          color: #fff !important;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: 0.3s;
          text-decoration: none;
        }
        .pp-btn:hover:not(:disabled) {
          opacity: 0.9;
        }
        .pp-btn:disabled {
          cursor: default;
          opacity: 0.7;
        }
        .pp-btn-current {
          background: transparent;
          color: var(--clr-theme-1) !important;
          border: 1px solid var(--clr-theme-1);
        }
      `}</style>
    </>
  );
};

export default PricingPlanMain;
