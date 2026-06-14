/**
 * Synthetic dataset for the ContourChart demo.
 *
 * Un champ scalaire lisse sur une grille régulière 16×16 (256 points,
 * x=i, y=j pour i,j ∈ 0..15), généré de façon déterministe (aucun Math.random) :
 * deux bosses gaussiennes de hauteurs distinctes plus une légère ondulation
 * trigonométrique. Découpé en paliers de couleur par la DS, le champ révèle des
 * bandes de contour concentriques façon carte topographique.
 */
import { createDashboardStore, type DashboardStore } from '@sentropic/dataviz-svelte';
import type { DataModel, Row } from '@sentropic/dataviz-svelte';

export const contourModel: DataModel = {
  dimensions: [],
  measures: [
    { id: 'x', label: 'X', aggregation: 'avg' },
    { id: 'y', label: 'Y', aggregation: 'avg' },
    { id: 'value', label: 'Valeur', aggregation: 'avg' },
  ],
};

const GRID = 16;

function scalarField(x: number, y: number): number {
  const bumpA = 100 * Math.exp(-(((x - 4) ** 2) + ((y - 5) ** 2)) / 12);
  const bumpB = 70 * Math.exp(-(((x - 11) ** 2) + ((y - 10) ** 2)) / 16);
  const ripple = 8 * Math.sin(x / 2) * Math.cos(y / 2);
  return bumpA + bumpB + ripple;
}

export const contourData: Row[] = (() => {
  const rows: Row[] = [];
  for (let i = 0; i < GRID; i += 1) {
    for (let j = 0; j < GRID; j += 1) {
      rows.push({
        x: i,
        y: j,
        value: Math.round(scalarField(i, j) * 100) / 100,
      });
    }
  }
  return rows;
})();

export function makeContourStore(): DashboardStore {
  return createDashboardStore({ model: contourModel, data: contourData });
}
