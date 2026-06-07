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
  className?: string;
};

export function GeoPointMap({
  store,
  viewId,
  latitude,
  longitude,
  id,
  labelField,
  value,
  width = 520,
  height = 320,
  label,
  className,
}: GeoPointMapProps) {
  const state = useDashboard(store);
  void state;
  const model = buildGeoPointModel(store.model, store.applyCrossfilter(viewId), {
    latitude,
    longitude,
    id,
    label: labelField,
    value,
  });
  const values = model.points.map((point) => point.value ?? 1);
  const min = Math.min(0, ...values);
  const max = Math.max(1, ...values);

  return (
    <svg
      role="img"
      aria-label={label}
      className={['st-geoPointMap', className].filter(Boolean).join(' ') || undefined}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      <title>{label}</title>
      {model.points.map((point, index) => {
        const projected = projectCoordinate(point, width, height);
        const radius = scaleNumber(point.value ?? 1, min, max, 5, 14);
        const text = `${point.label ?? point.id}${point.value === undefined ? '' : `: ${point.value}`}`;
        return (
          <g key={point.id}>
            <circle
              className="st-geoPointMap__point"
              cx={projected.x}
              cy={projected.y}
              r={radius}
              fill={GEO_TONES[index % GEO_TONES.length]}
              fillOpacity="0.82"
            >
              <title>{text}</title>
            </circle>
            <text x={projected.x + radius + 4} y={projected.y + 4} fontSize="12" fill="currentColor">
              {text}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
