import React from 'react';

const RankingTableTitle = () => {
    return (
        <div className="rank-list-row-heading">
            <div className="rank-list-row">
                <div className="rank-list-cell rank-list-cell-sl">SL</div>
                <div className="rank-list-cell rank-list-cell-artwotrks">Artwotrks</div>
                <div className="rank-list-cell rank-list-cell-market">Market</div>
                <div className="rank-list-cell rank-list-cell-volume">Volume</div>
                <div className="rank-list-cell rank-list-cell-hours">24 Hrs</div>
                <div className="rank-list-cell rank-list-cell-days">7 Day</div>
                <div className="rank-list-cell rank-list-cell-bids">Bids</div>
                <div className="rank-list-cell rank-list-cell-price">Grand Price</div>
                <div className="rank-list-cell rank-list-cell-owner">Owner</div>
                <div className="rank-list-cell rank-list-cell-assets">Assets</div>
            </div>
        </div>
    );
};

export default RankingTableTitle;