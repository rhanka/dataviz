<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type ChordChartProps = {
    store: DashboardStore;
    viewId: string;
    source: string;
    target: string;
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
</script>

<script lang="ts">
  import { useDashboard } from '../adapter.js';
  import { buildSafeFlowModel } from './partOfWholeData.js';

  let {
    store,
    viewId,
    source,
    target,
    measure,
    width = 480,
    height = 360,
    label,
    class: className,
  }: ChordChartProps = $props();

  const dash = $derived(useDashboard(store));
  const model = $derived.by(() => {
    void $dash;
    return buildSafeFlowModel(store.model, store.applyCrossfilter(viewId), { source, target, measure });
  });
  const layout = $derived.by(() => {
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.max(0, Math.min(width, height) * 0.34);
    const maxValue = Math.max(1, ...model.links.map((link) => link.value));
    const nodes = model.nodes.map((node, index) => ({
      ...node,
      tone: TONES[index % TONES.length]!,
      point: polarPoint(cx, cy, radius, (360 / Math.max(1, model.nodes.length)) * index),
    }));
    return {
      cx,
      cy,
      maxValue,
      nodes,
      nodeById: new Map(nodes.map((node) => [node.id, node])),
    };
  });
</script>

<svg
  role="img"
  aria-label={label}
  class={['st-chordChart', className].filter(Boolean).join(' ')}
  {width}
  {height}
  viewBox="0 0 {width} {height}"
>
  <title>{label}</title>
  {#each model.links as link, index (link.id)}
    {@const sourceNode = layout.nodeById.get(link.source)}
    {@const targetNode = layout.nodeById.get(link.target)}
    {#if sourceNode && targetNode}
      <path
        class="st-chordChart__ribbon"
        d="M {sourceNode.point.x} {sourceNode.point.y} Q {layout.cx} {layout.cy} {targetNode.point.x} {targetNode.point.y}"
        fill="none"
        stroke={TONES[index % TONES.length]}
        stroke-opacity="0.42"
        stroke-linecap="round"
        stroke-width={1 + Math.sqrt(Math.max(0, link.value) / layout.maxValue) * 12}
      >
        <title>{sourceNode.label} -&gt; {targetNode.label}: {link.value}</title>
      </path>
    {/if}
  {/each}
  {#each layout.nodes as node (node.id)}
    <g class="st-chordChart__node">
      <circle cx={node.point.x} cy={node.point.y} r="7" fill={node.tone} />
      <text
        x={node.point.x}
        y={node.point.y + (node.point.y < layout.cy ? -12 : 20)}
        text-anchor="middle"
        font-size="12"
        fill="currentColor"
      >
        {node.label}
      </text>
    </g>
  {/each}
</svg>
