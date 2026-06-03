"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useCheckHandle, useHandleSuggestions } from "@/hooks/api/useHandle";
import { ApiError, ApiFetch } from "@/utils/Api";
import type { RegisterPayload } from "@/types/api";

interface RegisterFormValues {
  isBusiness: boolean;
  noIdentification: string;
  busNameC: string;
  busName: string;
  firstName: string;
  lastName: string;
  handle: string;
  email: string;
  password: string;
  confirmPassword: string;
  /** Fase 12 — debe ser true para poder enviar el form. */
  acceptTerms: boolean;
}

function getSuggestionsFromError(error: unknown): string[] {
  if (!(error instanceof ApiError)) {
    return [];
  }

  const body = error.body;
  if (
    typeof body === "object" &&
    body !== null &&
    "suggestions" in body &&
    Array.isArray((body as { suggestions?: unknown }).suggestions)
  ) {
    return (body as { suggestions: unknown[] }).suggestions.filter(
      (suggestion): suggestion is string => typeof suggestion === "string",
    );
  }

  return [];
}

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
      .oneOf([Yup.ref("password")], t("auth.validation.passwordMismatch"))
      .required(t("auth.validation.requiredAll")),
    handle: Yup.string()
      .matches(/^[a-z0-9_]{3,30}$/, {
        message: "Usa 3 a 30 caracteres: minúsculas, números o guion bajo.",
        excludeEmptyString: true,
      })
      .notRequired(),
    // Fase 12 — gate legal: sin aceptar términos, no se puede registrar.
    acceptTerms: Yup.boolean().oneOf(
      [true],
      "Debes aceptar los Términos y la Política de Privacidad para registrarte.",
    ),
  });

  // 2. Configuración de Formik
  const formik = useFormik<RegisterFormValues>({
    initialValues: {
      isBusiness: false,
      noIdentification: "",
      busNameC: "",
      busName: "",
      firstName: "",
      lastName: "",
      handle: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
    validationSchema: registerSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setSubmitting(true);
      try {
        // 3. Replicamos EXACTAMENTE el payload de tu backend viejo
        const payload: RegisterPayload = {
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim(),
          password: values.password,
          isEmployee: false,
          isBusiness: values.isBusiness,
        };
        const normalizedHandle = values.handle.trim().toLowerCase();
        if (normalizedHandle) {
          payload.handle = normalizedHandle;
        }

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

      } catch (error: unknown) {
        const suggestions = getSuggestionsFromError(error);
        if (suggestions.length > 0) {
          await formik.setFieldValue("handle", suggestions[0]);
        }
        toast.error(error instanceof ApiError ? error.message : "Error al crear la cuenta");
      } finally {
        setSubmitting(false);
      }
    },
  });
  const normalizedHandle = formik.values.handle.trim().toLowerCase();
  const shouldCheckHandle = normalizedHandle.length >= 3;
  const handleCheckQuery = useCheckHandle(normalizedHandle);
  const handleSuggestionsQuery = useHandleSuggestions(normalizedHandle);
  const handleSuggestions = handleSuggestionsQuery.data?.suggestions ?? [];
  const handleIsAvailable = shouldCheckHandle ? handleCheckQuery.data?.available : undefined;

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
        <div className="col-md-12">
          <div className="single-input-unit handle-input-unit">
            <label>Nombre de usuario</label>
            <div className="handle-input-wrap">
              <input
                type="text"
                name="handle"
                onChange={(event) => {
                  void formik.setFieldValue("handle", event.target.value.toLowerCase());
                }}
                onBlur={formik.handleBlur}
                value={formik.values.handle}
                placeholder="opcional, ej. ana_garcia"
              />
              {shouldCheckHandle && (
                <span className={`handle-status ${handleIsAvailable ? "is-valid" : "is-invalid"}`}>
                  <i className={handleIsAvailable ? "fas fa-check" : "fas fa-times"}></i>
                </span>
              )}
            </div>
            {renderError("handle")}
            {shouldCheckHandle && handleIsAvailable === false && handleSuggestions.length > 0 && (
              <div className="handle-suggestions">
                {handleSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => {
                      void formik.setFieldValue("handle", suggestion);
                    }}
                  >
                    @{suggestion}
                  </button>
                ))}
              </div>
            )}
            {shouldCheckHandle && handleIsAvailable === true && (
              <div className="handle-help is-valid">Nombre disponible</div>
            )}
            {shouldCheckHandle && handleIsAvailable === false && (
              <div className="handle-help is-invalid">Ese nombre ya está ocupado.</div>
            )}
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
      <style jsx>{`
        .handle-input-wrap {
          position: relative;
        }
        .handle-input-wrap input {
          padding-right: 44px;
        }
        .handle-status {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 16px;
        }
        .handle-status.is-valid,
        .handle-help.is-valid {
          color: #2ed573;
        }
        .handle-status.is-invalid,
        .handle-help.is-invalid {
          color: #ff4757;
        }
        .handle-help {
          font-size: 12px;
          margin-top: 6px;
        }
        .handle-suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 10px;
        }
        .handle-suggestions button {
          border: 1px solid rgba(128, 128, 128, 0.25);
          background: transparent;
          color: inherit;
          border-radius: 18px;
          padding: 5px 12px;
          font-size: 12px;
          font-weight: 600;
        }
        .handle-suggestions button:hover {
          border-color: var(--tp-theme-1, #6c5ce7);
          color: var(--tp-theme-1, #6c5ce7);
        }
      `}</style>

      {/* Fase 12 — checkbox de aceptación legal (obligatorio). Sin esto
          no se puede enviar el form: Yup valida acceptTerms === true. */}
      <div className="legal-accept-row">
        <label className="legal-accept-label">
          <input
            type="checkbox"
            name="acceptTerms"
            checked={formik.values.acceptTerms}
            onChange={(e) =>
              formik.setFieldValue("acceptTerms", e.target.checked)
            }
            onBlur={formik.handleBlur}
          />
          <span>
            He leído y acepto los{" "}
            <Link href="/terminos" target="_blank" rel="noopener noreferrer">
              Términos y Condiciones
            </Link>{" "}
            y la{" "}
            <Link href="/privacidad" target="_blank" rel="noopener noreferrer">
              Política de Privacidad
            </Link>
            .
          </span>
        </label>
        {formik.touched.acceptTerms && formik.errors.acceptTerms && (
          <p className="legal-accept-error">{formik.errors.acceptTerms}</p>
        )}
      </div>

      <div className="sign-up-btn mt-10">
        <button
          className="fill-btn"
          type="submit"
          disabled={formik.isSubmitting || !formik.values.acceptTerms}
        >
          {formik.isSubmitting ? "..." : t("auth.register.submit")}
        </button>
        <div className="note">
          {t("auth.register.haveAccountLink")}
        </div>
      </div>

      <style jsx>{`
        .legal-accept-row {
          margin: 18px 0 4px;
        }
        .legal-accept-label {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          cursor: pointer;
          font-size: 13.5px;
          line-height: 1.5;
        }
        .legal-accept-label input[type="checkbox"] {
          margin-top: 3px;
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          cursor: pointer;
        }
        .legal-accept-label a {
          color: var(--clr-theme-1, #6c5ce7);
          font-weight: 600;
          text-decoration: underline;
        }
        .legal-accept-error {
          margin: 6px 0 0 26px;
          color: #ef4444;
          font-size: 12.5px;
        }
      `}</style>
    </form>
  );
};

export default RegisterForm;
