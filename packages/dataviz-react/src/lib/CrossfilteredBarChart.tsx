import {
  BarChart,
  type BarChartDatum,
  type BarChartTone,
} from '@sentropic/design-system-react';
import {
  findDimension,
  findMeasure,
  groupAggregate,
  type DashboardStore,
} from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type CrossfilteredBarChartProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** This chart's view id in the cross-filter graph. */
  viewId: string;
  /** Dimension id to group rows by (one bar per distinct value). */
  dimension: string;
  /** Measure id to aggregate into each bar's value. */
  measure: string;
  /** Accessible label of the chart (required by the design-system BarChart). */
  label: string;
  /** Bar colour tone from the design system. */
  tone?: BarChartTone;
  orientation?: 'vertical' | 'horizontal';
  width?: number;
  height?: number;
  className?: string;
};

/**
 * A design-system `BarChart` whose data is the cross-filtered, aggregated view
 * of the shared store. Output-only for now: bar selection (brushing input)
 * awaits controlled-selection support in the design-system BarChart.
 */
export function CrossfilteredBarChart({
  store,
  viewId,
  dimension,
  measure,
  label,
  tone,
  orientation = 'vertical',
  width,
  height,
  className,
}: CrossfilteredBarChartProps) {
  // Subscribe so the chart re-renders (and re-aggregates) on every mutation.
  useDashboard(store);
  const dim = findDimension(store.model, dimension);
  const m = findMeasure(store.model, measure);
  const data: BarChartDatum[] =
    dim && m
      ? groupAggregate(store.applyCrossfilter(viewId), dimension, m).map(({ key, value }) =>
          tone ? { label: key, value, tone } : { label: key, value },
        )
      : [];
  return (
    <BarChart
      data={data}
      label={label}
      orientation={orientation}
      width={width}
      height={height}
      className={className}
    />
  );
}
