import PublicationDetailsMain from '@/components/publications/PublicationDetailsMain';
import Wrapper from '@/layout/DefaultWrapper';
import React from 'react';

const PublicationDetailsPage = ({ params }: { params: { id: string } }) => {
  return (
    <Wrapper>
      <main>
        <PublicationDetailsMain id={params.id} />
      </main>
    </Wrapper>
  );
};

export default PublicationDetailsPage;
