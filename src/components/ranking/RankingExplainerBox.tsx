"use client";

// Fase 24 — Bloque explicativo reusable arriba de cada tab del ranking.
// Cada tab tiene su propio texto: el directorio explica el score compuesto;
// los mejor calificados explican el AVG rating estricto.

import React from "react";

interface Props {
  iconClass: string;
  title: string;
  formula?: React.ReactNode;
  description: React.ReactNode;
}

const RankingExplainerBox: React.FC<Props> = ({
  iconClass,
  title,
  formula,
  description,
}) => {
  return (
    <div className="kiosqui-ranking-explainer mb-35">
      <div className="kiosqui-ranking-explainer-icon">
        <i className={iconClass} aria-hidden="true" />
      </div>
      <div className="kiosqui-ranking-explainer-body">
        <h4 className="kiosqui-ranking-explainer-title">{title}</h4>
        <p className="kiosqui-ranking-explainer-desc">{description}</p>
        {formula && (
          <code className="kiosqui-ranking-explainer-formula">{formula}</code>
        )}
      </div>

      <style jsx>{`
        .kiosqui-ranking-explainer {
          align-items: flex-start;
          background: rgba(128, 128, 128, 0.08);
          border-left: 4px solid var(--clr-theme-1, #2785ff);
          border-radius: 8px;
          display: flex;
          gap: 16px;
          padding: 18px 20px;
        }
        .kiosqui-ranking-explainer-icon {
          align-items: center;
          background: var(--clr-theme-1, #2785ff);
          border-radius: 8px;
          color: #fff;
          display: inline-flex;
          flex-shrink: 0;
          font-size: 20px;
          height: 40px;
          justify-content: center;
          width: 40px;
        }
        .kiosqui-ranking-explainer-title {
          font-size: 17px;
          font-weight: 700;
          margin: 0 0 6px;
        }
        .kiosqui-ranking-explainer-desc {
          font-size: 14px;
          line-height: 1.6;
          margin: 0;
          opacity: 0.86;
        }
        .kiosqui-ranking-explainer-formula {
          background: rgba(0, 0, 0, 0.18);
          border-radius: 6px;
          display: inline-block;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 12.5px;
          margin-top: 10px;
          padding: 8px 12px;
        }
        @media (max-width: 575px) {
          .kiosqui-ranking-explainer {
            flex-direction: column;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default RankingExplainerBox;
