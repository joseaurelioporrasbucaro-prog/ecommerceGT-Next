import { redirect } from "next/navigation";
import React from "react";

// Fase 24 — Redirect al ranking unificado.
//
// Antes /art-ranking era una página independiente con el "ranking estricto"
// por AVG(rating). Ahora vive como tab dentro de /ranking. Mantenemos esta
// ruta como redirect para no romper links externos / SEO / bookmarks.
const ArtRankingRedirect = ({ params }: { params: { locale: string } }) => {
  redirect(`/${params.locale}/ranking?tab=calificados`);
};

export default ArtRankingRedirect;
