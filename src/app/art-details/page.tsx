import ArtDetailsMain from '@/components/art-details/ArtDetailsMain';
import Wrapper from '@/layout/DefaultWrapper';
import React from 'react';

const ArtDetailsPage = () => {
    const id =  "49"
    return (
        <>
            <Wrapper>
                <main>
                    <ArtDetailsMain id={id}/>
                </main>
            </Wrapper>
        </>
    );
};

export default ArtDetailsPage;