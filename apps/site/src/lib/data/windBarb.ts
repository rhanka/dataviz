/**
 * Synthetic dataset for the WindBarbChart demo.
 *
 * Seize observations horaires déterministes d'une station météo. L'axe temporel
 * `at` part d'une base epoch fixe et avance d'une heure (3 600 000 ms) par point.
 * La vitesse `speed` (en nœuds) suit une houle lisse qui traverse les paliers
 * standard des barbules (5 / 10 / 50 kt), de ~3 à ~55 kt. La direction `direction`
 * (en degrés, 0° = Nord — d'où vient le vent) tourne doucement au fil des heures.
 * Aucun Math.random / Date.now — uniquement des fonctions trigonométriques.
 */
import { createDashboardStore, type DashboardStore } from '@sentropic/dataviz-svelte';
import type { DataModel, Row } from '@sentropic/dataviz-svelte';

export const windBarbModel: DataModel = {
  dimensions: [],
  measures: [
    { id: 'at', label: 'Heure', aggregation: 'sum' },
    { id: 'speed', label: 'Vitesse (nœuds)', aggregation: 'avg' },
    { id: 'direction', label: 'Direction (°)', aggregation: 'avg' },
  ],
};

const COUNT = 16;
// Fixed epoch base (ms) — no Date.now: deterministic hourly observations.
const BASE_AT = 1718500000000;
const HOUR_MS = 3600000;

function makeWindBarbRows(): Row[] {
  const rows: Row[] = [];
  for (let i = 0; i < COUNT; i += 1) {
    const at = BASE_AT + i * HOUR_MS;

    // Smooth swell across the 5/10/50 kt barb thresholds: ~3 → ~55 kt.
    const speed = 29 + 26 * Math.sin((i / COUNT) * Math.PI * 1.5 - Math.PI / 2);

    // Direction gently rotating over the period, wrapped to 0..360°.
    const direction = ((45 + i * 18 + 30 * Math.cos(i / 3)) % 360 + 360) % 360;

    rows.push({
      at,
      speed: Math.round(Math.max(0, speed) * 100) / 100,
      direction: Math.round(direction * 100) / 100,
    });
  }
  return rows;
}

export const windBarbData: Row[] = makeWindBarbRows();

export function makeWindBarbStore(): DashboardStore {
  return createDashboardStore({ model: windBarbModel, data: windBarbData });
}
