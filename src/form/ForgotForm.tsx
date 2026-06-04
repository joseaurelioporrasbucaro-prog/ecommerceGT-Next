"use client";

import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useFormik, type FormikProps } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { ApiError, ApiFetch } from "@/utils/Api";

type EmailValues = {
  email: string;
};

type PasswordValues = {
  password: string;
  confirmPassword: string;
};

type RecoveryResponse = {
  message?: string;
};

const GENERIC_RECOVERY_MESSAGE = "Si el correo está registrado, recibirás un link para restablecer.";

const renderError = <T extends Record<string, string>>(
  formikInstance: FormikProps<T>,
  field: keyof T,
) => {
  const error = formikInstance.errors[field];
  if (formikInstance.touched[field] && typeof error === "string") {
    return <div style={{ color: "#d32f2f", fontSize: "12px", marginTop: "5px" }}>{error}</div>;
  }
  return null;
};

const ForgotForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const token = searchParams.get("token") || "";

  const emailSchema = Yup.object().shape({
    email: Yup.string()
      .email(t("auth.validation.invalidEmailDomain"))
      .required(t("auth.validation.requiredAll")),
  });

  const formikEmail = useFormik<EmailValues>({
    initialValues: { email: "" },
    validationSchema: emailSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setSubmitting(true);
      try {
        const res = await ApiFetch.post<RecoveryResponse>("/recoverypass", { email: values.email });
        toast.success(res.message || GENERIC_RECOVERY_MESSAGE);
        resetForm();
      } catch (error) {
        const msg = error instanceof ApiError ? error.message : GENERIC_RECOVERY_MESSAGE;
        if (error instanceof ApiError && error.status === 429) {
          toast.error(msg);
        } else {
          toast.info(GENERIC_RECOVERY_MESSAGE);
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  const passwordSchema = Yup.object().shape({
    password: Yup.string()
      .min(8, t("auth.validation.passwordLength"))
      .matches(/[A-Z]/, t("auth.validation.passwordUppercase"))
      .matches(/[0-9]/, t("auth.validation.passwordNumber"))
      .required(t("auth.validation.requiredAll")),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], t("auth.validation.passwordMismatch"))
      .required(t("auth.validation.requiredAll")),
  });

  const formikPassword = useFormik<PasswordValues>({
    initialValues: { password: "", confirmPassword: "" },
    validationSchema: passwordSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      try {
        const res = await ApiFetch.post<RecoveryResponse>("/recoverypassnew", {
          token,
          npassword: values.password,
        });
        toast.success(res.message || "Contraseña actualizada exitosamente.");
        router.push("/login");
      } catch (error) {
        const msg = error instanceof ApiError ? error.message : "Error al actualizar contraseña.";
        toast.error(msg);
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (!token) {
    return (
      <form onSubmit={formikEmail.handleSubmit} className="login-form">
        <p className="mb-4 text-gray text-center">
          Ingresá tu correo. Si está registrado, te enviaremos un link para restablecer tu contraseña.
        </p>
        <div className="single-input-unit">
          <label htmlFor="email">{t("auth.register.email")}</label>
          <input
            type="email"
            name="email"
            placeholder="ejemplo@correo.com"
            onChange={formikEmail.handleChange}
            onBlur={formikEmail.handleBlur}
            value={formikEmail.values.email}
          />
          {renderError(formikEmail, "email")}
        </div>
        <div className="login-btn mt-30">
          <button className="fill-btn" type="submit" disabled={formikEmail.isSubmitting}>
            {formikEmail.isSubmitting ? "Enviando..." : "Enviar link"}
          </button>
        </div>
        <div className="note mt-3 text-center">
          <Link className="text-btn" href="/login">Volver al Login</Link>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={formikPassword.handleSubmit} className="login-form">
      <p className="mb-4 text-gray text-center">
        Escribí tu nueva contraseña. El link es válido por 30 minutos y se puede usar una sola vez.
      </p>
      <div className="single-input-unit mb-4">
        <label htmlFor="password">Nueva contraseña</label>
        <input
          type="password"
          name="password"
          placeholder="********"
          onChange={formikPassword.handleChange}
          onBlur={formikPassword.handleBlur}
          value={formikPassword.values.password}
          autoComplete="new-password"
        />
        {renderError(formikPassword, "password")}
      </div>
      <div className="single-input-unit">
        <label htmlFor="confirmPassword">Confirmar nueva contraseña</label>
        <input
          type="password"
          name="confirmPassword"
          placeholder="********"
          onChange={formikPassword.handleChange}
          onBlur={formikPassword.handleBlur}
          value={formikPassword.values.confirmPassword}
          autoComplete="new-password"
        />
        {renderError(formikPassword, "confirmPassword")}
      </div>
      <div className="login-btn mt-30">
        <button className="fill-btn" type="submit" disabled={formikPassword.isSubmitting}>
          {formikPassword.isSubmitting ? "Guardando..." : "Cambiar contraseña"}
        </button>
      </div>
      <div className="note mt-3 text-center">
        <Link className="text-btn" href="/forgot">¿Link expirado? Solicitar uno nuevo</Link>
      </div>
    </form>
  );
};

export default ForgotForm;
