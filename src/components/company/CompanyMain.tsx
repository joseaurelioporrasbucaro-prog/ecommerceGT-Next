"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Breadcrumbs from '@/utils/Breadcrumbs';
import { useAuth } from '@/utils/AuthContext';
import { useCompany, useUpdateCompany } from '@/hooks/api/useCompany';

const CompanyMain = () => {
  const { user } = useAuth();
  const companyQuery = useCompany();
  const company = companyQuery.data;
  const updateCompany = useUpdateCompany();

  const isAdmin = Boolean(user?.isAdmin);

  const [form, setForm] = useState({ bname: '', btname: '', baddress: '', bphone: '' });
  const [showEmployees, setShowEmployees] = useState(false);
  useEffect(() => {
    if (company) {
      setForm({
        bname: company.name ?? '',
        btname: company.tradeName ?? '',
        baddress: company.address ?? '',
        bphone: company.phone ?? '',
      });
      setShowEmployees(Boolean(company.showEmployees));
    }
  }, [company]);

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !isAdmin) return;
    updateCompany.mutate({
      busid: company.busid,
      bname: form.bname,
      btname: form.btname,
      baddress: form.baddress,
      bphone: form.bphone,
      busimg: company.logo ?? '',
      showEmployees,
    });
  };

  return (
    <>
      <Breadcrumbs breadcrumbTitle="Datos de la empresa" breadcrumbSubTitle="Empresa" />

      <section className="company-area pt-50 pb-80">
        <div className="container">
          {!user && (
            <div className="alert alert-info">
              Debes <Link href="/login?from=/company">iniciar sesión</Link> para ver tu empresa.
            </div>
          )}

          {user && companyQuery.isLoading && (
            <div className="text-center pt-40">Cargando empresa…</div>
          )}

          {user && companyQuery.isError && (
            <div className="cm-empty">
              <h3>No perteneces a ninguna empresa</h3>
              <p>
                Las cuentas de empresa se crean al registrarte como empresa. Si
                tienes un plan empresarial, puedes gestionar tu equipo aquí.
              </p>
              <Link href="/pricing-plan" className="cm-btn">Ver planes</Link>
            </div>
          )}

          {user && company && (
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="cm-card">
                  <div className="cm-head">
                    <h3 className="cm-title">Datos de la empresa</h3>
                    {isAdmin && (
                      <Link href="/company/equipo" className="cm-link">
                        <i className="fal fa-users" /> Gestionar equipo
                      </Link>
                    )}
                  </div>

                  {!isAdmin && (
                    <p className="cm-note">
                      Solo el administrador puede editar estos datos.
                    </p>
                  )}

                  <form onSubmit={handleSaveCompany}>
                    <label className="cm-label">Razón social</label>
                    <input
                      className="cm-input"
                      value={form.bname}
                      onChange={(e) => setForm({ ...form, bname: e.target.value })}
                      disabled={!isAdmin}
                      required
                    />
                    <label className="cm-label">Nombre comercial</label>
                    <input
                      className="cm-input"
                      value={form.btname}
                      onChange={(e) => setForm({ ...form, btname: e.target.value })}
                      disabled={!isAdmin}
                      required
                    />
                    <label className="cm-label">Dirección</label>
                    <input
                      className="cm-input"
                      value={form.baddress}
                      onChange={(e) => setForm({ ...form, baddress: e.target.value })}
                      disabled={!isAdmin}
                    />
                    <label className="cm-label">Teléfono</label>
                    <input
                      className="cm-input"
                      value={form.bphone}
                      onChange={(e) => setForm({ ...form, bphone: e.target.value })}
                      disabled={!isAdmin}
                    />

                    <label className="cm-check">
                      <input
                        type="checkbox"
                        checked={showEmployees}
                        onChange={(e) => setShowEmployees(e.target.checked)}
                        disabled={!isAdmin}
                      />
                      <span>Mostrar mis empleados en el perfil público de la empresa</span>
                    </label>

                    {isAdmin && (
                      <button
                        type="submit"
                        className="cm-btn mt-20"
                        disabled={updateCompany.isPending}
                      >
                        {updateCompany.isPending ? 'Guardando…' : 'Guardar cambios'}
                      </button>
                    )}
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <style jsx>{`
        .cm-card {
          background: var(--clr-bg-white);
          border: 1px solid var(--clr-common-border);
          border-radius: 16px;
          padding: 30px 28px;
        }
        .cm-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
          flex-wrap: wrap;
          gap: 10px;
        }
        .cm-title {
          font-size: 22px;
          margin: 0;
        }
        .cm-link {
          font-weight: 600;
          color: var(--clr-theme-1);
          text-decoration: none;
        }
        .cm-link i {
          margin-right: 6px;
        }
        .cm-note {
          color: var(--clr-common-body-text);
          font-size: 14px;
          margin-bottom: 14px;
        }
        .cm-label {
          display: block;
          font-weight: 600;
          font-size: 14px;
          margin: 14px 0 6px;
          color: var(--clr-common-heading);
        }
        .cm-input {
          width: 100%;
          height: 48px;
          border: 1px solid var(--clr-common-border);
          border-radius: 10px;
          padding: 0 16px;
          background: var(--clr-bg-white);
          color: var(--clr-common-heading);
        }
        .cm-input:disabled {
          opacity: 0.7;
        }
        .cm-check {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 20px 0 4px;
          font-weight: 500;
          color: var(--clr-common-heading);
          cursor: pointer;
        }
        .cm-check input {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }
        .cm-btn {
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
        .cm-btn:hover:not(:disabled) {
          opacity: 0.9;
        }
        .cm-btn:disabled {
          opacity: 0.6;
          cursor: default;
        }
        .cm-empty {
          text-align: center;
          padding: 60px 0;
        }
        .cm-empty h3 {
          margin-bottom: 12px;
        }
        .cm-empty p {
          color: var(--clr-common-body-text);
          max-width: 520px;
          margin: 0 auto 24px;
        }
      `}</style>
    </>
  );
};

export default CompanyMain;
