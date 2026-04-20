import type { GraphEdge, GraphNode } from "../../types";
import { clampNumber } from "../../utils/number";

export const GRAPH_VIEWBOX = { width: 1120, height: 560 };
export const DEFAULT_GRAPH_VIEWPORT = { x: 0, y: 0, scale: 1 };

export type GraphViewport = typeof DEFAULT_GRAPH_VIEWPORT;

export type GraphDrag = {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
};

export function graphCenter() {
  return {
    x: GRAPH_VIEWBOX.width / 2,
    y: GRAPH_VIEWBOX.height / 2,
  };
}

export function getSvgPointFromClient(
  clientX: number,
  clientY: number,
  svg: SVGSVGElement
) {
  const rect = svg.getBoundingClientRect();
  if (!rect.width || !rect.height) {
    return graphCenter();
  }

  return {
    x: ((clientX - rect.left) / rect.width) * GRAPH_VIEWBOX.width,
    y: ((clientY - rect.top) / rect.height) * GRAPH_VIEWBOX.height,
  };
}

export function zoomViewport(
  viewport: GraphViewport,
  nextScale: number,
  focus: { x: number; y: number }
): GraphViewport {
  const scale = clampNumber(nextScale, 0.45, 2.8);
  const ratio = scale / viewport.scale;

  return {
    scale,
    x: focus.x - (focus.x - viewport.x) * ratio,
    y: focus.y - (focus.y - viewport.y) * ratio,
  };
}

export function splitLabel(label: string) {
  const words = label.split(/\s+/);
  const lines: string[] = [];

  words.forEach((word) => {
    const last = lines[lines.length - 1];
    if (!last || `${last} ${word}`.length > 16) {
      lines.push(word);
    } else {
      lines[lines.length - 1] = `${last} ${word}`;
    }
  });

  return lines.slice(0, 2);
}

export function nodeRadius(node: GraphNode) {
  return node.type === "company" && node.id === "company" ? 36 : 28;
}

export function edgePath(source: GraphNode, target: GraphNode, index: number) {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const distance = Math.hypot(dx, dy) || 1;
  const startRadius = nodeRadius(source) + 10;
  const endRadius = nodeRadius(target) + 10;
  const sx = source.x + (dx / distance) * startRadius;
  const sy = source.y + (dy / distance) * startRadius;
  const tx = target.x - (dx / distance) * endRadius;
  const ty = target.y - (dy / distance) * endRadius;
  const offset = ((index % 3) - 1) * Math.min(42, distance * 0.16);
  const nx = -dy / distance;
  const ny = dx / distance;
  const cx = (sx + tx) / 2 + nx * offset;
  const cy = (sy + ty) / 2 + ny * offset;

  return `M ${sx} ${sy} Q ${cx} ${cy} ${tx} ${ty}`;
}

export function edgeMidpoint(
  source: GraphNode,
  target: GraphNode,
  index: number
) {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const distance = Math.hypot(dx, dy) || 1;
  const offset = ((index % 3) - 1) * Math.min(30, distance * 0.12);
  return {
    x: (source.x + target.x) / 2 + (-dy / distance) * offset,
    y: (source.y + target.y) / 2 + (dx / distance) * offset - 8,
  };
}

export function edgeWidth(edge: GraphEdge) {
  return 1.3 + ((edge.strength ?? 50) / 100) * 2.2;
}
