import type { CompanyAnalysis } from "../../types";
import { ArticleCard } from "./ArticleCard";

export function EvidenceSection({ analysis }: { analysis: CompanyAnalysis }) {
  return (
    <section className="evidence-section" id="evidence">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Publikacje medialne</p>
          <h2>Artykuły wpływające na wynik</h2>
        </div>
        <span className="network-count">{analysis.articles.length} źródła</span>
      </div>

      <div className="article-grid">
        {analysis.articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
