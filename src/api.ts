import { createDemoAnalysis } from './mockData'
import type {
  AnalysisRequest,
  Article,
  Company,
  CompanyAnalysis,
  DataSource,
  GraphNodeType,
  PipelineStep,
  RiskKeyword,
  RiskLevel,
  ScorePoint,
  Sentiment,
  SourceStatus,
} from './types'

export const ANALYSIS_ENDPOINT =
  import.meta.env.VITE_ANALYSIS_ENDPOINT || '/api/reputation/analyze'
export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export async function fetchAnalysis(
  request: AnalysisRequest,
): Promise<CompanyAnalysis> {
  const response = await fetch(`${API_BASE}${ANALYSIS_ENDPOINT}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: request.query,
      identifiers: inferIdentifiers(request.query),
      options: {
        searchDepth: request.depth,
        dateFrom: request.dateFrom,
        dateTo: request.dateTo,
        includeMedia: request.options.media,
        includeRegisters: request.options.registers,
        includeAiReview: request.options.aiReview,
        includeCache: request.options.cache,
        country: 'PL',
        language: 'pl',
      },
      attachments: request.attachments,
    }),
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const raw = (await response.json()) as unknown
  return normalizeAnalysis(raw, createDemoAnalysis(request))
}

function normalizeAnalysis(
  raw: unknown,
  fallback: CompanyAnalysis,
): CompanyAnalysis {
  const root = asRecord(raw)
  const rawCompany = asRecord(
    root.company ?? root.firma ?? root.organization ?? root.entity,
  )
  const rawScore = asRecord(root.score ?? root.risk ?? root.reputation)
  const scoreValue = clamp(
    toNumber(
      rawScore.value ??
        rawScore.score ??
        root.riskScore ??
        root.reputationScore ??
        root.score,
      fallback.score.value,
    ),
    0,
    100,
  )

  const company: Company = {
    name: toText(rawCompany.name ?? rawCompany.companyName, fallback.company.name),
    nip: toText(rawCompany.nip, fallback.company.nip),
    krs: toText(rawCompany.krs, fallback.company.krs),
    regon: toText(rawCompany.regon, fallback.company.regon),
    website: toText(rawCompany.website ?? rawCompany.domain, fallback.company.website),
    sector: toText(rawCompany.sector ?? rawCompany.industry, fallback.company.sector),
    aliases: toTextArray(
      rawCompany.aliases ?? rawCompany.nameVariants,
      fallback.company.aliases,
    ),
  }

  return {
    company,
    score: {
      value: scoreValue,
      level: toRiskLevel(rawScore.level ?? root.level, scoreValue),
      confidence: normalizeConfidence(
        rawScore.confidence ?? root.confidence,
        fallback.score.confidence,
      ),
      delta: toNumber(rawScore.delta ?? root.delta, fallback.score.delta),
      updatedAt: toText(
        rawScore.updatedAt ?? root.updatedAt,
        fallback.score.updatedAt,
      ),
    },
    summary: toText(root.summary ?? root.description, fallback.summary),
    keyFindings: toTextArray(
      root.keyFindings ?? root.findings,
      fallback.keyFindings,
    ),
    recommendations: toTextArray(
      root.recommendations ?? root.actions,
      fallback.recommendations,
    ),
    riskKeywords: normalizeKeywords(
      root.riskKeywords ?? root.keywords,
      fallback.riskKeywords,
    ),
    history: normalizeHistory(
      root.history ?? root.scoreHistory ?? root.trend,
      fallback.history,
    ),
    articles: normalizeArticles(
      root.articles ?? root.news ?? root.evidence,
      fallback.articles,
    ),
    graph: normalizeGraph(root.graph ?? root.network, fallback.graph),
    sources: normalizeSources(root.sources ?? root.dataSources, fallback.sources),
    pipeline: normalizePipeline(root.pipeline ?? root.steps, fallback.pipeline),
  }
}

function normalizeKeywords(
  value: unknown,
  fallback: RiskKeyword[],
): RiskKeyword[] {
  if (!Array.isArray(value) || !value.length) {
    return fallback
  }

  return value.map((item, index) => {
    if (typeof item === 'string') {
      return { label: item, weight: 50, count: 1 }
    }

    const record = asRecord(item)
    const base = fallback[index] ?? fallback[0]
    return {
      label: toText(record.label ?? record.keyword ?? record.name, base.label),
      weight: clamp(toNumber(record.weight ?? record.score, base.weight), 0, 100),
      count: toNumber(record.count ?? record.hits, base.count),
    }
  })
}

function normalizeHistory(value: unknown, fallback: ScorePoint[]): ScorePoint[] {
  if (!Array.isArray(value) || !value.length) {
    return fallback
  }

  return value.map((item, index) => {
    const record = asRecord(item)
    const base = fallback[index] ?? fallback[fallback.length - 1]
    return {
      date: toText(record.date ?? record.day ?? record.timestamp, base.date),
      score: clamp(toNumber(record.score ?? record.value, base.score), 0, 100),
    }
  })
}

function normalizeArticles(value: unknown, fallback: Article[]): Article[] {
  if (!Array.isArray(value) || !value.length) {
    return fallback
  }

  return value.map((item, index) => {
    const record = asRecord(item)
    const base = fallback[index] ?? fallback[0]
    return {
      id: toText(record.id, `article-${index + 1}`),
      title: toText(record.title ?? record.headline, base.title),
      source: toText(record.source ?? record.publisher, base.source),
      date: toText(record.date ?? record.publishedAt, base.date),
      sentiment: toSentiment(record.sentiment, base.sentiment),
      riskScore: clamp(
        toNumber(record.riskScore ?? record.score, base.riskScore),
        0,
        100,
      ),
      confidence: normalizeConfidence(record.confidence, base.confidence),
      keywords: toTextArray(record.keywords ?? record.riskKeywords, base.keywords),
      excerpt: toText(record.excerpt ?? record.summary, base.excerpt),
      url: typeof record.url === 'string' ? record.url : base.url,
    }
  })
}

function normalizeGraph(
  value: unknown,
  fallback: CompanyAnalysis['graph'],
): CompanyAnalysis['graph'] {
  const graph = asRecord(value)
  const nodes = Array.isArray(graph.nodes) ? graph.nodes : []
  const edges = Array.isArray(graph.edges) ? graph.edges : []

  if (!nodes.length) {
    return fallback
  }

  const placedNodes = nodes.map((item, index) => {
    const record = asRecord(item)
    const base = fallback.nodes[index] ?? fallback.nodes[0]
    const angle = (index / nodes.length) * Math.PI * 2
    return {
      id: toText(record.id, `node-${index}`),
      label: toText(record.label ?? record.name, base.label),
      type: toGraphNodeType(record.type, base.type),
      risk: toRiskLevel(record.risk ?? record.level, base.risk === 'critical' ? 90 : 40),
      description: toOptionalText(record.description ?? record.summary, base.description),
      score:
        record.score !== undefined || record.riskScore !== undefined
          ? clamp(toNumber(record.score ?? record.riskScore, base.score ?? 0), 0, 100)
          : base.score,
      meta: toOptionalText(record.meta ?? record.subtitle ?? record.identifier, base.meta),
      x: toNumber(record.x, 360 + Math.cos(angle) * 190),
      y: toNumber(record.y, 180 + Math.sin(angle) * 105),
    }
  })

  return {
    nodes: placedNodes,
    edges: edges.length
      ? edges.map((item, index) => {
          const record = asRecord(item)
          const base = fallback.edges[index] ?? fallback.edges[0]
          return {
            source: toText(record.source ?? record.from, base.source),
            target: toText(record.target ?? record.to, base.target),
            label: toText(record.label ?? record.type, base.label),
            relationType: toOptionalText(
              record.relationType ?? record.kind,
              base.relationType,
            ),
            risk: toRiskLevel(
              record.risk ?? record.level,
              base.risk === 'critical' ? 90 : 40,
            ),
            strength: clamp(
              toNumber(record.strength ?? record.weight, base.strength ?? 50),
              0,
              100,
            ),
            evidence: toNumber(record.evidence ?? record.count, base.evidence ?? 1),
          }
        })
      : fallback.edges,
  }
}

function normalizeSources(value: unknown, fallback: DataSource[]): DataSource[] {
  if (!Array.isArray(value) || !value.length) {
    return fallback
  }

  return value.map((item, index) => {
    const record = asRecord(item)
    const base = fallback[index] ?? fallback[0]
    return {
      name: toText(record.name, base.name),
      status: toSourceStatus(record.status, base.status),
      coverage: clamp(toNumber(record.coverage, base.coverage), 0, 100),
      detail: toText(record.detail ?? record.description, base.detail),
    }
  })
}

function normalizePipeline(value: unknown, fallback: PipelineStep[]): PipelineStep[] {
  if (!Array.isArray(value) || !value.length) {
    return fallback
  }

  return value.map((item, index) => {
    const record = asRecord(item)
    const base = fallback[index] ?? fallback[0]
    const status = toText(record.status, base.status)
    return {
      name: toText(record.name, base.name),
      status:
        status === 'done' || status === 'active' || status === 'queued'
          ? status
          : base.status,
      detail: toText(record.detail ?? record.description, base.detail),
    }
  })
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function toText(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value : fallback
}

function toOptionalText(value: unknown, fallback?: string): string | undefined {
  return typeof value === 'string' && value.trim() ? value : fallback
}

function toTextArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) {
    return fallback
  }

  const items = value.filter((item): item is string => typeof item === 'string')
  return items.length ? items : fallback
}

function toNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }

  return fallback
}

function normalizeConfidence(value: unknown, fallback: number): number {
  const confidence = toNumber(value, fallback)
  return confidence > 1 ? clamp(confidence / 100, 0, 1) : clamp(confidence, 0, 1)
}

function toRiskLevel(value: unknown, score: number): RiskLevel {
  if (
    value === 'low' ||
    value === 'medium' ||
    value === 'high' ||
    value === 'critical'
  ) {
    return value
  }

  if (score >= 85) {
    return 'critical'
  }

  if (score >= 60) {
    return 'high'
  }

  if (score >= 35) {
    return 'medium'
  }

  return 'low'
}

function toSentiment(value: unknown, fallback: Sentiment): Sentiment {
  return value === 'positive' || value === 'neutral' || value === 'negative'
    ? value
    : fallback
}

function toSourceStatus(value: unknown, fallback: SourceStatus): SourceStatus {
  return value === 'fresh' || value === 'cached' || value === 'pending'
    ? value
    : fallback
}

function toGraphNodeType(value: unknown, fallback: GraphNodeType): GraphNodeType {
  return value === 'company' ||
    value === 'person' ||
    value === 'article' ||
    value === 'keyword' ||
    value === 'registry'
    ? value
    : fallback
}

function inferIdentifiers(query: string) {
  const compact = query.replace(/\D/g, '')

  return {
    nip: compact.length === 10 && !query.toLowerCase().includes('krs')
      ? compact
      : undefined,
    krs: compact.length === 10 && query.toLowerCase().includes('krs')
      ? compact
      : undefined,
    raw: query,
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}
