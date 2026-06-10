"use client";

// Fase 24 — Tab "Mejor calificados". Reusa la lógica de RankingMain
// (getSellerRanking estricto por AVG rating, tabla con columnas).

import React from "react";
import { ApiError } from "@/utils/Api";
import { useSellerRanking } from "@/hooks/api/useSellerRanking";
import type { SellerRankingItem } from "@/types/api";
import RankingTableTitle from "@/components/art-ranking/RankingTableTitle";
import SingleArtRanking from "@/components/art-ranking/SingleArtRanking";
import RankingExplainerBox from "./RankingExplainerBox";

function getErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "Error inesperado";
}

const RankingSkeleton = () => (
  <>
    {Array.from({ length: 6 }).map((_, index) => (
      <div
        key={index}
        className="rank-list-row seller-ranking-row seller-ranking-skeleton"
      >
        <div className="rank-list-cell rank-list-cell-sl"><span /></div>
        <div className="rank-list-cell rank-list-cell-artwotrks"><span /></div>
        <div className="rank-list-cell rank-list-cell-market"><span /></div>
        <div className="rank-list-cell rank-list-cell-volume"><span /></div>
        <div className="rank-list-cell rank-list-cell-hours"><span /></div>
        <div className="rank-list-cell rank-list-cell-days"><span /></div>
        <div className="rank-list-cell rank-list-cell-assets"><span /></div>
      </div>
    ))}
  </>
);

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

      <div className="rank-list-container wow fadeInUp">
        <div className="rank-list-wrapper mb-30">
          <RankingTableTitle />
          <div className="rank-list-items">
            {rankingQuery.isLoading && <RankingSkeleton />}
            {rankingQuery.error && (
              <div className="alert alert-danger m-0">
                {getErrorMessage(rankingQuery.error)}
              </div>
            )}
            {!rankingQuery.isLoading &&
              !rankingQuery.error &&
              sellers.length === 0 && (
                <div className="alert alert-warning m-0">
                  Aún no hay vendedores calificados.
                </div>
              )}
            {!rankingQuery.isLoading &&
              !rankingQuery.error &&
              sellers.map((seller: SellerRankingItem, index: number) => (
                <SingleArtRanking
                  key={seller.cusId}
                  seller={seller}
                  position={index + 1}
                />
              ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Mismo override de la Fase 22 — el SCSS del template inyecta un
           counter (decimal-leading-zero) en :before que se concatenaba con
           {position} ("01" + "1" = "011"). Acá montamos el panel dentro de
           una ruta nueva /ranking que no heredó el style jsx del componente
           original, así que repetimos el override. */
        :global(.seller-ranking-row .rank-list-cell-sl span::before) {
          content: none !important;
        }
        :global(.seller-ranking-row .rank-list-cell-sl span) {
          font-weight: 700;
          font-size: 18px;
        }
        :global(.seller-ranking-row) {
          display: grid;
          grid-template-columns: 64px 90px minmax(180px, 1.5fr) minmax(150px, 1fr) minmax(120px, 0.8fr) minmax(110px, 0.8fr) minmax(120px, 0.8fr);
          align-items: center;
          gap: 12px;
          min-width: 860px;
        }
        :global(.rank-list-wrapper) {
          overflow-x: auto;
        }
        :global(.seller-ranking-name) {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }
        :global(.seller-ranking-name a) {
          font-weight: 700;
        }
        :global(.seller-ranking-name span) {
          font-size: 13px;
          opacity: 0.65;
        }
        :global(.seller-ranking-rating) {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        :global(.seller-ranking-stars) {
          color: #fdcb6e;
          letter-spacing: 1px;
          white-space: nowrap;
        }
        :global(.seller-ranking-skeleton span) {
          display: block;
          width: 100%;
          height: 16px;
          border-radius: 8px;
          background: linear-gradient(90deg, rgba(128,128,128,0.12), rgba(128,128,128,0.24), rgba(128,128,128,0.12));
          background-size: 220% 100%;
          animation: seller-ranking-pulse 1.3s ease-in-out infinite;
        }
        :global(.seller-ranking-skeleton .rank-list-cell-artwotrks span) {
          width: 50px;
          height: 50px;
          border-radius: 50%;
        }
        @keyframes seller-ranking-pulse {
          from { background-position: 100% 0; }
          to { background-position: -100% 0; }
        }
        @media (max-width: 991px) {
          :global(.seller-ranking-row) {
            grid-template-columns: 48px 70px minmax(160px, 1fr) minmax(130px, 1fr) minmax(110px, 0.8fr) minmax(100px, 0.8fr) minmax(115px, 0.8fr);
          }
        }
      `}</style>
    </div>
  );
};

export default RankingRatedPanel;
