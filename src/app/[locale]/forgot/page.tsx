"use client";
import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import ForgotForm from '@/form/ForgotForm';
import AuthShell from '@/components/auth/AuthShell';
import DefaultWrapper from '@/layout/DefaultWrapper';

// Handoff #5 §1/§2 — /forgot dentro del AuthShell. El ForgotForm (flujo
// completo de recuperación) no se toca.
const ForgotPasswordPage = () => {
    const t = useTranslations('auth.forgot');
    const tShell = useTranslations('auth.shell');

    return (
        <DefaultWrapper>
            <main>
                <AuthShell headline={tShell('headlineForgot')}>
                    <Link href="/login" className="kq-auth-back">
                        <i className="fas fa-arrow-left" /> {tShell('backToLogin')}
                    </Link>
                    <h4>{t('title')}</h4>
                    <ForgotForm />
                    <div className="kq-auth-note">
                        <i className="fas fa-info-circle" />
                        <span>{tShell('forgotNote')}</span>
                    </div>
                    <style jsx global>{`
                        .kq-auth .kq-auth-back {
                            display: inline-flex;
                            align-items: center;
                            gap: 8px;
                            font-size: 14px;
                            font-weight: 600;
                            color: var(--fg-muted, #5c616a);
                            text-decoration: none;
                            margin-bottom: 22px;
                        }
                        .kq-auth .kq-auth-back i { font-size: 13px; }
                        .kq-auth .kq-auth-back:hover { color: var(--lav-700, #6d62cf); }
                        .kq-auth .kq-auth-note {
                            display: flex;
                            gap: 11px;
                            margin-top: 22px;
                            padding: 13px 15px;
                            background: var(--accent-soft, #ebe8fb);
                            border-radius: 14px;
                            color: var(--fg-muted, #5c616a);
                            font-size: 14px;
                            line-height: 1.5;
                        }
                        .kq-auth .kq-auth-note i {
                            color: var(--accent-hover, #8a7fe3);
                            margin-top: 2px;
                        }
                    `}</style>
                </AuthShell>
            </main>
        </DefaultWrapper>
    );
};

export default ForgotPasswordPage;
