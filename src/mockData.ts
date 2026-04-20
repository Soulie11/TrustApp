import type { AnalysisRequest, CompanyAnalysis } from './types'

export const defaultRequest: AnalysisRequest = {
  query: 'Nova Rail Sp. z o.o.',
  depth: 2,
  dateFrom: '2026-01-01',
  dateTo: '2026-04-20',
  options: {
    media: true,
    registers: true,
    aiReview: true,
    cache: true,
  },
  attachments: [],
}

export const demoAnalysis: CompanyAnalysis = {
  company: {
    name: 'Nova Rail Sp. z o.o.',
    nip: '521-390-10-44',
    krs: '0000876120',
    regon: '387102440',
    website: 'novarail.example',
    sector: 'Transport i infrastruktura',
    aliases: ['Nova Rail', 'NovaRail', 'Nova Rail Polska', 'NR Logistics'],
  },
  score: {
    value: 68,
    level: 'high',
    confidence: 0.84,
    delta: 14,
    updatedAt: '2026-04-20T10:30:00.000Z',
  },
  summary:
    'Podwyższony scoring wynika z kumulacji negatywnych publikacji, powtarzalnych słów ryzyka i bliskiego związku artykułów z nazwą firmy oraz osobami zarządu. Źródła rejestrowe są spójne, ale wymagają ręcznej weryfikacji dwóch publikacji branżowych.',
  keyFindings: [
    'Trzy publikacje z ostatnich 30 dni zawierają kontekst zarzutów lub postępowań.',
    'Warianty nazwy firmy pojawiają się w nagłówkach i leadach, więc dopasowanie ma wysoką pewność.',
    'Największy wpływ na wynik mają słowa: zarzuty, sankcje, korupcja i przetarg.',
  ],
  recommendations: [
    'Wymagaj dodatkowego approval przed onboardingiem kontrahenta.',
    'Sprawdź osoby zarządu w rejestrach sankcyjnych i PEP.',
    'Ustaw alert dla nowych publikacji oraz zmian KRS.',
  ],
  riskKeywords: [
    { label: 'zarzuty', weight: 88, count: 7 },
    { label: 'sankcje', weight: 74, count: 3 },
    { label: 'korupcja', weight: 69, count: 4 },
    { label: 'przetarg', weight: 52, count: 5 },
    { label: 'zarząd', weight: 41, count: 8 },
  ],
  history: [
    { date: '2026-01-05', score: 32 },
    { date: '2026-01-26', score: 35 },
    { date: '2026-02-12', score: 38 },
    { date: '2026-03-03', score: 47 },
    { date: '2026-03-27', score: 54 },
    { date: '2026-04-09', score: 61 },
    { date: '2026-04-20', score: 68 },
  ],
  articles: [
    {
      id: 'art-1',
      title: 'Kontrola po przetargu infrastrukturalnym obejmuje dokumenty spółki',
      source: 'Dziennik Gospodarczy',
      date: '2026-04-18',
      sentiment: 'negative',
      riskScore: 82,
      confidence: 0.91,
      keywords: ['przetarg', 'zarzuty', 'kontrola'],
      excerpt:
        'Artykuł łączy nazwę firmy z postępowaniem dotyczącym dokumentacji przetargowej. Model oznaczył kontekst jako istotny dla due diligence.',
      url: '#',
    },
    {
      id: 'art-2',
      title: 'Zarząd zapowiada audyt po publikacjach o podwykonawcach',
      source: 'Rynek Kolejowy Monitor',
      date: '2026-04-12',
      sentiment: 'neutral',
      riskScore: 49,
      confidence: 0.76,
      keywords: ['zarząd', 'audyt', 'podwykonawcy'],
      excerpt:
        'Materiał zawiera odpowiedź spółki i nie potwierdza naruszeń, ale zwiększa wagę obserwacji przez powiązanie z zarządem.',
      url: '#',
    },
    {
      id: 'art-3',
      title: 'Nowa umowa serwisowa po zmianach w strukturze właścicielskiej',
      source: 'Biuletyn Branżowy',
      date: '2026-03-29',
      sentiment: 'positive',
      riskScore: 18,
      confidence: 0.69,
      keywords: ['umowa', 'właściciel', 'KRS'],
      excerpt:
        'Publikacja ma pozytywny wydźwięk i obniża wynik cząstkowy, ale wskazuje potrzebę porównania zmian z danymi rejestrowymi.',
      url: '#',
    },
  ],
  graph: {
    nodes: [
      {
        id: 'company',
        label: 'NOVA RAIL',
        type: 'company',
        risk: 'high',
        description: 'Analizowana spółka i główny punkt scoringu reputacyjnego.',
        score: 68,
        meta: 'NIP 521-390-10-44',
        x: 560,
        y: 255,
      },
      {
        id: 'marta',
        label: 'Marta Dębska',
        type: 'person',
        risk: 'medium',
        description: 'Członkini zarządu wymieniana w publikacjach branżowych.',
        score: 42,
        meta: 'zarząd',
        x: 330,
        y: 80,
      },
      {
        id: 'jan',
        label: 'Jan Wroński',
        type: 'person',
        risk: 'high',
        description: 'Osoba powiązana z wcześniejszym postępowaniem przetargowym.',
        score: 71,
        meta: 'beneficjent',
        x: 770,
        y: 88,
      },
      {
        id: 'krs',
        label: 'KRS / NIP',
        type: 'registry',
        risk: 'low',
        description: 'Źródło rejestrowe użyte do ujednolicenia identyfikatorów.',
        score: 16,
        meta: '0000876120',
        x: 565,
        y: 55,
      },
      {
        id: 'article-audit',
        label: 'Kontrola przetargu',
        type: 'article',
        risk: 'high',
        description: 'Publikacja z negatywnym kontekstem i wysoką wagą dowodową.',
        score: 82,
        meta: 'Dziennik Gospodarczy',
        x: 230,
        y: 305,
      },
      {
        id: 'keyword-zarzuty',
        label: 'zarzuty / sankcje',
        type: 'keyword',
        risk: 'critical',
        description: 'Najsilniejszy zestaw sygnałów tekstowych w analizie artykułów.',
        score: 88,
        meta: '10 wystąpień',
        x: 810,
        y: 318,
      },
      {
        id: 'baltic',
        label: 'BALTIC CARGO',
        type: 'company',
        risk: 'medium',
        description: 'Podmiot powiązany przez umowy serwisowe i wspólnych doradców.',
        score: 48,
        meta: 'kontrahent',
        x: 125,
        y: 115,
      },
      {
        id: 'vector',
        label: 'VECTOR FUND',
        type: 'company',
        risk: 'medium',
        description: 'Udziałowiec mniejszościowy z publikacji o zmianach właścicielskich.',
        score: 44,
        meta: 'udziałowiec',
        x: 965,
        y: 140,
      },
      {
        id: 'lexport',
        label: 'LexPort Legal',
        type: 'company',
        risk: 'low',
        description: 'Kancelaria widoczna w dokumentach rejestrowych.',
        score: 19,
        meta: 'pełnomocnik',
        x: 965,
        y: 410,
      },
      {
        id: 'article-board',
        label: 'Audyt zarządu',
        type: 'article',
        risk: 'medium',
        description: 'Publikacja neutralna, ale wzmacnia kontekst osób zarządzających.',
        score: 49,
        meta: 'Rynek Kolejowy Monitor',
        x: 410,
        y: 475,
      },
      {
        id: 'registry-change',
        label: 'Zmiana KRS',
        type: 'registry',
        risk: 'low',
        description: 'Historyczna zmiana struktury właścicielskiej do porównania.',
        score: 22,
        meta: '2026-03-29',
        x: 650,
        y: 485,
      },
    ],
    edges: [
      {
        source: 'company',
        target: 'marta',
        label: 'zarząd',
        relationType: 'officer',
        risk: 'medium',
        strength: 82,
        evidence: 6,
      },
      {
        source: 'jan',
        target: 'company',
        label: 'beneficjent',
        relationType: 'ubo',
        risk: 'high',
        strength: 76,
        evidence: 4,
      },
      {
        source: 'krs',
        target: 'company',
        label: 'identyfikatory',
        relationType: 'registry',
        risk: 'low',
        strength: 94,
        evidence: 5,
      },
      {
        source: 'article-audit',
        target: 'company',
        label: 'wzmianka',
        relationType: 'media',
        risk: 'high',
        strength: 88,
        evidence: 3,
      },
      {
        source: 'article-audit',
        target: 'keyword-zarzuty',
        label: 'normalizacja',
        relationType: 'nlp',
        risk: 'critical',
        strength: 91,
        evidence: 7,
      },
      {
        source: 'keyword-zarzuty',
        target: 'company',
        label: 'wpływa na scoring',
        relationType: 'risk_signal',
        risk: 'critical',
        strength: 86,
        evidence: 10,
      },
      {
        source: 'baltic',
        target: 'company',
        label: 'kontrakt',
        relationType: 'contract',
        risk: 'medium',
        strength: 62,
        evidence: 2,
      },
      {
        source: 'vector',
        target: 'company',
        label: 'udziałowiec',
        relationType: 'ownership',
        risk: 'medium',
        strength: 58,
        evidence: 3,
      },
      {
        source: 'lexport',
        target: 'company',
        label: 'pełnomocnik',
        relationType: 'advisor',
        risk: 'low',
        strength: 37,
        evidence: 1,
      },
      {
        source: 'marta',
        target: 'article-board',
        label: 'cytowana',
        relationType: 'media',
        risk: 'medium',
        strength: 52,
        evidence: 2,
      },
      {
        source: 'article-board',
        target: 'company',
        label: 'kontekst zarządu',
        relationType: 'media',
        risk: 'medium',
        strength: 55,
        evidence: 2,
      },
      {
        source: 'registry-change',
        target: 'vector',
        label: 'zmiana udziałów',
        relationType: 'registry',
        risk: 'low',
        strength: 46,
        evidence: 1,
      },
      {
        source: 'registry-change',
        target: 'company',
        label: 'historia KRS',
        relationType: 'registry',
        risk: 'low',
        strength: 44,
        evidence: 1,
      },
    ],
  },
  sources: [
    {
      name: 'Rejestry KRS / NIP',
      status: 'fresh',
      coverage: 96,
      detail: 'Nazwa, identyfikatory i warianty nazw',
    },
    {
      name: 'Media online',
      status: 'fresh',
      coverage: 82,
      detail: 'Publikacje bieżące i branżowe',
    },
    {
      name: 'Cache artykułów',
      status: 'cached',
      coverage: 64,
      detail: 'Dane historyczne do trendu scoringu',
    },
    {
      name: 'PDF / KRS',
      status: 'pending',
      coverage: 38,
      detail: 'Dokumenty do ręcznego porównania',
    },
  ],
  pipeline: [
    { name: 'Firma', status: 'done', detail: 'Nazwa, NIP, warianty' },
    { name: 'Rejestry', status: 'done', detail: 'KRS i identyfikatory' },
    { name: 'Media', status: 'done', detail: 'Artykuły oraz cache' },
    { name: 'Normalizacja', status: 'active', detail: 'Alias, homonimy, słowa' },
    { name: 'AI review', status: 'queued', detail: 'Próg dla trudnych treści' },
    { name: 'Raport', status: 'queued', detail: 'PDF, mail, eksport JSON' },
  ],
}

