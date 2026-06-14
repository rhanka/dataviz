/**
 * Synthetic service-health dataset for the StatusHistoryChart demo.
 * 3 services × 8 hourly point-in-time status buckets (ok/warn/crit).
 * `at` expressed as hour index (0–7). Deterministic, no Math.random.
 */
import { createDashboardStore, type DashboardStore } from '@sentropic/dataviz-svelte';
import type { DataModel, Row } from '@sentropic/dataviz-svelte';

export const statusHistoryModel: DataModel = {
  dimensions: [
    { id: 'service', label: 'Service', type: 'discrete' },
    { id: 'status',  label: 'Statut',  type: 'discrete' },
  ],
  measures: [
    { id: 'at', label: 'Heure', aggregation: 'min' },
  ],
};

export const statusHistoryData: Row[] = [
  // ── API Gateway ───────────────────────────────────────────────────────────
  { service: 'API Gateway', at: 0, status: 'ok'   },
  { service: 'API Gateway', at: 1, status: 'ok'   },
  { service: 'API Gateway', at: 2, status: 'warn' },
  { service: 'API Gateway', at: 3, status: 'warn' },
  { service: 'API Gateway', at: 4, status: 'ok'   },
  { service: 'API Gateway', at: 5, status: 'ok'   },
  { service: 'API Gateway', at: 6, status: 'ok'   },
  { service: 'API Gateway', at: 7, status: 'ok'   },
  // ── Database ──────────────────────────────────────────────────────────────
  { service: 'Database',    at: 0, status: 'ok'   },
  { service: 'Database',    at: 1, status: 'ok'   },
  { service: 'Database',    at: 2, status: 'ok'   },
  { service: 'Database',    at: 3, status: 'crit' },
  { service: 'Database',    at: 4, status: 'crit' },
  { service: 'Database',    at: 5, status: 'warn' },
  { service: 'Database',    at: 6, status: 'ok'   },
  { service: 'Database',    at: 7, status: 'ok'   },
  // ── Cache ─────────────────────────────────────────────────────────────────
  { service: 'Cache',       at: 0, status: 'ok'   },
  { service: 'Cache',       at: 1, status: 'warn' },
  { service: 'Cache',       at: 2, status: 'crit' },
  { service: 'Cache',       at: 3, status: 'ok'   },
  { service: 'Cache',       at: 4, status: 'ok'   },
  { service: 'Cache',       at: 5, status: 'ok'   },
  { service: 'Cache',       at: 6, status: 'ok'   },
  { service: 'Cache',       at: 7, status: 'ok'   },
];

export function makeStatusHistoryStore(): DashboardStore {
  return createDashboardStore({ model: statusHistoryModel, data: statusHistoryData });
}
