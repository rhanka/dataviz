<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

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
    class?: string;
  };

  function scale(value: number, min: number, max: number, start: number, end: number): number {
    return max === min ? (start + end) / 2 : start + ((value - min) / (max - min)) * (end - start);
  }
</script>

<script lang="ts">
  import { buildForecastModel } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    x,
    y,
    periods,
    step,
    width = 360,
    height = 220,
    label,
    class: className,
  }: ForecastLineChartProps = $props();

  const dash = $derived(useDashboard(store));
  const model = $derived.by(() => {
    void $dash;
    return buildForecastModel(store.model, store.applyCrossfilter(viewId), { x, y, periods, step });
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
      raw: point,
    }));
  });
  const path = $derived(points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' '));
</script>

<svg
  role="img"
  aria-label={label}
  class={['st-forecastLineChart', className].filter(Boolean).join(' ')}
  {width}
  {height}
  viewBox="0 0 {width} {height}"
>
  <title>{label}</title>
  {#if points.length > 1}
    <path
      class="st-forecastLineChart__line"
      d={path}
      fill="none"
      stroke="#9333ea"
      stroke-width="2"
      stroke-dasharray="5 4"
    />
  {/if}
  {#each points as point, index (`${point.raw.x}:${index}`)}
    <circle class="st-forecastLineChart__point" cx={point.x} cy={point.y} r="4" fill="#9333ea">
      <title>{point.raw.x}: {point.raw.y}</title>
    </circle>
  {/each}
</svg>
