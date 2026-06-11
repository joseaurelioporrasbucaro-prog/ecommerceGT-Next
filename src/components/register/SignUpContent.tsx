import RegisterForm from "@/form/RegisterForm";
import React from "react";
import { useTranslations } from "next-intl";
import AuthShell from "@/components/auth/AuthShell";

// Handoff #5 §1/§2 — /register dentro del AuthShell. El RegisterForm
// (Formik/Yup) no se toca. El bloque "registrarse con redes" del template
// se retiró: eran links muertos (href="#") sin backend detrás.
const SignUpContent = () => {
  const t = useTranslations("auth");
  const tShell = useTranslations("auth.shell");
  return (
    <AuthShell headline={tShell("headlineRegister")}>
      <h4>{t("register.title")}</h4>
      <p className="kq-auth-sub">{t("register.subtitle")}</p>
      <RegisterForm />
    </AuthShell>
  );
};

export default SignUpContent;
