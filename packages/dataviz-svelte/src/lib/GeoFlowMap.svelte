<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type GeoFlowMapProps = {
    store: DashboardStore;
    viewId: string;
    sourceLatitude: string;
    sourceLongitude: string;
    targetLatitude: string;
    targetLongitude: string;
    value?: string;
    width?: number;
    height?: number;
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { buildGeoFlowModel } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';
  import { projectCoordinate, scaleNumber } from './geoMapLayout.js';

  let {
    store,
    viewId,
    sourceLatitude,
    sourceLongitude,
    targetLatitude,
    targetLongitude,
    value,
    width = 520,
    height = 320,
    label,
    class: className,
  }: GeoFlowMapProps = $props();

  const dash = $derived(useDashboard(store));
  const model = $derived.by(() => {
    void $dash;
    return buildGeoFlowModel(store.model, store.applyCrossfilter(viewId), {
      sourceLatitude,
      sourceLongitude,
      targetLatitude,
      targetLongitude,
      value,
    });
  });
  const links = $derived.by(() => {
    const max = Math.max(1, ...model.links.map((link) => link.value));
    return model.links.map((link) => ({
      link,
      source: projectCoordinate(link.source, width, height),
      target: projectCoordinate(link.target, width, height),
      strokeWidth: scaleNumber(link.value, 0, max, 2, 9),
    }));
  });
</script>

<svg
  role="img"
  aria-label={label}
  class={['st-geoFlowMap', className].filter(Boolean).join(' ')}
  {width}
  {height}
  viewBox="0 0 {width} {height}"
>
  <title>{label}</title>
  {#each links as item (item.link.id)}
    <line
      class="st-geoFlowMap__link"
      x1={item.source.x}
      y1={item.source.y}
      x2={item.target.x}
      y2={item.target.y}
      stroke="#2563eb"
      stroke-width={item.strokeWidth}
      stroke-linecap="round"
      stroke-opacity="0.62"
    >
      <title>{item.link.count} flows: {item.link.value}</title>
    </line>
  {/each}
</svg>
