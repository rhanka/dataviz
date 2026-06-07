<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type GeoClusterMapProps = {
    store: DashboardStore;
    viewId: string;
    latitude: string;
    longitude: string;
    id?: string;
    value?: string;
    radius?: number;
    width?: number;
    height?: number;
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { buildGeoClusterModel } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';
  import { GEO_TONES, projectCoordinate, scaleNumber } from './geoMapLayout.js';

  let {
    store,
    viewId,
    latitude,
    longitude,
    id,
    value,
    radius,
    width = 520,
    height = 320,
    label,
    class: className,
  }: GeoClusterMapProps = $props();

  const dash = $derived(useDashboard(store));
  const model = $derived.by(() => {
    void $dash;
    return buildGeoClusterModel(store.model, store.applyCrossfilter(viewId), { latitude, longitude, id, value, radius });
  });
  const clusters = $derived.by(() => {
    const max = Math.max(1, ...model.clusters.map((cluster) => cluster.count));
    return model.clusters.map((cluster, index) => {
      const point = projectCoordinate(cluster, width, height);
      return {
        cluster,
        x: point.x,
        y: point.y,
        r: scaleNumber(cluster.count, 0, max, 8, 24),
        fill: GEO_TONES[index % GEO_TONES.length],
      };
    });
  });
</script>

<svg
  role="img"
  aria-label={label}
  class={['st-geoClusterMap', className].filter(Boolean).join(' ')}
  {width}
  {height}
  viewBox="0 0 {width} {height}"
>
  <title>{label}</title>
  {#each clusters as item (item.cluster.id)}
    <circle
      class="st-geoClusterMap__cluster"
      cx={item.x}
      cy={item.y}
      r={item.r}
      fill={item.fill}
      fill-opacity="0.78"
    >
      <title>{item.cluster.id}: {item.cluster.count}</title>
    </circle>
  {/each}
</svg>
