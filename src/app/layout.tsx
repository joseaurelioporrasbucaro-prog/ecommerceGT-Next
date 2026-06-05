import './globals.css';
import '../style/index.scss';
// Kiosqui design system (Fase 17 — paleta de marca). Va DESPUÉS de index.scss
// para que el bridge gane en cascada sobre las --clr-* del scaffold.
// Revert: borrar estas 3 líneas + el dir src/style/kiosqui/.
import '../style/kiosqui/colors_and_type.css';
import '../style/kiosqui/components.css';
import '../style/kiosqui/bridge.css';
import 'react-toastify/dist/ReactToastify.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
