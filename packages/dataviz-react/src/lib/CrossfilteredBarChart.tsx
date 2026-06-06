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
  /**
   * When true (default) clicking a bar toggles this view's selection (brushing
   * input → `store.toggleSelection`); selected bars are highlighted. Set false
   * for an output-only facet.
   */
  selectable?: boolean;
  /** Fixed value-axis domain `[min, max]` for a shared scale across facets. */
  domain?: [number, number];
  orientation?: 'vertical' | 'horizontal';
  width?: number;
  height?: number;
  className?: string;
};

/**
 * A design-system `BarChart` whose data is the cross-filtered, aggregated view
 * of the shared store. Clicking a bar brushes this view's selection (unless
 * `selectable` is false), and the chart re-aggregates as the shared state moves.
 */
export function CrossfilteredBarChart({
  store,
  viewId,
  dimension,
  measure,
  label,
  tone,
  selectable = true,
  domain,
  orientation = 'vertical',
  width,
  height,
  className,
}: CrossfilteredBarChartProps) {
  const state = useDashboard(store);
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
      domain={domain}
      className={className}
      selectedKeys={selectable ? (state.selections[viewId] ?? []) : []}
      onSelect={selectable ? (key) => store.toggleSelection(viewId, key) : undefined}
    />
  );
}
