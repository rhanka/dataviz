import {
  AreaChart as DsAreaChart,
  type AreaChartTone,
} from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import {
  buildSimpleCategoricalSeries,
  toSimpleCategoricalPoints,
} from './categoricalData.js';

export type AreaChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  measure: string;
  tone?: AreaChartTone;
  smooth?: boolean;
  width?: number;
  height?: number;
  label: string;
  className?: string;
};

export function AreaChart({
  store,
  viewId,
  category,
  measure,
  tone,
  smooth = false,
  width,
  height,
  label,
  className,
}: AreaChartProps) {
  const state = useDashboard(store);
  void state;

  const seriesModel = buildSimpleCategoricalSeries(store.model, store.applyCrossfilter(viewId), category, measure);
  const data = toSimpleCategoricalPoints(seriesModel);

  return <DsAreaChart data={data} label={label} tone={tone} smooth={smooth} width={width} height={height} className={className} />;
}
