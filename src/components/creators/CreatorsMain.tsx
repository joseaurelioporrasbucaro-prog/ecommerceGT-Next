import React from 'react';
import ThemeChanger from '../home/ThemeChanger';
import Breadcrumbs from '@/utils/Breadcrumbs';
import CreatorSingle from './CreatorSingle';
import { creatorData } from '@/data/creator-data';
const CreatorsMain = () => {

    return (
        <main>

            <ThemeChanger />

            <Breadcrumbs breadcrumbTitle="Creators" breadcrumbSubTitle="Creators" />

            <section className="creator-area pt-130 pb-100">
                <div className="container">
                    <div className="row wow fadeInUp">
                        {
                            creatorData.map(creator => <CreatorSingle key={creator.id} creator={creator} />)
                        }
                        
                    </div>
                </div>
            </section>
        </main>
    );
};

export default CreatorsMain;