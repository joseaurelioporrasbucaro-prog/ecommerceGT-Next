"use client";

// Fase 24 — Tab "Mejor calificados". Reusa la MISMA card de ranking (Opción B,
// handoff #18) que "Vendedores destacados"; solo cambia el orden de los datos
// (estricto por AVG rating) que envía /sellers/ranking.

import React from "react";
import { ApiError } from "@/utils/Api";
import { useSellerRanking } from "@/hooks/api/useSellerRanking";
import type { SellerRankingItem } from "@/types/api";
import { getBackendUrl } from "@/utils/backendUrl";
import RankingSellerCard from "./RankingSellerCard";
import RankingExplainerBox from "./RankingExplainerBox";

function getErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "Error inesperado";
}

// Fase 24 — top 20 para que ambas tabs muestren la misma cantidad. El backend
// /sellers/ranking devuelve hasta 50, sliceamos client-side para no romper el
// shape compartido entre /sellers/ranking público y otros consumidores del hook.
const RATED_TOP_LIMIT = 20;

const RankingRatedPanel: React.FC = () => {
  const rankingQuery = useSellerRanking();
  const sellers = (rankingQuery.data?.sellers ?? []).slice(0, RATED_TOP_LIMIT);

  return (
    <div className="kiosqui-ranking-panel">
      <RankingExplainerBox
        iconClass="fas fa-star"
        title="Mejor calificados"
        description={
          <>
            Top 20 vendedores <strong>ordenados estrictamente por
            calificación</strong>: solo aparecen vendedores con al menos una
            reseña completada y se ordenan por promedio de estrellas. Un
            vendedor con muchos seguidores pero sin reseñas no aparece acá —
            para verlo entrá a "Vendedores destacados". Útil cuando querés
            decidir basándote 100% en feedback verificado de compradores
            anteriores.
          </>
        }
      />

      {rankingQuery.isLoading && (
        <p style={{ opacity: 0.6 }}>Cargando vendedores calificados…</p>
      )}
      {rankingQuery.error && (
        <div className="alert alert-danger m-0">
          {getErrorMessage(rankingQuery.error)}
        </div>
      )}
      {!rankingQuery.isLoading &&
        !rankingQuery.error &&
        sellers.length === 0 && (
          <p style={{ opacity: 0.6 }}>Aún no hay vendedores calificados.</p>
        )}

      <div className="row wow fadeInUp">
        {!rankingQuery.isLoading &&
          !rankingQuery.error &&
          sellers.map((seller: SellerRankingItem, index: number) => (
            <RankingSellerCard
              key={seller.cusId}
              rank={index + 1}
              name={`${seller.firstName ?? ""} ${seller.lastName ?? ""}`.trim() || "Vendedor"}
              handle={seller.handle}
              avatarUrl={seller.avatar ? getBackendUrl(seller.avatar) : null}
              publications={seller.totalpublis}
              followers={seller.followers}
              rating={seller.averageRating}
              reviews={seller.totalReviews}
              profileId={seller.cusId}
            />
          ))}
      </div>
    </div>
  );
};

export default RankingRatedPanel;
