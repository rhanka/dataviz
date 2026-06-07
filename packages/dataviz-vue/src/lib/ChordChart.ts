import { defineComponent, h, type PropType } from 'vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafeFlowModel } from './partOfWholeData.js';

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

export const ChordChart = defineComponent({
  name: 'ChordChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    source: { type: String, required: true },
    target: { type: String, required: true },
    measure: { type: String, required: true },
    width: { type: Number, default: 480 },
    height: { type: Number, default: 360 },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const model = buildSafeFlowModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
        source: props.source,
        target: props.target,
        measure: props.measure,
      });
      const cx = props.width / 2;
      const cy = props.height / 2;
      const radius = Math.max(0, Math.min(props.width, props.height) * 0.34);
      const maxValue = Math.max(1, ...model.links.map((link) => link.value));
      const nodes = model.nodes.map((node, index) => ({
        ...node,
        tone: TONES[index % TONES.length]!,
        point: polarPoint(cx, cy, radius, (360 / Math.max(1, model.nodes.length)) * index),
      }));
      const nodeById = new Map(nodes.map((node) => [node.id, node]));

      return h(
        'svg',
        {
          role: 'img',
          'aria-label': props.label,
          class: ['st-chordChart', props.class],
          width: props.width,
          height: props.height,
          viewBox: `0 0 ${props.width} ${props.height}`,
        },
        [
          h('title', props.label),
          ...model.links.map((link, index) => {
            const sourceNode = nodeById.get(link.source);
            const targetNode = nodeById.get(link.target);
            if (!sourceNode || !targetNode) return null;
            return h(
              'path',
              {
                key: link.id,
                class: 'st-chordChart__ribbon',
                d: `M ${sourceNode.point.x} ${sourceNode.point.y} Q ${cx} ${cy} ${targetNode.point.x} ${targetNode.point.y}`,
                fill: 'none',
                stroke: TONES[index % TONES.length],
                'stroke-opacity': '0.42',
                'stroke-linecap': 'round',
                'stroke-width': 1 + Math.sqrt(Math.max(0, link.value) / maxValue) * 12,
              },
              [h('title', `${sourceNode.label} -> ${targetNode.label}: ${link.value}`)],
            );
          }),
          ...nodes.map((node) =>
            h('g', { key: node.id, class: 'st-chordChart__node' }, [
              h('circle', { cx: node.point.x, cy: node.point.y, r: 7, fill: node.tone }),
              h(
                'text',
                {
                  x: node.point.x,
                  y: node.point.y + (node.point.y < cy ? -12 : 20),
                  'text-anchor': 'middle',
                  'font-size': 12,
                  fill: 'currentColor',
                },
                node.label,
              ),
            ]),
          ),
        ],
      );
    };
  },
});
