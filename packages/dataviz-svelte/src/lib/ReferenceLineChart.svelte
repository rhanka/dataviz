<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type ReferenceLineChartProps = {
    store: DashboardStore;
    viewId: string;
    value?: number;
    measure?: string;
    referenceId?: string;
    referenceLabel?: string;
    domainMin?: number;
    domainMax?: number;
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
  import { buildReferenceLineModel } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    value,
    measure,
    referenceId,
    referenceLabel,
    domainMin,
    domainMax,
    width = 360,
    height = 96,
    label,
    class: className,
  }: ReferenceLineChartProps = $props();

  const dash = $derived(useDashboard(store));
  const model = $derived.by(() => {
    void $dash;
    return buildReferenceLineModel(store.model, store.applyCrossfilter(viewId), {
      id: referenceId,
      label: referenceLabel,
      value,
      measure,
    });
  });
  const min = $derived(domainMin ?? Math.min(0, model.value));
  const max = $derived(domainMax ?? Math.max(1, model.value));
  const x = $derived(scale(model.value, min, max, 28, width - 28));
</script>

<svg
  role="img"
  aria-label={label}
  class={['st-referenceLineChart', className].filter(Boolean).join(' ')}
  {width}
  {height}
  viewBox="0 0 {width} {height}"
>
  <title>{label}</title>
  <line x1="28" y1={height - 30} x2={width - 28} y2={height - 30} stroke="currentColor" stroke-opacity="0.25" />
  <line
    class="st-referenceLineChart__line"
    x1={x}
    y1="18"
    x2={x}
    y2={height - 24}
    stroke="#2563eb"
    stroke-width="3"
  >
    <title>{model.label}: {model.value}</title>
  </line>
  <text x={x} y="14" text-anchor="middle" font-size="12" fill="currentColor">
    {model.label}: {model.value}
  </text>
</svg>
