import type { CSSProperties } from "react";
import type { DataSource } from "../../types";
import { sourceStatusLabel } from "../../utils/labels";

export function SourceList({ sources }: { sources: DataSource[] }) {
  return (
    <div className="source-list">
      {sources.map((source) => (
        <div className="source-item" key={source.name}>
          <div>
            <strong>{source.name}</strong>
            <span>{source.detail}</span>
          </div>
          <span className={`source-status status-${source.status}`}>
            {sourceStatusLabel(source.status)}
          </span>
          <div
            className="source-bar"
            style={
              { "--source-progress": `${source.coverage}%` } as CSSProperties
            }
          >
            <span />
          </div>
        </div>
      ))}
    </div>
  );
}
