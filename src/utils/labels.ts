import type { GraphNode, RiskLevel, Sentiment, SourceStatus } from "../types";

export function riskLabel(level: RiskLevel) {
  const labels: Record<RiskLevel, string> = {
    low: "Niskie ryzyko",
    medium: "Umiarkowane ryzyko",
    high: "Podwyższone ryzyko",
    critical: "Krytyczne ryzyko",
  };
  return labels[level];
}

export function sourceStatusLabel(status: SourceStatus) {
  const labels: Record<SourceStatus, string> = {
    fresh: "świeże",
    cached: "cache",
    pending: "oczekuje",
  };
  return labels[status];
}

export function sentimentLabel(sentiment: Sentiment) {
  const labels: Record<Sentiment, string> = {
    positive: "pozytywny",
    neutral: "neutralny",
    negative: "negatywny",
  };
  return labels[sentiment];
}

export function graphNodeTypeLabel(type: GraphNode["type"]) {
  const labels: Record<GraphNode["type"], string> = {
    article: "Artykuł",
    company: "Firma",
    keyword: "Sygnał",
    person: "Osoba",
    registry: "Rejestr",
  };
  return labels[type];
}
