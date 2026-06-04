import SignUpMain from '@/components/register/SignUpMain';
import Wrapper from '@/layout/DefaultWrapper';
import React from 'react';

const RegisterPage = () => {
    return (
        <>
            <Wrapper>
            <main>
               <SignUpMain/>
            </main>
        </Wrapper> 
        </>
    );
};

export default RegisterPage;