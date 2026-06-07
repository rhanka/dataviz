import { defineComponent, h, type PropType } from 'vue';
import { buildChoroplethModel, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { GEO_TONES, scaleNumber } from './geoMapLayout.js';

export type ChoroplethMapProps = {
  store: DashboardStore;
  viewId: string;
  region: string;
  measure: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

export const ChoroplethMap = defineComponent({
  name: 'ChoroplethMap',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    region: { type: String, required: true },
    measure: { type: String, required: true },
    width: { type: Number, default: 520 },
    height: { type: Number, default: 260 },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const model = buildChoroplethModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
        region: props.region,
        measure: props.measure,
      });
      const columns = Math.max(1, Math.ceil(Math.sqrt(Math.max(1, model.regions.length))));
      const rows = Math.max(1, Math.ceil(model.regions.length / columns));
      const padding = 20;
      const cellWidth = (props.width - padding * 2) / columns;
      const cellHeight = (props.height - padding * 2) / rows;
      const max = Math.max(1, ...model.regions.map((item) => item.value));

      return h(
        'svg',
        {
          role: 'img',
          'aria-label': props.label,
          class: ['st-choroplethMap', props.class],
          width: props.width,
          height: props.height,
          viewBox: `0 0 ${props.width} ${props.height}`,
        },
        [
          h('title', props.label),
          ...model.regions.map((item, index) => {
            const column = index % columns;
            const row = Math.floor(index / columns);
            const x = padding + column * cellWidth;
            const y = padding + row * cellHeight;
            return h('g', { key: item.key }, [
              h(
                'rect',
                {
                  class: 'st-choroplethMap__region',
                  x,
                  y,
                  width: Math.max(0, cellWidth - 8),
                  height: Math.max(0, cellHeight - 8),
                  rx: 4,
                  fill: GEO_TONES[index % GEO_TONES.length],
                  'fill-opacity': scaleNumber(item.value, 0, max, 0.22, 0.9),
                },
                [h('title', `${item.label}: ${item.value}`)],
              ),
              h('text', { x: x + 8, y: y + 20, 'font-size': 12, fill: 'currentColor' }, `${item.label}: ${item.value}`),
            ]);
          }),
        ],
      );
    };
  },
});
