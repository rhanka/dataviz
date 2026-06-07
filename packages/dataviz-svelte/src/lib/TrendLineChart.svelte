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

  function scale(value: number, min: number, max: number, start: number, end: number): number {
    return max === min ? (start + end) / 2 : start + ((value - min) / (max - min)) * (end - start);
  }
</script>

<script lang="ts">
  import { buildTrendLineModel } from '@sentropic/dataviz-core';
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
  const points = $derived.by(() => {
    const xs = model.points.map((point) => point.x);
    const ys = model.points.map((point) => point.y);
    const minX = Math.min(0, ...xs);
    const maxX = Math.max(1, ...xs);
    const minY = Math.min(0, ...ys);
    const maxY = Math.max(1, ...ys);
    return model.points.map((point) => ({
      x: scale(point.x, minX, maxX, 32, width - 24),
      y: scale(point.y, minY, maxY, height - 28, 18),
    }));
  });
</script>

<svg
  role="img"
  aria-label={label}
  class={['st-trendLineChart', className].filter(Boolean).join(' ')}
  {width}
  {height}
  viewBox="0 0 {width} {height}"
>
  <title>{label}</title>
  {#if points.length >= 2}
    <path
      class="st-trendLineChart__line"
      d={`M ${points[0]!.x} ${points[0]!.y} L ${points[1]!.x} ${points[1]!.y}`}
      fill="none"
      stroke="#2563eb"
      stroke-width="3"
    >
      <title>R2: {model.rSquared}</title>
    </path>
  {/if}
</svg>
