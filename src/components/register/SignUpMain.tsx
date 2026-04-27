import React from "react";
import ThemeChanger from "../home/ThemeChanger";
import Breadcrumbs from "@/utils/Breadcrumbs";
import SignUpContent from "./SignUpContent";

const SignUpMain = () => {
  return (
    <>
      <ThemeChanger />

      <Breadcrumbs
        breadcrumbTitle="Sign up"
        breadcrumbSubTitle="Create Account"
      />
      <SignUpContent />
    </>
  );
};

export default SignUpMain;
