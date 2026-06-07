import { defineComponent, h, type PropType } from 'vue';
import { buildReferenceLineModel, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type ReferenceLineChartProps = {
  store: DashboardStore;
  viewId: string;
  value?: number;
  measure?: string;
  referenceId?: string;
  referenceLabel?: string;
  domainMin?: number;
  domainMax?: number;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

function scale(value: number, min: number, max: number, start: number, end: number): number {
  return max === min ? (start + end) / 2 : start + ((value - min) / (max - min)) * (end - start);
}

export const ReferenceLineChart = defineComponent({
  name: 'ReferenceLineChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    value: { type: Number, default: undefined },
    measure: { type: String, default: undefined },
    referenceId: { type: String, default: undefined },
    referenceLabel: { type: String, default: undefined },
    domainMin: { type: Number, default: undefined },
    domainMax: { type: Number, default: undefined },
    width: { type: Number, default: 360 },
    height: { type: Number, default: 96 },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const model = buildReferenceLineModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
        id: props.referenceId,
        label: props.referenceLabel,
        value: props.value,
        measure: props.measure,
      });
      const min = props.domainMin ?? Math.min(0, model.value);
      const max = props.domainMax ?? Math.max(1, model.value);
      const x = scale(model.value, min, max, 28, props.width - 28);

      return h(
        'svg',
        {
          role: 'img',
          'aria-label': props.label,
          class: ['st-referenceLineChart', props.class],
          width: props.width,
          height: props.height,
          viewBox: `0 0 ${props.width} ${props.height}`,
        },
        [
          h('title', props.label),
          h('line', {
            x1: 28,
            y1: props.height - 30,
            x2: props.width - 28,
            y2: props.height - 30,
            stroke: 'currentColor',
            'stroke-opacity': '0.25',
          }),
          h(
            'line',
            {
              class: 'st-referenceLineChart__line',
              x1: x,
              y1: 18,
              x2: x,
              y2: props.height - 24,
              stroke: '#2563eb',
              'stroke-width': 3,
            },
            [h('title', `${model.label}: ${model.value}`)],
          ),
          h(
            'text',
            { x, y: 14, 'text-anchor': 'middle', 'font-size': 12, fill: 'currentColor' },
            `${model.label}: ${model.value}`,
          ),
        ],
      );
    };
  },
});
