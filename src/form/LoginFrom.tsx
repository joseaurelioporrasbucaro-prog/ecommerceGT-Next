"use client";
import Link from "next/link";
import React, { useState } from "react";
import { useFormik } from "formik";
import { login_schema } from "@/utils/validation-schema";
import ErrorMessage from "@/utils/ErrorMessage";

// Importaciones nuevas para tu lógica
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ApiFetch } from "@/utils/Api";
import type { LoginResponse } from "@/types/api";
import { useAuth } from "@/utils/AuthContext";

const LoginFrom = () => {
  const router = useRouter();
  const { checkAuth, setUserForgot } = useAuth() as any; // Traemos checkAuth para actualizar el estado de autenticación después del login exitoso, y setUserForgot para manejar el flujo de "Olvidé mi contraseña"
  const [loading, setLoading] = useState(false);


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
          toast.error("Credenciales incorrectas o error de servidor");
          console.error("Error en login:", error);
        } finally {
          setLoading(false);
        }
      },
    });

  return (
    <>
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