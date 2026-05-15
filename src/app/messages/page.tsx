import MessagesMain from '@/components/messages/MessagesMain';
import Wrapper from '@/layout/DefaultWrapper';
import React, { Suspense } from 'react';

const MessagesPage = () => (
  <Wrapper>
    {/* Suspense necesario porque MessagesMain usa useSearchParams() */}
    <Suspense fallback={null}>
      <MessagesMain />
    </Suspense>
  </Wrapper>
);

export default MessagesPage;
