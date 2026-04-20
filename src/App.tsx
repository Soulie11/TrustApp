import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type FormEvent,
  type PointerEvent,
  type RefObject,
} from "react";
import { ANALYSIS_ENDPOINT, API_BASE, fetchAnalysis } from "./api";
import { createDemoAnalysis, defaultRequest } from "./mockData";
import type {
  AnalysisRequest,
  ApiState,
  Article,
  CompanyAnalysis,
  DataSource,
  GraphEdge,
  GraphNode,
  PipelineStep,
  ReputationScore,
  RiskKeyword,
  RiskLevel,
  ScorePoint,
  Sentiment,
  SourceStatus,
} from "./types";
import "./App.css";

function useContainedWheelScroll(
  ref: RefObject<HTMLElement | null>,
  dependencyKey: unknown
) {
  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const scrollElement = element;

    function handleWheel(event: WheelEvent) {
      event.preventDefault();
      event.stopPropagation();

      const maxScroll = scrollElement.scrollHeight - scrollElement.clientHeight;
      if (maxScroll <= 0) {
        return;
      }

      scrollElement.scrollTop = clampNumber(
        scrollElement.scrollTop + normalizeWheelDelta(event),
        0,
        maxScroll
      );
    }

    scrollElement.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      scrollElement.removeEventListener("wheel", handleWheel);
    };
  }, [ref, dependencyKey]);
}

