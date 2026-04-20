import type { CompanyAnalysis, RiskKeyword } from "../../types";
import { riskLabel } from "../../utils/labels";
import { Metric } from "../common/Metric";
import { RiskGauge } from "./RiskGauge";
import { TrendChart } from "./TrendChart";

type RiskPanelProps = {
  analysis: CompanyAnalysis;
  highestKeyword?: RiskKeyword;
};

export function RiskPanel({ analysis, highestKeyword }: RiskPanelProps) {
  return (
    <section className="panel risk-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Scoring reputacyjny</p>
          <h2>{riskLabel(analysis.score.level)}</h2>
        </div>
        <span className={`risk-badge risk-${analysis.score.level}`}>
          {analysis.score.value}/100
        </span>
      </div>

      <div className="score-layout">
        <RiskGauge score={analysis.score} />
        <div className="score-copy">
          <p>{analysis.summary}</p>
          <div className="metric-row">
            <Metric
              label="Zmiana"
              value={`${analysis.score.delta > 0 ? "+" : ""}${
                analysis.score.delta
              } pkt`}
            />
            <Metric
              label="Pewność"
              value={`${Math.round(analysis.score.confidence * 100)}%`}
            />
            <Metric
              label="Top sygnał"
              value={highestKeyword?.label ?? "brak"}
            />
          </div>
        </div>
      </div>

      <TrendChart points={analysis.history} />
    </section>
  );
}
