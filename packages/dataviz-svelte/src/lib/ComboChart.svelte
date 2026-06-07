<script lang="ts" module>
  import type {
    CategoricalMeasureInput,
    CategoricalMode,
    DashboardStore,
  } from '@sentropic/dataviz-core';

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
    width?: number;
    height?: number;
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import {
    ComboChart as DsComboChart,
    type ComboChartBarSeries,
    type ComboChartLineSeries,
  } from '@sentropic/design-system-svelte';
  import { useDashboard } from '../adapter.js';
  import { buildSafeCategoricalSeries } from './categoricalData.js';

  let {
    store,
    viewId,
    category,
    measures,
    series,
    mode = 'grouped',
    leftAxisLabel,
    rightAxisLabel,
    legend = true,
    width,
    height,
    label,
    class: className,
  }: ComboChartProps = $props();

  const dash = $derived(useDashboard(store));
  const seriesModel = $derived.by(() => {
    void $dash;
    return buildSafeCategoricalSeries(store.model, store.applyCrossfilter(viewId), {
      category,
      series,
      measures,
      mode,
    });
  });
  const bars = $derived.by(
    (): ComboChartBarSeries[] =>
      seriesModel.series
        .filter((item) => item.mark === 'bar')
        .map((item) => ({ label: item.label, data: item.values })),
  );
  const lines = $derived.by(
    (): ComboChartLineSeries[] =>
      seriesModel.series
        .filter((item) => item.mark === 'line')
        .map((item) => ({ label: item.label, data: item.values })),
  );
</script>

<DsComboChart
  categories={seriesModel.categories}
  {bars}
  {lines}
  {leftAxisLabel}
  {rightAxisLabel}
  {legend}
  {width}
  {height}
  {label}
  class={className}
/>
