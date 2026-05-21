"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Breadcrumbs from '@/utils/Breadcrumbs';
import { useAuth } from '@/utils/AuthContext';
import {
  useCompany,
  useEmployees,
  useUpdateCompany,
  useAddEmployee,
  useInviteExistingUser,
} from '@/hooks/api/useCompany';
import { useSearchBuyers } from '@/hooks/api/useSearchBuyers';
import { useMySubscription } from '@/hooks/api/useSubscription';

const CompanyMain = () => {
  const { user } = useAuth();
  const companyQuery = useCompany();
  const company = companyQuery.data;
  const busid = company?.busid;

  const employeesQuery = useEmployees(busid);
  const subQuery = useMySubscription();
  const updateCompany = useUpdateCompany();
  const addEmployee = useAddEmployee(busid);
  const inviteExistingUser = useInviteExistingUser();

  const isAdmin = Boolean(user?.isAdmin);

  // Búsqueda de usuarios existentes para agregar al equipo.
  const [search, setSearch] = useState('');
  const buyersQuery = useSearchBuyers(search);
  const buyers = buyersQuery.data ?? [];

  // Form de empresa
  const [form, setForm] = useState({ bname: '', btname: '', baddress: '', bphone: '' });
  useEffect(() => {
    if (company) {
      setForm({
        bname: company.name ?? '',
        btname: company.tradeName ?? '',
        baddress: company.address ?? '',
        bphone: company.phone ?? '',
      });
    }
  }, [company]);

  // Form de empleado
  const [emp, setEmp] = useState({ firstName: '', lastName: '', email: '' });

  const employees = employeesQuery.data ?? [];
  const userLimit = subQuery.data?.userLimit ?? 1;
  const usedSlots = employees.length;
  const canAddMore = usedSlots < userLimit;

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
    });
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emp.firstName || !emp.lastName || !emp.email) return;
    addEmployee.mutate(emp, {
      onSuccess: () => setEmp({ firstName: '', lastName: '', email: '' }),
    });
  };

  const handleInviteExisting = (cusId: number) => {
    if (!canAddMore) return;
    inviteExistingUser.mutate(cusId, {
      onSuccess: () => setSearch(''),
    });
  };

  return (
    <>
      <Breadcrumbs breadcrumbTitle="Mi empresa" breadcrumbSubTitle="Empresa" />

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
            <div className="row">
              {/* Columna izquierda: datos de la empresa */}
              <div className="col-lg-6">
                <div className="cm-card">
                  <h3 className="cm-title">Datos de la empresa</h3>
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

              {/* Columna derecha: equipo */}
              <div className="col-lg-6">
                <div className="cm-card">
                  <div className="cm-team-head">
                    <h3 className="cm-title">Equipo</h3>
                    <span className="cm-slots">
                      {usedSlots} / {userLimit} usuarios
                    </span>
                  </div>

                  {employeesQuery.isLoading && <p>Cargando equipo…</p>}

                  <ul className="cm-emp-list">
                    {employees.map((e) => (
                      <li key={e.id} className="cm-emp">
                        <div>
                          <span className="cm-emp-name">
                            {e.firstName} {e.lastName}
                          </span>
                          <span className="cm-emp-email">{e.email}</span>
                        </div>
                        <div className="cm-emp-tags">
                          {e.isAdmin && <span className="cm-tag cm-tag-admin">Admin</span>}
                          <span className="cm-tag">{e.status}</span>
                        </div>
                      </li>
                    ))}
                    {employees.length === 0 && !employeesQuery.isLoading && (
                      <li className="cm-emp-empty">Aún no hay empleados.</li>
                    )}
                  </ul>

                  {isAdmin && (
                    <div className="cm-add-form">
                      {!canAddMore && (
                        <p className="cm-note">
                          Alcanzaste el límite de tu plan.{' '}
                          <Link href="/pricing-plan">Mejóralo</Link> para agregar más.
                        </p>
                      )}

                      {/* Invitar a un usuario YA registrado (sin crear cuenta nueva) */}
                      <h4 className="cm-subtitle">Invitar usuario existente</h4>
                      <div className="cm-search-wrap">
                        <input
                          className="cm-input"
                          placeholder="Buscar por nombre o correo"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          disabled={!canAddMore}
                        />
                        {search.trim().length >= 2 && (
                          <ul className="cm-search-results">
                            {buyersQuery.isLoading && (
                              <li className="cm-search-empty">Buscando…</li>
                            )}
                            {!buyersQuery.isLoading && buyers.length === 0 && (
                              <li className="cm-search-empty">Sin resultados</li>
                            )}
                            {buyers.map((b) => (
                              <li key={b.cusId} className="cm-search-item">
                                <div>
                                  <span className="cm-emp-name">
                                    {b.firstName} {b.lastName}
                                  </span>
                                  <span className="cm-emp-email">{b.email}</span>
                                </div>
                                <button
                                  type="button"
                                  className="cm-mini-btn"
                                  onClick={() => handleInviteExisting(b.cusId)}
                                  disabled={!canAddMore || inviteExistingUser.isPending}
                                >
                                  Invitar
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Crear una cuenta nueva e invitar por correo */}
                      <form onSubmit={handleAddEmployee}>
                        <h4 className="cm-subtitle">¿No tiene cuenta? Invítalo por correo</h4>
                        <div className="cm-row2">
                          <input
                            className="cm-input"
                            placeholder="Nombre"
                            value={emp.firstName}
                            onChange={(e) => setEmp({ ...emp, firstName: e.target.value })}
                            disabled={!canAddMore}
                            required
                          />
                          <input
                            className="cm-input"
                            placeholder="Apellido"
                            value={emp.lastName}
                            onChange={(e) => setEmp({ ...emp, lastName: e.target.value })}
                            disabled={!canAddMore}
                            required
                          />
                        </div>
                        <input
                          className="cm-input"
                          type="email"
                          placeholder="Correo electrónico"
                          value={emp.email}
                          onChange={(e) => setEmp({ ...emp, email: e.target.value })}
                          disabled={!canAddMore}
                          required
                        />
                        <button
                          type="submit"
                          className="cm-btn mt-10"
                          disabled={!canAddMore || addEmployee.isPending}
                        >
                          {addEmployee.isPending ? 'Enviando…' : 'Invitar empleado'}
                        </button>
                      </form>
                    </div>
                  )}
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
          padding: 28px 26px;
          margin-bottom: 30px;
          height: calc(100% - 30px);
        }
        .cm-title {
          font-size: 22px;
          margin-bottom: 18px;
        }
        .cm-subtitle {
          font-size: 17px;
          margin: 22px 0 12px;
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
        .cm-row2 {
          display: flex;
          gap: 12px;
        }
        .cm-row2 .cm-input {
          margin-bottom: 12px;
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
        .cm-team-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .cm-slots {
          background: var(--clr-theme-1);
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 20px;
        }
        .cm-emp-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .cm-emp {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid var(--clr-common-border);
        }
        .cm-emp-name {
          display: block;
          font-weight: 600;
          color: var(--clr-common-heading);
        }
        .cm-emp-email {
          display: block;
          font-size: 13px;
          color: var(--clr-common-body-text);
        }
        .cm-emp-tags {
          display: flex;
          gap: 6px;
        }
        .cm-tag {
          font-size: 12px;
          padding: 3px 10px;
          border-radius: 14px;
          background: var(--clr-common-border);
          color: var(--clr-common-heading);
        }
        .cm-tag-admin {
          background: var(--clr-theme-1);
          color: #fff;
        }
        .cm-emp-empty {
          padding: 16px 0;
          color: var(--clr-common-body-text);
        }
        .cm-add-form {
          margin-top: 10px;
        }
        .cm-search-wrap {
          margin-bottom: 18px;
        }
        .cm-search-results {
          list-style: none;
          margin: 8px 0 0;
          padding: 6px;
          border: 1px solid var(--clr-common-border);
          border-radius: 10px;
          background: var(--clr-bg-white);
          max-height: 240px;
          overflow-y: auto;
        }
        .cm-search-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 10px;
          border-radius: 8px;
        }
        .cm-search-item:hover {
          background: var(--clr-common-border);
        }
        .cm-search-empty {
          padding: 10px;
          color: var(--clr-common-body-text);
          font-size: 14px;
        }
        .cm-mini-btn {
          flex-shrink: 0;
          padding: 6px 16px;
          border-radius: 20px;
          background: var(--clr-theme-1);
          color: #fff;
          font-weight: 600;
          font-size: 13px;
          border: none;
          cursor: pointer;
          transition: 0.3s;
        }
        .cm-mini-btn:hover:not(:disabled) {
          opacity: 0.9;
        }
        .cm-mini-btn:disabled {
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
