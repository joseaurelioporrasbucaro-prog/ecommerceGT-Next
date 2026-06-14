import { redirect } from 'next/navigation';

// Handoff #11 §2 — landing del enlace de referido personal /invite/:code.
// El backend de referidos aún no existe (ver docs/phases/codex-prompt-referrals-q50.md):
// por ahora reenvía al registro con el código en ?ref= para mostrar el banner
// "te invitaron". Cuando exista el backend, acá se validará el código y se
// creará el vínculo referrer→referred antes de mandar al registro.
interface InviteRedeemPageProps {
  params: { locale: string; code: string };
}

const InviteRedeemPage = ({ params }: InviteRedeemPageProps) => {
  redirect(`/${params.locale}/register?ref=${encodeURIComponent(params.code)}`);
};

export default InviteRedeemPage;
