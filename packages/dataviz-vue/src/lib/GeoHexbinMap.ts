import { defineComponent, h, type PropType } from 'vue';
import { buildGeoHexbinModel, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { GEO_TONES, hexagonPoints, projectCoordinate, scaleNumber } from './geoMapLayout.js';

export type GeoHexbinMapProps = {
  store: DashboardStore;
  viewId: string;
  latitude: string;
  longitude: string;
  value?: string;
  cellSize?: number;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

export const GeoHexbinMap = defineComponent({
  name: 'GeoHexbinMap',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    latitude: { type: String, required: true },
    longitude: { type: String, required: true },
    value: { type: String, default: undefined },
    cellSize: { type: Number, default: undefined },
    width: { type: Number, default: 520 },
    height: { type: Number, default: 320 },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const model = buildGeoHexbinModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
        latitude: props.latitude,
        longitude: props.longitude,
        value: props.value,
        cellSize: props.cellSize,
      });
      const max = Math.max(1, ...model.bins.map((bin) => bin.value));

      return h(
        'svg',
        {
          role: 'img',
          'aria-label': props.label,
          class: ['st-geoHexbinMap', props.class],
          width: props.width,
          height: props.height,
          viewBox: `0 0 ${props.width} ${props.height}`,
        },
        [
          h('title', props.label),
          ...model.bins.map((bin, index) => {
            const point = projectCoordinate(bin.center, props.width, props.height);
            return h(
              'polygon',
              {
                key: bin.id,
                class: 'st-geoHexbinMap__bin',
                points: hexagonPoints(point.x, point.y, scaleNumber(bin.value, 0, max, 10, 22)),
                fill: GEO_TONES[index % GEO_TONES.length],
                'fill-opacity': '0.72',
              },
              [h('title', `${bin.id}: ${bin.value}`)],
            );
          }),
        ],
      );
    };
  },
});
