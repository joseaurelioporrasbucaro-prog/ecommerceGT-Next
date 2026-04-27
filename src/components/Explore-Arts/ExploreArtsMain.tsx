import React from "react";
import ThemeChanger from "../home/ThemeChanger";
import Breadcrumbs from "@/utils/Breadcrumbs";
import ExploreCategorySlider from "@/elements/sliders/ExploreCategorySlider";
import ExploreArtsBar from "./ExploreArtsBar";
import ExploreArtsCommon from "../home-three/ExploreArtsCommon";
import Pagination from "@/utils/Pagination";
const ExploreArtsMain = () => {
  return (
    <main>
      <ThemeChanger />
      <Breadcrumbs
        breadcrumbTitle="Explore Artworks"
        breadcrumbSubTitle="Explore Artworks"
      />

      <section className="artworks-area pt-130 pb-90">
        <div className="container">
          <ExploreCategorySlider />
          <ExploreArtsBar />
          <div className="row wow fadeInUp">
            <ExploreArtsCommon start={0} end={24} />
          </div>
          <div className="row wow fadeInUp">
            <div className="col-12">
              <Pagination />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ExploreArtsMain;
