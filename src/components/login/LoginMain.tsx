import React from "react";
import ThemeChanger from "../home/ThemeChanger";
import Breadcrumbs from "@/utils/Breadcrumbs";
import LoginContent from "./LoginContent";

const LoginMain = () => {
  return (
    <>
      <ThemeChanger />
      <Breadcrumbs breadcrumbTitle="Sign in" breadcrumbSubTitle="Sign in" />
      <LoginContent/>
    </>
  );
};

export default LoginMain;
