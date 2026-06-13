/**
 * Synthetic dataset for VariablePieChart and ItemChart demos.
 *
 * VariablePie: répartition des sièges parlementaires par parti,
 * avec valeur (part des voix) et z (taille du groupe).
 * ItemChart: même données de composition.
 * Deterministic, no Math.random.
 */
import { createDashboardStore, type DashboardStore } from '@sentropic/dataviz-svelte';
import type { DataModel, Row } from '@sentropic/dataviz-svelte';

export const variablePieModel: DataModel = {
  dimensions: [
    { id: 'party', label: 'Parti', type: 'discrete' },
  ],
  measures: [
    { id: 'votes', label: 'Part des voix (%)', aggregation: 'sum' },
    { id: 'seats', label: 'Sièges', aggregation: 'sum' },
  ],
};

export const variablePieData: Row[] = [
  { party: 'Centre',        votes: 28, seats: 180 },
  { party: 'Centre-gauche', votes: 22, seats: 140 },
  { party: 'Centre-droite', votes: 19, seats: 120 },
  { party: 'Gauche',        votes: 14, seats:  85 },
  { party: 'Droite',        votes: 10, seats:  60 },
  { party: 'Verts',         votes:  7, seats:  40 },
];

export function makeVariablePieStore(): DashboardStore {
  return createDashboardStore({ model: variablePieModel, data: variablePieData });
}

// ItemChart: répartition hémicycle (same data)
export const itemModel: DataModel = variablePieModel;
export const itemData: Row[] = variablePieData;

export function makeItemStore(): DashboardStore {
  return createDashboardStore({ model: itemModel, data: itemData });
}
