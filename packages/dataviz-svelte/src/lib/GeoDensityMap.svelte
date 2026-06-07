<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type GeoDensityMapProps = {
    store: DashboardStore;
    viewId: string;
    latitude: string;
    longitude: string;
    value?: string;
    cellSize?: number;
    width?: number;
    height?: number;
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { buildGeoDensityModel } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';
  import { projectCoordinate, scaleNumber } from './geoMapLayout.js';

  let {
    store,
    viewId,
    latitude,
    longitude,
    value,
    cellSize,
    width = 520,
    height = 320,
    label,
    class: className,
  }: GeoDensityMapProps = $props();

  const dash = $derived(useDashboard(store));
  const model = $derived.by(() => {
    void $dash;
    return buildGeoDensityModel(store.model, store.applyCrossfilter(viewId), { latitude, longitude, value, cellSize });
  });
  const cells = $derived.by(() => {
    const max = Math.max(1, ...model.cells.map((cell) => cell.density));
    return model.cells.map((cell) => {
      const point = projectCoordinate(cell.center, width, height);
      const size = scaleNumber(cell.density, 0, max, 16, 34);
      return { cell, x: point.x - size / 2, y: point.y - size / 2, size };
    });
  });
</script>

<svg
  role="img"
  aria-label={label}
  class={['st-geoDensityMap', className].filter(Boolean).join(' ')}
  {width}
  {height}
  viewBox="0 0 {width} {height}"
>
  <title>{label}</title>
  {#each cells as item (item.cell.id)}
    <rect
      class="st-geoDensityMap__cell"
      x={item.x}
      y={item.y}
      width={item.size}
      height={item.size}
      fill="#dc2626"
      fill-opacity="0.5"
    >
      <title>{item.cell.id}: {item.cell.density}</title>
    </rect>
  {/each}
</svg>
