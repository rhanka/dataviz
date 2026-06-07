import { defineComponent, h, type PropType } from 'vue';
import { buildGeoClusterModel, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { GEO_TONES, projectCoordinate, scaleNumber } from './geoMapLayout.js';

export type GeoClusterMapProps = {
  store: DashboardStore;
  viewId: string;
  latitude: string;
  longitude: string;
  id?: string;
  value?: string;
  radius?: number;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

export const GeoClusterMap = defineComponent({
  name: 'GeoClusterMap',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    latitude: { type: String, required: true },
    longitude: { type: String, required: true },
    id: { type: String, default: undefined },
    value: { type: String, default: undefined },
    radius: { type: Number, default: undefined },
    width: { type: Number, default: 520 },
    height: { type: Number, default: 320 },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const model = buildGeoClusterModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
        latitude: props.latitude,
        longitude: props.longitude,
        id: props.id,
        value: props.value,
        radius: props.radius,
      });
      const max = Math.max(1, ...model.clusters.map((cluster) => cluster.count));

      return h(
        'svg',
        {
          role: 'img',
          'aria-label': props.label,
          class: ['st-geoClusterMap', props.class],
          width: props.width,
          height: props.height,
          viewBox: `0 0 ${props.width} ${props.height}`,
        },
        [
          h('title', props.label),
          ...model.clusters.map((cluster, index) => {
            const point = projectCoordinate(cluster, props.width, props.height);
            return h(
              'circle',
              {
                key: cluster.id,
                class: 'st-geoClusterMap__cluster',
                cx: point.x,
                cy: point.y,
                r: scaleNumber(cluster.count, 0, max, 8, 24),
                fill: GEO_TONES[index % GEO_TONES.length],
                'fill-opacity': '0.78',
              },
              [h('title', `${cluster.id}: ${cluster.count}`)],
            );
          }),
        ],
      );
    };
  },
});
