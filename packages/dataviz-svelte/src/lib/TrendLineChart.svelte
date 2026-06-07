<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type TrendLineChartProps = {
    store: DashboardStore;
    viewId: string;
    x: string;
    y: string;
    width?: number;
    height?: number;
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { buildTrendLineModel } from '@sentropic/dataviz-core';
  import { LineChart as DsLineChart, type LineChartDatum } from '@sentropic/design-system-svelte';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    x,
    y,
    width = 360,
    height = 220,
    label,
    class: className,
  }: TrendLineChartProps = $props();

  const dash = $derived(useDashboard(store));
  const model = $derived.by(() => {
    void $dash;
    return buildTrendLineModel(store.model, store.applyCrossfilter(viewId), { x, y });
  });
  const data = $derived.by((): LineChartDatum[] => model.points.map((point) => ({ x: point.x, y: point.y })));
  const classes = $derived(['st-trendLineChart', className].filter(Boolean).join(' '));
</script>

<DsLineChart {data} {width} {height} {label} trend={true} class={classes} />
