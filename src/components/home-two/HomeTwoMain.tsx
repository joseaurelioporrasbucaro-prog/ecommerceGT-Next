import React from 'react';
import ThemeChanger from '../home/ThemeChanger';
import HeroSectionTwo from './HeroSectionTwo';
import OctionTwoSlider from './OctionTwoSlider';
import TopCreatorTwo from './TopCreatorTwo';
import WalletSection from '../home/WalletSection';
import ArtWorksSection from '../home/ArtWorksSection';
import WorkProcessSection from '../home/WorkProcessSection';
import PopularSection from '../home/PopularSection';

const HomeTwoMain = () => {
    return (
        <>
            <ThemeChanger/>
            <HeroSectionTwo/>
            <OctionTwoSlider/>
            <TopCreatorTwo/>
            <WalletSection walletSpacing="pt-80 pb-100 z-index-1"/>
            <ArtWorksSection />
            <WorkProcessSection/>
            <PopularSection/>
        </>
    );
};

export default HomeTwoMain;