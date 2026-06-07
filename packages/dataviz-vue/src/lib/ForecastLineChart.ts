import { defineComponent, h, type PropType } from 'vue';
import { buildForecastModel, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type ForecastLineChartProps = {
  store: DashboardStore;
  viewId: string;
  x: string;
  y: string;
  periods: number;
  step?: number;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

function scale(value: number, min: number, max: number, start: number, end: number): number {
  return max === min ? (start + end) / 2 : start + ((value - min) / (max - min)) * (end - start);
}

export const ForecastLineChart = defineComponent({
  name: 'ForecastLineChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    x: { type: String, required: true },
    y: { type: String, required: true },
    periods: { type: Number, required: true },
    step: { type: Number, default: undefined },
    width: { type: Number, default: 360 },
    height: { type: Number, default: 220 },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const model = buildForecastModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
        x: props.x,
        y: props.y,
        periods: props.periods,
        step: props.step,
      });
      const xs = model.points.map((point) => point.x);
      const ys = model.points.map((point) => point.y);
      const minX = Math.min(0, ...xs);
      const maxX = Math.max(1, ...xs);
      const minY = Math.min(0, ...ys);
      const maxY = Math.max(1, ...ys);
      const points = model.points.map((point) => ({
        x: scale(point.x, minX, maxX, 32, props.width - 24),
        y: scale(point.y, minY, maxY, props.height - 28, 18),
        raw: point,
      }));
      const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');

      return h(
        'svg',
        {
          role: 'img',
          'aria-label': props.label,
          class: ['st-forecastLineChart', props.class],
          width: props.width,
          height: props.height,
          viewBox: `0 0 ${props.width} ${props.height}`,
        },
        [
          h('title', props.label),
          points.length > 1
            ? h('path', {
                class: 'st-forecastLineChart__line',
                d: path,
                fill: 'none',
                stroke: '#9333ea',
                'stroke-width': 2,
                'stroke-dasharray': '5 4',
              })
            : null,
          ...points.map((point, index) =>
            h(
              'circle',
              {
                key: `${point.raw.x}:${index}`,
                class: 'st-forecastLineChart__point',
                cx: point.x,
                cy: point.y,
                r: 4,
                fill: '#9333ea',
              },
              [h('title', `${point.raw.x}: ${point.raw.y}`)],
            ),
          ),
        ],
      );
    };
  },
});
