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

  // WP-7 — "Plan recomendado". El backend no expone un flag popular/recomendado
  // (ver feedback §2), así que lo derivamos en el front: entre los planes pagos
  // NO personalizados del intervalo visible, el de mayor capacidad de publicación
  // (flagship); desempate por precio. Si no hay candidatos, no se recomienda.
  const recommendedId = useMemo<number | null>(() => {
    const candidates = visiblePlans.filter((p: Plan) => !p.personalized && p.price > 0);
    if (candidates.length === 0) return null;
    const best = candidates.reduce((a: Plan, b: Plan) =>
      b.pubPerUser > a.pubPerUser || (b.pubPerUser === a.pubPerUser && b.price > a.price) ? b : a,
    );
    return best.id;
  }, [visiblePlans]);

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
              <h2 className="pp-heading">Elegí el plan ideal para vos</h2>
              <p className="pp-sub">
                Publicá más propiedades y gestioná tu equipo. Cambiá o cancelá
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
              No se pudieron cargar los planes. Intentá de nuevo.
            </div>
          )}

          <div className="row pp-grid">
            {visiblePlans.map((plan) => {
              const isCurrent = plan.id === currentSubId;
              const isRecommended = !isCurrent && plan.id === recommendedId;
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
                          Iniciá sesión para elegir
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
                    <div className={`pp-card ${isCurrent ? 'is-current' : ''} ${isRecommended ? 'is-recommended' : ''}`}>
                      {isCurrent ? (
                        <span className="pp-badge">Tu plan</span>
                      ) : isRecommended ? (
                        <span className="pp-badge pp-badge-rec">Recomendado</span>
                      ) : null}
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
                          Iniciá sesión para elegir
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
          font-family: var(--font-display);
          font-size: 36px;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 12px;
        }
        .pp-sub {
          color: var(--clr-common-body-text);
          margin-bottom: 30px;
        }
        /* Cápsula pill con el activo en navy (como la referencia). */
        .pp-toggle {
          display: flex;
          width: fit-content;
          margin: 0 auto 40px;
          padding: 5px;
          background: var(--surface);
          border: 1.5px solid var(--border-strong);
          border-radius: 999px;
        }
        .pp-toggle button {
          border: none;
          background: transparent;
          color: var(--fg-muted);
          padding: 10px 26px;
          border-radius: 999px;
          font-family: var(--font-display);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.3s;
        }
        .pp-toggle button.active {
          background: var(--navy-800);
          color: var(--cream);
        }
        .pp-grid {
          margin-top: 10px;
          justify-content: center;
        }
        .pp-card {
          position: relative;
          background: var(--clr-bg-white);
          border: 1px solid var(--clr-common-border);
          border-radius: 20px;
          padding: 32px 26px;
          margin-top: 30px;
          height: calc(100% - 30px);
          display: flex;
          flex-direction: column;
          transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;
        }
        .pp-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 36px rgba(30, 45, 74, 0.1);
        }
        /* Card destacada (= plan actual del usuario): borde navy + inset y
           fondo cálido. En dark, --clr-theme-1 ya es lavanda vía el bridge. */
        .pp-card.is-current {
          border-color: var(--clr-theme-1);
          box-shadow: 0 0 0 2px var(--clr-theme-1) inset;
          background: var(--paper);
        }
        /* WP-7 — Plan recomendado (heurístico): anillo lavanda + leve elevación,
           distinto del navy de "Tu plan". */
        .pp-card.is-recommended {
          border-color: var(--lav-500);
          box-shadow: 0 0 0 2px var(--lav-500) inset, var(--shadow-md);
        }
        .pp-card.is-recommended:hover {
          box-shadow: 0 0 0 2px var(--lav-500) inset, 0 16px 36px rgba(109, 98, 207, 0.22);
        }
        .pp-badge {
          position: absolute;
          top: -13px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--green-500);
          color: var(--navy-900);
          font-size: 12px;
          font-weight: 700;
          padding: 5px 14px;
          border-radius: 999px;
          white-space: nowrap;
        }
        /* Badge "Recomendado" — lavanda (el verde queda para "Tu plan"). */
        .pp-badge-rec {
          background: var(--lav-600);
          color: #fff;
        }
        :global([data-theme='dark']) .pp-badge-rec {
          background: var(--lav-400);
          color: var(--navy-900);
        }
        .pp-name {
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 14px;
        }
        .pp-price {
          display: flex;
          align-items: baseline;
          gap: 6px;
          margin-bottom: 8px;
        }
        .pp-amount {
          font-family: var(--font-display);
          font-size: 34px;
          font-weight: 800;
          letter-spacing: -0.02em;
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
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 7px 0;
          color: var(--clr-common-body-text);
          font-size: 15px;
        }
        /* Check verde en círculo (sello de la referencia). */
        .pp-features i {
          flex-shrink: 0;
          width: 18px;
          height: 18px;
          margin-top: 4px;
          border-radius: 999px;
          background: var(--green-100);
          color: var(--green-600);
          font-size: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        /* CTA de marca verde con texto navy. */
        /* pp-btn vive en <Link> y <button>; el Link no recibe el hash → :global. */
        .pp-card :global(.pp-btn) {
          display: inline-block;
          width: 100%;
          text-align: center;
          padding: 13px 20px;
          border-radius: 999px;
          background: var(--action);
          color: var(--on-action) !important;
          font-family: var(--font-display);
          font-weight: 700;
          border: 1.5px solid transparent;
          cursor: pointer;
          transition: 0.3s;
          text-decoration: none;
        }
        .pp-card :global(.pp-btn:hover:not(:disabled)) {
          background: var(--action-hover);
        }
        .pp-card :global(.pp-btn:disabled) {
          cursor: default;
          opacity: 0.7;
        }
        /* "Plan actual" (disabled) → outline atenuado, no el verde de acción. */
        .pp-card :global(.pp-btn-current) {
          background: transparent;
          color: var(--fg-muted) !important;
          border: 1.5px solid var(--border-strong);
        }
      `}</style>
    </>
  );
};

export default PricingPlanMain;
