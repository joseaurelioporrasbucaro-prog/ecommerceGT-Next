"use client";
import React, { useState } from "react";
import { useFormik } from "formik";
import Link from "next/link";
import { toast } from "react-toastify";
import { useLocale } from "next-intl";
import { contact_schema } from "@/utils/validation-schema";
import ErrorMessage from "@/utils/ErrorMessage";
import NiceSelectForm from "@/elements/niceSelect/NiceSelectForm";
import { selectSubject } from "@/data/nice-select-data";
import { ApiError, ApiFetch } from "@/utils/Api";
// Fase 23 — Captcha Cloudflare Turnstile anti-bot.
import TurnstileWidget from "@/components/common/TurnstileWidget";

interface ContactResponse {
  message?: string;
}

const ContactFormSection = () => {
  const [selelectForm, setSelelectForm] = useState<string>("");
  // Token Turnstile (vacío hasta que el usuario complete el reto).
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const locale = useLocale();

  const {
    handleChange,
    handleSubmit,
    handleBlur,
    errors,
    values,
    touched,
    isSubmitting,
    setSubmitting,
    resetForm,
  } = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
    validationSchema: contact_schema,
    onSubmit: async (values, { resetForm: rf, setSubmitting: ss }) => {
      // Fase 23 — Validación anti-bot. Si el captcha aún no se completó,
      // bloqueamos el submit antes de pegar al backend (el backend igualmente
      // valida, esto es UX: el botón ya está visible pero el toast guía al user).
      if (!captchaToken) {
        toast.warning("Por favor completá el captcha antes de enviar.");
        ss(false);
        return;
      }

      try {
        const res = await ApiFetch.post<ContactResponse>("/contact", {
          name: values.name,
          email: values.email,
          phone: values.phone,
          subject: selelectForm || "General",
          message: values.message,
          captchaToken,
          locale,
        });
        toast.success(res.message || "Mensaje enviado. Te responderemos pronto.");
        rf();
        setCaptchaToken("");
      } catch (error) {
        const msg = error instanceof ApiError
          ? error.message
          : "No se pudo enviar el mensaje. Intentá de nuevo.";
        toast.error(msg);
      } finally {
        ss(false);
      }
    },
  });

  const selectHandler = () => {};

  return (
    <div className="contact-wrapper pos-rel mb-40 wow fadeInUp">
      <div className=" contact-inner">
        <div className="contact-content">
          <h4>Conversemos</h4>
          <p className="mb-35">
            ¿Tenés una consulta, propuesta o reporte? Escribinos y nuestro
            equipo de soporte te responde en menos de 24 horas hábiles.
          </p>
          <form onSubmit={handleSubmit} className="contact-form" noValidate>
            <div className="row">
              <div className="col-md-6">
                <div className="single-input-unit">
                  <label htmlFor="name">Nombre</label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    placeholder="Tu nombre"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                  {touched.name && <ErrorMessage error={errors.name} />}
                </div>
              </div>
              <div className="col-md-6">
                <div className="single-input-unit">
                  <label htmlFor="email">Correo</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="tu@correo.com"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                  {touched.email && <ErrorMessage error={errors.email} />}
                </div>
              </div>
              <div className="col-md-6">
                <div className="single-input-unit">
                  <label htmlFor="phone">Teléfono</label>
                  <input
                    type="text"
                    name="phone"
                    id="phone"
                    placeholder="Teléfono"
                    value={values.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                  {touched.phone && <ErrorMessage error={errors.phone} />}
                </div>
              </div>
              <div className="col-md-6">
                <div className="single-input-unit">
                  <label htmlFor="s-select">Asunto</label>
                  <div className="mb-30 w-full">
                    <NiceSelectForm
                      options={selectSubject}
                      defaultCurrent={0}
                      onChange={selectHandler}
                      setSelelectForm={setSelelectForm}
                      name="s-select"
                      className="gender-category-select"
                    />
                  </div>
                </div>
              </div>
              <div className="col-md-12">
                <div className="single-input-unit">
                  <label htmlFor="message">Mensaje</label>
                  <textarea
                    name="message"
                    id="message"
                    placeholder="Contanos en qué te podemos ayudar..."
                    value={values.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  ></textarea>
                  {touched.message && <ErrorMessage error={errors.message} />}
                </div>
              </div>
              <div className="col-md-12">
                {/* Captcha Cloudflare Turnstile — Fase 23.
                    Bloquea el submit si el usuario no resolvió el reto.
                    En dev sin sitekey muestra un placeholder claro. */}
                <div className="mb-30">
                  <TurnstileWidget
                    onToken={setCaptchaToken}
                    theme="auto"
                  />
                </div>
              </div>
            </div>
            <div className="contact-btn">
              <div className="note">
                Al enviar acepto los{" "}
                <Link className="text-btn" href="/terminos">
                  Términos y Condiciones
                </Link>{" "}
                y la{" "}
                <Link className="text-btn" href="/privacidad">
                  Política de Privacidad
                </Link>
                .
              </div>
              <button
                className="fill-btn"
                type="submit"
                disabled={isSubmitting || !captchaToken}
              >
                {isSubmitting ? "Enviando..." : "Enviar mensaje"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactFormSection;
