import React from 'react';
import { useTranslations } from 'next-intl';

import Link from 'next/link';
import ExploreArtsCommon from './ExploreArtsCommon';
const ExploreArtsThree = () => {
    const t = useTranslations('home');
    return (
        <section className="artworks-area pt-110 pb-100">
            <div className="container c-container-1">
                <div className="row wow fadeInUp">
                    <div className="col-lg-8">
                        <div className="section-title1">
                            <h2 className="section-main-title1 mb-40">{t('legacy.exploreArtworks')}</h2>
                        </div>
                    </div>
                    <div className="col-lg-4">
                    </div>
                </div>
                <div className="row wow fadeInUp home-3-artworks">
                    <ExploreArtsCommon start={0} end={16}/>
                </div>
                <div className="artwork-btn text-center pt-20 pb-30">
                    <Link className="fill-btn" href="/explore-arts">{t('legacy.exploreNow')}</Link>
                </div>
            </div>
        </section>
    );
};

export default ExploreArtsThree;
