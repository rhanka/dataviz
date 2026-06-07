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
  className?: string;
};

export function GeoHexbinMap({
  store,
  viewId,
  latitude,
  longitude,
  value,
  cellSize,
  width = 520,
  height = 320,
  label,
  className,
}: GeoHexbinMapProps) {
  const state = useDashboard(store);
  void state;
  const model = buildGeoHexbinModel(store.model, store.applyCrossfilter(viewId), { latitude, longitude, value, cellSize });
  const max = Math.max(1, ...model.bins.map((bin) => bin.value));

  return (
    <svg
      role="img"
      aria-label={label}
      className={['st-geoHexbinMap', className].filter(Boolean).join(' ') || undefined}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      <title>{label}</title>
      {model.bins.map((bin, index) => {
        const point = projectCoordinate(bin.center, width, height);
        const radius = scaleNumber(bin.value, 0, max, 10, 22);
        return (
          <polygon
            key={bin.id}
            className="st-geoHexbinMap__bin"
            points={hexagonPoints(point.x, point.y, radius)}
            fill={GEO_TONES[index % GEO_TONES.length]}
            fillOpacity="0.72"
          >
            <title>{`${bin.id}: ${bin.value}`}</title>
          </polygon>
        );
      })}
    </svg>
  );
}
