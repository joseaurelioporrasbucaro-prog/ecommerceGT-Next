"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ApiFetch, ApiError } from "@/utils/Api";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import AuthShell from "@/components/auth/AuthShell";

// Handoff #5 §2 — /verify dentro del AuthShell. OJO: el flujo real es por
// LINK con token (POST /verify/:token automático al abrir), no por código
// OTP como la referencia visual — se conserva la lógica y se re-skinea el
// estado. TODO(design): pantalla OTP requeriría código corto en backend.
export default function VerifyPage() {
    const params = useParams();
    const token = params.token as string; // Capturamos el token de la carpeta [token]
    const router = useRouter();
    const tShell = useTranslations("auth.shell");

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!token) return;

        const verifyAccount = async () => {
            try {
                const res = await ApiFetch.post(`/verify/${token}`, {});
                void res;
                setStatus("success");
                toast.success("¡Cuenta verificada correctamente!");
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } catch (error) {
                setStatus("error");
                const errorMsg =
                    error instanceof ApiError ? error.message : "¡Token inválido o expirado!";
                setMessage(errorMsg);
                toast.error(errorMsg);
            }
        };

        verifyAccount();
    }, [token, router]);

    return (
        <AuthShell headline={tShell("headlineVerify")}>
            <div className="kq-verify">
                {status === "loading" && (
                    <>
                        <span className="kq-verify-icon is-loading">
                            <i className="fas fa-circle-notch fa-spin" />
                        </span>
                        <h4>Verificando tu cuenta…</h4>
                        <p className="kq-auth-sub">Esto toma solo un momento.</p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <span className="kq-verify-icon is-success">
                            <i className="fas fa-check" />
                        </span>
                        <h4>Cuenta verificada</h4>
                        <p className="kq-auth-sub">
                            Serás redirigido al login en unos segundos…
                        </p>
                    </>
                )}

                {status === "error" && (
                    <>
                        <span className="kq-verify-icon is-error">
                            <i className="fas fa-times" />
                        </span>
                        <h4>Error de verificación</h4>
                        <p className="kq-auth-sub">{message}</p>
                        <button
                            className="fill-btn"
                            onClick={() => router.push('/register')}
                        >
                            Volver al registro
                        </button>
                    </>
                )}
            </div>

            <style jsx global>{`
                .kq-auth .kq-verify {
                    text-align: center;
                }
                .kq-auth .kq-verify-icon {
                    width: 72px;
                    height: 72px;
                    border-radius: 999px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    margin-bottom: 22px;
                }
                .kq-auth .kq-verify-icon.is-loading {
                    background: var(--accent-soft, #ebe8fb);
                    color: var(--lav-700, #6d62cf);
                }
                .kq-auth .kq-verify-icon.is-success {
                    background: var(--green-100, #eef6df);
                    color: var(--green-700, #6f9433);
                }
                .kq-auth .kq-verify-icon.is-error {
                    background: var(--danger-bg, #f8e4e4);
                    color: var(--danger, #cf4a4a);
                }
            `}</style>
        </AuthShell>
    );
}
