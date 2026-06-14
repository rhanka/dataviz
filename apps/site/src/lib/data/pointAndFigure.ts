/**
 * Synthetic dataset for the PointAndFigureChart demo.
 *
 * ~50 jours de cotation : une série de prix de clôture qui oscille
 * suffisamment (montées puis reculs) pour former plusieurs colonnes de X
 * (hausse) et de O (baisse) avec un reversal de 3. Deterministic — combinaison
 * de Math.sin / Math.cos, jamais Math.random ni Date.now.
 */
import { createDashboardStore, type DashboardStore } from '@sentropic/dataviz-svelte';
import type { DataModel, Row } from '@sentropic/dataviz-svelte';

export const pointAndFigureModel: DataModel = {
  dimensions: [],
  measures: [
    { id: 'date', label: 'Date', aggregation: 'sum' },
    { id: 'close', label: 'Clôture', aggregation: 'sum' },
  ],
};

// 50 daily price points — epoch ms base fixed (no Date.now), one day apart.
const BASE = 1718500000000;
const DAY = 86400000;

export const pointAndFigureData: Row[] = Array.from({ length: 50 }, (_, i) => ({
  date: BASE + i * DAY,
  close: 50 + 12 * Math.sin(i / 4) + 6 * Math.cos(i / 9),
}));

export function makePointAndFigureStore(): DashboardStore {
  return createDashboardStore({ model: pointAndFigureModel, data: pointAndFigureData });
}
