import EditPublicationMain from '@/components/Upload/EditPublicationMain';
import Wrapper from '@/layout/DefaultWrapper';
import { notFound } from 'next/navigation';
import React from 'react';

interface EditPublicationPageProps {
  params: { id: string };
}

const EditPublicationPage = ({ params }: EditPublicationPageProps) => {
  const numericId = Number(params.id);
  if (!Number.isFinite(numericId) || numericId <= 0) {
    notFound();
  }

  return (
    <Wrapper>
      <EditPublicationMain publicationId={numericId} />
    </Wrapper>
  );
};

export default EditPublicationPage;
