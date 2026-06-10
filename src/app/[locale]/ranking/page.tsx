import RankingUnifiedMain from "@/components/ranking/RankingUnifiedMain";
import Wrapper from "@/layout/DefaultWrapper";
import React, { Suspense } from "react";

// Fase 24 — Ranking unificado en una sola URL canónica.
// Las antiguas /creators y /art-ranking redirigen acá (ver sus page.tsx).
const RankingPage = () => {
  return (
    <Wrapper>
      <main>
        {/* RankingUnifiedMain usa useSearchParams (?tab=) y por eso Next 13.4
            exige un Suspense boundary alrededor en server components. */}
        <Suspense fallback={null}>
          <RankingUnifiedMain />
        </Suspense>
      </main>
    </Wrapper>
  );
};

export default RankingPage;
