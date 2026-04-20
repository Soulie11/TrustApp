import { useRef } from "react";
import "./App.css";
import { AnalysisCommand } from "./components/analysis/AnalysisCommand";
import { EvidenceSection } from "./components/evidence/EvidenceSection";
import { InsightsPanel } from "./components/insights/InsightsPanel";
import { AppHeader } from "./components/layout/AppHeader";
import { NetworkSection } from "./components/network/NetworkSection";
import { CompanyPanel } from "./components/overview/CompanyPanel";
import { RiskPanel } from "./components/overview/RiskPanel";
import { SourcesPanel } from "./components/overview/SourcesPanel";
import { useContainedWheelScroll } from "./hooks/useContainedWheelScroll";
import { useReputationAnalysis } from "./hooks/useReputationAnalysis";

function App() {
  const {
    analysis,
    apiState,
    exportJson,
    handleAttachments,
    handleSubmit,
    highestKeyword,
    isLoading,
    notice,
    request,
    updateOption,
    updateRequest,
  } = useReputationAnalysis();
  const insightPanelRef = useRef<HTMLElement | null>(null);

  useContainedWheelScroll(insightPanelRef, analysis.company.name);

  return (
    <main className="app-shell">
      <AppHeader />

      <AnalysisCommand
        apiState={apiState}
        isLoading={isLoading}
        notice={notice}
        onAttachmentsChange={handleAttachments}
        onOptionChange={updateOption}
        onRequestChange={updateRequest}
        onSubmit={handleSubmit}
        request={request}
      />

      <section className="overview-grid" aria-label="Wynik analizy">
        <CompanyPanel analysis={analysis} />
        <RiskPanel analysis={analysis} highestKeyword={highestKeyword} />
        <SourcesPanel analysis={analysis} />
      </section>

      <section className="insight-grid">
        <InsightsPanel
          analysis={analysis}
          onExportJson={exportJson}
          scrollRef={insightPanelRef}
        />
        <NetworkSection analysis={analysis} />
      </section>

      <EvidenceSection analysis={analysis} />
    </main>
  );
}

export default App;
