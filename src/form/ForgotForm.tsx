"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { ApiFetch } from "@/utils/Api";
import { useAuth } from "@/utils/AuthContext";

const ForgotForm = () => {
  const router = useRouter();
  const { t } = useTranslation();

  
  // Traemos userForgot de tu contexto para saber en qué "Paso" estamos
  const { userForgot, setUserForgot } = useAuth() as any; 
   
  // Nota: asegúrate de que setCheckPwdForgot (o como llames a la función para guardar el email temporal) esté exportado en tu AuthContext.

  // --- PASO 1: Formulario para solicitar Email ---
  const emailSchema = Yup.object().shape({
    email: Yup.string()
      .email(t("auth.validation.invalidEmailDomain"))
      .required(t("auth.validation.requiredAll")),
  });

  const formikEmail = useFormik({
    initialValues: { email: "" },
    validationSchema: emailSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      try {
        const res = await ApiFetch.post<{ message?: string }>("/recoverypass", { email: values.email });
        toast.success(res.message || "Solicitud enviada");
        // Si tu backend requiere que pasemos a la pantalla de "Nueva Contraseña" inmediatamente:
        // (Adaptalo si tu flujo depende de que el usuario haga clic en un link en su correo)
                // Reemplaza la línea que decía setCheckPwdForgot por esto:
        if(setUserForgot) setUserForgot({ email: values.email });
      } catch (error: any) {
        toast.error(error.message || "Error al solicitar recuperación");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // --- PASO 2: Formulario para Nueva Contraseña ---
  // Fase 8.3.4 (security fix CWE-640): además de la nueva contraseña, ahora
  // pedimos la contraseña TEMPORAL que recibió el usuario por correo. Sin
  // ella, cualquiera con el email podía tomar la cuenta.
  const passwordSchema = Yup.object().shape({
    tempPassword: Yup.string()
      .required("Ingresá la contraseña temporal que recibiste por correo."),
    password: Yup.string()
      .min(8, t("auth.validation.passwordLength"))
      .matches(/[A-Z]/, t("auth.validation.passwordUppercase"))
      .matches(/[0-9]/, t("auth.validation.passwordNumber"))
      .required(t("auth.validation.requiredAll")),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null as any], t("auth.validation.passwordMismatch"))
      .required(t("auth.validation.requiredAll")),
  });

  const formikPassword = useFormik({
    initialValues: { tempPassword: "", password: "", confirmPassword: "" },
    validationSchema: passwordSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      try {
        const res = await ApiFetch.post<{ message?: string }>("/recoverypassnew", {
          email: userForgot?.email,         // Email del contexto temporal
          lastPwd: values.tempPassword,     // Fase 8.3.4: temporal del correo
          npassword: values.password,
        });
        toast.success(res.message || "Contraseña actualizada exitosamente");
        if(setUserForgot) setUserForgot(null); // Limpiamos la memoria al terminar
        router.push("/login");
      } catch (error: any) {
        toast.error(error.message || "Error al actualizar contraseña");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Función de ayuda para pintar errores
  const renderError = (formikInstance: any, field: string) => {
    if (formikInstance.touched[field] && formikInstance.errors[field]) {
      return <div style={{ color: "#d32f2f", fontSize: "12px", marginTop: "5px" }}>{formikInstance.errors[field]}</div>;
    }
    return null;
  };

  // --- RENDER CONDICIONAL (IGUAL QUE EN TU PROYECTO VIEJO) ---
  if (!userForgot) {
    // VISTA 1: Pedir Email
    return (
      <form onSubmit={formikEmail.handleSubmit} className="login-form">
        <p className="mb-4 text-gray text-center">
          Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
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
            {formikEmail.isSubmitting ? "Enviando..." : t("auth.register.resetPwd")}
          </button>
        </div>
        <div className="note mt-3 text-center">
          <Link className="text-btn" href="/login">Volver al Login</Link>
        </div>
      </form>
    );
  } else {
    // VISTA 2: Ingresar contraseña temporal + nueva contraseña
    return (
      <form onSubmit={formikPassword.handleSubmit} className="login-form">
        <p className="mb-4 text-gray text-center">
          Te enviamos una <strong>contraseña temporal</strong> a <strong>{userForgot.email}</strong>.
          Revisá tu correo, copiala abajo y escribí tu nueva contraseña.
        </p>
        {/* Fase 8.3.4: validación de posesión del correo. Sin este campo
            cualquier persona con tu email podía cambiarte la contraseña. */}
        <div className="single-input-unit mb-4">
          <label htmlFor="tempPassword">Contraseña temporal del correo</label>
          <input
            type="password"
            name="tempPassword"
            placeholder="La que te enviamos por email"
            onChange={formikPassword.handleChange}
            onBlur={formikPassword.handleBlur}
            value={formikPassword.values.tempPassword}
            autoComplete="one-time-code"
          />
          {renderError(formikPassword, "tempPassword")}
        </div>
        <div className="single-input-unit mb-4">
          <label htmlFor="password">{t("auth.register.newpassword")}</label>
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
          <label htmlFor="confirmPassword">{t("auth.register.confirmNewPassword")}</label>
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
            {formikPassword.isSubmitting ? "Guardando..." : t("auth.register.saveChanges")}
          </button>
        </div>
        <div className="note mt-3 text-center">
          <button
            type="button"
            className="text-btn"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', textDecoration: 'underline' }}
            onClick={() => setUserForgot(null)}
          >
            ¿No recibiste el correo? Volver a empezar
          </button>
        </div>
      </form>
    );
  }
};

export default ForgotForm;