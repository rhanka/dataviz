<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type ErrorBarsChartProps = {
    store: DashboardStore;
    viewId: string;
    category: string;
    value: string;
    interval?: 'stdev' | 'stderr';
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
  import { buildErrorBarsModel } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    category,
    value,
    interval,
    width = 420,
    height = 240,
    label,
    class: className,
  }: ErrorBarsChartProps = $props();

  const dash = $derived(useDashboard(store));
  const model = $derived.by(() => {
    void $dash;
    return buildErrorBarsModel(store.model, store.applyCrossfilter(viewId), { category, value, interval });
  });
  const layout = $derived.by(() => {
    const min = Math.min(0, ...model.items.map((item) => item.lower));
    const max = Math.max(1, ...model.items.map((item) => item.upper));
    const step = (width - 64) / Math.max(1, model.items.length);
    return { min, max, step };
  });
</script>

<svg
  role="img"
  aria-label={label}
  class={['st-errorBarsChart', className].filter(Boolean).join(' ')}
  {width}
  {height}
  viewBox="0 0 {width} {height}"
>
  <title>{label}</title>
  {#each model.items as item, index (item.key)}
    {@const x = 32 + layout.step * (index + 0.5)}
    {@const y1 = scale(item.upper, layout.min, layout.max, height - 32, 18)}
    {@const y2 = scale(item.lower, layout.min, layout.max, height - 32, 18)}
    {@const meanY = scale(item.mean, layout.min, layout.max, height - 32, 18)}
    <g>
      <line class="st-errorBarsChart__bar" x1={x} y1={y1} x2={x} y2={y2} stroke="#2563eb" stroke-width="3">
        <title>{item.label}: mean {item.mean}</title>
      </line>
      <circle cx={x} cy={meanY} r="4" fill="#2563eb" />
      <text x={x} y={height - 8} text-anchor="middle" font-size="12" fill="currentColor">
        {item.label}: mean {item.mean}
      </text>
    </g>
  {/each}
</svg>
