"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { ApiFetch } from "@/utils/Api";

const RegisterForm = () => {
  const router = useRouter();
  const { t } = useTranslation();

  // 1. Esquema de Validación Dinámico (Usa 't' para los idiomas en tiempo real)
  const registerSchema = Yup.object().shape({
    isBusiness: Yup.boolean(),
    
    // Validaciones condicionales: Solo se exigen si isBusiness es TRUE
    noIdentification: Yup.string().when("isBusiness", {
      is: true,
      then: (schema) => schema.required(t("auth.validation.requiredAll")),
      otherwise: (schema) => schema.notRequired(),
    }),
    busNameC: Yup.string().when("isBusiness", {
      is: true,
      then: (schema) => schema.required(t("auth.validation.requiredAll")),
      otherwise: (schema) => schema.notRequired(),
    }),
    busName: Yup.string().when("isBusiness", {
      is: true,
      then: (schema) => schema.required(t("auth.validation.requiredAll")),
      otherwise: (schema) => schema.notRequired(),
    }),

    // Validaciones estándar
    firstName: Yup.string().required(t("auth.validation.requiredAll")),
    lastName: Yup.string().required(t("auth.validation.requiredAll")),
    email: Yup.string()
      .email(t("auth.validation.invalidEmailDomain"))
      .required(t("auth.validation.requiredAll")),
    password: Yup.string()
      .min(8, t("auth.validation.passwordLength"))
      .matches(/[A-Z]/, t("auth.validation.passwordUppercase"))
      .matches(/[0-9]/, t("auth.validation.passwordNumber"))
      .required(t("auth.validation.requiredAll")),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null as any], t("auth.validation.passwordMismatch"))
      .required(t("auth.validation.requiredAll")),
  });

  // 2. Configuración de Formik
  const formik = useFormik({
    initialValues: {
      isBusiness: false,
      noIdentification: "",
      busNameC: "",
      busName: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: registerSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setSubmitting(true);
      try {
        // 3. Replicamos EXACTAMENTE el payload de tu backend viejo
        const payload: any = {
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim(),
          password: values.password,
          confirmPassword: values.confirmPassword,
          isEmployee: false,
          isBusiness: values.isBusiness,
        };

        if (values.isBusiness) {
          payload.busId = values.noIdentification.trim();
          payload.busTName = values.busNameC.trim();
          payload.busName = values.busName.trim();
        }

        // Llamada a la API
        const res = await ApiFetch.post<{ message?: string }>("/register", payload);
        
        toast.success(res.message || "¡Cuenta creada exitosamente!");
        resetForm();
        router.push("/login"); // Redirección al Login como lo tenías antes

      } catch (error: any) {
        toast.error(error.message || "Error al crear la cuenta");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Función de ayuda para pintar los errores en rojo fácilmente
  const renderError = (field: keyof typeof formik.values) => {
    if (formik.touched[field] && formik.errors[field]) {
      return <div style={{ color: "#d32f2f", fontSize: "12px", marginTop: "5px" }}>{formik.errors[field] as string}</div>;
    }
    return null;
  };

  return (
    <form onSubmit={formik.handleSubmit} className="sign-up-form" action="#">
      <div className="row">
        
        {/* Toggle para Empresa */}
        <div className="col-12 mb-30">
            <label style={{ display: "flex", alignItems: "center", cursor: "pointer", fontWeight: "600", fontSize: "16px" }}>
              <input
                type="checkbox"
                name="isBusiness"
                checked={formik.values.isBusiness}
                onChange={formik.handleChange}
                style={{ width: "20px", height: "20px", marginRight: "10px" }}
              />
              {t("auth.register.isBusiness")}
            </label>
        </div>

        {/* Campos Condicionales de Empresa */}
        {formik.values.isBusiness && (
          <>
            <div className="col-md-12">
              <div className="single-input-unit">
                <label>{t("auth.register.businessId")}</label>
                <input
                  type="text"
                  name="noIdentification"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.noIdentification}
                />
                {renderError("noIdentification")}
              </div>
            </div>
            <div className="col-md-6">
              <div className="single-input-unit">
                <label>{t("auth.register.tradeName")}</label>
                <input
                  type="text"
                  name="busNameC"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.busNameC}
                />
                {renderError("busNameC")}
              </div>
            </div>
            <div className="col-md-6">
              <div className="single-input-unit">
                <label>{t("auth.register.businessName")}</label>
                <input
                  type="text"
                  name="busName"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.busName}
                />
                {renderError("busName")}
              </div>
            </div>
          </>
        )}

        {/* Campos Estándar */}
        <div className="col-md-6">
          <div className="single-input-unit">
            <label>{!formik.values.isBusiness ? t("auth.register.firstName") : t("auth.register.firstNameRep")}</label>
            <input
              type="text"
              name="firstName"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.firstName}
            />
            {renderError("firstName")}
          </div>
        </div>
        <div className="col-md-6">
          <div className="single-input-unit">
            <label>{t("auth.register.lastName")}</label>
            <input
              type="text"
              name="lastName"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.lastName}
            />
            {renderError("lastName")}
          </div>
        </div>
        <div className="col-md-12">
          <div className="single-input-unit">
            <label>{t("auth.register.email")}</label>
            <input
              type="email"
              name="email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
            />
            {renderError("email")}
          </div>
        </div>
        <div className="col-md-6">
          <div className="single-input-unit">
            <label>{t("auth.register.password")}</label>
            <input
              type="password"
              name="password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
            />
            {renderError("password")}
          </div>
        </div>
        <div className="col-md-6">
          <div className="single-input-unit">
            <label>{t("auth.register.confirmPassword")}</label>
            <input
              type="password"
              name="confirmPassword"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.confirmPassword}
            />
            {renderError("confirmPassword")}
          </div>
        </div>
      </div>

      <div className="sign-up-btn mt-10">
        <button className="fill-btn" type="submit" disabled={formik.isSubmitting}>
          {formik.isSubmitting ? "..." : t("auth.register.submit")}
        </button>
        <div className="note">
          {t("auth.register.haveAccountLink")}
        </div>
      </div>
    </form>
  );
};

export default RegisterForm;