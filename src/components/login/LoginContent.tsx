import LoginFrom from "@/form/LoginFrom";
import React from "react";
import { useTranslations } from "next-intl";
import AuthShell from "@/components/auth/AuthShell";

// Handoff #5 §1/§2 — /login dentro del AuthShell (panel de marca navy +
// formulario sin card). El form (Formik + apelación + lockout) no se toca.
const LoginContent = () => {
  const t = useTranslations("auth");
  const tShell = useTranslations("auth.shell");
  return (
    <AuthShell headline={tShell("headlineLogin")}>
      <h4>{t("login.title")}</h4>
      <p className="kq-auth-sub">{t("login.subtitle")}</p>
      <LoginFrom />
    </AuthShell>
  );
};

export default LoginContent;
