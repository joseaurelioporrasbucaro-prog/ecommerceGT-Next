"use client";

// Fase 24 — Tab "Directorio". Reusa la lógica de listado de CreatorsMain
// (getTopSellers con score compuesto, cards visuales con cover + avatar).

import React from "react";
import { useTopSellers } from "@/hooks/api/useTopSellers";
import type { TopSellerRow } from "@/types/api";
import defaultCover from "../../../public/assets/img/profile/profile-cover/profile-cover-big-1.jpg";
import CreatorSingle from "@/components/creators/CreatorSingle";
import RankingExplainerBox from "./RankingExplainerBox";

const RankingDirectoryPanel: React.FC = () => {
  const { data, isLoading } = useTopSellers(20);
  const sellers = data ?? [];

  return (
    <div className="kiosqui-ranking-panel">
      <RankingExplainerBox
        iconClass="fas fa-users"
        title="Directorio de vendedores"
        description={
          <>
            Lista amplia ordenada por un{" "}
            <strong>score compuesto</strong> que mezcla popularidad (seguidores,
            vistas) con calidad (reseñas, calificación). Entra cualquier vendedor
            que tenga al menos una publicación activa, incluso si todavía no
            recibió reseñas. Útil para descubrir vendedores nuevos y consolidados
            al mismo tiempo.
          </>
        }
        formula={
          <>seguidores × 2 + reseñas × 5 + rating × 10 + vistas × 0.05</>
        }
      />

      {isLoading && (
        <p style={{ opacity: 0.6 }}>Cargando directorio…</p>
      )}
      {!isLoading && sellers.length === 0 && (
        <p style={{ opacity: 0.6 }}>
          Aún no hay vendedores en el directorio.
        </p>
      )}
      <div className="row wow fadeInUp">
        {sellers.map((s: TopSellerRow, i: number) => (
          <CreatorSingle
            key={s.id}
            creator={s}
            rank={i + 1}
            defaultCover={defaultCover}
          />
        ))}
      </div>
    </div>
  );
};

export default RankingDirectoryPanel;
