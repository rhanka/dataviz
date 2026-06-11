import {
  ComboChart as DsComboChart,
  type ComboChartBarSeries,
  type ComboChartLineSeries,
} from '@sentropic/design-system-react';
import type {
  CategoricalMeasureInput,
  CategoricalMode,
  DashboardStore,
} from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafeCategoricalSeries } from './categoricalData.js';

export type ComboChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  measures: CategoricalMeasureInput[];
  series?: string;
  mode?: CategoricalMode;
  leftAxisLabel?: string;
  rightAxisLabel?: string;
  legend?: boolean;
  hiddenSeries?: string[];
  onToggleSeries?: (seriesId: string) => void;
  width?: number;
  height?: number;
  label: string;
  className?: string;
};

export function ComboChart({
  store,
  viewId,
  category,
  measures,
  series,
  mode = 'grouped',
  leftAxisLabel,
  rightAxisLabel,
  legend = true,
  hiddenSeries,
  onToggleSeries,
  width,
  height,
  label,
  className,
}: ComboChartProps) {
  const state = useDashboard(store);
  void state;

  const seriesModel = buildSafeCategoricalSeries(store.model, store.applyCrossfilter(viewId), {
    category,
    series,
    measures,
    mode,
  });
  const bars: ComboChartBarSeries[] = seriesModel.series
    .filter((item) => item.mark === 'bar')
    .map((item) => ({ label: item.label, data: item.values }));
  const lines: ComboChartLineSeries[] = seriesModel.series
    .filter((item) => item.mark === 'line')
    .map((item) => ({ label: item.label, data: item.values }));

  return (
    <DsComboChart
      categories={seriesModel.categories}
      bars={bars}
      lines={lines}
      leftAxisLabel={leftAxisLabel}
      rightAxisLabel={rightAxisLabel}
      legend={legend}
      hiddenSeries={hiddenSeries}
      onToggleSeries={onToggleSeries}
      width={width}
      height={height}
      label={label}
      className={className}
    />
  );
}
