import React from "react";
import { useTranslations } from "next-intl";
import ThemeChanger from "../home/ThemeChanger";
import Breadcrumbs from "@/utils/Breadcrumbs";
import SignUpContent from "./SignUpContent";

const SignUpMain = () => {
  const t = useTranslations("auth");
  return (
    <>
      <ThemeChanger />

      <Breadcrumbs
        breadcrumbTitle={t("register.title")}
        breadcrumbSubTitle={t("register.title")}
      />
      <SignUpContent />
    </>
  );
};

export default SignUpMain;
