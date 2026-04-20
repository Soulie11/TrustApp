import type { RefObject } from "react";
import type { CompanyAnalysis } from "../../types";
import { Icon } from "../common/Icon";
import { FindingList } from "./FindingList";
import { KeywordBar } from "./KeywordBar";

type InsightsPanelProps = {
  analysis: CompanyAnalysis;
  onExportJson: () => void;
  scrollRef: RefObject<HTMLElement | null>;
};

export function InsightsPanel({
  analysis,
  onExportJson,
  scrollRef,
}: InsightsPanelProps) {
  return (
    <section className="insight-section" ref={scrollRef}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Czynniki ryzyka</p>
          <h2>Słowa kluczowe i decyzje</h2>
        </div>
        <div className="export-actions">
          <button className="ghost-action" type="button" onClick={onExportJson}>
            <Icon name="download" />
            JSON
          </button>
          <button
            className="ghost-action"
            type="button"
            onClick={() => window.print()}
          >
            <Icon name="file" />
            PDF
          </button>
          <a
            className="ghost-action"
            href={`mailto:?subject=${encodeURIComponent(
              `CheckTrust: ${analysis.company.name}`
            )}&body=${encodeURIComponent(analysis.summary)}`}
          >
            <Icon name="mail" />
            Mail
          </a>
        </div>
      </div>

      <div className="keyword-grid">
        {analysis.riskKeywords.map((keyword) => (
          <KeywordBar key={keyword.label} keyword={keyword} />
        ))}
      </div>

      <div className="finding-grid">
        <FindingList title="Wnioski" items={analysis.keyFindings} />
        <FindingList title="Rekomendacje" items={analysis.recommendations} />
      </div>
    </section>
  );
}
