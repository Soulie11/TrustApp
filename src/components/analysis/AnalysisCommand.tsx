import type { ChangeEvent, FormEvent } from "react";
import type { AnalysisRequest, ApiState } from "../../types";
import { Icon } from "../common/Icon";
import { StatusBadge } from "../common/StatusBadge";
import { Toggle } from "../common/Toggle";

type AnalysisCommandProps = {
  apiState: ApiState;
  isLoading: boolean;
  notice: string;
  onAttachmentsChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onOptionChange: <K extends keyof AnalysisRequest["options"]>(
    key: K,
    value: AnalysisRequest["options"][K]
  ) => void;
  onRequestChange: <K extends keyof AnalysisRequest>(
    key: K,
    value: AnalysisRequest[K]
  ) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  request: AnalysisRequest;
};

export function AnalysisCommand({
  apiState,
  isLoading,
  notice,
  onAttachmentsChange,
  onOptionChange,
  onRequestChange,
  onSubmit,
  request,
}: AnalysisCommandProps) {
  return (
    <section className="command-band" id="analysis">
      <form className="search-console" onSubmit={onSubmit}>
        <label className="field field-search" htmlFor="company-query">
          <span>Firma, NIP albo KRS</span>
          <div className="input-frame">
            <Icon name="search" />
            <input
              id="company-query"
              value={request.query}
              onChange={(event) => onRequestChange("query", event.target.value)}
              placeholder="np. nazwa spółki, NIP, KRS"
            />
          </div>
        </label>

        <label className="field" htmlFor="search-depth">
          <span>Głębokość</span>
          <select
            id="search-depth"
            value={request.depth}
            onChange={(event) =>
              onRequestChange("depth", Number(event.target.value))
            }
          >
            <option value={0}>0 - szybka</option>
            <option value={1}>1 - standard</option>
            <option value={2}>2 - rozszerzona</option>
            <option value={3}>3 - śledcza</option>
          </select>
        </label>

        <label className="field" htmlFor="date-from">
          <span>Od</span>
          <input
            id="date-from"
            type="date"
            value={request.dateFrom}
            onChange={(event) => onRequestChange("dateFrom", event.target.value)}
          />
        </label>

        <label className="field" htmlFor="date-to">
          <span>Do</span>
          <input
            id="date-to"
            type="date"
            value={request.dateTo}
            onChange={(event) => onRequestChange("dateTo", event.target.value)}
          />
        </label>

        <button className="primary-action" type="submit" disabled={isLoading}>
          <Icon name={isLoading ? "loader" : "spark"} />
          {isLoading ? "Analizuję" : "Analizuj"}
        </button>
      </form>

      <div className="option-row" aria-label="Zakres danych">
        <Toggle
          checked={request.options.media}
          label="Media"
          onChange={(checked) => onOptionChange("media", checked)}
        />
        <Toggle
          checked={request.options.registers}
          label="Rejestry"
          onChange={(checked) => onOptionChange("registers", checked)}
        />
        <Toggle
          checked={request.options.aiReview}
          label="AI review"
          onChange={(checked) => onOptionChange("aiReview", checked)}
        />
        <Toggle
          checked={request.options.cache}
          label="Cache"
          onChange={(checked) => onOptionChange("cache", checked)}
        />

        <label className="file-chip" htmlFor="evidence-file">
          <Icon name="paperclip" />
          <span>
            {request.attachments.length
              ? request.attachments.map((file) => file.name).join(", ")
              : "PDF / KRS"}
          </span>
          <input
            id="evidence-file"
            type="file"
            accept=".pdf,.csv,.txt,.json"
            multiple
            onChange={onAttachmentsChange}
          />
        </label>

        <StatusBadge state={apiState} label={notice} />
      </div>
    </section>
  );
}
