import type { CompanyAnalysis } from "../../types";
import { NetworkGraph } from "./NetworkGraph";

export function NetworkSection({ analysis }: { analysis: CompanyAnalysis }) {
  return (
    <section className="network-panel" id="network">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Powiązania</p>
          <h2>Graf osób, źródeł i sygnałów</h2>
        </div>
        <span className="network-count">
          {analysis.graph.nodes.length} węzłów / {analysis.graph.edges.length} relacji
        </span>
      </div>

      <NetworkGraph graph={analysis.graph} />
    </section>
  );
}
