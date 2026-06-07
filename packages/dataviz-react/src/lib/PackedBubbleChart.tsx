import type { DashboardStore, PartWholeSort } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafePackedBubbleModel } from './partOfWholeData.js';

export type PackedBubbleChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  measure: string;
  sort?: PartWholeSort;
  width?: number;
  height?: number;
  label: string;
  className?: string;
};

const TONES = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ca8a04', '#0891b2', '#db2777', '#4f46e5'];

export function PackedBubbleChart({
  store,
  viewId,
  category,
  measure,
  sort = 'value-desc',
  width = 420,
  height = 320,
  label,
  className,
}: PackedBubbleChartProps) {
  const state = useDashboard(store);
  void state;

  const model = buildSafePackedBubbleModel(store.model, store.applyCrossfilter(viewId), { category, measure, sort });
  const columns = Math.max(1, Math.ceil(Math.sqrt(Math.max(1, model.bubbles.length))));
  const rows = Math.max(1, Math.ceil(Math.max(1, model.bubbles.length) / columns));
  const padding = 42;
  const cellWidth = (width - padding * 2) / columns;
  const cellHeight = (height - padding * 2) / rows;
  const maxValue = Math.max(1, ...model.bubbles.map((bubble) => bubble.value));

  return (
    <svg
      role="img"
      aria-label={label}
      className={['st-packedBubbleChart', className].filter(Boolean).join(' ') || undefined}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      <title>{label}</title>
      {model.bubbles.map((bubble, index) => {
        const column = index % columns;
        const row = Math.floor(index / columns);
        const cx = padding + cellWidth * (column + 0.5);
        const cy = padding + cellHeight * (row + 0.5);
        const radius = Math.sqrt(Math.max(0, bubble.value) / maxValue) * Math.min(cellWidth, cellHeight) * 0.38;
        return (
          <g key={bubble.key}>
            <circle
              className="st-packedBubbleChart__bubble"
              cx={cx}
              cy={cy}
              r={radius}
              fill={TONES[index % TONES.length]}
              fillOpacity="0.8"
            >
              <title>{`${bubble.label}: ${bubble.value}`}</title>
            </circle>
            <text x={cx} y={cy + 4} textAnchor="middle" fontSize="12" fill="white">
              {bubble.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
