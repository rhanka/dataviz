/**
 * Synthetic dataset for BellCurveChart demo.
 *
 * Simulates 80 product review scores (1–100) normally distributed
 * around a mean of 72 with spread ~12. Deterministic, no Math.random.
 */
import { createDashboardStore, type DashboardStore } from '@sentropic/dataviz-svelte';
import type { DataModel, Row } from '@sentropic/dataviz-svelte';

export const bellCurveModel: DataModel = {
  dimensions: [],
  measures: [
    { id: 'score', label: 'Score (/100)', aggregation: 'avg' },
  ],
};

// 80 scores approximating a normal distribution around μ=72, σ≈12
const scores = [
  44, 48, 50, 52, 53, 55, 56, 57, 58, 58,
  59, 60, 61, 62, 63, 63, 64, 64, 65, 65,
  66, 66, 67, 67, 68, 68, 69, 69, 70, 70,
  70, 71, 71, 71, 72, 72, 72, 72, 73, 73,
  73, 73, 74, 74, 74, 75, 75, 75, 76, 76,
  76, 77, 77, 78, 78, 79, 79, 80, 80, 81,
  81, 82, 82, 83, 84, 84, 85, 86, 87, 88,
  89, 90, 91, 92, 93, 95, 96, 97, 99, 100,
];

export const bellCurveData: Row[] = scores.map((score) => ({ score }));

export function makeBellCurveStore(): DashboardStore {
  return createDashboardStore({ model: bellCurveModel, data: bellCurveData });
}
