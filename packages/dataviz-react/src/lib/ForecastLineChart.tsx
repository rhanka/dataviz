import type { DashboardStore } from '@sentropic/dataviz-core';
import { LineChart } from '@sentropic/design-system-react';
import { useDashboard } from '../adapter.js';
import { buildForecastLineData } from './analyticsDsData.js';

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
  const data = buildForecastLineData(store.model, store.applyCrossfilter(viewId), { x, y, periods, step });

  return (
    <LineChart
      data={data}
      width={width}
      height={height}
      label={label}
      className={['st-forecastLineChart', className].filter(Boolean).join(' ') || undefined}
    />
  );
}
