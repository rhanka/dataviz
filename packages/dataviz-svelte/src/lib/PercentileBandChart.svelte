<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type PercentileBandChartProps = {
    store: DashboardStore;
    viewId: string;
    value: string;
    lower: number;
    upper: number;
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
  import { buildPercentileBandModel } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    value,
    lower,
    upper,
    width = 360,
    height = 96,
    label,
    class: className,
  }: PercentileBandChartProps = $props();

  const dash = $derived(useDashboard(store));
  const model = $derived.by(() => {
    void $dash;
    return buildPercentileBandModel(store.model, store.applyCrossfilter(viewId), { value, lower, upper });
  });
  const min = $derived(Math.min(0, model.lowerValue, model.median, model.upperValue));
  const max = $derived(Math.max(1, model.lowerValue, model.median, model.upperValue));
  const x1 = $derived(scale(model.lowerValue, min, max, 28, width - 28));
  const x2 = $derived(scale(model.upperValue, min, max, 28, width - 28));
  const medianX = $derived(scale(model.median, min, max, 28, width - 28));
</script>

<svg
  role="img"
  aria-label={label}
  class={['st-percentileBandChart', className].filter(Boolean).join(' ')}
  {width}
  {height}
  viewBox="0 0 {width} {height}"
>
  <title>{label}</title>
  <line x1="28" y1={height / 2} x2={width - 28} y2={height / 2} stroke="currentColor" stroke-opacity="0.2" />
  <rect
    class="st-percentileBandChart__band"
    x={x1}
    y={height / 2 - 14}
    width={Math.max(0, x2 - x1)}
    height="28"
    fill="#16a34a"
    fill-opacity="0.28"
  >
    <title>{model.lowerValue}..{model.upperValue}</title>
  </rect>
  <line
    class="st-percentileBandChart__median"
    x1={medianX}
    y1="24"
    x2={medianX}
    y2={height - 24}
    stroke="#16a34a"
    stroke-width="2"
  />
</svg>
