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
              <div className="iv-card">
                {!user && (
                  <>
                    <h3 className="iv-title">{t('invite.loginTitle')}</h3>
                    <p className="iv-text">
                      {t('invite.loginText')}
                    </p>
                    <Link href={`/login?from=/invite/team/${token}`} className="iv-btn">
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
                    <p className="iv-text">
                      {t('invite.notFoundText')}
                    </p>
                    <Link href="/" className="iv-btn">{t('invite.home')}</Link>
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
                    <Link href="/company" className="iv-btn">{t('invite.goCompany')}</Link>
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
                        className="iv-btn"
                        onClick={() => handleRespond(true)}
                      disabled={respond.isPending}
                    >
                        {respond.isPending ? t('invite.processing') : t('invite.accept')}
                      </button>
                      <button
                        type="button"
                        className="iv-btn iv-btn-ghost"
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
