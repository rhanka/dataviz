/**
 * Synthetic dataset for the ColumnPyramidChart demo.
 *
 * Funnel d'acquisition : chaque étape compte moins d'utilisateurs que la
 * précédente, ce qui donne au graphe sa forme de pyramide. Une ligne par
 * étape (pas d'agrégation). Deterministic, no Math.random.
 */
import { createDashboardStore, type DashboardStore } from '@sentropic/dataviz-svelte';
import type { DataModel, Row } from '@sentropic/dataviz-svelte';

export const columnPyramidModel: DataModel = {
  dimensions: [
    { id: 'stage', label: 'Étape', type: 'discrete' },
  ],
  measures: [
    { id: 'users', label: 'Utilisateurs', aggregation: 'sum' },
  ],
};

export const columnPyramidData: Row[] = [
  { stage: 'Visiteurs', users: 12000 },
  { stage: 'Inscrits', users: 5200 },
  { stage: 'Actifs', users: 2400 },
  { stage: 'Payants', users: 880 },
  { stage: 'Fidèles', users: 310 },
];

export function makeColumnPyramidStore(): DashboardStore {
  return createDashboardStore({ model: columnPyramidModel, data: columnPyramidData });
}