function App() {
  const [request, setRequest] = useState<AnalysisRequest>(defaultRequest);
  const [analysis, setAnalysis] = useState<CompanyAnalysis>(() =>
    createDemoAnalysis(defaultRequest)
  );
  const [apiState, setApiState] = useState<ApiState>("demo");
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState(
    "Tryb demo: podłącz backend przez VITE_API_URL albo ten sam origin."
  );
  const insightPanelRef = useRef<HTMLElement | null>(null);

  const endpointLabel = `${API_BASE}${ANALYSIS_ENDPOINT}`;
  const highestKeyword = useMemo(
    () =>
      analysis.riskKeywords.reduce(
        (top, keyword) => (keyword.weight > top.weight ? keyword : top),
        analysis.riskKeywords[0]
      ),
    [analysis.riskKeywords]
  );

  useContainedWheelScroll(insightPanelRef, analysis.company.name);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setNotice("Analiza w toku...");

    try {
      const result = await fetchAnalysis(request);
      setAnalysis(result);
      setApiState("live");
      setNotice(`Backend odpowiedział: ${endpointLabel}`);
    } catch (error) {
      setAnalysis(createDemoAnalysis(request));
      setApiState("fallback");
      setNotice(
        `Backend niedostępny, pokazuję dane demo zgodne z kontraktem. ${readError(
          error
        )}`
      );
    } finally {
      setIsLoading(false);
    }
  }

  function updateRequest<K extends keyof AnalysisRequest>(
    key: K,
    value: AnalysisRequest[K]
  ) {
    setRequest((current) => ({ ...current, [key]: value }));
  }

  function updateOption<K extends keyof AnalysisRequest["options"]>(
    key: K,
    value: AnalysisRequest["options"][K]
  ) {
    setRequest((current) => ({
      ...current,
      options: { ...current.options, [key]: value },
    }));
  }

  function handleAttachments(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
    }));
    updateRequest("attachments", files);
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(analysis, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slugify(analysis.company.name)}-checktrust.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <Icon name="shield" />
          </div>
          <div>
            <p className="eyebrow">CheckTrust</p>
            <h1>Monitoring reputacji kontrahenta</h1>
          </div>
        </div>

        <nav className="top-actions" aria-label="Sekcje aplikacji">
          <a href="#analysis">Analiza</a>
          <a href="#evidence">Publikacje</a>
          <a href="#network">Graf</a>
        </nav>
      </header>

      <section className="command-band" id="analysis">
        <form className="search-console" onSubmit={handleSubmit}>
          <label className="field field-search" htmlFor="company-query">
            <span>Firma, NIP albo KRS</span>
            <div className="input-frame">
              <Icon name="search" />
              <input
                id="company-query"
                value={request.query}
                onChange={(event) => updateRequest("query", event.target.value)}
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
                updateRequest("depth", Number(event.target.value))
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
              onChange={(event) =>
                updateRequest("dateFrom", event.target.value)
              }
            />
          </label>

          <label className="field" htmlFor="date-to">
            <span>Do</span>
            <input
              id="date-to"
              type="date"
              value={request.dateTo}
              onChange={(event) => updateRequest("dateTo", event.target.value)}
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
            onChange={(checked) => updateOption("media", checked)}
          />
          <Toggle
            checked={request.options.registers}
            label="Rejestry"
            onChange={(checked) => updateOption("registers", checked)}
          />
          <Toggle
            checked={request.options.aiReview}
            label="AI review"
            onChange={(checked) => updateOption("aiReview", checked)}
          />
          <Toggle
            checked={request.options.cache}
            label="Cache"
            onChange={(checked) => updateOption("cache", checked)}
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
              onChange={handleAttachments}
            />
          </label>

          <StatusBadge state={apiState} label={notice} />
        </div>
      </section>

      <section className="overview-grid" aria-label="Wynik analizy">
        <CompanyPanel analysis={analysis} />

        <section className="panel risk-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Scoring reputacyjny</p>
              <h2>{riskLabel(analysis.score.level)}</h2>
            </div>
            <span className={`risk-badge risk-${analysis.score.level}`}>
              {analysis.score.value}/100
            </span>
          </div>

          <div className="score-layout">
            <RiskGauge score={analysis.score} />
            <div className="score-copy">
              <p>{analysis.summary}</p>
              <div className="metric-row">
                <Metric
                  label="Zmiana"
                  value={`${analysis.score.delta > 0 ? "+" : ""}${
                    analysis.score.delta
                  } pkt`}
                />
                <Metric
                  label="Pewność"
                  value={`${Math.round(analysis.score.confidence * 100)}%`}
                />
                <Metric
                  label="Top sygnał"
                  value={highestKeyword?.label ?? "brak"}
                />
              </div>
            </div>
          </div>

          <TrendChart points={analysis.history} />
        </section>

        <section className="panel sources-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Stan danych</p>
              <h2>Źródła i pipeline</h2>
            </div>
            <Icon name="database" />
          </div>
          <SourceList sources={analysis.sources} />
          <Pipeline steps={analysis.pipeline} />
        </section>
      </section>

      <section className="insight-grid">
        <section className="insight-section" ref={insightPanelRef}>
          <div className="section-heading">
            <div>
              <p className="eyebrow">Czynniki ryzyka</p>
              <h2>Słowa kluczowe i decyzje</h2>
            </div>
            <div className="export-actions">
              <button
                className="ghost-action"
                type="button"
                onClick={exportJson}
              >
                <Icon name="download" />
                JSON
              </button>
              <button
                className="ghost-action"
                type="button"
                onClick={() => window.print()}
              >
                <Icon name="file" />
                PDF
              </button>
              <a
                className="ghost-action"
                href={`mailto:?subject=${encodeURIComponent(
                  `CheckTrust: ${analysis.company.name}`
                )}&body=${encodeURIComponent(analysis.summary)}`}
              >
                <Icon name="mail" />
                Mail
              </a>
            </div>
          </div>

          <div className="keyword-grid">
            {analysis.riskKeywords.map((keyword) => (
              <KeywordBar key={keyword.label} keyword={keyword} />
            ))}
          </div>

          <div className="finding-grid">
            <FindingList title="Wnioski" items={analysis.keyFindings} />
            <FindingList
              title="Rekomendacje"
              items={analysis.recommendations}
            />
          </div>
        </section>

        <section className="network-panel" id="network">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Graf</p>
              <h2>Powiązania i replikacja scoringu</h2>
            </div>
            <span className="network-count">
              {analysis.graph.nodes.length} węzłów · {analysis.graph.edges.length}{' '}
              relacji
            </span>
          </div>
          <NetworkGraph graph={analysis.graph} />
        </section>
      </section>

      <section className="evidence-section" id="evidence">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Publikacje medialne</p>
            <h2>Artykuły wpływające na wynik</h2>
          </div>
          <span className="network-count">
            {analysis.articles.length} źródła
          </span>
        </div>

        <div className="article-grid">
          {analysis.articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>
    </main>
  );
}

