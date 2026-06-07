import { defineComponent, h, type PropType } from 'vue';
import { buildGeoFlowModel, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { projectCoordinate, scaleNumber } from './geoMapLayout.js';

export type GeoFlowMapProps = {
  store: DashboardStore;
  viewId: string;
  sourceLatitude: string;
  sourceLongitude: string;
  targetLatitude: string;
  targetLongitude: string;
  value?: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

export const GeoFlowMap = defineComponent({
  name: 'GeoFlowMap',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    sourceLatitude: { type: String, required: true },
    sourceLongitude: { type: String, required: true },
    targetLatitude: { type: String, required: true },
    targetLongitude: { type: String, required: true },
    value: { type: String, default: undefined },
    width: { type: Number, default: 520 },
    height: { type: Number, default: 320 },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const model = buildGeoFlowModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
        sourceLatitude: props.sourceLatitude,
        sourceLongitude: props.sourceLongitude,
        targetLatitude: props.targetLatitude,
        targetLongitude: props.targetLongitude,
        value: props.value,
      });
      const max = Math.max(1, ...model.links.map((link) => link.value));

      return h(
        'svg',
        {
          role: 'img',
          'aria-label': props.label,
          class: ['st-geoFlowMap', props.class],
          width: props.width,
          height: props.height,
          viewBox: `0 0 ${props.width} ${props.height}`,
        },
        [
          h('title', props.label),
          ...model.links.map((link) => {
            const source = projectCoordinate(link.source, props.width, props.height);
            const target = projectCoordinate(link.target, props.width, props.height);
            return h(
              'line',
              {
                key: link.id,
                class: 'st-geoFlowMap__link',
                x1: source.x,
                y1: source.y,
                x2: target.x,
                y2: target.y,
                stroke: '#2563eb',
                'stroke-width': scaleNumber(link.value, 0, max, 2, 9),
                'stroke-linecap': 'round',
                'stroke-opacity': '0.62',
              },
              [h('title', `${link.count} flows: ${link.value}`)],
            );
          }),
        ],
      );
    };
  },
});
