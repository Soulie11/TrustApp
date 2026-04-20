import type { CompanyAnalysis } from "../../types";
import { Icon } from "../common/Icon";
import { Pipeline } from "./Pipeline";
import { SourceList } from "./SourceList";

export function SourcesPanel({ analysis }: { analysis: CompanyAnalysis }) {
  return (
    <section className="panel sources-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Stan danych</p>
          <h2>Źródła i pipeline</h2>
        </div>
        <Icon name="database" />
      </div>
      <SourceList sources={analysis.sources} />
      <Pipeline steps={analysis.pipeline} />
    </section>
  );
}
