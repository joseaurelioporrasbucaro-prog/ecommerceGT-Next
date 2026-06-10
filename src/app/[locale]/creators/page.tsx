import { redirect } from "next/navigation";
import React from "react";

// Fase 24 — Redirect al ranking unificado.
//
// Antes /creators era una página independiente con el ranking "directorio"
// (score compuesto). Ahora vive como tab dentro de /ranking. Mantenemos
// esta ruta como redirect para no romper:
//   - Links externos ya compartidos
//   - SEO indexado en Google
//   - Bookmarks de usuarios
//
// next/navigation `redirect()` emite un 307 en streaming + 308 en el HTML
// inicial. Google interpreta cualquiera como redirect y migra el sitio
// canonical al destino.
const CreatorsRedirect = ({ params }: { params: { locale: string } }) => {
  redirect(`/${params.locale}/ranking?tab=destacados`);
};

export default CreatorsRedirect;
