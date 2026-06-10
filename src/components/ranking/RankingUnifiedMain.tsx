"use client";

// ============================================================================
// Fase 24 — Ranking unificado (Aurelio 2026-06-05).
//
// Antes existían dos páginas separadas, /creators y /art-ranking, con dos
// algoritmos de ranking distintos. Los usuarios entraban a una sin saber
// qué hacía la otra. Ahora una sola pantalla con tabs:
//
//   Directorio       → getTopSellers (score compuesto, todos los vendedores)
//   Mejor calificados → getSellerRanking (AVG rating, solo con reseñas)
//
// La tab activa se controla con query param ?tab=directorio|calificados.
// Cambiar de tab actualiza el URL sin reload (history.replaceState) para
// que el link sea compartible y SEO friendly.
//
// Las rutas viejas /creators y /art-ranking siguen accesibles pero redirigen
// a /ranking?tab=... (ver src/app/[locale]/creators/page.tsx y
// art-ranking/page.tsx en este mismo commit) para no romper enlaces ya
// indexados por Google.
// ============================================================================

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "@/i18n/navigation";
import ThemeChanger from "@/components/home/ThemeChanger";
import Breadcrumbs from "@/utils/Breadcrumbs";
import RankingDirectoryPanel from "./RankingDirectoryPanel";
import RankingRatedPanel from "./RankingRatedPanel";

type TabKey = "destacados" | "calificados";

const DEFAULT_TAB: TabKey = "destacados";
const VALID_TABS: ReadonlySet<TabKey> = new Set<TabKey>(["destacados", "calificados"]);

// Compat con la query-string anterior: ?tab=directorio (Fase 24 initial) sigue
// siendo aceptada y mapea a destacados. Evita que un link viejo guardado en
// algún lado abra la tab errónea.
function parseTab(value: string | null): TabKey {
  if (value === "directorio") return "destacados";
  if (value && VALID_TABS.has(value as TabKey)) return value as TabKey;
  return DEFAULT_TAB;
}

const RankingUnifiedMain: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Tab inicial desde el query param. Sin parámetro → "directorio" por default.
  const initialTab = parseTab(searchParams?.get("tab") ?? null);
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  // Si el usuario llega con un ?tab= que no parseó (typo), corregimos el URL
  // silenciosamente. Evita que `/ranking?tab=foo` quede en la barra.
  useEffect(() => {
    const raw = searchParams?.get("tab");
    if (raw && raw !== initialTab) {
      router.replace(
        { pathname, query: { tab: initialTab } } as { pathname: typeof pathname; query: { tab: string } },
        { scroll: false },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectTab = (next: TabKey) => {
    if (next === activeTab) return;
    setActiveTab(next);
    // replace (no push) para que el back del navegador NO vaya entre tabs;
    // el back debe volver a la página anterior, no al estado de tab previo.
    router.replace(
      { pathname, query: { tab: next } } as { pathname: typeof pathname; query: { tab: string } },
      { scroll: false },
    );
  };

  return (
    <>
      <ThemeChanger />
      <Breadcrumbs
        breadcrumbTitle="Ranking de vendedores"
        breadcrumbSubTitle="Vendedores destacados + ranking por calificación"
      />

      <section className="kiosqui-ranking-section pt-90 pb-100">
        <div className="container">
          {/* Tabs */}
          <div className="kiosqui-ranking-tabs mb-30" role="tablist" aria-label="Tipo de ranking">
            <button
              role="tab"
              type="button"
              aria-selected={activeTab === "destacados"}
              className={`kiosqui-tab ${activeTab === "destacados" ? "is-active" : ""}`}
              onClick={() => handleSelectTab("destacados")}
            >
              <i className="fas fa-trophy" aria-hidden="true" />
              <span>Vendedores destacados</span>
            </button>
            <button
              role="tab"
              type="button"
              aria-selected={activeTab === "calificados"}
              className={`kiosqui-tab ${activeTab === "calificados" ? "is-active" : ""}`}
              onClick={() => handleSelectTab("calificados")}
            >
              <i className="fas fa-star" aria-hidden="true" />
              <span>Mejor calificados</span>
            </button>
          </div>

          {/* Contenido de la tab activa */}
          <div className="kiosqui-ranking-tabpanels">
            {activeTab === "destacados" && <RankingDirectoryPanel />}
            {activeTab === "calificados" && <RankingRatedPanel />}
          </div>
        </div>
      </section>

      <style jsx>{`
        .kiosqui-ranking-tabs {
          display: inline-flex;
          gap: 0;
          padding: 6px;
          background: rgba(128, 128, 128, 0.1);
          border-radius: 12px;
        }
        :global(.kiosqui-tab) {
          align-items: center;
          background: transparent;
          border: 0;
          border-radius: 8px;
          color: inherit;
          cursor: pointer;
          display: inline-flex;
          font-size: 15px;
          font-weight: 700;
          gap: 8px;
          padding: 10px 18px;
          transition: background 0.18s ease, color 0.18s ease;
        }
        :global(.kiosqui-tab:hover) {
          background: rgba(255, 255, 255, 0.08);
        }
        :global(.kiosqui-tab.is-active) {
          background: var(--clr-theme-1, #2785ff);
          color: #fff;
        }
        :global(.kiosqui-tab.is-active:hover) {
          background: var(--clr-theme-1, #2785ff);
        }
        @media (max-width: 575px) {
          .kiosqui-ranking-tabs {
            width: 100%;
          }
          :global(.kiosqui-ranking-tabs .kiosqui-tab) {
            flex: 1;
            justify-content: center;
            padding: 10px 12px;
          }
        }
      `}</style>
    </>
  );
};

export default RankingUnifiedMain;
