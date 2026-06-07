import { defineComponent, h, type PropType } from 'vue';
import { buildGeoJsonLayerModel, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { GEO_TONES, geometryPath } from './geoMapLayout.js';

export type GeoJsonMapProps = {
  store: DashboardStore;
  viewId: string;
  geometry: string;
  id?: string;
  labelField?: string;
  value?: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

export const GeoJsonMap = defineComponent({
  name: 'GeoJsonMap',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    geometry: { type: String, required: true },
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
      const model = buildGeoJsonLayerModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
        geometry: props.geometry,
        id: props.id,
        label: props.labelField,
        value: props.value,
      });

      return h(
        'svg',
        {
          role: 'img',
          'aria-label': props.label,
          class: ['st-geoJsonMap', props.class],
          width: props.width,
          height: props.height,
          viewBox: `0 0 ${props.width} ${props.height}`,
        },
        [
          h('title', props.label),
          ...model.features.map((feature, index) => {
            const path = geometryPath(feature.geometry, props.width, props.height);
            const text = `${feature.label ?? feature.id}${feature.value === undefined ? '' : `: ${feature.value}`}`;
            const fill = GEO_TONES[index % GEO_TONES.length];
            return h('g', { key: feature.id }, [
              h(
                'path',
                {
                  class: 'st-geoJsonMap__feature',
                  d: path === '' ? `M 24 ${24 + index * 18} h 40 v 12 h -40 Z` : path,
                  fill,
                  'fill-opacity': '0.34',
                  stroke: fill,
                  'stroke-width': 2,
                },
                [h('title', text)],
              ),
              h('text', { x: 24, y: props.height - 18 - index * 14, 'font-size': 12, fill: 'currentColor' }, text),
            ]);
          }),
        ],
      );
    };
  },
});
