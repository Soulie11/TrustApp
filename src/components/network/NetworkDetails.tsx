import type { RefObject } from "react";
import type { GraphEdge, GraphNode } from "../../types";
import { graphNodeTypeLabel, riskLabel } from "../../utils/labels";
import { Metric } from "../common/Metric";
import { MiniNodeIcon } from "./GraphNodeGlyph";

type NetworkDetailsProps = {
  edges: GraphEdge[];
  node: GraphNode;
  nodeById: Map<string, GraphNode>;
  scrollRef: RefObject<HTMLElement | null>;
};

export function NetworkDetails({
  edges,
  node,
  nodeById,
  scrollRef,
}: NetworkDetailsProps) {
  return (
    <aside className="network-details" ref={scrollRef}>
      <div className="selected-node-heading">
        <MiniNodeIcon type={node.type} />
        <div>
          <p className="micro-label">{graphNodeTypeLabel(node.type)}</p>
          <h3>{node.label}</h3>
        </div>
      </div>

      <p className="selected-node-description">
        {node.description ??
          "Węzeł z odpowiedzi backendu. Szczegóły pojawią się po dodaniu pól description, score albo meta."}
      </p>

      <div className="network-detail-metrics">
        <Metric label="Ryzyko" value={riskLabel(node.risk ?? "low")} />
        <Metric
          label="Score"
          value={node.score !== undefined ? `${node.score}/100` : "brak"}
        />
        <Metric label="Relacje" value={`${edges.length}`} />
      </div>

      <div className="relation-list">
        <h3>Relacje</h3>
        <ul>
          {edges.map((edge) => {
            const otherId = edge.source === node.id ? edge.target : edge.source;
            const otherNode = nodeById.get(otherId);

            return (
              <li key={`${edge.source}-${edge.target}-${edge.label}`}>
                <span className={`relation-dot risk-${edge.risk ?? "medium"}`} />
                <div>
                  <strong>{edge.label}</strong>
                  <p>
                    {otherNode?.label ?? otherId}
                    {edge.evidence ? ` · ${edge.evidence} dow.` : ""}
                    {edge.strength !== undefined
                      ? ` · siła ${edge.strength}%`
                      : ""}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
