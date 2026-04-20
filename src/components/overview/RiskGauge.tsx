import type { CSSProperties } from "react";
import type { ReputationScore } from "../../types";

export function RiskGauge({ score }: { score: ReputationScore }) {
  return (
    <div
      className={`risk-gauge risk-${score.level}`}
      style={{ "--score": `${score.value}%` } as CSSProperties}
      aria-label={`Scoring ${score.value} na 100`}
    >
      <div className="risk-gauge-body">
        <strong>{score.value}</strong>
        <span>/100</span>
      </div>
    </div>
  );
}
