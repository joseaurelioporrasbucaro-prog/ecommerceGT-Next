"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';
import { useAuth } from '@/utils/AuthContext';
import { useAdCredit } from '@/hooks/api/useCampaigns';
import { useMyReferrals } from '@/hooks/api/useReferrals';

/**
 * /invite (referidos Q50) — cableado al backend real (GET /referrals/me).
 *  - Código + link reales del usuario; el link es /register?ref=CODE.
 *  - Copiar usa el portapapeles; compartir abre WhatsApp / Facebook / correo.
 *  - El progreso (activados / pendientes) viene del endpoint.
 *  - El saldo de pauta sigue viniendo de useAdCredit (el mismo de /pauta).
 */

const fmtQ = (n: number) => `Q ${Number(n || 0).toLocaleString('es-GT')}`;

const STEPS = [
  { icon: 'fa-paper-plane', key: 'share' },
  { icon: 'fa-user-check', key: 'register' },
  { icon: 'fa-bolt', key: 'earn' },
] as const;

const SHARE = [
  { icon: 'fab fa-whatsapp', key: 'whatsapp', color: '#25D366' },
  { icon: 'fab fa-facebook', key: 'facebook', color: '#1877F2' },
  { icon: 'fas fa-envelope', key: 'email', color: 'var(--navy-600)' },
] as const;

