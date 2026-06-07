import { defineComponent, h, type PropType } from 'vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafeRoseModel } from './partOfWholeData.js';

export type RoseChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
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

function sectorPath(cx: number, cy: number, radius: number, startAngle: number, endAngle: number): string {
  const start = polarPoint(cx, cy, radius, startAngle);
  const end = polarPoint(cx, cy, radius, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

export const RoseChart = defineComponent({
  name: 'RoseChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    category: { type: String, required: true },
    measure: { type: String, required: true },
    width: { type: Number, default: 360 },
    height: { type: Number, default: 360 },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const model = buildSafeRoseModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
        category: props.category,
        measure: props.measure,
      });
      const cx = props.width / 2;
      const cy = props.height / 2;
      const maxRadius = Math.max(0, Math.min(props.width, props.height) * 0.38);
      const maxValue = Math.max(1, ...model.sectors.map((sector) => sector.value));

      return h(
        'svg',
        {
          role: 'img',
          'aria-label': props.label,
          class: ['st-roseChart', props.class],
          width: props.width,
          height: props.height,
          viewBox: `0 0 ${props.width} ${props.height}`,
        },
        [
          h('title', props.label),
          h('circle', {
            cx,
            cy,
            r: maxRadius,
            fill: 'none',
            stroke: 'currentColor',
            'stroke-opacity': '0.18',
          }),
          ...model.sectors.map((sector, index) => {
            const radius = Math.sqrt(Math.max(0, sector.value) / maxValue) * maxRadius;
            const labelPoint = polarPoint(cx, cy, radius + 18, (sector.startAngle + sector.endAngle) / 2);
            return h('g', { key: sector.key }, [
              h(
                'path',
                {
                  class: 'st-roseChart__sector',
                  d: sectorPath(cx, cy, radius, sector.startAngle, sector.endAngle),
                  fill: TONES[index % TONES.length],
                  'fill-opacity': '0.78',
                  stroke: 'white',
                  'stroke-width': '1',
                },
                [h('title', `${sector.label}: ${sector.value}`)],
              ),
              h(
                'text',
                {
                  x: labelPoint.x,
                  y: labelPoint.y,
                  'text-anchor': 'middle',
                  'font-size': 12,
                  fill: 'currentColor',
                },
                sector.label,
              ),
            ]);
          }),
        ],
      );
    };
  },
});
