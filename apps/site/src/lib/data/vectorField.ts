/**
 * Synthetic dataset for the VectorFieldChart demo.
 *
 * Une grille déterministe 8×8 (64 vecteurs) d'un champ de rotation (« swirl »)
 * centré sur (3.5, 3.5). En chaque point on calcule, à partir d'une fonction
 * analytique lisse de (x, y), une composante tangentielle (perpendiculaire au
 * rayon) : la direction tourne autour du centre dans le sens trigonométrique,
 * et la magnitude est maximale à mi-rayon (annulée au centre et atténuée sur
 * les bords), ce qui produit un tourbillon visuellement cohérent. Aucun
 * Math.random / Date.now — uniquement des fonctions trigonométriques.
 */
import { createDashboardStore, type DashboardStore } from '@sentropic/dataviz-svelte';
import type { DataModel, Row } from '@sentropic/dataviz-svelte';

export const vectorFieldModel: DataModel = {
  dimensions: [],
  measures: [
    { id: 'x', label: 'X', aggregation: 'avg' },
    { id: 'y', label: 'Y', aggregation: 'avg' },
    { id: 'length', label: 'Magnitude', aggregation: 'avg' },
    { id: 'direction', label: 'Direction (°)', aggregation: 'avg' },
  ],
};

const GRID = 8;
const CENTER_X = 3.5;
const CENTER_Y = 3.5;
// Mid-radius of the 8×8 grid where the swirl reaches peak magnitude.
const MID_RADIUS = 3.5;

function makeVectorFieldRows(): Row[] {
  const rows: Row[] = [];
  for (let j = 0; j < GRID; j += 1) {
    for (let i = 0; i < GRID; i += 1) {
      const x = i;
      const y = j;
      const dxFromCenter = x - CENTER_X;
      const dyFromCenter = y - CENTER_Y;
      const radius = Math.hypot(dxFromCenter, dyFromCenter);

      // Tangential (90° ahead of the radial vector, trig sense) → rotation.
      const tangentX = -dyFromCenter;
      const tangentY = dxFromCenter;
      const direction = (Math.atan2(tangentY, tangentX) * 180) / Math.PI;

      // Magnitude peaks near mid-radius, vanishes at the centre, fades at edges.
      const length = radius * Math.cos(((radius - MID_RADIUS) / MID_RADIUS) * (Math.PI / 2));

      rows.push({
        x,
        y,
        length: Math.round(Math.max(0, length) * 100) / 100,
        direction: Math.round(direction * 100) / 100,
      });
    }
  }
  return rows;
}

export const vectorFieldData: Row[] = makeVectorFieldRows();

export function makeVectorFieldStore(): DashboardStore {
  return createDashboardStore({ model: vectorFieldModel, data: vectorFieldData });
}
