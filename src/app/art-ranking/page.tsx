import RankingMain from '@/components/art-ranking/RankingMain';
import Wrapper from '@/layout/DefaultWrapper';
import React from 'react';

const ArtRankingPage = () => {
    return (
        <>
            <Wrapper>
                <main>
                    <RankingMain/>
                </main>
            </Wrapper>
        </>
    );
};

export default ArtRankingPage;