import { buildForecastModel, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type ForecastLineChartProps = {
  store: DashboardStore;
  viewId: string;
  x: string;
  y: string;
  periods: number;
  step?: number;
  width?: number;
  height?: number;
  label: string;
  className?: string;
};

function scale(value: number, min: number, max: number, start: number, end: number): number {
  return max === min ? (start + end) / 2 : start + ((value - min) / (max - min)) * (end - start);
}

export function ForecastLineChart({
  store,
  viewId,
  x,
  y,
  periods,
  step,
  width = 360,
  height = 220,
  label,
  className,
}: ForecastLineChartProps) {
  const state = useDashboard(store);
  void state;
  const model = buildForecastModel(store.model, store.applyCrossfilter(viewId), { x, y, periods, step });
  const xs = model.points.map((point) => point.x);
  const ys = model.points.map((point) => point.y);
  const minX = Math.min(0, ...xs);
  const maxX = Math.max(1, ...xs);
  const minY = Math.min(0, ...ys);
  const maxY = Math.max(1, ...ys);
  const points = model.points.map((point) => ({
    x: scale(point.x, minX, maxX, 32, width - 24),
    y: scale(point.y, minY, maxY, height - 28, 18),
    raw: point,
  }));
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');

  return (
    <svg
      role="img"
      aria-label={label}
      className={['st-forecastLineChart', className].filter(Boolean).join(' ') || undefined}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      <title>{label}</title>
      {points.length > 1 ? <path className="st-forecastLineChart__line" d={path} fill="none" stroke="#9333ea" strokeWidth="2" strokeDasharray="5 4" /> : null}
      {points.map((point) => (
        <circle key={point.raw.x} className="st-forecastLineChart__point" cx={point.x} cy={point.y} r="4" fill="#9333ea">
          <title>{`${point.raw.x}: ${point.raw.y}`}</title>
        </circle>
      ))}
    </svg>
  );
}
