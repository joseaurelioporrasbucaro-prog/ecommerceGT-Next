import React from "react";
import ThemeChanger from "../home/ThemeChanger";
import Breadcrumbs from "@/utils/Breadcrumbs";
import FAQContent from "./FAQContent";

const FAQMain = () => {
  return (
    <>
      <ThemeChanger />

      <Breadcrumbs
        breadcrumbTitle="Frequently Asked Questions"
        breadcrumbSubTitle="Frequently Asked Questions"
      />
      <FAQContent/>
    </>
  );
};

export default FAQMain;
