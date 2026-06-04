import InviteMain from '@/components/company/InviteMain';
import Wrapper from '@/layout/DefaultWrapper';

interface InvitePageProps {
  params: { token: string };
}

const InvitePage = ({ params }: InvitePageProps) => {
  return (
    <Wrapper>
      <main>
        <InviteMain token={params.token} />
      </main>
    </Wrapper>
  );
};

export default InvitePage;
