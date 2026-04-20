import type { PipelineStep } from "../../types";

export function Pipeline({ steps }: { steps: PipelineStep[] }) {
  return (
    <ol className="pipeline-list">
      {steps.map((step) => (
        <li className={`pipeline-step step-${step.status}`} key={step.name}>
          <span aria-hidden="true" />
          <div>
            <strong>{step.name}</strong>
            <p>{step.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
