import { buildChoroplethModel, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { GEO_TONES, scaleNumber } from './geoMapLayout.js';

export type ChoroplethMapProps = {
  store: DashboardStore;
  viewId: string;
  region: string;
  measure: string;
  width?: number;
  height?: number;
  label: string;
  className?: string;
};

export function ChoroplethMap({ store, viewId, region, measure, width = 520, height = 260, label, className }: ChoroplethMapProps) {
  const state = useDashboard(store);
  void state;
  const model = buildChoroplethModel(store.model, store.applyCrossfilter(viewId), { region, measure });
  const columns = Math.max(1, Math.ceil(Math.sqrt(Math.max(1, model.regions.length))));
  const rows = Math.max(1, Math.ceil(model.regions.length / columns));
  const padding = 20;
  const cellWidth = (width - padding * 2) / columns;
  const cellHeight = (height - padding * 2) / rows;
  const max = Math.max(1, ...model.regions.map((item) => item.value));

  return (
    <svg
      role="img"
      aria-label={label}
      className={['st-choroplethMap', className].filter(Boolean).join(' ') || undefined}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      <title>{label}</title>
      {model.regions.map((item, index) => {
        const column = index % columns;
        const row = Math.floor(index / columns);
        const x = padding + column * cellWidth;
        const y = padding + row * cellHeight;
        const opacity = scaleNumber(item.value, 0, max, 0.22, 0.9);
        return (
          <g key={item.key}>
            <rect
              className="st-choroplethMap__region"
              x={x}
              y={y}
              width={Math.max(0, cellWidth - 8)}
              height={Math.max(0, cellHeight - 8)}
              rx="4"
              fill={GEO_TONES[index % GEO_TONES.length]}
              fillOpacity={opacity}
            >
              <title>{`${item.label}: ${item.value}`}</title>
            </rect>
            <text x={x + 8} y={y + 20} fontSize="12" fill="currentColor">
              {item.label}: {item.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
