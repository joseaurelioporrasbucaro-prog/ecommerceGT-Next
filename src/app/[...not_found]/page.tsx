import ErrorMain from '@/components/error-page/ErrorMain';
import Wrapper from '@/layout/DefaultWrapper';
import React from 'react';

const GlobalErrorPage = () => {
    return (
        <>
            <Wrapper>
                <main>
                    <ErrorMain/>
                </main>
            </Wrapper>
        </>
    );
};

export default GlobalErrorPage;