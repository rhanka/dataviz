import { defineComponent, h, type PropType } from 'vue';
import type { DashboardStore, PartWholeSort } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafePackedBubbleModel } from './partOfWholeData.js';

export type PackedBubbleChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  measure: string;
  sort?: PartWholeSort;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

const TONES = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ca8a04', '#0891b2', '#db2777', '#4f46e5'];

export const PackedBubbleChart = defineComponent({
  name: 'PackedBubbleChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    category: { type: String, required: true },
    measure: { type: String, required: true },
    sort: { type: String as PropType<PartWholeSort>, default: 'value-desc' },
    width: { type: Number, default: 420 },
    height: { type: Number, default: 320 },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const model = buildSafePackedBubbleModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
        category: props.category,
        measure: props.measure,
        sort: props.sort,
      });
      const columns = Math.max(1, Math.ceil(Math.sqrt(Math.max(1, model.bubbles.length))));
      const rows = Math.max(1, Math.ceil(Math.max(1, model.bubbles.length) / columns));
      const padding = 42;
      const cellWidth = (props.width - padding * 2) / columns;
      const cellHeight = (props.height - padding * 2) / rows;
      const maxValue = Math.max(1, ...model.bubbles.map((bubble) => bubble.value));

      return h(
        'svg',
        {
          role: 'img',
          'aria-label': props.label,
          class: ['st-packedBubbleChart', props.class],
          width: props.width,
          height: props.height,
          viewBox: `0 0 ${props.width} ${props.height}`,
        },
        [
          h('title', props.label),
          ...model.bubbles.map((bubble, index) => {
            const column = index % columns;
            const row = Math.floor(index / columns);
            const cx = padding + cellWidth * (column + 0.5);
            const cy = padding + cellHeight * (row + 0.5);
            const radius = Math.sqrt(Math.max(0, bubble.value) / maxValue) * Math.min(cellWidth, cellHeight) * 0.38;
            return h('g', { key: bubble.key }, [
              h(
                'circle',
                {
                  class: 'st-packedBubbleChart__bubble',
                  cx,
                  cy,
                  r: radius,
                  fill: TONES[index % TONES.length],
                  'fill-opacity': '0.8',
                },
                [h('title', `${bubble.label}: ${bubble.value}`)],
              ),
              h(
                'text',
                {
                  x: cx,
                  y: cy + 4,
                  'text-anchor': 'middle',
                  'font-size': 12,
                  fill: 'white',
                },
                bubble.label,
              ),
            ]);
          }),
        ],
      );
    };
  },
});