const ReferralInviteMain: React.FC = () => {
  const t = useTranslations('pauta');
  const { user } = useAuth();
  const credit = useAdCredit();
  const availableCredit = Number(credit.data?.credit || 0);
  const referrals = useMyReferrals();
  const summary = referrals.data;
  const code = summary?.code ?? '';

  const [origin, setOrigin] = useState('https://kiosqui.com');
  useEffect(() => {
    if (typeof window !== 'undefined') setOrigin(window.location.origin);
  }, []);

  // Link real /register?ref=CODE en el origin actual (funciona local + prod).
  const inviteLink = code ? `${origin}/register?ref=${code}` : '';

  const copyLink = () => {
    if (!inviteLink || typeof navigator === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard.writeText(inviteLink).then(
      () => toast.success(t('invite.link.copied')),
      () => toast.error(t('invite.link.copyError')),
    );
  };

  const shareTo = (key: string) => {
    if (!inviteLink) return;
    const msg = encodeURIComponent(`${t('invite.shareText')} ${inviteLink}`);
    const url = encodeURIComponent(inviteLink);
    const targets: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${msg}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      email: `mailto:?subject=${encodeURIComponent(t('invite.banner.title'))}&body=${msg}`,
    };
    const target = targets[key];
    if (target) window.open(target, '_blank', 'noopener,noreferrer');
  };

  return (
    <main className="invite-page">
      <div className="invite-wrap">

        {/* ── Banner navy ── */}
        <section className="iv-banner">
          <span className="iv-banner-icon" aria-hidden="true"><i className="fas fa-gift" /></span>
          <span className="iv-banner-badge">{t('invite.banner.badge')}</span>
          <h1 className="iv-banner-title">{t('invite.banner.title')}</h1>
          <p className="iv-banner-body">{t('invite.banner.body')}</p>
        </section>

        {/* ── 3 pasos ── */}
        <div className="iv-steps">
          {STEPS.map((s) => (
            <div key={s.key} className="iv-step">
              <span className="iv-step-icon" aria-hidden="true"><i className={`fas ${s.icon}`} /></span>
              <span className="iv-step-text">{t(`invite.steps.${s.key}`)}</span>
            </div>
          ))}
        </div>

        {/* ── Enlace de invitación ── */}
        <div className="iv-link-head">
          <span className="iv-link-label">{t('invite.link.label')}</span>
        </div>

        {user ? (
          <>
            <div className="iv-link-row">
              <input
                type="text"
                className="iv-link-input"
                value={inviteLink}
                readOnly
                aria-label={t('invite.link.label')}
                onFocus={(e) => e.currentTarget.select()}
              />
              <button type="button" className="iv-copy" onClick={copyLink}>
                <i className="fas fa-copy" />
                <span>{t('invite.link.copy')}</span>
              </button>
            </div>

            <div className="iv-share">
              {SHARE.map((s) => (
                <button key={s.key} type="button" className="iv-share-btn" onClick={() => shareTo(s.key)}>
                  <i className={s.icon} style={{ color: s.color }} />
                  <span>{t(`invite.share.${s.key}`)}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="iv-login">
            <p>{t('invite.link.loginPrompt')}</p>
            <Link href="/login" className="iv-login-btn">{t('invite.link.login')}</Link>
          </div>
        )}

        {/* ── Progreso de referidos (estado cero — sin datos de backend) ── */}
        <div className="iv-progress">
          <div className="iv-progress-num">{summary?.activatedCount ?? 0}</div>
          <div className="iv-progress-info">
            <span className="iv-progress-title">
              {summary && summary.activatedCount > 0
                ? t('invite.progress.active', { count: summary.activatedCount })
                : t('invite.progress.none')}
            </span>
            <span className="iv-progress-sub">
              {summary && summary.pendingCount > 0
                ? t('invite.progress.pending', { count: summary.pendingCount })
                : t('invite.progress.hint')}
            </span>
          </div>
        </div>

        {/* ── Saldo real (alimentado por useAdCredit, el mismo de /pauta) ── */}
        <div className="iv-balance">
          <div className="iv-balance-info">
            <span className="iv-balance-label">{t('invite.balance.label')}</span>
            <span className="iv-balance-amount">{fmtQ(availableCredit)}</span>
            <span className="iv-balance-gift">
              <i className="fas fa-gift" /> {t('invite.balance.gift')}
            </span>
          </div>
          <Link href="/pauta" className="iv-balance-cta">{t('invite.balance.cta')}</Link>
        </div>

      </div>

      <style jsx>{`
        .invite-page {
          background: var(--bg);
          min-height: 60vh;
        }
        .invite-wrap {
          max-width: 560px;
          margin: 0 auto;
          padding: 44px 20px 56px;
        }

        /* ── Banner ── */
        .iv-banner {
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(400px 240px at 90% -20%, rgba(181, 172, 239, 0.32), transparent 60%),
            radial-gradient(360px 220px at -10% 120%, rgba(155, 198, 74, 0.18), transparent 60%),
            var(--navy-800);
          border-radius: var(--r-lg, 18px);
          padding: 38px 32px;
          color: var(--cream);
          margin-bottom: 24px;
        }
        .iv-banner-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 54px;
          height: 54px;
          border-radius: var(--r-md, 14px);
          background: rgba(181, 172, 239, 0.2);
          color: var(--lav-300);
          font-size: 22px;
          margin-bottom: 16px;
        }
        .iv-banner-badge {
          display: block;
          font-family: var(--font-display);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--lav-300);
          margin-bottom: 8px;
        }
        .iv-banner-title {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: clamp(24px, 4vw, 28px);
          line-height: 1.2;
          letter-spacing: -0.02em;
          margin: 0 0 10px;
          color: var(--cream);
        }
        .iv-banner-body {
          font-size: 15px;
          line-height: 1.55;
          color: rgba(248, 244, 238, 0.82);
          margin: 0;
        }

        /* ── Pasos ── */
        .iv-steps {
          display: flex;
          gap: 10px;
          margin-bottom: 26px;
        }
        .iv-step {
          flex: 1;
          text-align: center;
          padding: 16px 10px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--r-md, 14px);
        }
        .iv-step-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          margin-bottom: 8px;
          border-radius: 999px;
          background: var(--accent-soft);
          color: var(--info);
          font-size: 14px;
        }
        .iv-step-text {
          display: block;
          font-size: 12px;
          line-height: 1.4;
          color: var(--fg-muted);
        }

        /* ── Enlace ── */
        .iv-link-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 8px;
        }
        .iv-link-label {
          font-size: 14px;
          font-weight: 700;
          color: var(--fg-strong);
        }
        .iv-soon {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--info);
          background: var(--accent-soft);
          border-radius: 999px;
          padding: 3px 10px;
        }
        .iv-link-row {
          display: flex;
          gap: 10px;
          margin-bottom: 16px;
        }
        .iv-link-input {
          flex: 1;
          min-width: 0;
          height: 48px;
          padding: 0 16px;
          background: var(--surface);
          border: 1.5px solid var(--border-strong);
          border-radius: var(--r-sm, 10px);
          font-size: 13.5px;
          color: var(--fg-muted);
          outline: none;
        }
        .iv-link-input:focus {
          border-color: var(--accent);
          box-shadow: var(--shadow-focus);
        }
        .iv-copy {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
          padding: 0 18px;
          height: 48px;
          border: none;
          border-radius: var(--r-sm, 10px);
          background: var(--green-500);
          color: var(--navy-900);
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: var(--shadow-sm);
          transition: background 0.15s;
        }
        .iv-copy:hover {
          background: var(--green-600);
        }

        /* ── Compartir ── */
        .iv-share {
          display: flex;
          gap: 10px;
          margin-bottom: 26px;
        }
        .iv-share-btn {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 44px;
          border-radius: var(--r-sm, 10px);
          border: 1.5px solid var(--border-strong);
          background: var(--surface);
          color: var(--fg-strong);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
        }
        .iv-share-btn:hover {
          border-color: var(--accent);
          background: var(--accent-soft);
        }

        /* ── Login (sin sesión) ── */
        .iv-login {
          text-align: center;
          padding: 24px 20px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--r-md, 14px);
          margin-bottom: 26px;
        }
        .iv-login p {
          margin: 0 0 14px;
          font-size: 14px;
          color: var(--fg-muted);
        }
        .invite-page :global(.iv-login-btn) {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 24px;
          border-radius: 999px;
          background: var(--green-500);
          color: var(--navy-900);
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          box-shadow: var(--shadow-sm);
        }
        .invite-page :global(.iv-login-btn:hover) {
          background: var(--green-600);
        }

        /* ── Progreso ── */
        .iv-progress {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 18px 20px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--r-md, 14px);
          margin-bottom: 16px;
        }
        .iv-progress-num {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 30px;
          line-height: 1;
          color: var(--green-600);
          flex-shrink: 0;
        }
        .iv-progress-info {
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 0;
        }
        .iv-progress-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--fg-strong);
        }
        .iv-progress-sub {
          font-size: 12.5px;
          line-height: 1.4;
          color: var(--fg-muted);
        }

        /* ── Saldo ── */
        .iv-balance {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px 20px;
          background: var(--accent-soft);
          border-radius: var(--r-md, 14px);
        }
        .iv-balance-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .iv-balance-label {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--info);
        }
        .iv-balance-amount {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 24px;
          letter-spacing: -0.02em;
          color: var(--fg-strong);
        }
        .iv-balance-gift {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--fg-muted);
        }
        .invite-page :global(.iv-balance-cta) {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 18px;
          border-radius: 999px;
          background: var(--navy-800);
          color: var(--cream);
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          transition: background 0.15s;
        }
        .invite-page :global(.iv-balance-cta:hover) {
          background: var(--navy-700);
        }

        /* ── Móvil ── */
        @media (max-width: 480px) {
          .iv-banner {
            padding: 30px 22px;
          }
          .iv-share-btn span {
            display: none;
          }
          .iv-balance {
            flex-direction: column;
            align-items: stretch;
            text-align: center;
          }
        }
      `}</style>
    </main>
  );
};

export default ReferralInviteMain;
