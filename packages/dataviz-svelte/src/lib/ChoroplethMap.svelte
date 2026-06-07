<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type ChoroplethMapProps = {
    store: DashboardStore;
    viewId: string;
    region: string;
    measure: string;
    width?: number;
    height?: number;
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { buildChoroplethModel } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';
  import { GEO_TONES, scaleNumber } from './geoMapLayout.js';

  let {
    store,
    viewId,
    region,
    measure,
    width = 520,
    height = 260,
    label,
    class: className,
  }: ChoroplethMapProps = $props();

  const dash = $derived(useDashboard(store));
  const model = $derived.by(() => {
    void $dash;
    return buildChoroplethModel(store.model, store.applyCrossfilter(viewId), { region, measure });
  });
  const regions = $derived.by(() => {
    const columns = Math.max(1, Math.ceil(Math.sqrt(Math.max(1, model.regions.length))));
    const rowCount = Math.max(1, Math.ceil(model.regions.length / columns));
    const padding = 20;
    const cellWidth = (width - padding * 2) / columns;
    const cellHeight = (height - padding * 2) / rowCount;
    const max = Math.max(1, ...model.regions.map((item) => item.value));
    return model.regions.map((item, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      return {
        item,
        x: padding + column * cellWidth,
        y: padding + row * cellHeight,
        width: Math.max(0, cellWidth - 8),
        height: Math.max(0, cellHeight - 8),
        fill: GEO_TONES[index % GEO_TONES.length],
        opacity: scaleNumber(item.value, 0, max, 0.22, 0.9),
      };
    });
  });
</script>

<svg
  role="img"
  aria-label={label}
  class={['st-choroplethMap', className].filter(Boolean).join(' ')}
  {width}
  {height}
  viewBox="0 0 {width} {height}"
>
  <title>{label}</title>
  {#each regions as regionItem (regionItem.item.key)}
    <g>
      <rect
        class="st-choroplethMap__region"
        x={regionItem.x}
        y={regionItem.y}
        width={regionItem.width}
        height={regionItem.height}
        rx="4"
        fill={regionItem.fill}
        fill-opacity={regionItem.opacity}
      >
        <title>{regionItem.item.label}: {regionItem.item.value}</title>
      </rect>
      <text x={regionItem.x + 8} y={regionItem.y + 20} font-size="12" fill="currentColor">
        {regionItem.item.label}: {regionItem.item.value}
      </text>
    </g>
  {/each}
</svg>
