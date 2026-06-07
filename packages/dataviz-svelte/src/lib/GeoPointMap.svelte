<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type GeoPointMapProps = {
    store: DashboardStore;
    viewId: string;
    latitude: string;
    longitude: string;
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
  import { buildGeoPointModel } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';
  import { GEO_TONES, projectCoordinate, scaleNumber } from './geoMapLayout.js';

  let {
    store,
    viewId,
    latitude,
    longitude,
    id,
    labelField,
    value,
    width = 520,
    height = 320,
    label,
    class: className,
  }: GeoPointMapProps = $props();

  const dash = $derived(useDashboard(store));
  const model = $derived.by(() => {
    void $dash;
    return buildGeoPointModel(store.model, store.applyCrossfilter(viewId), {
      latitude,
      longitude,
      id,
      label: labelField,
      value,
    });
  });
  const points = $derived.by(() => {
    const values = model.points.map((point) => point.value ?? 1);
    const min = Math.min(0, ...values);
    const max = Math.max(1, ...values);
    return model.points.map((point, index) => {
      const projected = projectCoordinate(point, width, height);
      const radius = scaleNumber(point.value ?? 1, min, max, 5, 14);
      return {
        point,
        x: projected.x,
        y: projected.y,
        radius,
        fill: GEO_TONES[index % GEO_TONES.length],
        text: `${point.label ?? point.id}${point.value === undefined ? '' : `: ${point.value}`}`,
      };
    });
  });
</script>

<svg
  role="img"
  aria-label={label}
  class={['st-geoPointMap', className].filter(Boolean).join(' ')}
  {width}
  {height}
  viewBox="0 0 {width} {height}"
>
  <title>{label}</title>
  {#each points as item (item.point.id)}
    <g>
      <circle
        class="st-geoPointMap__point"
        cx={item.x}
        cy={item.y}
        r={item.radius}
        fill={item.fill}
        fill-opacity="0.82"
      >
        <title>{item.text}</title>
      </circle>
      <text x={item.x + item.radius + 4} y={item.y + 4} font-size="12" fill="currentColor">
        {item.text}
      </text>
    </g>
  {/each}
</svg>
