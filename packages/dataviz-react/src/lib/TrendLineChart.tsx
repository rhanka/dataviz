import { buildTrendLineModel, type DashboardStore } from '@sentropic/dataviz-core';
import { LineChart, type LineChartDatum } from '@sentropic/design-system-react';
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

export function TrendLineChart({ store, viewId, x, y, width = 360, height = 220, label, className }: TrendLineChartProps) {
  const state = useDashboard(store);
  void state;
  const model = buildTrendLineModel(store.model, store.applyCrossfilter(viewId), { x, y });
  const data: LineChartDatum[] = model.points.map((point) => ({ x: point.x, y: point.y }));

  return (
    <LineChart
      data={data}
      width={width}
      height={height}
      label={label}
      trend
      className={['st-trendLineChart', className].filter(Boolean).join(' ') || undefined}
    />
  );
}
