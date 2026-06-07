import { buildReferenceLineModel, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type ReferenceLineChartProps = {
  store: DashboardStore;
  viewId: string;
  value?: number;
  measure?: string;
  referenceId?: string;
  referenceLabel?: string;
  domainMin?: number;
  domainMax?: number;
  width?: number;
  height?: number;
  label: string;
  className?: string;
};

function scale(value: number, min: number, max: number, start: number, end: number): number {
  return max === min ? (start + end) / 2 : start + ((value - min) / (max - min)) * (end - start);
}

export function ReferenceLineChart({
  store,
  viewId,
  value,
  measure,
  referenceId,
  referenceLabel,
  domainMin,
  domainMax,
  width = 360,
  height = 96,
  label,
  className,
}: ReferenceLineChartProps) {
  const state = useDashboard(store);
  void state;
  const model = buildReferenceLineModel(store.model, store.applyCrossfilter(viewId), {
    id: referenceId,
    label: referenceLabel,
    value,
    measure,
  });
  const min = domainMin ?? Math.min(0, model.value);
  const max = domainMax ?? Math.max(1, model.value);
  const x = scale(model.value, min, max, 28, width - 28);

  return (
    <svg
      role="img"
      aria-label={label}
      className={['st-referenceLineChart', className].filter(Boolean).join(' ') || undefined}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      <title>{label}</title>
      <line x1="28" y1={height - 30} x2={width - 28} y2={height - 30} stroke="currentColor" strokeOpacity="0.25" />
      <line
        className="st-referenceLineChart__line"
        x1={x}
        y1="18"
        x2={x}
        y2={height - 24}
        stroke="#2563eb"
        strokeWidth="3"
      >
        <title>{`${model.label}: ${model.value}`}</title>
      </line>
      <text x={x} y="14" textAnchor="middle" fontSize="12" fill="currentColor">
        {model.label}: {model.value}
      </text>
    </svg>
  );
}
