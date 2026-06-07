import { buildAnalyticsClusterModel, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type AnalyticsClusterPlotProps = {
  store: DashboardStore;
  viewId: string;
  fields: string[];
  k: number;
  maxIterations?: number;
  width?: number;
  height?: number;
  label: string;
  className?: string;
};

const TONES = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ca8a04', '#0891b2'];

function scale(value: number, min: number, max: number, start: number, end: number): number {
  return max === min ? (start + end) / 2 : start + ((value - min) / (max - min)) * (end - start);
}

export function AnalyticsClusterPlot({
  store,
  viewId,
  fields,
  k,
  maxIterations,
  width = 360,
  height = 240,
  label,
  className,
}: AnalyticsClusterPlotProps) {
  const state = useDashboard(store);
  void state;
  const model = buildAnalyticsClusterModel(store.model, store.applyCrossfilter(viewId), { fields, k, maxIterations });
  const xField = fields[0]!;
  const yField = fields[1] ?? fields[0]!;
  const xs = model.clusters.map((cluster) => cluster.centroid[xField] ?? 0);
  const ys = model.clusters.map((cluster) => cluster.centroid[yField] ?? 0);
  const minX = Math.min(0, ...xs);
  const maxX = Math.max(1, ...xs);
  const minY = Math.min(0, ...ys);
  const maxY = Math.max(1, ...ys);

  return (
    <svg
      role="img"
      aria-label={label}
      className={['st-analyticsClusterPlot', className].filter(Boolean).join(' ') || undefined}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      <title>{label}</title>
      {model.clusters.map((cluster, index) => {
        const cx = scale(cluster.centroid[xField] ?? 0, minX, maxX, 32, width - 24);
        const cy = scale(cluster.centroid[yField] ?? 0, minY, maxY, height - 28, 18);
        return (
          <circle
            key={cluster.id}
            className="st-analyticsClusterPlot__centroid"
            cx={cx}
            cy={cy}
            r={Math.max(5, Math.sqrt(cluster.count) * 5)}
            fill={TONES[index % TONES.length]}
            fillOpacity="0.82"
          >
            <title>{`${cluster.id}: ${cluster.count}`}</title>
          </circle>
        );
      })}
    </svg>
  );
}
