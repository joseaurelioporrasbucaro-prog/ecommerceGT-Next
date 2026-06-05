"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useFormik, type FormikProps } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { Link, useRouter } from "@/i18n/navigation";
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
  const t = useTranslations("auth");
  const token = searchParams.get("token") || "";
  const genericRecoveryMessage = t("forgot.genericMessage");

  const emailSchema = Yup.object().shape({
    email: Yup.string()
      .email(t("validation.invalidEmailDomain"))
      .required(t("validation.requiredAll")),
  });

  const formikEmail = useFormik<EmailValues>({
    initialValues: { email: "" },
    validationSchema: emailSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setSubmitting(true);
      try {
        const res = await ApiFetch.post<RecoveryResponse>("/recoverypass", { email: values.email });
        toast.success(res.message || genericRecoveryMessage);
        resetForm();
      } catch (error) {
        const msg = error instanceof ApiError ? error.message : genericRecoveryMessage;
        if (error instanceof ApiError && error.status === 429) {
          toast.error(msg);
        } else {
          toast.info(genericRecoveryMessage);
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  const passwordSchema = Yup.object().shape({
    password: Yup.string()
      .min(8, t("validation.passwordLength"))
      .matches(/[A-Z]/, t("validation.passwordUppercase"))
      .matches(/[0-9]/, t("validation.passwordNumber"))
      .required(t("validation.requiredAll")),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], t("validation.passwordMismatch"))
      .required(t("validation.requiredAll")),
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
        toast.success(res.message || t("forgot.updateSuccess"));
        router.push("/login");
      } catch (error) {
        const msg = error instanceof ApiError ? error.message : t("forgot.updateError");
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
          {t("forgot.instructions")}
        </p>
        <div className="single-input-unit">
          <label htmlFor="email">{t("register.email")}</label>
          <input
            type="email"
            name="email"
            placeholder={t("forgot.emailPlaceholder")}
            onChange={formikEmail.handleChange}
            onBlur={formikEmail.handleBlur}
            value={formikEmail.values.email}
          />
          {renderError(formikEmail, "email")}
        </div>
        <div className="login-btn mt-30">
          <button className="fill-btn" type="submit" disabled={formikEmail.isSubmitting}>
            {formikEmail.isSubmitting ? t("forgot.sending") : t("forgot.sendLink")}
          </button>
        </div>
        <div className="note mt-3 text-center">
          <Link className="text-btn" href="/login">{t("forgot.backToLogin")}</Link>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={formikPassword.handleSubmit} className="login-form">
      <p className="mb-4 text-gray text-center">
        {t("forgot.newPasswordInstructions")}
      </p>
      <div className="single-input-unit mb-4">
        <label htmlFor="password">{t("forgot.newPassword")}</label>
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
        <label htmlFor="confirmPassword">{t("forgot.confirmNewPassword")}</label>
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
          {formikPassword.isSubmitting ? t("forgot.saving") : t("forgot.changePassword")}
        </button>
      </div>
      <div className="note mt-3 text-center">
        <Link className="text-btn" href="/forgot">{t("forgot.expiredLink")}</Link>
      </div>
    </form>
  );
};

export default ForgotForm;
