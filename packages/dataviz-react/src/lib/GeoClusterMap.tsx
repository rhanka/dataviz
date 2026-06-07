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
  className?: string;
};

export function GeoClusterMap({
  store,
  viewId,
  latitude,
  longitude,
  id,
  value,
  radius,
  width = 520,
  height = 320,
  label,
  className,
}: GeoClusterMapProps) {
  const state = useDashboard(store);
  void state;
  const model = buildGeoClusterModel(store.model, store.applyCrossfilter(viewId), { latitude, longitude, id, value, radius });
  const max = Math.max(1, ...model.clusters.map((cluster) => cluster.count));

  return (
    <svg
      role="img"
      aria-label={label}
      className={['st-geoClusterMap', className].filter(Boolean).join(' ') || undefined}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      <title>{label}</title>
      {model.clusters.map((cluster, index) => {
        const point = projectCoordinate(cluster, width, height);
        const r = scaleNumber(cluster.count, 0, max, 8, 24);
        return (
          <circle
            key={cluster.id}
            className="st-geoClusterMap__cluster"
            cx={point.x}
            cy={point.y}
            r={r}
            fill={GEO_TONES[index % GEO_TONES.length]}
            fillOpacity="0.78"
          >
            <title>{`${cluster.id}: ${cluster.count}`}</title>
          </circle>
        );
      })}
    </svg>
  );
}
