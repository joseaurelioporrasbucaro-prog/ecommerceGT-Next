
import Link from 'next/link';
import React from 'react';
import { useTranslations } from 'next-intl';

interface SingleCreatorSummary {
    name?: string | null;
}

interface singleCreatorType{
    singleCreator?: SingleCreatorSummary;
}

const ProfileBreadCamb = ({singleCreator}:singleCreatorType) => {
    const t = useTranslations('profile');
    return (
        <>
             <section className="page-title-area">
                <div className="container">
                    <div className="row wow fadeInUp">
                        <div className="col-lg-12">
                            <div className="page-title">
                                <h2 className="breadcrumb-title mb-10">{singleCreator?.name}</h2>
                                <div className="breadcrumb-menu">
                                    <nav className="breadcrumb-trail breadcrumbs">
                                        <ul className="trail-items">
                                            <li className="trail-item trail-begin"><Link href="/">{t('breadcrumbs.home')}</Link></li>
                                            <li className="trail-item trail-end"><span>{singleCreator?.name}</span></li>
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ProfileBreadCamb;
