import { defineComponent, h, type PropType } from 'vue';
import { buildTrendLineModel, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type TrendLineChartProps = {
  store: DashboardStore;
  viewId: string;
  x: string;
  y: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

function scale(value: number, min: number, max: number, start: number, end: number): number {
  return max === min ? (start + end) / 2 : start + ((value - min) / (max - min)) * (end - start);
}

export const TrendLineChart = defineComponent({
  name: 'TrendLineChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    x: { type: String, required: true },
    y: { type: String, required: true },
    width: { type: Number, default: 360 },
    height: { type: Number, default: 220 },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const model = buildTrendLineModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
        x: props.x,
        y: props.y,
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
      }));

      return h(
        'svg',
        {
          role: 'img',
          'aria-label': props.label,
          class: ['st-trendLineChart', props.class],
          width: props.width,
          height: props.height,
          viewBox: `0 0 ${props.width} ${props.height}`,
        },
        [
          h('title', props.label),
          points.length >= 2
            ? h(
                'path',
                {
                  class: 'st-trendLineChart__line',
                  d: `M ${points[0]!.x} ${points[0]!.y} L ${points[1]!.x} ${points[1]!.y}`,
                  fill: 'none',
                  stroke: '#2563eb',
                  'stroke-width': 3,
                },
                [h('title', `R2: ${model.rSquared}`)],
              )
            : null,
        ],
      );
    };
  },
});
