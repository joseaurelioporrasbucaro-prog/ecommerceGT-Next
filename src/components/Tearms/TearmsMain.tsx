import React from "react";
import ThemeChanger from "../home/ThemeChanger";
import Breadcrumbs from "@/utils/Breadcrumbs";
import TearmsContent from "./TearmsContent";

const TearmsMain = () => {
  return (
    <>
      <ThemeChanger />

      <Breadcrumbs
        breadcrumbTitle="Terms of Uses"
        breadcrumbSubTitle="Terms of Uses"
      />
      <TearmsContent/>
    </>
  );
};

export default TearmsMain;