export function createDemoAnalysis(request: AnalysisRequest): CompanyAnalysis {
  const copy = JSON.parse(JSON.stringify(demoAnalysis)) as CompanyAnalysis
  const query = request.query.trim()

  if (query && query !== defaultRequest.query) {
    copy.company.name = query
    copy.company.aliases = [
      query,
      query.replace(/\b(sp\.?\s*z\s*o\.?o\.?|s\.a\.)\b/gi, '').trim(),
      `${query} Polska`,
      acronym(query),
    ].filter(Boolean)
    copy.summary = `Wynik demo dla zapytania "${query}" zachowuje strukturę odpowiedzi backendu: profil firmy, scoring, artykuły, słowa ryzyka, historię i graf powiązań.`
    copy.graph.nodes = copy.graph.nodes.map((node) =>
      node.id === 'company' ? { ...node, label: shortName(query) } : node,
    )
  }

  if (request.attachments.length) {
    copy.sources = copy.sources.map((source) =>
      source.name === 'PDF / KRS'
        ? {
            ...source,
            status: 'fresh',
            coverage: 74,
            detail: request.attachments.map((file) => file.name).join(', '),
          }
        : source,
    )
  }

  return copy
}

function acronym(value: string) {
  return value
    .split(/\s+/)
    .filter((word) => /^[a-ząćęłńóśźż]/i.test(word))
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

function shortName(value: string) {
  return value.split(/\s+/).slice(0, 2).join(' ')
}