function CompanyPanel({ analysis }: { analysis: CompanyAnalysis }) {
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

function RiskGauge({ score }: { score: ReputationScore }) {
  return (
    <div
      className={`risk-gauge risk-${score.level}`}
      style={{ "--score": `${score.value}%` } as CSSProperties}
      aria-label={`Scoring ${score.value} na 100`}
    >
      <div className="risk-gauge-body">
        <strong>{score.value}</strong>
        <span>/100</span>
      </div>
    </div>
  );
}

function TrendChart({ points }: { points: ScorePoint[] }) {
  const width = 640;
  const height = 190;
  const padX = 42;
  const padY = 24;
  const chartWidth = width - padX * 2;
  const chartHeight = height - padY * 2;
  const coordinates = points.map((point, index) => {
    const x =
      padX +
      (points.length === 1 ? 0 : (index / (points.length - 1)) * chartWidth);
    const y = padY + (1 - point.score / 100) * chartHeight;
    return { ...point, x, y };
  });
  const line = coordinates.map((point) => `${point.x},${point.y}`).join(" ");
  const area = `${padX},${height - padY} ${line} ${width - padX},${
    height - padY
  }`;

  return (
    <svg className="trend-chart" viewBox={`0 0 ${width} ${height}`} role="img">
      <title>Historia scoringu reputacyjnego</title>
      {[0, 50, 100].map((value) => {
        const y = padY + (1 - value / 100) * chartHeight;
        return (
          <g key={value}>
            <line x1={padX} x2={width - padX} y1={y} y2={y} />
            <text x={14} y={y + 5}>
              {value}
            </text>
          </g>
        );
      })}
      <polygon points={area} />
      <polyline points={line} />
      {coordinates.map((point) => (
        <g key={point.date}>
          <circle cx={point.x} cy={point.y} r="5" />
          <text x={point.x} y={height - 5} textAnchor="middle">
            {formatShortDate(point.date)}
          </text>
        </g>
      ))}
    </svg>
  );
}

function SourceList({ sources }: { sources: DataSource[] }) {
  return (
    <div className="source-list">
      {sources.map((source) => (
        <div className="source-item" key={source.name}>
          <div>
            <strong>{source.name}</strong>
            <span>{source.detail}</span>
          </div>
          <span className={`source-status status-${source.status}`}>
            {sourceStatusLabel(source.status)}
          </span>
          <div
            className="source-bar"
            style={
              { "--source-progress": `${source.coverage}%` } as CSSProperties
            }
          >
            <span />
          </div>
        </div>
      ))}
    </div>
  );
}

function Pipeline({ steps }: { steps: PipelineStep[] }) {
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

function KeywordBar({ keyword }: { keyword: RiskKeyword }) {
  return (
    <div className="keyword-item">
      <div>
        <strong>{keyword.label}</strong>
        <span>{keyword.count} wystąpień</span>
      </div>
      <div
        className="keyword-track"
        style={{ "--keyword-weight": `${keyword.weight}%` } as CSSProperties}
      >
        <span />
      </div>
      <b>{keyword.weight}</b>
    </div>
  );
}

function FindingList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="finding-list">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

const GRAPH_VIEWBOX = { width: 1120, height: 560 };
const DEFAULT_GRAPH_VIEWPORT = { x: 0, y: 0, scale: 1 };

type GraphViewport = typeof DEFAULT_GRAPH_VIEWPORT;
type GraphDrag = {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
};

function NetworkGraph({ graph }: { graph: CompanyAnalysis["graph"] }) {
  const [selectedNodeId, setSelectedNodeId] = useState(graph.nodes[0]?.id ?? "");
  const [viewport, setViewport] = useState<GraphViewport>(DEFAULT_GRAPH_VIEWPORT);
  const [isPanning, setIsPanning] = useState(false);
  const graphSvgRef = useRef<SVGSVGElement | null>(null);
  const detailsPanelRef = useRef<HTMLElement | null>(null);
  const dragRef = useRef<GraphDrag | null>(null);
  const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
  const selectedNode = nodeById.get(selectedNodeId) ?? graph.nodes[0];
  const selectedEdges = selectedNode
    ? graph.edges.filter(
        (edge) =>
          edge.source === selectedNode.id || edge.target === selectedNode.id,
      )
    : [];

  useEffect(() => {
    const svg = graphSvgRef.current;
    if (!svg) {
      return;
    }
    const svgElement = svg;

    function handleNativeWheel(event: WheelEvent) {
      event.preventDefault();
      const focus = getSvgPointFromClient(
        event.clientX,
        event.clientY,
        svgElement,
      );
      const factor = event.deltaY > 0 ? 0.88 : 1.14;
      setViewport((current) =>
        zoomViewport(current, current.scale * factor, focus),
      );
    }

    svgElement.addEventListener("wheel", handleNativeWheel, { passive: false });

    return () => {
      svgElement.removeEventListener("wheel", handleNativeWheel);
    };
  }, []);

  useContainedWheelScroll(detailsPanelRef, `${selectedNodeId}:${selectedEdges.length}`);

  function zoomTo(nextScale: number, focus = graphCenter()) {
    setViewport((current) => zoomViewport(current, nextScale, focus));
  }

  function handlePointerDown(event: PointerEvent<SVGSVGElement>) {
    if (event.button !== 0) {
      return;
    }

    if ((event.target as Element).closest(".network-node")) {
      return;
    }

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: viewport.x,
      originY: viewport.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsPanning(true);
  }

  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const dx = ((event.clientX - drag.startX) / rect.width) * GRAPH_VIEWBOX.width;
    const dy =
      ((event.clientY - drag.startY) / rect.height) * GRAPH_VIEWBOX.height;

    setViewport((current) => ({
      ...current,
      x: drag.originX + dx,
      y: drag.originY + dy,
    }));
  }

  function handlePointerEnd(event: PointerEvent<SVGSVGElement>) {
    if (dragRef.current?.pointerId !== event.pointerId) {
      return;
    }

    dragRef.current = null;
    setIsPanning(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <div className="network-workspace">
      <div className="network-map-shell">
        <div className="network-map-topline">
          <div className="network-legend" aria-label="Legenda grafu">
            {(['company', 'person', 'registry', 'article', 'keyword'] as const).map(
              (type) => (
                <span key={type}>
                  <MiniNodeIcon type={type} />
                  {graphNodeTypeLabel(type)}
                </span>
              ),
            )}
          </div>
          <div className="network-map-actions">
            <span className="network-hint">Kółko: zoom · przeciągnij tło: ruch</span>
            <div className="zoom-controls" aria-label="Sterowanie widokiem grafu">
              <button
                aria-label="Pomniejsz graf"
                onClick={() => zoomTo(viewport.scale * 0.82)}
                title="Pomniejsz"
                type="button"
              >
                <Icon name="zoom-out" />
              </button>
              <button
                aria-label="Resetuj widok grafu"
                onClick={() => setViewport(DEFAULT_GRAPH_VIEWPORT)}
                title="Resetuj widok"
                type="button"
              >
                <Icon name="target" />
              </button>
              <button
                aria-label="Powiększ graf"
                onClick={() => zoomTo(viewport.scale * 1.22)}
                title="Powiększ"
                type="button"
              >
                <Icon name="zoom-in" />
              </button>
            </div>
          </div>
        </div>

        <div className="network-canvas-scroll">
          <svg
            ref={graphSvgRef}
            className={`network-graph ${isPanning ? "is-panning" : ""}`}
            viewBox="0 0 1120 560"
            role="img"
            aria-label="Graf powiązań firmy, osób, artykułów i rejestrów"
            onPointerCancel={handlePointerEnd}
            onPointerDown={handlePointerDown}
            onPointerLeave={handlePointerEnd}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
          >
            <defs>
              {(['low', 'medium', 'high', 'critical'] as const).map((risk) => (
                <marker
                  id={`arrow-${risk}`}
                  key={risk}
                  markerHeight="10"
                  markerUnits="strokeWidth"
                  markerWidth="10"
                  orient="auto"
                  refX="8"
                  refY="5"
                  viewBox="0 0 10 10"
                >
                  <path className={`arrow-head risk-${risk}`} d="M0 0 10 5 0 10z" />
                </marker>
              ))}
            </defs>

            <g
              className="network-viewport"
              transform={`translate(${viewport.x} ${viewport.y}) scale(${viewport.scale})`}
            >
              {graph.edges.map((edge, index) => {
              const source = nodeById.get(edge.source)
              const target = nodeById.get(edge.target)
              if (!source || !target) {
                return null
              }

              const isSelected =
                selectedNode &&
                (edge.source === selectedNode.id || edge.target === selectedNode.id)
              const midpoint = edgeMidpoint(source, target, index)
              const risk = edge.risk ?? 'medium'

              return (
                <g
                  className={`network-edge-group ${isSelected ? 'is-active' : ''}`}
                  key={`${edge.source}-${edge.target}-${edge.label}`}
                >
                  <path
                    className={`network-edge risk-${risk}`}
                    d={edgePath(source, target, index)}
                    markerEnd={`url(#arrow-${risk})`}
                    strokeWidth={edgeWidth(edge)}
                  />
                  <text
                    className="network-edge-label"
                    x={midpoint.x}
                    y={midpoint.y}
                    textAnchor="middle"
                  >
                    {edge.label}
                  </text>
                </g>
              )
              })}

              {graph.nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id
              return (
                <g
                  aria-label={`${graphNodeTypeLabel(node.type)} ${node.label}`}
                  className={`network-node graph-${node.type} risk-${
                    node.risk ?? 'low'
                  } ${isSelected ? 'is-selected' : ''}`}
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      setSelectedNodeId(node.id)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  transform={`translate(${node.x} ${node.y})`}
                >
                  <circle className="node-hit-area" r={nodeRadius(node) + 26} />
                  <circle className="node-halo" r={nodeRadius(node) + 10} />
                  <GraphNodeGlyph type={node.type} />
                  <text className="network-node-label" textAnchor="middle">
                    {splitLabel(node.label).map((line, index) => (
                      <tspan
                        dy={index === 0 ? 0 : 15}
                        key={line}
                        x="0"
                        y={nodeRadius(node) + 24 + index * 15}
                      >
                        {line}
                      </tspan>
                    ))}
                  </text>
                  {node.meta ? (
                    <text
                      className="network-node-meta"
                      textAnchor="middle"
                      x="0"
                      y={nodeRadius(node) + 58}
                    >
                      {node.meta}
                    </text>
                  ) : null}
                </g>
              )
              })}
            </g>
          </svg>
        </div>
      </div>

      {selectedNode ? (
        <aside className="network-details" ref={detailsPanelRef}>
          <div className="selected-node-heading">
            <MiniNodeIcon type={selectedNode.type} />
            <div>
              <p className="micro-label">{graphNodeTypeLabel(selectedNode.type)}</p>
              <h3>{selectedNode.label}</h3>
            </div>
          </div>
          <p className="selected-node-description">
            {selectedNode.description ??
              'Węzeł z odpowiedzi backendu. Szczegóły pojawią się po dodaniu pól description, score albo meta.'}
          </p>

          <div className="network-detail-metrics">
            <Metric label="Ryzyko" value={riskLabel(selectedNode.risk ?? 'low')} />
            <Metric
              label="Score"
              value={
                selectedNode.score !== undefined
                  ? `${selectedNode.score}/100`
                  : 'brak'
              }
            />
            <Metric label="Relacje" value={`${selectedEdges.length}`} />
          </div>

          <div className="relation-list">
            <h3>Relacje</h3>
            <ul>
              {selectedEdges.map((edge) => {
                const otherId =
                  edge.source === selectedNode.id ? edge.target : edge.source
                const otherNode = nodeById.get(otherId)
                return (
                  <li key={`${edge.source}-${edge.target}-${edge.label}`}>
                    <span className={`relation-dot risk-${edge.risk ?? 'medium'}`} />
                    <div>
                      <strong>{edge.label}</strong>
                      <p>
                        {otherNode?.label ?? otherId}
                        {edge.evidence ? ` · ${edge.evidence} dow.` : ''}
                        {edge.strength !== undefined
                          ? ` · siła ${edge.strength}%`
                          : ''}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </aside>
      ) : null}
    </div>
  )
}

function graphCenter() {
  return {
    x: GRAPH_VIEWBOX.width / 2,
    y: GRAPH_VIEWBOX.height / 2,
  };
}

function getSvgPointFromClient(
  clientX: number,
  clientY: number,
  svg: SVGSVGElement,
) {
  const rect = svg.getBoundingClientRect();
  if (!rect.width || !rect.height) {
    return graphCenter();
  }

  return {
    x: ((clientX - rect.left) / rect.width) * GRAPH_VIEWBOX.width,
    y: ((clientY - rect.top) / rect.height) * GRAPH_VIEWBOX.height,
  };
}

function zoomViewport(
  viewport: GraphViewport,
  nextScale: number,
  focus: { x: number; y: number },
): GraphViewport {
  const scale = clampNumber(nextScale, 0.45, 2.8);
  const ratio = scale / viewport.scale;

  return {
    scale,
    x: focus.x - (focus.x - viewport.x) * ratio,
    y: focus.y - (focus.y - viewport.y) * ratio,
  };
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeWheelDelta(event: WheelEvent) {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
    return event.deltaY * 18;
  }

  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    return event.deltaY * 240;
  }

  return event.deltaY;
}

function MiniNodeIcon({ type }: { type: GraphNode['type'] }) {
  return (
    <svg className={`mini-node-icon graph-${type}`} viewBox="-24 -24 48 48">
      <GraphNodeGlyph type={type} />
    </svg>
  )
}

function GraphNodeGlyph({ type }: { type: GraphNode['type'] }) {
  if (type === 'person') {
    return (
      <g className="node-glyph person-glyph">
        <circle cx="0" cy="-12" r="9" />
        <path d="M-18 20c2-13 9-20 18-20s16 7 18 20Z" />
      </g>
    )
  }

  if (type === 'registry') {
    return (
      <g className="node-glyph registry-glyph">
        <ellipse cx="0" cy="-13" rx="18" ry="7" />
        <path d="M-18-13v24c0 4 8 7 18 7s18-3 18-7v-24" />
        <path d="M-18-1c0 4 8 7 18 7s18-3 18-7" />
      </g>
    )
  }

  if (type === 'article') {
    return (
      <g className="node-glyph article-glyph">
        <path d="M-15-20h20l10 10v30h-30Z" />
        <path d="M5-20v10h10" />
        <path d="M-8 2H8" />
        <path d="M-8 10H6" />
      </g>
    )
  }

  if (type === 'keyword') {
    return (
      <g className="node-glyph keyword-glyph">
        <path d="M-10-18-15 18" />
        <path d="M8-18 3 18" />
        <path d="M-18-6H15" />
        <path d="M-20 8H13" />
      </g>
    )
  }

  return (
    <g className="node-glyph company-glyph">
      <path d="M-18 20v-31l18-7 18 7v31" />
      <path d="M-7 20V7H7v13" />
      <path d="M-9-8h.1" />
      <path d="M0-8h.1" />
      <path d="M9-8h.1" />
      <path d="M-9 0h.1" />
      <path d="M0 0h.1" />
      <path d="M9 0h.1" />
    </g>
  )
}

function splitLabel(label: string) {
  const words = label.split(/\s+/)
  const lines: string[] = []

  words.forEach((word) => {
    const last = lines[lines.length - 1]
    if (!last || `${last} ${word}`.length > 16) {
      lines.push(word)
    } else {
      lines[lines.length - 1] = `${last} ${word}`
    }
  })

  return lines.slice(0, 2)
}

function nodeRadius(node: GraphNode) {
  return node.type === 'company' && node.id === 'company' ? 36 : 28
}

function edgePath(source: GraphNode, target: GraphNode, index: number) {
  const dx = target.x - source.x
  const dy = target.y - source.y
  const distance = Math.hypot(dx, dy) || 1
  const startRadius = nodeRadius(source) + 10
  const endRadius = nodeRadius(target) + 10
  const sx = source.x + (dx / distance) * startRadius
  const sy = source.y + (dy / distance) * startRadius
  const tx = target.x - (dx / distance) * endRadius
  const ty = target.y - (dy / distance) * endRadius
  const offset = ((index % 3) - 1) * Math.min(42, distance * 0.16)
  const nx = -dy / distance
  const ny = dx / distance
  const cx = (sx + tx) / 2 + nx * offset
  const cy = (sy + ty) / 2 + ny * offset

  return `M ${sx} ${sy} Q ${cx} ${cy} ${tx} ${ty}`
}

function edgeMidpoint(source: GraphNode, target: GraphNode, index: number) {
  const dx = target.x - source.x
  const dy = target.y - source.y
  const distance = Math.hypot(dx, dy) || 1
  const offset = ((index % 3) - 1) * Math.min(30, distance * 0.12)
  return {
    x: (source.x + target.x) / 2 + (-dy / distance) * offset,
    y: (source.y + target.y) / 2 + (dx / distance) * offset - 8,
  }
}

function edgeWidth(edge: GraphEdge) {
  return 1.3 + ((edge.strength ?? 50) / 100) * 2.2
}

function graphNodeTypeLabel(type: GraphNode['type']) {
  const labels: Record<GraphNode['type'], string> = {
    article: 'Artykuł',
    company: 'Firma',
    keyword: 'Sygnał',
    person: 'Osoba',
    registry: 'Rejestr',
  }
  return labels[type]
}

function ArticleCard({ article }: { article: Article }) {
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Toggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="toggle">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}

function StatusBadge({ state, label }: { state: ApiState; label: string }) {
  return (
    <div className={`api-badge api-${state}`}>
      <span aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

function Icon({ name }: { name: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 5 6v5c0 4.7 2.9 8.1 7 10 4.1-1.9 7-5.3 7-10V6l-7-3Z" />
          <path d="m9.4 12 1.7 1.7 3.7-4" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4 4" />
        </svg>
      );
    case "spark":
      return (
        <svg {...common}>
          <path d="M12 3v5" />
          <path d="M12 16v5" />
          <path d="M3 12h5" />
          <path d="M16 12h5" />
          <path d="m5.6 5.6 3.5 3.5" />
          <path d="m14.9 14.9 3.5 3.5" />
          <path d="m18.4 5.6-3.5 3.5" />
          <path d="m9.1 14.9-3.5 3.5" />
        </svg>
      );
    case "loader":
      return (
        <svg {...common} className="spin-icon">
          <path d="M21 12a9 9 0 0 1-9 9" />
          <path d="M3 12a9 9 0 0 1 9-9" />
        </svg>
      );
    case "paperclip":
      return (
        <svg {...common}>
          <path d="m21 10-9.3 9.3a5 5 0 0 1-7.1-7.1L14 2.8a3.2 3.2 0 0 1 4.5 4.5l-9.2 9.2a1.5 1.5 0 0 1-2.1-2.1l8.4-8.4" />
        </svg>
      );
    case "database":
      return (
        <svg {...common}>
          <ellipse cx="12" cy="5" rx="7" ry="3" />
          <path d="M5 5v7c0 1.7 3.1 3 7 3s7-1.3 7-3V5" />
          <path d="M5 12v7c0 1.7 3.1 3 7 3s7-1.3 7-3v-7" />
        </svg>
      );
    case "building":
      return (
        <svg {...common}>
          <path d="M4 21V5l8-3 8 3v16" />
          <path d="M9 21v-6h6v6" />
          <path d="M8 7h.1" />
          <path d="M12 7h.1" />
          <path d="M16 7h.1" />
          <path d="M8 11h.1" />
          <path d="M12 11h.1" />
          <path d="M16 11h.1" />
        </svg>
      );
    case "external":
      return (
        <svg {...common}>
          <path d="M14 4h6v6" />
          <path d="m10 14 10-10" />
          <path d="M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5" />
        </svg>
      );
    case "download":
      return (
        <svg {...common}>
          <path d="M12 3v12" />
          <path d="m7 10 5 5 5-5" />
          <path d="M5 21h14" />
        </svg>
      );
    case "file":
      return (
        <svg {...common}>
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
          <path d="M14 3v5h5" />
          <path d="M8 14h8" />
          <path d="M8 18h5" />
        </svg>
      );
    case "mail":
      return (
        <svg {...common}>
          <path d="M4 6h16v12H4z" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      );
    case "zoom-in":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4 4" />
          <path d="M11 8v6" />
          <path d="M8 11h6" />
        </svg>
      );
    case "zoom-out":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4 4" />
          <path d="M8 11h6" />
        </svg>
      );
    case "target":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="7" />
          <circle cx="12" cy="12" r="2" />
          <path d="M12 3v3" />
          <path d="M12 18v3" />
          <path d="M3 12h3" />
          <path d="M18 12h3" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
}

function riskLabel(level: RiskLevel) {
  const labels: Record<RiskLevel, string> = {
    low: "Niskie ryzyko",
    medium: "Umiarkowane ryzyko",
    high: "Podwyższone ryzyko",
    critical: "Krytyczne ryzyko",
  };
  return labels[level];
}

function sourceStatusLabel(status: SourceStatus) {
  const labels: Record<SourceStatus, string> = {
    fresh: "świeże",
    cached: "cache",
    pending: "oczekuje",
  };
  return labels[status];
}

function sentimentLabel(sentiment: Sentiment) {
  const labels: Record<Sentiment, string> = {
    positive: "pozytywny",
    neutral: "neutralny",
    negative: "negatywny",
  };
  return labels[sentiment];
}

function formatShortDate(date: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(date));
}

function formatFullDate(date: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function readError(error: unknown) {
  return error instanceof Error ? error.message : "Nieznany błąd";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9ąćęłńóśźż]+/gi, "-")
    .replace(/^-|-$/g, "");
}

export default App;
