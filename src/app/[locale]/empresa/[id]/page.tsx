import CompanyProfileMain from '@/components/company/CompanyProfileMain';
import Wrapper from '@/layout/DefaultWrapper';
import React from 'react';

interface CompanyProfilePageProps {
  params: { id: string };
}

const CompanyProfilePage = ({ params }: CompanyProfilePageProps) => {
  return (
    <Wrapper>
      <main>
        <CompanyProfileMain id={params.id} />
      </main>
    </Wrapper>
  );
};

export default CompanyProfilePage;
