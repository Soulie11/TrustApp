import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { CompanyAnalysis } from "../../types";
import { useContainedWheelScroll } from "../../hooks/useContainedWheelScroll";
import { graphNodeTypeLabel } from "../../utils/labels";
import { Icon } from "../common/Icon";
import { GraphNodeGlyph, MiniNodeIcon } from "./GraphNodeGlyph";
import { NetworkDetails } from "./NetworkDetails";
import {
  DEFAULT_GRAPH_VIEWPORT,
  GRAPH_VIEWBOX,
  edgeMidpoint,
  edgePath,
  edgeWidth,
  getSvgPointFromClient,
  graphCenter,
  nodeRadius,
  splitLabel,
  zoomViewport,
  type GraphDrag,
  type GraphViewport,
} from "./graphMath";

type NetworkGraphProps = {
  graph: CompanyAnalysis["graph"];
};

const GRAPH_NODE_TYPES = [
  "company",
  "person",
  "registry",
  "article",
  "keyword",
] as const;
const GRAPH_RISK_LEVELS = ["low", "medium", "high", "critical"] as const;

export function NetworkGraph({ graph }: NetworkGraphProps) {
  const [selectedNodeId, setSelectedNodeId] = useState(
    graph.nodes[0]?.id ?? ""
  );
  const [viewport, setViewport] =
    useState<GraphViewport>(DEFAULT_GRAPH_VIEWPORT);
  const [isPanning, setIsPanning] = useState(false);
  const graphSvgRef = useRef<SVGSVGElement | null>(null);
  const detailsPanelRef = useRef<HTMLElement | null>(null);
  const dragRef = useRef<GraphDrag | null>(null);
  const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
  const selectedNode = nodeById.get(selectedNodeId) ?? graph.nodes[0];
  const selectedEdges = selectedNode
    ? graph.edges.filter(
        (edge) =>
          edge.source === selectedNode.id || edge.target === selectedNode.id
      )
    : [];

  useEffect(() => {
    const svg = graphSvgRef.current;
    if (!svg) {
      return;
    }
    const svgElement = svg;

    function handleNativeWheel(event: WheelEvent) {
      event.preventDefault();
      const focus = getSvgPointFromClient(
        event.clientX,
        event.clientY,
        svgElement
      );
      const factor = event.deltaY > 0 ? 0.88 : 1.14;
      setViewport((current) =>
        zoomViewport(current, current.scale * factor, focus)
      );
    }

    svgElement.addEventListener("wheel", handleNativeWheel, { passive: false });

    return () => {
      svgElement.removeEventListener("wheel", handleNativeWheel);
    };
  }, []);

  useContainedWheelScroll(
    detailsPanelRef,
    `${selectedNodeId}:${selectedEdges.length}`
  );

  function zoomTo(nextScale: number, focus = graphCenter()) {
    setViewport((current) => zoomViewport(current, nextScale, focus));
  }

  function handlePointerDown(event: PointerEvent<SVGSVGElement>) {
    if (event.button !== 0) {
      return;
    }

    if ((event.target as Element).closest(".network-node")) {
      return;
    }

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: viewport.x,
      originY: viewport.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsPanning(true);
  }

  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const dx = ((event.clientX - drag.startX) / rect.width) * GRAPH_VIEWBOX.width;
    const dy =
      ((event.clientY - drag.startY) / rect.height) * GRAPH_VIEWBOX.height;

    setViewport((current) => ({
      ...current,
      x: drag.originX + dx,
      y: drag.originY + dy,
    }));
  }

  function handlePointerEnd(event: PointerEvent<SVGSVGElement>) {
    if (dragRef.current?.pointerId !== event.pointerId) {
      return;
    }

    dragRef.current = null;
    setIsPanning(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <div className="network-workspace">
      <div className="network-map-shell">
        <div className="network-map-topline">
          <div className="network-legend" aria-label="Legenda grafu">
            {GRAPH_NODE_TYPES.map((type) => (
              <span key={type}>
                <MiniNodeIcon type={type} />
                {graphNodeTypeLabel(type)}
              </span>
            ))}
          </div>

          <div className="network-map-actions">
            <span className="network-hint">Kółko: zoom · przeciągnij tło: ruch</span>
            <div className="zoom-controls" aria-label="Sterowanie widokiem grafu">
              <button
                aria-label="Pomniejsz graf"
                onClick={() => zoomTo(viewport.scale * 0.82)}
                title="Pomniejsz"
                type="button"
              >
                <Icon name="zoom-out" />
              </button>
              <button
                aria-label="Resetuj widok grafu"
                onClick={() => setViewport(DEFAULT_GRAPH_VIEWPORT)}
                title="Resetuj widok"
                type="button"
              >
                <Icon name="target" />
              </button>
              <button
                aria-label="Powiększ graf"
                onClick={() => zoomTo(viewport.scale * 1.22)}
                title="Powiększ"
                type="button"
              >
                <Icon name="zoom-in" />
              </button>
            </div>
          </div>
        </div>

        <div className="network-canvas-scroll">
          <svg
            ref={graphSvgRef}
            className={`network-graph ${isPanning ? "is-panning" : ""}`}
            viewBox={`0 0 ${GRAPH_VIEWBOX.width} ${GRAPH_VIEWBOX.height}`}
            role="img"
            aria-label="Graf powiązań firmy, osób, artykułów i rejestrów"
            onPointerCancel={handlePointerEnd}
            onPointerDown={handlePointerDown}
            onPointerLeave={handlePointerEnd}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
          >
            <defs>
              {GRAPH_RISK_LEVELS.map((risk) => (
                <marker
                  id={`arrow-${risk}`}
                  key={risk}
                  markerHeight="10"
                  markerUnits="strokeWidth"
                  markerWidth="10"
                  orient="auto"
                  refX="8"
                  refY="5"
                  viewBox="0 0 10 10"
                >
                  <path className={`arrow-head risk-${risk}`} d="M0 0 10 5 0 10z" />
                </marker>
              ))}
            </defs>

            <g
              className="network-viewport"
              transform={`translate(${viewport.x} ${viewport.y}) scale(${viewport.scale})`}
            >
              {graph.edges.map((edge, index) => {
                const source = nodeById.get(edge.source);
                const target = nodeById.get(edge.target);
                if (!source || !target) {
                  return null;
                }

                const isSelected =
                  selectedNode &&
                  (edge.source === selectedNode.id ||
                    edge.target === selectedNode.id);
                const midpoint = edgeMidpoint(source, target, index);
                const risk = edge.risk ?? "medium";

                return (
                  <g
                    className={`network-edge-group ${
                      isSelected ? "is-active" : ""
                    }`}
                    key={`${edge.source}-${edge.target}-${edge.label}`}
                  >
                    <path
                      className={`network-edge risk-${risk}`}
                      d={edgePath(source, target, index)}
                      markerEnd={`url(#arrow-${risk})`}
                      strokeWidth={edgeWidth(edge)}
                    />
                    <text
                      className="network-edge-label"
                      x={midpoint.x}
                      y={midpoint.y}
                      textAnchor="middle"
                    >
                      {edge.label}
                    </text>
                  </g>
                );
              })}

              {graph.nodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;

                return (
                  <g
                    aria-label={`${graphNodeTypeLabel(node.type)} ${node.label}`}
                    className={`network-node graph-${node.type} risk-${
                      node.risk ?? "low"
                    } ${isSelected ? "is-selected" : ""}`}
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        setSelectedNodeId(node.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    transform={`translate(${node.x} ${node.y})`}
                  >
                    <circle className="node-hit-area" r={nodeRadius(node) + 26} />
                    <circle className="node-halo" r={nodeRadius(node) + 10} />
                    <GraphNodeGlyph type={node.type} />
                    <text className="network-node-label" textAnchor="middle">
                      {splitLabel(node.label).map((line, index) => (
                        <tspan
                          dy={index === 0 ? 0 : 15}
                          key={`${node.id}-${line}`}
                          x="0"
                          y={nodeRadius(node) + 24 + index * 15}
                        >
                          {line}
                        </tspan>
                      ))}
                    </text>
                    {node.meta ? (
                      <text
                        className="network-node-meta"
                        textAnchor="middle"
                        x="0"
                        y={nodeRadius(node) + 58}
                      >
                        {node.meta}
                      </text>
                    ) : null}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      </div>

      {selectedNode ? (
        <NetworkDetails
          edges={selectedEdges}
          node={selectedNode}
          nodeById={nodeById}
          scrollRef={detailsPanelRef}
        />
      ) : null}
    </div>
  );
}
