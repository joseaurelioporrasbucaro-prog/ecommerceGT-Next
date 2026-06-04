
import ActivityMain from '@/components/activity/ActivityMain';
import Wrapper from '@/layout/DefaultWrapper';
import React from 'react';

const ActivityPage = () => {
    return (
        <>
            <Wrapper>
                <main>
                   <ActivityMain/>
                </main>
            </Wrapper>
        </>
    );
};

export default ActivityPage;