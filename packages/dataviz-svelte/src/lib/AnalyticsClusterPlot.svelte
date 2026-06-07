<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type AnalyticsClusterPlotProps = {
    store: DashboardStore;
    viewId: string;
    fields: string[];
    k: number;
    maxIterations?: number;
    width?: number;
    height?: number;
    label: string;
    class?: string;
  };

  const TONES = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ca8a04', '#0891b2'];

  function scale(value: number, min: number, max: number, start: number, end: number): number {
    return max === min ? (start + end) / 2 : start + ((value - min) / (max - min)) * (end - start);
  }
</script>

<script lang="ts">
  import { buildAnalyticsClusterModel } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    fields,
    k,
    maxIterations,
    width = 360,
    height = 240,
    label,
    class: className,
  }: AnalyticsClusterPlotProps = $props();

  const dash = $derived(useDashboard(store));
  const model = $derived.by(() => {
    void $dash;
    return buildAnalyticsClusterModel(store.model, store.applyCrossfilter(viewId), { fields, k, maxIterations });
  });
  const centroids = $derived.by(() => {
    const xField = fields[0]!;
    const yField = fields[1] ?? fields[0]!;
    const xs = model.clusters.map((cluster) => cluster.centroid[xField] ?? 0);
    const ys = model.clusters.map((cluster) => cluster.centroid[yField] ?? 0);
    const minX = Math.min(0, ...xs);
    const maxX = Math.max(1, ...xs);
    const minY = Math.min(0, ...ys);
    const maxY = Math.max(1, ...ys);
    return model.clusters.map((cluster, index) => ({
      cluster,
      cx: scale(cluster.centroid[xField] ?? 0, minX, maxX, 32, width - 24),
      cy: scale(cluster.centroid[yField] ?? 0, minY, maxY, height - 28, 18),
      fill: TONES[index % TONES.length],
    }));
  });
</script>

<svg
  role="img"
  aria-label={label}
  class={['st-analyticsClusterPlot', className].filter(Boolean).join(' ')}
  {width}
  {height}
  viewBox="0 0 {width} {height}"
>
  <title>{label}</title>
  {#each centroids as item (item.cluster.id)}
    <circle
      class="st-analyticsClusterPlot__centroid"
      cx={item.cx}
      cy={item.cy}
      r={Math.max(5, Math.sqrt(item.cluster.count) * 5)}
      fill={item.fill}
      fill-opacity="0.82"
    >
      <title>{item.cluster.id}: {item.cluster.count}</title>
    </circle>
  {/each}
</svg>
