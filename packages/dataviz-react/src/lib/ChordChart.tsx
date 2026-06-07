import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafeFlowModel } from './partOfWholeData.js';

export type ChordChartProps = {
  store: DashboardStore;
  viewId: string;
  source: string;
  target: string;
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

export function ChordChart({
  store,
  viewId,
  source,
  target,
  measure,
  width = 480,
  height = 360,
  label,
  className,
}: ChordChartProps) {
  const state = useDashboard(store);
  void state;

  const model = buildSafeFlowModel(store.model, store.applyCrossfilter(viewId), { source, target, measure });
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.max(0, Math.min(width, height) * 0.34);
  const maxValue = Math.max(1, ...model.links.map((link) => link.value));
  const nodes = model.nodes.map((node, index) => ({
    ...node,
    tone: TONES[index % TONES.length]!,
    point: polarPoint(cx, cy, radius, (360 / Math.max(1, model.nodes.length)) * index),
  }));
  const nodeById = new Map(nodes.map((node) => [node.id, node]));

  return (
    <svg
      role="img"
      aria-label={label}
      className={['st-chordChart', className].filter(Boolean).join(' ') || undefined}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      <title>{label}</title>
      {model.links.map((link, index) => {
        const sourceNode = nodeById.get(link.source);
        const targetNode = nodeById.get(link.target);
        if (!sourceNode || !targetNode) return null;
        const strokeWidth = 1 + Math.sqrt(Math.max(0, link.value) / maxValue) * 12;
        const tone = TONES[index % TONES.length]!;
        return (
          <path
            key={link.id}
            className="st-chordChart__ribbon"
            d={`M ${sourceNode.point.x} ${sourceNode.point.y} Q ${cx} ${cy} ${targetNode.point.x} ${targetNode.point.y}`}
            fill="none"
            stroke={tone}
            strokeOpacity="0.42"
            strokeLinecap="round"
            strokeWidth={strokeWidth}
          >
            <title>{`${sourceNode.label} -> ${targetNode.label}: ${link.value}`}</title>
          </path>
        );
      })}
      {nodes.map((node) => (
        <g key={node.id} className="st-chordChart__node">
          <circle cx={node.point.x} cy={node.point.y} r="7" fill={node.tone} />
          <text
            x={node.point.x}
            y={node.point.y + (node.point.y < cy ? -12 : 20)}
            textAnchor="middle"
            fontSize="12"
            fill="currentColor"
          >
            {node.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
