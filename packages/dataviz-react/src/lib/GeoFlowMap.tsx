import { buildGeoFlowModel, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { projectCoordinate, scaleNumber } from './geoMapLayout.js';

export type GeoFlowMapProps = {
  store: DashboardStore;
  viewId: string;
  sourceLatitude: string;
  sourceLongitude: string;
  targetLatitude: string;
  targetLongitude: string;
  value?: string;
  width?: number;
  height?: number;
  label: string;
  className?: string;
};

export function GeoFlowMap({
  store,
  viewId,
  sourceLatitude,
  sourceLongitude,
  targetLatitude,
  targetLongitude,
  value,
  width = 520,
  height = 320,
  label,
  className,
}: GeoFlowMapProps) {
  const state = useDashboard(store);
  void state;
  const model = buildGeoFlowModel(store.model, store.applyCrossfilter(viewId), {
    sourceLatitude,
    sourceLongitude,
    targetLatitude,
    targetLongitude,
    value,
  });
  const max = Math.max(1, ...model.links.map((link) => link.value));

  return (
    <svg
      role="img"
      aria-label={label}
      className={['st-geoFlowMap', className].filter(Boolean).join(' ') || undefined}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      <title>{label}</title>
      {model.links.map((link) => {
        const source = projectCoordinate(link.source, width, height);
        const target = projectCoordinate(link.target, width, height);
        const strokeWidth = scaleNumber(link.value, 0, max, 2, 9);
        return (
          <line
            key={link.id}
            className="st-geoFlowMap__link"
            x1={source.x}
            y1={source.y}
            x2={target.x}
            y2={target.y}
            stroke="#2563eb"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeOpacity="0.62"
          >
            <title>{`${link.count} flows: ${link.value}`}</title>
          </line>
        );
      })}
    </svg>
  );
}
