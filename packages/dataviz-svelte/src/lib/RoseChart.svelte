<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type RoseChartProps = {
    store: DashboardStore;
    viewId: string;
    category: string;
    measure: string;
    width?: number;
    height?: number;
    label: string;
    class?: string;
  };

  const TONES = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ca8a04', '#0891b2', '#db2777', '#4f46e5'];

  function polarPoint(cx: number, cy: number, radius: number, angle: number) {
    const radians = ((angle - 90) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(radians),
      y: cy + radius * Math.sin(radians),
    };
  }

  function sectorPath(cx: number, cy: number, radius: number, startAngle: number, endAngle: number): string {
    const start = polarPoint(cx, cy, radius, startAngle);
    const end = polarPoint(cx, cy, radius, endAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
  }
</script>

<script lang="ts">
  import { useDashboard } from '../adapter.js';
  import { buildSafeRoseModel } from './partOfWholeData.js';

  let {
    store,
    viewId,
    category,
    measure,
    width = 360,
    height = 360,
    label,
    class: className,
  }: RoseChartProps = $props();

  const dash = $derived(useDashboard(store));
  const model = $derived.by(() => {
    void $dash;
    return buildSafeRoseModel(store.model, store.applyCrossfilter(viewId), { category, measure });
  });
  const layout = $derived.by(() => ({
    cx: width / 2,
    cy: height / 2,
    maxRadius: Math.max(0, Math.min(width, height) * 0.38),
    maxValue: Math.max(1, ...model.sectors.map((sector) => sector.value)),
  }));
</script>

<svg
  role="img"
  aria-label={label}
  class={['st-roseChart', className].filter(Boolean).join(' ')}
  {width}
  {height}
  viewBox="0 0 {width} {height}"
>
  <title>{label}</title>
  <circle cx={layout.cx} cy={layout.cy} r={layout.maxRadius} fill="none" stroke="currentColor" stroke-opacity="0.18" />
  {#each model.sectors as sector, index (sector.key)}
    {@const radius = Math.sqrt(Math.max(0, sector.value) / layout.maxValue) * layout.maxRadius}
    {@const labelPoint = polarPoint(layout.cx, layout.cy, radius + 18, (sector.startAngle + sector.endAngle) / 2)}
    <g>
      <path
        class="st-roseChart__sector"
        d={sectorPath(layout.cx, layout.cy, radius, sector.startAngle, sector.endAngle)}
        fill={TONES[index % TONES.length]}
        fill-opacity="0.78"
        stroke="white"
        stroke-width="1"
      >
        <title>{sector.label}: {sector.value}</title>
      </path>
      <text x={labelPoint.x} y={labelPoint.y} text-anchor="middle" font-size="12" fill="currentColor">
        {sector.label}
      </text>
    </g>
  {/each}
</svg>
