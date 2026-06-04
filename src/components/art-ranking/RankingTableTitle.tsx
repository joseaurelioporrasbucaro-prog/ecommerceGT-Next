import React from 'react';

const RankingTableTitle = () => (
  <div className="rank-list-row-heading">
    <div className="rank-list-row seller-ranking-row">
      <div className="rank-list-cell rank-list-cell-sl">#</div>
      <div className="rank-list-cell rank-list-cell-artwotrks">Vendedor</div>
      <div className="rank-list-cell rank-list-cell-market">Nombre</div>
      <div className="rank-list-cell rank-list-cell-volume">Calificación</div>
      <div className="rank-list-cell rank-list-cell-hours">Reseñas</div>
      <div className="rank-list-cell rank-list-cell-days">Seguidores</div>
      <div className="rank-list-cell rank-list-cell-assets">Publicaciones</div>
    </div>
  </div>
);

export default RankingTableTitle;
