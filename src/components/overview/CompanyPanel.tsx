import type { CompanyAnalysis } from "../../types";
import { Icon } from "../common/Icon";

export function CompanyPanel({ analysis }: { analysis: CompanyAnalysis }) {
  return (
    <section className="panel company-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Profil firmy</p>
          <h2>{analysis.company.name}</h2>
        </div>
        <Icon name="building" />
      </div>

      <dl className="identity-list">
        <div>
          <dt>NIP</dt>
          <dd>{analysis.company.nip}</dd>
        </div>
        <div>
          <dt>KRS</dt>
          <dd>{analysis.company.krs}</dd>
        </div>
        <div>
          <dt>REGON</dt>
          <dd>{analysis.company.regon}</dd>
        </div>
        <div>
          <dt>Branża</dt>
          <dd>{analysis.company.sector}</dd>
        </div>
      </dl>

      <div className="alias-block">
        <p className="micro-label">Warianty nazw</p>
        <div className="chip-row">
          {analysis.company.aliases.map((alias) => (
            <span key={alias} className="chip">
              {alias}
            </span>
          ))}
        </div>
      </div>

      <a
        className="company-link"
        href={`https://${analysis.company.website}`}
        target="_blank"
        rel="noreferrer"
      >
        <Icon name="external" />
        {analysis.company.website}
      </a>
    </section>
  );
}
