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
  className?: string;
};

export function GeoJsonMap({
  store,
  viewId,
  geometry,
  id,
  labelField,
  value,
  width = 520,
  height = 320,
  label,
  className,
}: GeoJsonMapProps) {
  const state = useDashboard(store);
  void state;
  const model = buildGeoJsonLayerModel(store.model, store.applyCrossfilter(viewId), {
    geometry,
    id,
    label: labelField,
    value,
  });

  return (
    <svg
      role="img"
      aria-label={label}
      className={['st-geoJsonMap', className].filter(Boolean).join(' ') || undefined}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      <title>{label}</title>
      {model.features.map((feature, index) => {
        const path = geometryPath(feature.geometry, width, height);
        const text = `${feature.label ?? feature.id}${feature.value === undefined ? '' : `: ${feature.value}`}`;
        return (
          <g key={feature.id}>
            <path
              className="st-geoJsonMap__feature"
              d={path === '' ? `M 24 ${24 + index * 18} h 40 v 12 h -40 Z` : path}
              fill={GEO_TONES[index % GEO_TONES.length]}
              fillOpacity="0.34"
              stroke={GEO_TONES[index % GEO_TONES.length]}
              strokeWidth="2"
            >
              <title>{text}</title>
            </path>
            <text x="24" y={height - 18 - index * 14} fontSize="12" fill="currentColor">
              {text}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
