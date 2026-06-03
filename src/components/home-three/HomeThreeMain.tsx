"use client";
import React from 'react';
import KiosquiHero from './KiosquiHero';
import FeaturedShowcase from './FeaturedShowcase';
import CategoriesShowcase from './CategoriesShowcase';
import TopSellersShowcase from './TopSellersShowcase';
import HowItWorks from './HowItWorks';
import HomeCTA from './HomeCTA';

/**
 * Fase 16 — Home oficial KIOSQUI.
 *
 * Reemplaza el contenido NFT-themed del template (HeroSectionThree +
 * ExploreArtsThree con "Discover Digital Artworks") por un flujo armado
 * con datos reales del marketplace de bienes raíces:
 *
 *   1. KiosquiHero        — titular + búsqueda + chips de categoría + trust badges
 *   2. FeaturedShowcase   — publicaciones pautadas (oculto si no hay)
 *   3. CategoriesShowcase — 3 grandes categorías (Casa / Apto / Terreno)
 *   4. TopSellersShowcase — top vendedores con rating + verificación
 *   5. HowItWorks         — 4 pasos del flujo del usuario
 *   6. HomeCTA            — banner final con CTA según sesión
 *
 * Mantenemos el archivo viejo HeroSectionThree.tsx + ExploreArts* en
 * disco por si en el futuro queremos volver a una variante del template
 * — son completamente independientes; al no estar referenciados acá
 * tampoco se incluyen en el bundle.
 *
 * Cada sección consume sus propios hooks y se renderiza independiente
 * (no hay un loading global). Si el backend falla en cualquiera, las
 * otras siguen funcionando.
 */
const HomeThreeMain: React.FC = () => {
  return (
    <>
      <KiosquiHero />
      <FeaturedShowcase />
      <CategoriesShowcase />
      <TopSellersShowcase />
      <HowItWorks />
      <HomeCTA />

      {/* Estilos globales compartidos por las secciones de la home —
          el header `.kh-section-head` se repite en varias y vale la pena
          centralizar acá. */}
      <style jsx global>{`
        .kh-section .kh-section-head {
          text-align: center;
          margin-bottom: 36px;
        }
        .kh-section .kh-section-head h2 {
          margin: 0 0 8px;
          font-size: clamp(24px, 3.4vw, 32px);
          font-weight: 800;
          color: var(--clr-common-heading);
        }
        .kh-section .kh-section-head p {
          margin: 0 auto;
          font-size: 15px;
          color: var(--clr-common-body-text);
          max-width: 580px;
          line-height: 1.5;
        }
      `}</style>
    </>
  );
};

export default HomeThreeMain;
