import { buildPercentileBandModel, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type PercentileBandChartProps = {
  store: DashboardStore;
  viewId: string;
  value: string;
  lower: number;
  upper: number;
  width?: number;
  height?: number;
  label: string;
  className?: string;
};

function scale(value: number, min: number, max: number, start: number, end: number): number {
  return max === min ? (start + end) / 2 : start + ((value - min) / (max - min)) * (end - start);
}

export function PercentileBandChart({
  store,
  viewId,
  value,
  lower,
  upper,
  width = 360,
  height = 96,
  label,
  className,
}: PercentileBandChartProps) {
  const state = useDashboard(store);
  void state;
  const model = buildPercentileBandModel(store.model, store.applyCrossfilter(viewId), { value, lower, upper });
  const min = Math.min(0, model.lowerValue, model.median, model.upperValue);
  const max = Math.max(1, model.lowerValue, model.median, model.upperValue);
  const x1 = scale(model.lowerValue, min, max, 28, width - 28);
  const x2 = scale(model.upperValue, min, max, 28, width - 28);
  const medianX = scale(model.median, min, max, 28, width - 28);

  return (
    <svg
      role="img"
      aria-label={label}
      className={['st-percentileBandChart', className].filter(Boolean).join(' ') || undefined}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      <title>{label}</title>
      <line x1="28" y1={height / 2} x2={width - 28} y2={height / 2} stroke="currentColor" strokeOpacity="0.2" />
      <rect
        className="st-percentileBandChart__band"
        x={x1}
        y={height / 2 - 14}
        width={Math.max(0, x2 - x1)}
        height="28"
        fill="#16a34a"
        fillOpacity="0.28"
      >
        <title>{`${model.lowerValue}..${model.upperValue}`}</title>
      </rect>
      <line className="st-percentileBandChart__median" x1={medianX} y1="24" x2={medianX} y2={height - 24} stroke="#16a34a" strokeWidth="2" />
    </svg>
  );
}
