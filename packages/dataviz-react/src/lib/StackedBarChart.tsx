import { StackedBarChart as DsStackedBarChart } from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import {
  buildSafeCategoricalSeries,
  toStackedCategoricalData,
  type StackedMode,
} from './categoricalData.js';

export type StackedBarChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  series: string;
  measure: string;
  mode?: StackedMode;
  showLegend?: boolean;
  width?: number;
  height?: number;
  label: string;
  className?: string;
};

export function StackedBarChart({
  store,
  viewId,
  category,
  series,
  measure,
  mode = 'stacked',
  showLegend = true,
  width,
  height,
  label,
  className,
}: StackedBarChartProps) {
  const state = useDashboard(store);
  void state;

  const seriesModel = buildSafeCategoricalSeries(store.model, store.applyCrossfilter(viewId), {
    category,
    series,
    measures: [measure],
    mode,
  });
  const data = toStackedCategoricalData(seriesModel);

  return (
    <DsStackedBarChart
      data={data}
      label={label}
      showLegend={showLegend}
      width={width}
      height={height}
      className={className}
    />
  );
}
