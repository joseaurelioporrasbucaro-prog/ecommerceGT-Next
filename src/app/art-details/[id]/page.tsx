import { redirect } from 'next/navigation';

const artDetailsDynamic = ({ params }: { params: { id: string } }) => {
    redirect(`/publications/${params.id}`);
};

export default artDetailsDynamic;
