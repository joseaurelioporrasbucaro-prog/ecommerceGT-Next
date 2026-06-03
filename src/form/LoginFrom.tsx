"use client";
import Link from "next/link";
import React, { useState } from "react";
import { useFormik } from "formik";
import { login_schema } from "@/utils/validation-schema";
import ErrorMessage from "@/utils/ErrorMessage";

// Importaciones nuevas para tu lógica
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ApiError, ApiFetch } from "@/utils/Api";
import type { LoginResponse } from "@/types/api";
import { useAuth } from "@/utils/AuthContext";

const LoginFrom = () => {
  const router = useRouter();
  const { checkAuth, setUserForgot } = useAuth() as any; // Traemos checkAuth para actualizar el estado de autenticación después del login exitoso, y setUserForgot para manejar el flujo de "Olvidé mi contraseña"
  const [loading, setLoading] = useState(false);
  // Fase 8.3.1 — bloqueo por sanción + flujo de apelación.
  const [bannedMsg, setBannedMsg] = useState<string | null>(null);
  const [appealOpen, setAppealOpen] = useState(false);
  const [appealText, setAppealText] = useState("");
  const [appealEmail, setAppealEmail] = useState("");
  const [appealing, setAppealing] = useState(false);
  // Fase 8.3.3 — bloqueo por intentos fallidos (passta_id=2): la salida NO
  // es apelación sino restablecer contraseña. Cuando este flag está en true,
  // el bloque de bannedMsg muestra un botón "Restablecer contraseña" en
  // lugar del flujo de apelación.
  const [forceResetMode, setForceResetMode] = useState(false);

  const goReset = () => {
    if (setUserForgot && appealEmail) setUserForgot({ email: appealEmail });
    router.push("/forgot");
  };

  const submitAppeal = async () => {
    if (appealText.trim().length < 10) { toast.error("Explica tu apelación (mín. 10 caracteres)."); return; }
    setAppealing(true);
    try {
      const r = await ApiFetch.post<{ message: string }>("/appeal", { email: appealEmail, message: appealText.trim() });
      toast.success(r.message || "Apelación enviada.");
      setAppealOpen(false);
      setAppealText("");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "No se pudo enviar la apelación.");
    } finally {
      setAppealing(false);
    }
  };


  // use formik
  const { handleChange, handleSubmit, handleBlur, errors, values, touched } =
    useFormik({
      initialValues: {
        email: "",
        password: "",
        // Removimos "username" de aquí porque tu API no lo necesita para el login
      },
      validationSchema: login_schema,
      onSubmit: async (values, { resetForm }) => {
        setLoading(true);
        setBannedMsg(null);
        setForceResetMode(false);
        try {
          // 1. Llamada a tu backend en Node.js (Puerto 4000)
          const res = await ApiFetch.post<LoginResponse>("/login", {
            email: values.email,
            password: values.password,
          });

          // 2. Manejo de la respuesta de tu base de datos
          if (res.idpwd === 1) {
            toast.success(res.message || "¡Inicio de sesión exitoso!");
            await checkAuth();
            resetForm();
            router.push("/");
          } else if (res.idpwd === 5) {
            toast.warning("Debes cambiar tu contraseña temporal");
            // ¡MAGIA! Guardamos tu email en memoria antes de mandarte a /forgot
            if(setUserForgot) setUserForgot({ email: values.email });
            router.push("/forgot");
          }
        } catch (error: any) {
          if (error instanceof ApiError) {
            const body = (error.body as any) || {};
            // Fase 8.3.3 — bloqueo por intentos fallidos: o aún dentro de la
            // ventana de 30 min (passwordLocked) o vencida pero solo se sale
            // por reset (mustResetPassword). En ambos casos la salida UI es
            // restablecer contraseña, no apelar.
            if (error.status === 403 && (body.passwordLocked || body.mustResetPassword)) {
              setBannedMsg(error.message);
              setAppealEmail(values.email);
              setForceResetMode(true);
              return;
            }
            // Fase 8.3.3 — warning en el 4º intento: toast persistente con CTA.
            if (error.status === 400 && body.nearLockout) {
              toast.warning(error.message, { autoClose: 8000 });
              return;
            }
            // Cuenta sancionada por soporte (403 con banned): apelación.
            if (error.status === 403 && body.banned) {
              setBannedMsg(error.message);
              setAppealEmail(values.email);
              setAppealText("");
              setAppealOpen(false);
              return;
            }
            // Resto de errores de negocio del backend (incl. password incorrecto).
            toast.error(error.message || "Credenciales incorrectas");
            return;
          }
          toast.error("Error inesperado al iniciar sesión");
          console.error("Error en login:", error);
        } finally {
          setLoading(false);
        }
      },
    });

  return (
    <>
      {bannedMsg && (
        <div className="appeal-box">
          <p className="appeal-msg">
            <i className={forceResetMode ? "fas fa-lock" : "fas fa-ban"} /> {bannedMsg}
          </p>
          {forceResetMode ? (
            <button type="button" className="fill-btn" onClick={goReset}>
              Restablecer contraseña
            </button>
          ) : !appealOpen ? (
            <button type="button" className="appeal-link" onClick={() => setAppealOpen(true)}>
              Apelar esta decisión
            </button>
          ) : (
            <div className="appeal-form">
              <textarea
                rows={3}
                placeholder="Explica por qué deberíamos revisar la sanción…"
                value={appealText}
                onChange={(e) => setAppealText(e.target.value)}
              />
              <button type="button" className="fill-btn" onClick={submitAppeal} disabled={appealing}>
                {appealing ? "Enviando…" : "Enviar apelación"}
              </button>
            </div>
          )}
          <style jsx>{`
            .appeal-box { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.3); border-radius: 12px; padding: 16px; margin-bottom: 20px; }
            .appeal-msg { margin: 0 0 10px; color: #dc2626; font-size: 14px; display: flex; gap: 8px; }
            .appeal-link { background: none; border: none; color: #dc2626; font-weight: 600; text-decoration: underline; cursor: pointer; padding: 0; }
            .appeal-form textarea { width: 100%; border: 1px solid rgba(128,128,128,0.3); border-radius: 8px; padding: 10px; margin-bottom: 10px; resize: vertical; }
          `}</style>
        </div>
      )}

      <form onSubmit={handleSubmit} className="login-form" action="#">
        <div className="row">
          <div className="col-md-12">
            <div className="single-input-unit">
              <label htmlFor="m-id">Email</label>
              <input
                name="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                type="email"
                placeholder="Enter Your Email"
              />
              {touched.email && errors.email && <ErrorMessage error={errors.email} />}
            </div>
          </div>
          
          {/* Cambiamos a col-md-12 para que ocupe el ancho completo sin el username */}
          <div className="col-md-12">
            <div className="single-input-unit">
              <label htmlFor="password">Password</label>
              <input
                name="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                type="password"
                placeholder="Password"
                id="password"
              />
              {touched.password && errors.password && <ErrorMessage error={errors.password} />}
            </div>
          </div>
        </div>
        
        {/* --- NUEVO BLOQUE: Enlace de Olvidé mi Contraseña --- */}
        <div className="row mb-3">
          <div className="col-md-12 text-end">
            <Link href="/forgot" style={{ fontSize: '14px', color: '#5a5af2', fontWeight: 500, textDecoration: 'underline' }}>
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>

        <div className="login-btn">
          <button 
            type="submit" 
            className="fill-btn" 
            disabled={loading}
          >
            {loading ? "Cargando..." : "Sign in Account"}
          </button>
          <div className="note">
            Not yet registered?{" "}
            <Link className="text-btn" href="/register">
              Sign up
            </Link>
          </div>
        </div>
      </form>
    </>
  );
};

export default LoginFrom;