import { defineComponent, h, type PropType } from 'vue';
import { buildAnalyticsClusterModel, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type AnalyticsClusterPlotProps = {
  store: DashboardStore;
  viewId: string;
  fields: string[];
  k: number;
  maxIterations?: number;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

const TONES = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ca8a04', '#0891b2'];

function scale(value: number, min: number, max: number, start: number, end: number): number {
  return max === min ? (start + end) / 2 : start + ((value - min) / (max - min)) * (end - start);
}

export const AnalyticsClusterPlot = defineComponent({
  name: 'AnalyticsClusterPlot',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    fields: { type: Array as PropType<string[]>, required: true },
    k: { type: Number, required: true },
    maxIterations: { type: Number, default: undefined },
    width: { type: Number, default: 360 },
    height: { type: Number, default: 240 },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const model = buildAnalyticsClusterModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
        fields: props.fields,
        k: props.k,
        maxIterations: props.maxIterations,
      });
      const xField = props.fields[0]!;
      const yField = props.fields[1] ?? props.fields[0]!;
      const xs = model.clusters.map((cluster) => cluster.centroid[xField] ?? 0);
      const ys = model.clusters.map((cluster) => cluster.centroid[yField] ?? 0);
      const minX = Math.min(0, ...xs);
      const maxX = Math.max(1, ...xs);
      const minY = Math.min(0, ...ys);
      const maxY = Math.max(1, ...ys);

      return h(
        'svg',
        {
          role: 'img',
          'aria-label': props.label,
          class: ['st-analyticsClusterPlot', props.class],
          width: props.width,
          height: props.height,
          viewBox: `0 0 ${props.width} ${props.height}`,
        },
        [
          h('title', props.label),
          ...model.clusters.map((cluster, index) => {
            const cx = scale(cluster.centroid[xField] ?? 0, minX, maxX, 32, props.width - 24);
            const cy = scale(cluster.centroid[yField] ?? 0, minY, maxY, props.height - 28, 18);
            return h(
              'circle',
              {
                key: cluster.id,
                class: 'st-analyticsClusterPlot__centroid',
                cx,
                cy,
                r: Math.max(5, Math.sqrt(cluster.count) * 5),
                fill: TONES[index % TONES.length],
                'fill-opacity': '0.82',
              },
              [h('title', `${cluster.id}: ${cluster.count}`)],
            );
          }),
        ],
      );
    };
  },
});
