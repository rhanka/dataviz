import { defineComponent, h, type PropType } from 'vue';
import { buildErrorBarsModel, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type ErrorBarsChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  value: string;
  interval?: 'stdev' | 'stderr';
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

function scale(value: number, min: number, max: number, start: number, end: number): number {
  return max === min ? (start + end) / 2 : start + ((value - min) / (max - min)) * (end - start);
}

export const ErrorBarsChart = defineComponent({
  name: 'ErrorBarsChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    category: { type: String, required: true },
    value: { type: String, required: true },
    interval: { type: String as PropType<'stdev' | 'stderr'>, default: undefined },
    width: { type: Number, default: 420 },
    height: { type: Number, default: 240 },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const model = buildErrorBarsModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
        category: props.category,
        value: props.value,
        interval: props.interval,
      });
      const min = Math.min(0, ...model.items.map((item) => item.lower));
      const max = Math.max(1, ...model.items.map((item) => item.upper));
      const step = (props.width - 64) / Math.max(1, model.items.length);

      return h(
        'svg',
        {
          role: 'img',
          'aria-label': props.label,
          class: ['st-errorBarsChart', props.class],
          width: props.width,
          height: props.height,
          viewBox: `0 0 ${props.width} ${props.height}`,
        },
        [
          h('title', props.label),
          ...model.items.map((item, index) => {
            const x = 32 + step * (index + 0.5);
            const y1 = scale(item.upper, min, max, props.height - 32, 18);
            const y2 = scale(item.lower, min, max, props.height - 32, 18);
            const meanY = scale(item.mean, min, max, props.height - 32, 18);
            return h('g', { key: item.key }, [
              h(
                'line',
                {
                  class: 'st-errorBarsChart__bar',
                  x1: x,
                  y1: y1,
                  x2: x,
                  y2: y2,
                  stroke: '#2563eb',
                  'stroke-width': 3,
                },
                [h('title', `${item.label}: mean ${item.mean}`)],
              ),
              h('circle', { cx: x, cy: meanY, r: 4, fill: '#2563eb' }),
              h(
                'text',
                {
                  x,
                  y: props.height - 8,
                  'text-anchor': 'middle',
                  'font-size': 12,
                  fill: 'currentColor',
                },
                `${item.label}: mean ${item.mean}`,
              ),
            ]);
          }),
        ],
      );
    };
  },
});
