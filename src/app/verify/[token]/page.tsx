"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ApiFetch, ApiError } from "@/utils/Api";
import { toast } from "react-toastify";

// Opcional: Si quieres que tenga la barra superior y los colores del tema
import ThemeChanger from "@/components/home/ThemeChanger"; 

export default function VerifyPage() {
    const params = useParams();
    const token = params.token as string; // Capturamos el token de la carpeta [token]
    const router = useRouter();
    
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!token) return;

        const verifyAccount = async () => {
            try {
                // Hacemos el POST a tu backend con el token
            const res = await ApiFetch.post(`/verify/${token}`, {});
                
                // Si llegamos aquí, el Axios interceptor resolvió correctamente
                setStatus("success");
                toast.success("¡Cuenta verificada correctamente!");
                
                // Redirigimos después de 3 segundos
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
        <>
            <ThemeChanger />
            <div style={{ 
                textAlign: "center", 
                marginTop: "150px", 
                marginBottom: "150px",
                minHeight: "40vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center"
            }}>
                {status === "loading" && (
                    <h2 className="text-white">⏳ Verificando cuenta...</h2>
                )}
                
                {status === "success" && (
                    <>
                        <h2 style={{ color: "#4caf50" }}>✅ Cuenta verificada</h2>
                        <p className="mt-3 text-gray">Serás redirigido al login en unos segundos...</p>
                    </>
                )}
                
                {status === "error" && (
                    <>
                        <h2 style={{ color: "#f44336" }}>❌ Error de verificación</h2>
                        <p className="mt-3 text-gray">{message}</p>
                        <button 
                            className="fill-btn mt-4" 
                            onClick={() => router.push('/register')}
                        >
                            Volver al registro
                        </button>
                    </>
                )}
            </div>
        </>
    );
}