//@refresh

// Fase 16 polish (2026-06-02): la home oficial es ahora HomeThreeMain
// (la versión KIOSQUI con secciones dinámicas). El HomeMain legacy
// del template sigue disponible bajo /home-two si querés QA o
// comparativa visual. La ruta /home-three también se mantiene.
import HomeThreeMain from "@/components/home-three/HomeThreeMain";
import Wrapper from "@/layout/DefaultWrapper";

export const metadata = {
  title: 'KIOSQUI — Marketplace de bienes raíces en Guatemala',
  description:
    'Casas, apartamentos y terrenos publicados directamente por propietarios verificados. Sin intermediarios escondidos.',
};

const Home = () => {
  return (
    <>
      <Wrapper>
        <main>
          <HomeThreeMain />
        </main>
      </Wrapper>
    </>
  );
};

export default Home;
