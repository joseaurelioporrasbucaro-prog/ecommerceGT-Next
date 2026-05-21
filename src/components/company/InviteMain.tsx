"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Breadcrumbs from '@/utils/Breadcrumbs';
import { useAuth } from '@/utils/AuthContext';
import { useInvitation, useRespondInvitation } from '@/hooks/api/useInvitations';

const InviteMain = ({ token }: { token: string }) => {
  const { user } = useAuth();
  const router = useRouter();
  const invitationQuery = useInvitation(token);
  const respond = useRespondInvitation(token);

  const invitation = invitationQuery.data;

  const handleRespond = (accept: boolean) => {
    respond.mutate(accept, {
      onSuccess: (data) => {
        toast.success(data.message);
        if (data.status === 'accepted') {
          router.push('/company');
        }
      },
      onError: (err) => toast.error(err.message || 'No se pudo procesar la invitación'),
    });
  };

  const statusLabel: Record<string, string> = {
    accepted: 'Esta invitación ya fue aceptada.',
    rejected: 'Esta invitación fue rechazada.',
  };

  return (
    <>
      <Breadcrumbs breadcrumbTitle="Invitación a empresa" breadcrumbSubTitle="Invitación" />

      <section className="invite-area pt-50 pb-80">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-6 col-lg-8">
              <div className="iv-card">
                {!user && (
                  <>
                    <h3 className="iv-title">Inicia sesión para ver tu invitación</h3>
                    <p className="iv-text">
                      Necesitas tener la sesión iniciada con la cuenta invitada.
                    </p>
                    <Link href={`/login?from=/invite/${token}`} className="iv-btn">
                      Iniciar sesión
                    </Link>
                  </>
                )}

                {user && invitationQuery.isLoading && (
                  <p className="iv-text">Cargando invitación…</p>
                )}

                {user && invitationQuery.isError && (
                  <>
                    <h3 className="iv-title">Invitación no encontrada</h3>
                    <p className="iv-text">
                      El enlace no es válido o la invitación ya no existe.
                    </p>
                    <Link href="/" className="iv-btn">Ir al inicio</Link>
                  </>
                )}

                {user && invitation && !invitation.isForMe && (
                  <>
                    <h3 className="iv-title">Esta invitación no es para ti</h3>
                    <p className="iv-text">
                      Inicia sesión con la cuenta a la que se envió la invitación.
                    </p>
                  </>
                )}

                {user && invitation && invitation.isForMe && invitation.status !== 'pending' && (
                  <>
                    <h3 className="iv-title">{statusLabel[invitation.status]}</h3>
                    <p className="iv-text">
                      Invitación al equipo de <strong>{invitation.busName}</strong>.
                    </p>
                    <Link href="/company" className="iv-btn">Ir a mi empresa</Link>
                  </>
                )}

                {user && invitation && invitation.isForMe && invitation.status === 'pending' && (
                  <>
                    <div className="iv-icon">
                      <i className="fal fa-building" />
                    </div>
                    <h3 className="iv-title">
                      {invitation.inviterName || 'Una empresa'} te invitó a su equipo
                    </h3>
                    <p className="iv-text">
                      Empresa: <strong>{invitation.busName}</strong>
                    </p>
                    <p className="iv-note">
                      Si aceptas, formarás parte de esta empresa. Solo puedes pertenecer
                      a una empresa a la vez.
                    </p>
                    <div className="iv-actions">
                      <button
                        type="button"
                        className="iv-btn"
                        onClick={() => handleRespond(true)}
                        disabled={respond.isPending}
                      >
                        {respond.isPending ? 'Procesando…' : 'Aceptar'}
                      </button>
                      <button
                        type="button"
                        className="iv-btn iv-btn-ghost"
                        onClick={() => handleRespond(false)}
                        disabled={respond.isPending}
                      >
                        Rechazar
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .iv-card {
          background: var(--clr-bg-white);
          border: 1px solid var(--clr-common-border);
          border-radius: 16px;
          padding: 40px 34px;
          text-align: center;
        }
        .iv-icon {
          width: 70px;
          height: 70px;
          margin: 0 auto 20px;
          border-radius: 50%;
          background: rgba(90, 90, 242, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .iv-icon i {
          font-size: 30px;
          color: var(--clr-theme-1);
        }
        .iv-title {
          font-size: 24px;
          margin-bottom: 12px;
        }
        .iv-text {
          color: var(--clr-common-body-text);
          margin-bottom: 8px;
        }
        .iv-note {
          color: var(--clr-common-body-text);
          font-size: 14px;
          margin: 12px 0 24px;
        }
        .iv-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }
        .iv-btn {
          display: inline-block;
          padding: 12px 30px;
          border-radius: 30px;
          background: var(--clr-theme-1);
          color: #fff !important;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: 0.3s;
          text-decoration: none;
        }
        .iv-btn:hover:not(:disabled) {
          opacity: 0.9;
        }
        .iv-btn:disabled {
          opacity: 0.6;
          cursor: default;
        }
        .iv-btn-ghost {
          background: transparent;
          color: var(--clr-theme-1) !important;
          border: 1px solid var(--clr-theme-1);
        }
      `}</style>
    </>
  );
};

export default InviteMain;
