import SurveyMain from '@/components/survey/SurveyMain';
import Wrapper from '@/layout/DefaultWrapper';

interface SurveyPageProps {
  params: { token: string };
}

const SurveyPage = ({ params }: SurveyPageProps) => {
  return (
    <Wrapper>
      <main>
        <SurveyMain token={params.token} />
      </main>
    </Wrapper>
  );
};

export default SurveyPage;
