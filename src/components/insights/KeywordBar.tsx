import type { CSSProperties } from "react";
import type { RiskKeyword } from "../../types";

export function KeywordBar({ keyword }: { keyword: RiskKeyword }) {
  return (
    <div className="keyword-item">
      <div>
        <strong>{keyword.label}</strong>
        <span>{keyword.count} wystąpień</span>
      </div>
      <div
        className="keyword-track"
        style={{ "--keyword-weight": `${keyword.weight}%` } as CSSProperties}
      >
        <span />
      </div>
      <b>{keyword.weight}</b>
    </div>
  );
}
