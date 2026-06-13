/**
 * Synthetic dataset for Range-family chart demos:
 * AreaRangeChart, AreaSplineRangeChart, ColumnRangeChart, DumbbellChart.
 *
 * Models monthly temperature extremes (°C) across seasons.
 * Deterministic, no Math.random.
 */
import { createDashboardStore, type DashboardStore } from '@sentropic/dataviz-svelte';
import type { DataModel, Row } from '@sentropic/dataviz-svelte';

export const rangeModel: DataModel = {
  dimensions: [
    { id: 'month', label: 'Mois', type: 'discrete' },
  ],
  measures: [
    { id: 'low', label: 'Min (°C)', aggregation: 'min' },
    { id: 'high', label: 'Max (°C)', aggregation: 'max' },
  ],
};

export const rangeData: Row[] = [
  { month: 'Jan', low: -4, high: 5 },
  { month: 'Fév', low: -3, high: 7 },
  { month: 'Mar', low: 1,  high: 13 },
  { month: 'Avr', low: 4,  high: 18 },
  { month: 'Mai', low: 8,  high: 22 },
  { month: 'Jun', low: 12, high: 27 },
  { month: 'Jul', low: 14, high: 30 },
  { month: 'Aoû', low: 13, high: 29 },
  { month: 'Sep', low: 9,  high: 23 },
  { month: 'Oct', low: 5,  high: 17 },
  { month: 'Nov', low: 0,  high: 10 },
  { month: 'Déc', low: -3, high: 5 },
];

export function makeRangeStore(): DashboardStore {
  return createDashboardStore({ model: rangeModel, data: rangeData });
}
