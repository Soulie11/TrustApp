import type { ApiState } from "../../types";

export function StatusBadge({ state, label }: { state: ApiState; label: string }) {
  return (
    <div className={`api-badge api-${state}`}>
      <span aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}
