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
  className?: string;
};

export function GeoDensityMap({
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
}: GeoDensityMapProps) {
  const state = useDashboard(store);
  void state;
  const model = buildGeoDensityModel(store.model, store.applyCrossfilter(viewId), { latitude, longitude, value, cellSize });
  const max = Math.max(1, ...model.cells.map((cell) => cell.density));

  return (
    <svg
      role="img"
      aria-label={label}
      className={['st-geoDensityMap', className].filter(Boolean).join(' ') || undefined}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      <title>{label}</title>
      {model.cells.map((cell) => {
        const point = projectCoordinate(cell.center, width, height);
        const size = scaleNumber(cell.density, 0, max, 16, 34);
        return (
          <rect
            key={cell.id}
            className="st-geoDensityMap__cell"
            x={point.x - size / 2}
            y={point.y - size / 2}
            width={size}
            height={size}
            fill="#dc2626"
            fillOpacity="0.5"
          >
            <title>{`${cell.id}: ${cell.density}`}</title>
          </rect>
        );
      })}
    </svg>
  );
}
