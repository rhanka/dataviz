import { buildTrendLineModel, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type TrendLineChartProps = {
  store: DashboardStore;
  viewId: string;
  x: string;
  y: string;
  width?: number;
  height?: number;
  label: string;
  className?: string;
};

function scale(value: number, min: number, max: number, start: number, end: number): number {
  return max === min ? (start + end) / 2 : start + ((value - min) / (max - min)) * (end - start);
}

export function TrendLineChart({ store, viewId, x, y, width = 360, height = 220, label, className }: TrendLineChartProps) {
  const state = useDashboard(store);
  void state;
  const model = buildTrendLineModel(store.model, store.applyCrossfilter(viewId), { x, y });
  const xs = model.points.map((point) => point.x);
  const ys = model.points.map((point) => point.y);
  const minX = Math.min(0, ...xs);
  const maxX = Math.max(1, ...xs);
  const minY = Math.min(0, ...ys);
  const maxY = Math.max(1, ...ys);
  const points = model.points.map((point) => ({
    x: scale(point.x, minX, maxX, 32, width - 24),
    y: scale(point.y, minY, maxY, height - 28, 18),
  }));

  return (
    <svg
      role="img"
      aria-label={label}
      className={['st-trendLineChart', className].filter(Boolean).join(' ') || undefined}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      <title>{label}</title>
      {points.length >= 2 ? (
        <path
          className="st-trendLineChart__line"
          d={`M ${points[0]!.x} ${points[0]!.y} L ${points[1]!.x} ${points[1]!.y}`}
          fill="none"
          stroke="#2563eb"
          strokeWidth="3"
        >
          <title>{`R2: ${model.rSquared}`}</title>
        </path>
      ) : null}
    </svg>
  );
}
