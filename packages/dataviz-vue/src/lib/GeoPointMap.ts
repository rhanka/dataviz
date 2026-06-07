import { defineComponent, h, type PropType } from 'vue';
import { buildGeoPointModel, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { GEO_TONES, projectCoordinate, scaleNumber } from './geoMapLayout.js';

export type GeoPointMapProps = {
  store: DashboardStore;
  viewId: string;
  latitude: string;
  longitude: string;
  id?: string;
  labelField?: string;
  value?: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

export const GeoPointMap = defineComponent({
  name: 'GeoPointMap',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    latitude: { type: String, required: true },
    longitude: { type: String, required: true },
    id: { type: String, default: undefined },
    labelField: { type: String, default: undefined },
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
      const model = buildGeoPointModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
        latitude: props.latitude,
        longitude: props.longitude,
        id: props.id,
        label: props.labelField,
        value: props.value,
      });
      const values = model.points.map((point) => point.value ?? 1);
      const min = Math.min(0, ...values);
      const max = Math.max(1, ...values);

      return h(
        'svg',
        {
          role: 'img',
          'aria-label': props.label,
          class: ['st-geoPointMap', props.class],
          width: props.width,
          height: props.height,
          viewBox: `0 0 ${props.width} ${props.height}`,
        },
        [
          h('title', props.label),
          ...model.points.map((point, index) => {
            const projected = projectCoordinate(point, props.width, props.height);
            const radius = scaleNumber(point.value ?? 1, min, max, 5, 14);
            const text = `${point.label ?? point.id}${point.value === undefined ? '' : `: ${point.value}`}`;
            return h('g', { key: point.id }, [
              h(
                'circle',
                {
                  class: 'st-geoPointMap__point',
                  cx: projected.x,
                  cy: projected.y,
                  r: radius,
                  fill: GEO_TONES[index % GEO_TONES.length],
                  'fill-opacity': '0.82',
                },
                [h('title', text)],
              ),
              h('text', { x: projected.x + radius + 4, y: projected.y + 4, 'font-size': 12, fill: 'currentColor' }, text),
            ]);
          }),
        ],
      );
    };
  },
});
