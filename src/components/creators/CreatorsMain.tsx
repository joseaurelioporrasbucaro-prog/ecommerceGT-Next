"use client";
import React from 'react';
import ThemeChanger from '../home/ThemeChanger';
import Breadcrumbs from '@/utils/Breadcrumbs';
import CreatorSingle from './CreatorSingle';
import { useTopSellers } from '@/hooks/api/useTopSellers';
import defaultCover from '../../../public/assets/img/profile/profile-cover/profile-cover-big-1.jpg';

const CreatorsMain = () => {
    // Fase 9 — ranking real de vendedores (reemplaza la data demo estática).
    const { data, isLoading } = useTopSellers(20);
    const sellers = data ?? [];

    return (
        <main>
            <ThemeChanger />

            <Breadcrumbs breadcrumbTitle="Creators" breadcrumbSubTitle="Ranking de vendedores" />

            <section className="creator-area pt-130 pb-100">
                <div className="container">
                    {isLoading && <p style={{ opacity: 0.6 }}>Cargando ranking…</p>}
                    {!isLoading && sellers.length === 0 && (
                        <p style={{ opacity: 0.6 }}>Aún no hay vendedores en el ranking.</p>
                    )}
                    <div className="row wow fadeInUp">
                        {sellers.map((s, i) => (
                            <CreatorSingle key={s.id} creator={s} rank={i + 1} defaultCover={defaultCover} />
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
};

export default CreatorsMain;
