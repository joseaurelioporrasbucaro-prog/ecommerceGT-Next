import ReferralInviteMain from '@/components/pauta/ReferralInviteMain';
import Wrapper from '@/layout/DefaultWrapper';
import React from 'react';

// Handoff #10 §2 — /invite (referidos Q50). El invite de EMPRESA vive en
// /invite/[token]; esta es la pantalla de referidos para usuarios.
const InviteReferralPage = () => (
  <Wrapper>
    <ReferralInviteMain />
  </Wrapper>
);

export default InviteReferralPage;
