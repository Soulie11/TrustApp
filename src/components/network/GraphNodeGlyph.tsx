import type { GraphNode } from "../../types";

type GraphNodeGlyphProps = {
  type: GraphNode["type"];
};

export function MiniNodeIcon({ type }: GraphNodeGlyphProps) {
  return (
    <svg className={`mini-node-icon graph-${type}`} viewBox="-24 -24 48 48">
      <GraphNodeGlyph type={type} />
    </svg>
  );
}

export function GraphNodeGlyph({ type }: GraphNodeGlyphProps) {
  if (type === "person") {
    return (
      <g className="node-glyph person-glyph">
        <circle cx="0" cy="-12" r="9" />
        <path d="M-18 20c2-13 9-20 18-20s16 7 18 20Z" />
      </g>
    );
  }

  if (type === "registry") {
    return (
      <g className="node-glyph registry-glyph">
        <ellipse cx="0" cy="-13" rx="18" ry="7" />
        <path d="M-18-13v24c0 4 8 7 18 7s18-3 18-7v-24" />
        <path d="M-18-1c0 4 8 7 18 7s18-3 18-7" />
      </g>
    );
  }

  if (type === "article") {
    return (
      <g className="node-glyph article-glyph">
        <path d="M-15-20h20l10 10v30h-30Z" />
        <path d="M5-20v10h10" />
        <path d="M-8 2H8" />
        <path d="M-8 10H6" />
      </g>
    );
  }

  if (type === "keyword") {
    return (
      <g className="node-glyph keyword-glyph">
        <path d="M-10-18-15 18" />
        <path d="M8-18 3 18" />
        <path d="M-18-6H15" />
        <path d="M-20 8H13" />
      </g>
    );
  }

  return (
    <g className="node-glyph company-glyph">
      <path d="M-18 20v-31l18-7 18 7v31" />
      <path d="M-7 20V7H7v13" />
      <path d="M-9-8h.1" />
      <path d="M0-8h.1" />
      <path d="M9-8h.1" />
      <path d="M-9 0h.1" />
      <path d="M0 0h.1" />
      <path d="M9 0h.1" />
    </g>
  );
}
