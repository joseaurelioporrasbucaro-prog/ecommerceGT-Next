"use client";
import React from 'react';
import { useTranslations } from 'next-intl';
import ThemeChanger from '@/components/home/ThemeChanger';
import Breadcrumbs from '@/utils/Breadcrumbs';
import ForgotForm from '@/form/ForgotForm';

import DefaultWrapper from '@/layout/DefaultWrapper';

const ForgotPasswordPage = () => {
    const t = useTranslations('auth.forgot');

    return (
        <DefaultWrapper>
            <main>
                <ThemeChanger/>
                <Breadcrumbs breadcrumbTitle={t('breadcrumb')} breadcrumbSubTitle={t('breadcrumb')} />
                <section className="login-area pt-130 pb-130">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-xl-6 col-lg-8 col-md-10">
                                <div className="login-wrapper mb-40 wow fadeInUp">
                                    <h4 className="login-title mb-4">{t('title')}</h4>
                                    <ForgotForm />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </DefaultWrapper>
    );
};

export default ForgotPasswordPage;
