import { defineComponent, h, type PropType } from 'vue';
import { buildPercentileBandModel, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type PercentileBandChartProps = {
  store: DashboardStore;
  viewId: string;
  value: string;
  lower: number;
  upper: number;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

function scale(value: number, min: number, max: number, start: number, end: number): number {
  return max === min ? (start + end) / 2 : start + ((value - min) / (max - min)) * (end - start);
}

export const PercentileBandChart = defineComponent({
  name: 'PercentileBandChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    value: { type: String, required: true },
    lower: { type: Number, required: true },
    upper: { type: Number, required: true },
    width: { type: Number, default: 360 },
    height: { type: Number, default: 96 },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const model = buildPercentileBandModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
        value: props.value,
        lower: props.lower,
        upper: props.upper,
      });
      const min = Math.min(0, model.lowerValue, model.median, model.upperValue);
      const max = Math.max(1, model.lowerValue, model.median, model.upperValue);
      const x1 = scale(model.lowerValue, min, max, 28, props.width - 28);
      const x2 = scale(model.upperValue, min, max, 28, props.width - 28);
      const medianX = scale(model.median, min, max, 28, props.width - 28);

      return h(
        'svg',
        {
          role: 'img',
          'aria-label': props.label,
          class: ['st-percentileBandChart', props.class],
          width: props.width,
          height: props.height,
          viewBox: `0 0 ${props.width} ${props.height}`,
        },
        [
          h('title', props.label),
          h('line', {
            x1: 28,
            y1: props.height / 2,
            x2: props.width - 28,
            y2: props.height / 2,
            stroke: 'currentColor',
            'stroke-opacity': '0.2',
          }),
          h(
            'rect',
            {
              class: 'st-percentileBandChart__band',
              x: x1,
              y: props.height / 2 - 14,
              width: Math.max(0, x2 - x1),
              height: 28,
              fill: '#16a34a',
              'fill-opacity': '0.28',
            },
            [h('title', `${model.lowerValue}..${model.upperValue}`)],
          ),
          h('line', {
            class: 'st-percentileBandChart__median',
            x1: medianX,
            y1: 24,
            x2: medianX,
            y2: props.height - 24,
            stroke: '#16a34a',
            'stroke-width': 2,
          }),
        ],
      );
    };
  },
});
