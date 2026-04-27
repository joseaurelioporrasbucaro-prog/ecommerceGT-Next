import CreatorProfileMain from '@/components/Creator-Profile/CreatorProfileMain';
import Wrapper from '@/layout/DefaultWrapper';
import React from 'react';

const CreatorProfilePage = () => {
    return (
        <>
            <Wrapper>
                <main>
                    <CreatorProfileMain id={"1"}/>
                </main>
            </Wrapper>
        </>
    );
};

export default CreatorProfilePage;