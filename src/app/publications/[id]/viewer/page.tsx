import PublicationViewerMain from '@/components/publications/PublicationViewerMain';
import Wrapper from '@/layout/DefaultWrapper';
import React from 'react';

const PublicationViewerPage = ({ params }: { params: { id: string } }) => {
  return (
    <Wrapper>
      <PublicationViewerMain id={params.id} />
    </Wrapper>
  );
};

export default PublicationViewerPage;
