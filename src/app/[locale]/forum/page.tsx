import ForumMain from '@/components/forum/ForumMain';
import Wrapper from '@/layout/DefaultWrapper';
import React from 'react';

const ForumPage = () => {
    return (
        <>
            <Wrapper>
                <main>
                    <ForumMain/>
                </main>
            </Wrapper>
        </>
    );
};

export default ForumPage;