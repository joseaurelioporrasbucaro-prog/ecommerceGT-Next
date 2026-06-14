import InviteMain from '@/components/company/InviteMain';
import Wrapper from '@/layout/DefaultWrapper';

// Handoff #11 §2 — invitación de EMPRESA/equipo namespaced en
// /invite/team/[token]. El referido personal Q50 vive en /invite (panel) y
// /invite/[code] (canje). Antes la empresa estaba en /invite/[token], que
// chocaba con el código de referido; se movió (el enlace es 100% frontend:
// notificación in-app + redirect interno, sin URLs en emails de backend).
interface TeamInvitePageProps {
  params: { token: string };
}

const TeamInvitePage = ({ params }: TeamInvitePageProps) => {
  return (
    <Wrapper>
      <main>
        <InviteMain token={params.token} />
      </main>
    </Wrapper>
  );
};

export default TeamInvitePage;
