/**
 * Synthetic service-health dataset for the StateTimelineChart demo.
 * 3 services × segments of state (up/degraded/down) over 24 h.
 * Start/end expressed as hour indices (0 = midnight, 24 = end of day).
 * Deterministic, no Math.random.
 */
import { createDashboardStore, type DashboardStore } from '@sentropic/dataviz-svelte';
import type { DataModel, Row } from '@sentropic/dataviz-svelte';

export const stateTimelineModel: DataModel = {
  dimensions: [
    { id: 'service', label: 'Service', type: 'discrete' },
    { id: 'state',   label: 'État',    type: 'discrete' },
  ],
  measures: [
    { id: 'start', label: 'Début (h)', aggregation: 'min' },
    { id: 'end',   label: 'Fin (h)',   aggregation: 'max' },
  ],
};

export const stateTimelineData: Row[] = [
  // ── API Gateway ───────────────────────────────────────────────────────────
  { service: 'API Gateway', start: 0,  end: 6,  state: 'up'       },
  { service: 'API Gateway', start: 6,  end: 8,  state: 'degraded' },
  { service: 'API Gateway', start: 8,  end: 24, state: 'up'       },
  // ── Database ──────────────────────────────────────────────────────────────
  { service: 'Database',    start: 0,  end: 10, state: 'up'       },
  { service: 'Database',    start: 10, end: 13, state: 'down'     },
  { service: 'Database',    start: 13, end: 17, state: 'degraded' },
  { service: 'Database',    start: 17, end: 24, state: 'up'       },
  // ── Cache ─────────────────────────────────────────────────────────────────
  { service: 'Cache',       start: 0,  end: 5,  state: 'up'       },
  { service: 'Cache',       start: 5,  end: 7,  state: 'degraded' },
  { service: 'Cache',       start: 7,  end: 9,  state: 'down'     },
  { service: 'Cache',       start: 9,  end: 24, state: 'up'       },
];

export function makeStateTimelineStore(): DashboardStore {
  return createDashboardStore({ model: stateTimelineModel, data: stateTimelineData });
}
