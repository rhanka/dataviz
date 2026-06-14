/**
 * Synthetic dataset for the RenkoChart demo.
 *
 * ~50 deterministic daily close prices. The series trends up then back down
 * with a steady oscillation, spanning a wide enough price range (~20-40 units)
 * that several Renko bricks form in both directions. Deterministic, no
 * Math.random / Date.now — dates are a fixed epoch base plus a daily step.
 */
import { createDashboardStore, type DashboardStore } from '@sentropic/dataviz-svelte';
import type { DataModel, Row } from '@sentropic/dataviz-svelte';

export const renkoModel: DataModel = {
  dimensions: [],
  measures: [
    { id: 'date', label: 'Date', aggregation: 'sum' },
    { id: 'close', label: 'Clôture', aggregation: 'sum' },
  ],
};

const DAY_MS = 86_400_000;
const BASE_MS = 1_718_500_000_000;
const POINTS = 50;

// Up-then-down trend with oscillation; kept strictly positive.
export const renkoData: Row[] = Array.from({ length: POINTS }, (_, i) => {
  const trend = i * 0.4 - (i > 30 ? (i - 30) * 0.9 : 0);
  const close = 100 + 18 * Math.sin(i / 6) + trend;
  return {
    date: BASE_MS + i * DAY_MS,
    close: Math.max(1, close),
  };
});

export function makeRenkoStore(): DashboardStore {
  return createDashboardStore({ model: renkoModel, data: renkoData });
}
