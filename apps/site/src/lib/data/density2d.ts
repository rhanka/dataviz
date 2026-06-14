/**
 * Synthetic dataset for the Density2DChart demo.
 *
 * Deux nuages de points gaussiens distincts sur un plan numérique, générés de
 * façon déterministe (aucun Math.random) : pour chaque point on combine deux
 * fonctions trigonométriques décorrélées (sin/cos d'angles dérivés de l'index)
 * comme rayon × angle, ce qui produit une dispersion radiale concentrée autour
 * de chaque centre. La densité binnée révèle deux foyers nettement séparés.
 */
import { createDashboardStore, type DashboardStore } from '@sentropic/dataviz-svelte';
import type { DataModel, Row } from '@sentropic/dataviz-svelte';

export const density2dModel: DataModel = {
  dimensions: [],
  measures: [
    { id: 'x', label: 'X', aggregation: 'avg' },
    { id: 'y', label: 'Y', aggregation: 'avg' },
  ],
};

const POINTS_PER_CLUSTER = 90;
// Two well-separated centres with distinct spreads.
const CLUSTERS = [
  { cx: 30, cy: 35, spread: 9 },
  { cx: 68, cy: 72, spread: 12 },
];

function makeClusterRows(
  cx: number,
  cy: number,
  spread: number,
  seedOffset: number,
): Row[] {
  const rows: Row[] = [];
  for (let i = 0; i < POINTS_PER_CLUSTER; i += 1) {
    const t = i + seedOffset;
    // Decorrelated angle + radius from trig/modulo — deterministic scatter.
    const angle = t * 2.39996; // golden angle (rad), spreads points evenly
    const radius = spread * Math.sqrt(((t * 13) % 97) / 97);
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    rows.push({
      x: Math.round(x * 100) / 100,
      y: Math.round(y * 100) / 100,
    });
  }
  return rows;
}

export const density2dData: Row[] = CLUSTERS.flatMap((c, idx) =>
  makeClusterRows(c.cx, c.cy, c.spread, idx * POINTS_PER_CLUSTER + 1),
);

export function makeDensity2DStore(): DashboardStore {
  return createDashboardStore({ model: density2dModel, data: density2dData });
}
