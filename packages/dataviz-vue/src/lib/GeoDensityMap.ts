import { defineComponent, h, type PropType } from 'vue';
import { buildGeoDensityModel, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { projectCoordinate, scaleNumber } from './geoMapLayout.js';

export type GeoDensityMapProps = {
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

export const GeoDensityMap = defineComponent({
  name: 'GeoDensityMap',
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
      const model = buildGeoDensityModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
        latitude: props.latitude,
        longitude: props.longitude,
        value: props.value,
        cellSize: props.cellSize,
      });
      const max = Math.max(1, ...model.cells.map((cell) => cell.density));

      return h(
        'svg',
        {
          role: 'img',
          'aria-label': props.label,
          class: ['st-geoDensityMap', props.class],
          width: props.width,
          height: props.height,
          viewBox: `0 0 ${props.width} ${props.height}`,
        },
        [
          h('title', props.label),
          ...model.cells.map((cell) => {
            const point = projectCoordinate(cell.center, props.width, props.height);
            const size = scaleNumber(cell.density, 0, max, 16, 34);
            return h(
              'rect',
              {
                key: cell.id,
                class: 'st-geoDensityMap__cell',
                x: point.x - size / 2,
                y: point.y - size / 2,
                width: size,
                height: size,
                fill: '#dc2626',
                'fill-opacity': '0.5',
              },
              [h('title', `${cell.id}: ${cell.density}`)],
            );
          }),
        ],
      );
    };
  },
});
