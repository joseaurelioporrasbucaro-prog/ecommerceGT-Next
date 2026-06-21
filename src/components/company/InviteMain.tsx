"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';
import Breadcrumbs from '@/utils/Breadcrumbs';
import { useAuth } from '@/utils/AuthContext';
import { useInvitation, useRespondInvitation } from '@/hooks/api/useInvitations';

const InviteMain = ({ token }: { token: string }) => {
  const t = useTranslations('profile');
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
      onError: (err) => toast.error(err.message || t('invite.processError')),
    });
  };

  const statusLabel: Record<string, string> = {
    accepted: t('invite.accepted'),
    rejected: t('invite.rejected'),
  };

  return (
    <>
      <Breadcrumbs breadcrumbTitle={t('invite.breadcrumbTitle')} breadcrumbSubTitle={t('invite.breadcrumbSubtitle')} />

      <section className="invite-area pt-50 pb-80">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-6 col-lg-8">
              <div className="iv-card kq-card">
                {!user && (
                  <>
                    <h3 className="iv-title">{t('invite.loginTitle')}</h3>
                    <p className="iv-text">
                      {t('invite.loginText')}
                    </p>
                    <Link href={`/login?from=/invite/team/${token}`} className="kq-btn kq-btn--action iv-btn">
                      {t('invite.loginButton')}
                    </Link>
                  </>
                )}

                {user && invitationQuery.isLoading && (
                  <p className="iv-text">{t('invite.loading')}</p>
                )}

                {user && invitationQuery.isError && (
                  <>
                    <h3 className="iv-title">{t('invite.notFoundTitle')}</h3>
                    <p className="iv-text iv-text--danger">
                      {t('invite.notFoundText')}
                    </p>
                    <Link href="/" className="kq-btn kq-btn--outline iv-btn">{t('invite.home')}</Link>
                  </>
                )}

                {user && invitation && !invitation.isForMe && (
                  <>
                    <h3 className="iv-title">{t('invite.notForYouTitle')}</h3>
                    <p className="iv-text">
                      {t('invite.notForYouText')}
                    </p>
                  </>
                )}

                {user && invitation && invitation.isForMe && invitation.status !== 'pending' && (
                  <>
                    <h3 className="iv-title">{statusLabel[invitation.status]}</h3>
                    <p className="iv-text">
                      {t('invite.teamOf')} <strong>{invitation.busName}</strong>.
                    </p>
                    <Link href="/company" className="kq-btn kq-btn--action iv-btn">{t('invite.goCompany')}</Link>
                  </>
                )}

                {user && invitation && invitation.isForMe && invitation.status === 'pending' && (
                  <>
                    <div className="iv-icon">
                      <i className="fal fa-building" />
                    </div>
                    <h3 className="iv-title">
                      {t('invite.pendingTitle', { name: invitation.inviterName || t('invite.companyFallback') })}
                    </h3>
                    <p className="iv-text">
                      {t('invite.company')}: <strong>{invitation.busName}</strong>
                    </p>
                    <p className="iv-note">
                      {t('invite.note')}
                    </p>
                    <div className="iv-actions">
                      <button
                        type="button"
                        className="kq-btn kq-btn--action iv-btn"
                        onClick={() => handleRespond(true)}
                      disabled={respond.isPending}
                    >
                        {respond.isPending ? t('invite.processing') : t('invite.accept')}
                      </button>
                      <button
                        type="button"
                        className="kq-btn kq-btn--outline iv-btn"
                        onClick={() => handleRespond(false)}
                      disabled={respond.isPending}
                    >
                        {t('invite.reject')}
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
        /* Tarjeta centrada (kq-card aporta surface/borde/sombra); aqui solo
           el padding y el centrado del contenido del invite. */
        .iv-card {
          padding: 40px 34px;
          text-align: center;
        }
        /* Placeholder circular con gradiente navy-lavanda (mismo lenguaje que
           el avatar/logo de CompanyProfileMain), nunca azul Oction. */
        .iv-icon {
          width: 70px;
          height: 70px;
          margin: 0 auto 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--lav-500, #b5acef), var(--navy-800, #1e2d4a));
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .iv-icon i {
          font-size: 30px;
          color: var(--cream, #f8f4ee);
        }
        .iv-title {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 24px;
          color: var(--fg-strong, #22252a);
          margin-bottom: 12px;
        }
        .iv-text {
          color: var(--fg-muted, #5c616a);
          margin-bottom: 8px;
        }
        .iv-text strong {
          color: var(--fg-strong, #22252a);
        }
        .iv-text--danger {
          color: var(--danger, #d2453c);
        }
        .iv-note {
          color: var(--fg-subtle, #9aa0a8);
          font-size: 14px;
          margin: 12px 0 24px;
        }
        .iv-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }
        /* Los botones llevan .kq-btn (primitiva global); .iv-btn solo ajusta el
           espaciado superior. Como los Link no reciben el scope de styled-jsx,
           se aplica via :global. */
        .iv-card :global(.iv-btn) {
          margin-top: 8px;
        }
      `}</style>
    </>
  );
};

export default InviteMain;
