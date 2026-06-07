import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafeRoseModel } from './partOfWholeData.js';

export type RoseChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  measure: string;
  width?: number;
  height?: number;
  label: string;
  className?: string;
};

const TONES = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ca8a04', '#0891b2', '#db2777', '#4f46e5'];

function polarPoint(cx: number, cy: number, radius: number, angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function sectorPath(cx: number, cy: number, radius: number, startAngle: number, endAngle: number): string {
  const start = polarPoint(cx, cy, radius, startAngle);
  const end = polarPoint(cx, cy, radius, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

export function RoseChart({
  store,
  viewId,
  category,
  measure,
  width = 360,
  height = 360,
  label,
  className,
}: RoseChartProps) {
  const state = useDashboard(store);
  void state;

  const model = buildSafeRoseModel(store.model, store.applyCrossfilter(viewId), { category, measure });
  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = Math.max(0, Math.min(width, height) * 0.38);
  const maxValue = Math.max(1, ...model.sectors.map((sector) => sector.value));

  return (
    <svg
      role="img"
      aria-label={label}
      className={['st-roseChart', className].filter(Boolean).join(' ') || undefined}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      <title>{label}</title>
      <circle cx={cx} cy={cy} r={maxRadius} fill="none" stroke="currentColor" strokeOpacity="0.18" />
      {model.sectors.map((sector, index) => {
        const radius = Math.sqrt(Math.max(0, sector.value) / maxValue) * maxRadius;
        const labelPoint = polarPoint(cx, cy, radius + 18, (sector.startAngle + sector.endAngle) / 2);
        return (
          <g key={sector.key}>
            <path
              className="st-roseChart__sector"
              d={sectorPath(cx, cy, radius, sector.startAngle, sector.endAngle)}
              fill={TONES[index % TONES.length]}
              fillOpacity="0.78"
              stroke="white"
              strokeWidth="1"
            >
              <title>{`${sector.label}: ${sector.value}`}</title>
            </path>
            <text x={labelPoint.x} y={labelPoint.y} textAnchor="middle" fontSize="12" fill="currentColor">
              {sector.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
