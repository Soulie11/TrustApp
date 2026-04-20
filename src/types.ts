export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type Sentiment = 'positive' | 'neutral' | 'negative'
export type SourceStatus = 'fresh' | 'cached' | 'pending'
export type PipelineStatus = 'done' | 'active' | 'queued'
export type GraphNodeType =
  | 'company'
  | 'person'
  | 'article'
  | 'keyword'
  | 'registry'

export type Company = {
  name: string
  nip: string
  krs: string
  regon: string
  website: string
  sector: string
  aliases: string[]
}

export type ReputationScore = {
  value: number
  level: RiskLevel
  confidence: number
  delta: number
  updatedAt: string
}

export type ScorePoint = {
  date: string
  score: number
}

export type RiskKeyword = {
  label: string
  weight: number
  count: number
}

export type Article = {
  id: string
  title: string
  source: string
  date: string
  sentiment: Sentiment
  riskScore: number
  confidence: number
  keywords: string[]
  excerpt: string
  url?: string
}

export type GraphNode = {
  id: string
  label: string
  type: GraphNodeType
  risk?: RiskLevel
  description?: string
  score?: number
  meta?: string
  x: number
  y: number
}

export type GraphEdge = {
  source: string
  target: string
  label: string
  relationType?: string
  risk?: RiskLevel
  strength?: number
  evidence?: number
}

export type DataSource = {
  name: string
  status: SourceStatus
  coverage: number
  detail: string
}

export type PipelineStep = {
  name: string
  status: PipelineStatus
  detail: string
}

export type AttachmentMeta = {
  name: string
  type: string
  size: number
}

export type AnalysisRequest = {
  query: string
  depth: number
  dateFrom: string
  dateTo: string
  options: {
    media: boolean
    registers: boolean
    aiReview: boolean
    cache: boolean
  }
  attachments: AttachmentMeta[]
}

export type CompanyAnalysis = {
  company: Company
  score: ReputationScore
  summary: string
  keyFindings: string[]
  recommendations: string[]
  riskKeywords: RiskKeyword[]
  history: ScorePoint[]
  articles: Article[]
  graph: {
    nodes: GraphNode[]
    edges: GraphEdge[]
  }
  sources: DataSource[]
  pipeline: PipelineStep[]
}

export type ApiState = 'demo' | 'live' | 'fallback'
