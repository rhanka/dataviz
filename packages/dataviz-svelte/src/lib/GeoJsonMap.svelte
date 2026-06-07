<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type GeoJsonMapProps = {
    store: DashboardStore;
    viewId: string;
    geometry: string;
    id?: string;
    labelField?: string;
    value?: string;
    width?: number;
    height?: number;
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { buildGeoJsonLayerModel } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';
  import { GEO_TONES, geometryPath } from './geoMapLayout.js';

  let {
    store,
    viewId,
    geometry,
    id,
    labelField,
    value,
    width = 520,
    height = 320,
    label,
    class: className,
  }: GeoJsonMapProps = $props();

  const dash = $derived(useDashboard(store));
  const model = $derived.by(() => {
    void $dash;
    return buildGeoJsonLayerModel(store.model, store.applyCrossfilter(viewId), {
      geometry,
      id,
      label: labelField,
      value,
    });
  });
  const features = $derived.by(() =>
    model.features.map((feature, index) => {
      const path = geometryPath(feature.geometry, width, height);
      return {
        feature,
        path: path === '' ? `M 24 ${24 + index * 18} h 40 v 12 h -40 Z` : path,
        fill: GEO_TONES[index % GEO_TONES.length],
        text: `${feature.label ?? feature.id}${feature.value === undefined ? '' : `: ${feature.value}`}`,
        textY: height - 18 - index * 14,
      };
    }),
  );
</script>

<svg
  role="img"
  aria-label={label}
  class={['st-geoJsonMap', className].filter(Boolean).join(' ')}
  {width}
  {height}
  viewBox="0 0 {width} {height}"
>
  <title>{label}</title>
  {#each features as item (item.feature.id)}
    <g>
      <path
        class="st-geoJsonMap__feature"
        d={item.path}
        fill={item.fill}
        fill-opacity="0.34"
        stroke={item.fill}
        stroke-width="2"
      >
        <title>{item.text}</title>
      </path>
      <text x="24" y={item.textY} font-size="12" fill="currentColor">
        {item.text}
      </text>
    </g>
  {/each}
</svg>
