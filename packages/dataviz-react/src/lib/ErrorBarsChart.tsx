import { buildErrorBarsModel, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type ErrorBarsChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  value: string;
  interval?: 'stdev' | 'stderr';
  width?: number;
  height?: number;
  label: string;
  className?: string;
};

function scale(value: number, min: number, max: number, start: number, end: number): number {
  return max === min ? (start + end) / 2 : start + ((value - min) / (max - min)) * (end - start);
}

export function ErrorBarsChart({
  store,
  viewId,
  category,
  value,
  interval,
  width = 420,
  height = 240,
  label,
  className,
}: ErrorBarsChartProps) {
  const state = useDashboard(store);
  void state;
  const model = buildErrorBarsModel(store.model, store.applyCrossfilter(viewId), { category, value, interval });
  const min = Math.min(0, ...model.items.map((item) => item.lower));
  const max = Math.max(1, ...model.items.map((item) => item.upper));
  const step = (width - 64) / Math.max(1, model.items.length);

  return (
    <svg
      role="img"
      aria-label={label}
      className={['st-errorBarsChart', className].filter(Boolean).join(' ') || undefined}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      <title>{label}</title>
      {model.items.map((item, index) => {
        const x = 32 + step * (index + 0.5);
        const y1 = scale(item.upper, min, max, height - 32, 18);
        const y2 = scale(item.lower, min, max, height - 32, 18);
        const meanY = scale(item.mean, min, max, height - 32, 18);
        return (
          <g key={item.key}>
            <line className="st-errorBarsChart__bar" x1={x} y1={y1} x2={x} y2={y2} stroke="#2563eb" strokeWidth="3">
              <title>{`${item.label}: mean ${item.mean}`}</title>
            </line>
            <circle cx={x} cy={meanY} r="4" fill="#2563eb" />
            <text x={x} y={height - 8} textAnchor="middle" fontSize="12" fill="currentColor">
              {item.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
