"use client";

import React from 'react';
import ThemeChanger from '../home/ThemeChanger';
import Breadcrumbs from '@/utils/Breadcrumbs';
import { ApiError } from '@/utils/Api';
import { useSellerRanking } from '@/hooks/api/useSellerRanking';
import type { SellerRankingItem } from '@/types/api';
import RankingTableTitle from './RankingTableTitle';
import SingleArtRanking from './SingleArtRanking';

function getErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Error inesperado';
}

const RankingSkeleton = () => (
  <>
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="rank-list-row seller-ranking-row seller-ranking-skeleton">
        <div className="rank-list-cell rank-list-cell-sl">
          <span />
        </div>
        <div className="rank-list-cell rank-list-cell-artwotrks">
          <span />
        </div>
        <div className="rank-list-cell rank-list-cell-market">
          <span />
        </div>
        <div className="rank-list-cell rank-list-cell-volume">
          <span />
        </div>
        <div className="rank-list-cell rank-list-cell-hours">
          <span />
        </div>
        <div className="rank-list-cell rank-list-cell-days">
          <span />
        </div>
        <div className="rank-list-cell rank-list-cell-assets">
          <span />
        </div>
      </div>
    ))}
  </>
);

const RankingMain = () => {
  const rankingQuery = useSellerRanking();
  const sellers = rankingQuery.data?.sellers ?? [];

  return (
    <>
      <ThemeChanger />
      <Breadcrumbs breadcrumbTitle="Ranking de vendedores" breadcrumbSubTitle="Ranking de vendedores" />
      <div className="art-ranking-area pt-130 pb-90">
        <div className="container">
          <div className="row wow fadeInUp">
            <div className="col-lg-12">
              <div className="section-title1 mb-35">
                <h2 className="section-main-title1">Vendedores mejor calificados</h2>
                <p className="seller-ranking-intro">
                  Directorio público ordenado por promedio de reseñas verificadas.
                </p>
              </div>
            </div>
          </div>

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

                {!rankingQuery.isLoading && !rankingQuery.error && sellers.length === 0 && (
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
        </div>
      </div>

      <style jsx>{`
        .seller-ranking-intro {
          max-width: 680px;
          margin: 10px 0 0;
          opacity: 0.72;
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
        :global(.rank-list-cell) {
          min-width: 0;
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
          background: linear-gradient(
            90deg,
            rgba(128, 128, 128, 0.12),
            rgba(128, 128, 128, 0.24),
            rgba(128, 128, 128, 0.12)
          );
          background-size: 220% 100%;
          animation: seller-ranking-pulse 1.3s ease-in-out infinite;
        }
        :global(.seller-ranking-skeleton .rank-list-cell-artwotrks span) {
          width: 50px;
          height: 50px;
          border-radius: 50%;
        }
        @keyframes seller-ranking-pulse {
          from {
            background-position: 100% 0;
          }
          to {
            background-position: -100% 0;
          }
        }
        @media (max-width: 991px) {
          :global(.seller-ranking-row) {
            grid-template-columns: 48px 70px minmax(160px, 1fr) minmax(130px, 1fr) minmax(110px, 0.8fr) minmax(100px, 0.8fr) minmax(115px, 0.8fr);
          }
        }
      `}</style>
    </>
  );
};

export default RankingMain;
