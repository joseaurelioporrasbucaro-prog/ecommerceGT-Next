"use client";
import React from 'react';
import ThemeChanger from '@/components/home/ThemeChanger';
import Breadcrumbs from '@/utils/Breadcrumbs';
import ForgotForm from '../../form/ForgotForm';

// Importamos los envoltorios mágicos de la plantilla
import DefaultWrapper from '@/layout/DefaultWrapper';
import HeaderOne from '@/layout/header/HeaderOne';

const ForgotPasswordPage = () => {
    return (
        <DefaultWrapper>
            <main>
                <ThemeChanger/>
                <Breadcrumbs breadcrumbTitle="Recover Password" breadcrumbSubTitle="Recover Password" />
                <section className="login-area pt-130 pb-130">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-xl-6 col-lg-8 col-md-10">
                                <div className="login-wrapper mb-40 wow fadeInUp">
                                    <h4 className="login-title mb-4">Recuperar Contraseña</h4>
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