<script lang="ts" module>
  import type { DashboardStore, PartWholeSort } from '@sentropic/dataviz-core';

  export type PackedBubbleChartProps = {
    store: DashboardStore;
    viewId: string;
    category: string;
    measure: string;
    sort?: PartWholeSort;
    width?: number;
    height?: number;
    label: string;
    class?: string;
  };

  const TONES = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ca8a04', '#0891b2', '#db2777', '#4f46e5'];
</script>

<script lang="ts">
  import { useDashboard } from '../adapter.js';
  import { buildSafePackedBubbleModel } from './partOfWholeData.js';

  let {
    store,
    viewId,
    category,
    measure,
    sort = 'value-desc',
    width = 420,
    height = 320,
    label,
    class: className,
  }: PackedBubbleChartProps = $props();

  const dash = $derived(useDashboard(store));
  const model = $derived.by(() => {
    void $dash;
    return buildSafePackedBubbleModel(store.model, store.applyCrossfilter(viewId), { category, measure, sort });
  });
  const layout = $derived.by(() => {
    const columns = Math.max(1, Math.ceil(Math.sqrt(Math.max(1, model.bubbles.length))));
    const rows = Math.max(1, Math.ceil(Math.max(1, model.bubbles.length) / columns));
    const padding = 42;
    return {
      columns,
      padding,
      cellWidth: (width - padding * 2) / columns,
      cellHeight: (height - padding * 2) / rows,
      maxValue: Math.max(1, ...model.bubbles.map((bubble) => bubble.value)),
    };
  });
</script>

<svg
  role="img"
  aria-label={label}
  class={['st-packedBubbleChart', className].filter(Boolean).join(' ')}
  {width}
  {height}
  viewBox="0 0 {width} {height}"
>
  <title>{label}</title>
  {#each model.bubbles as bubble, index (bubble.key)}
    {@const column = index % layout.columns}
    {@const row = Math.floor(index / layout.columns)}
    {@const cx = layout.padding + layout.cellWidth * (column + 0.5)}
    {@const cy = layout.padding + layout.cellHeight * (row + 0.5)}
    {@const radius = Math.sqrt(Math.max(0, bubble.value) / layout.maxValue) * Math.min(layout.cellWidth, layout.cellHeight) * 0.38}
    <g>
      <circle
        class="st-packedBubbleChart__bubble"
        {cx}
        {cy}
        r={radius}
        fill={TONES[index % TONES.length]}
        fill-opacity="0.8"
      >
        <title>{bubble.label}: {bubble.value}</title>
      </circle>
      <text x={cx} y={cy + 4} text-anchor="middle" font-size="12" fill="white">
        {bubble.label}
      </text>
    </g>
  {/each}
</svg>
