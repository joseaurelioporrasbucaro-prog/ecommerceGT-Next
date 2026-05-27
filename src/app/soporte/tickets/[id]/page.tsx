import TicketDetailMain from '@/components/support/TicketDetailMain';
import Wrapper from '@/layout/DefaultWrapper';
import React from 'react';

const TicketDetailPage = ({ params }: { params: { id: string } }) => (
    <Wrapper>
        <TicketDetailMain id={params.id} />
    </Wrapper>
);

export default TicketDetailPage;
