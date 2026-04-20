import type { ScorePoint } from "../../types";
import { formatShortDate } from "../../utils/formatters";

export function TrendChart({ points }: { points: ScorePoint[] }) {
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
