import React from "react";
import ThemeChanger from "./ThemeChanger";
import HeroSection from "./HeroSection";
import WalletSection from "./WalletSection";
import LiveOctionSection from "./LiveOctionSection";
import BrowseCategorySection from "./BrowseCategorySection";
import TopSellerSection from "./TopSellerSection";
import PopularSection from "./PopularSection";
import ArtWorksSection from "./ArtWorksSection";
import WorkProcessSection from "./WorkProcessSection";

const HomeMain = () => {
  return (
    <>
      <ThemeChanger />
      <HeroSection />
      <WalletSection/>
      <LiveOctionSection/>
      <BrowseCategorySection/>
      <TopSellerSection/>
      <PopularSection/>
      <ArtWorksSection/>
      <WorkProcessSection/>
    </>
  );
};

export default HomeMain;
