import CreatorProfileMain from '@/components/Creator-Profile/CreatorProfileMain';
import Wrapper from '@/layout/DefaultWrapper';
import React from 'react';

const DynamciCreatorProfilePage = ({ params }: { params: { id: string } }) => {
    const id =  params.id
    return (
        <>
             <Wrapper>
                <main>
                    <CreatorProfileMain id = {id}/>
                </main>
            </Wrapper>
        </>
    );
};

export default DynamciCreatorProfilePage;