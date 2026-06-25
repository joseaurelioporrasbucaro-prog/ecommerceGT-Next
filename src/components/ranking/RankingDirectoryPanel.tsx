"use client";

// Fase 24 — Tab "Directorio". Reusa la lógica de listado de CreatorsMain
// (getTopSellers con score compuesto, cards visuales con cover + avatar).

import React from "react";
import { useTopSellers } from "@/hooks/api/useTopSellers";
import type { TopSellerRow } from "@/types/api";
import { getBackendUrl } from "@/utils/backendUrl";
import RankingSellerCard from "./RankingSellerCard";
import RankingExplainerBox from "./RankingExplainerBox";

const RankingDirectoryPanel: React.FC = () => {
  const { data, isLoading } = useTopSellers(20);
  const sellers = data ?? [];

  return (
    <div className="kiosqui-ranking-panel">
      <RankingExplainerBox
        iconClass="fas fa-trophy"
        title="Vendedores destacados"
        description={
          <>
            Top 20 vendedores <strong>ordenados del mejor al peor</strong> según
            un score que mezcla popularidad (seguidores, vistas) con calidad
            (reseñas, calificación). Entra cualquier vendedor con al menos una
            publicación activa, incluso si todavía no recibió reseñas. La
            posición de cada uno es su número en el ranking.
          </>
        }
      />

      {isLoading && (
        <p style={{ opacity: 0.6 }}>Cargando vendedores destacados…</p>
      )}
      {!isLoading && sellers.length === 0 && (
        <p style={{ opacity: 0.6 }}>
          Aún no hay vendedores destacados.
        </p>
      )}
      <div className="row wow fadeInUp">
        {sellers.map((s: TopSellerRow, i: number) => (
          <RankingSellerCard
            key={s.id}
            rank={i + 1}
            name={`${s.firstname ?? ""} ${s.lastname ?? ""}`.trim() || "Vendedor"}
            handle={s.handle}
            avatarUrl={s.imagenu ? getBackendUrl(s.imagenu) : null}
            publications={s.totalpubs}
            followers={s.followers}
            rating={s.avgrating}
            reviews={s.numreviews}
            profileId={s.id}
          />
        ))}
      </div>
    </div>
  );
};

export default RankingDirectoryPanel;
