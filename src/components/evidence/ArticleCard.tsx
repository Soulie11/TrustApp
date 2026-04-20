import type { Article } from "../../types";
import { formatFullDate } from "../../utils/formatters";
import { sentimentLabel } from "../../utils/labels";

export function ArticleCard({ article }: { article: Article }) {
  return (
    <article className={`article-card sentiment-${article.sentiment}`}>
      <div className="article-topline">
        <span>{article.source}</span>
        <time dateTime={article.date}>{formatFullDate(article.date)}</time>
      </div>
      <h3>{article.title}</h3>
      <p>{article.excerpt}</p>
      <div className="chip-row">
        {article.keywords.map((keyword) => (
          <span className="chip" key={keyword}>
            {keyword}
          </span>
        ))}
      </div>
      <div className="article-footer">
        <span className="sentiment-label">
          {sentimentLabel(article.sentiment)}
        </span>
        <span>{article.riskScore}/100</span>
        <span>{Math.round(article.confidence * 100)}%</span>
      </div>
    </article>
  );
}
