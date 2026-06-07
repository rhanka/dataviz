<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type GeoHexbinMapProps = {
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
  import { buildGeoHexbinModel } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';
  import { GEO_TONES, hexagonPoints, projectCoordinate, scaleNumber } from './geoMapLayout.js';

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
  }: GeoHexbinMapProps = $props();

  const dash = $derived(useDashboard(store));
  const model = $derived.by(() => {
    void $dash;
    return buildGeoHexbinModel(store.model, store.applyCrossfilter(viewId), { latitude, longitude, value, cellSize });
  });
  const bins = $derived.by(() => {
    const max = Math.max(1, ...model.bins.map((bin) => bin.value));
    return model.bins.map((bin, index) => {
      const point = projectCoordinate(bin.center, width, height);
      return {
        bin,
        points: hexagonPoints(point.x, point.y, scaleNumber(bin.value, 0, max, 10, 22)),
        fill: GEO_TONES[index % GEO_TONES.length],
      };
    });
  });
</script>

<svg
  role="img"
  aria-label={label}
  class={['st-geoHexbinMap', className].filter(Boolean).join(' ')}
  {width}
  {height}
  viewBox="0 0 {width} {height}"
>
  <title>{label}</title>
  {#each bins as item (item.bin.id)}
    <polygon class="st-geoHexbinMap__bin" points={item.points} fill={item.fill} fill-opacity="0.72">
      <title>{item.bin.id}: {item.bin.value}</title>
    </polygon>
  {/each}
</svg>
