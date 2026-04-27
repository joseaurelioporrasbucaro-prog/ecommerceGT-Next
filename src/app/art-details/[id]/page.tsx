import ArtDetailsMain from '@/components/art-details/ArtDetailsMain';
import Wrapper from '@/layout/DefaultWrapper';
import React from 'react';

const artDetailsDynamic = ({ params }: { params: { id: string } }) => {
    const id = params.id
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

export default artDetailsDynamic;