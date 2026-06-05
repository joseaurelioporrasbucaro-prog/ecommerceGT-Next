import React from "react";
import { useTranslations } from "next-intl";
import ThemeChanger from "../home/ThemeChanger";
import Breadcrumbs from "@/utils/Breadcrumbs";
import LoginContent from "./LoginContent";

const LoginMain = () => {
  const t = useTranslations("auth");
  return (
    <>
      <ThemeChanger />
      <Breadcrumbs breadcrumbTitle={t("login.title")} breadcrumbSubTitle={t("login.title")} />
      <LoginContent/>
    </>
  );
};

export default LoginMain;
