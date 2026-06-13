/**
 * Synthetic monthly series dataset for the StreamgraphChart demo.
 * 3 series × 6 months = 18 rows.
 * category=month (x-axis), series=channel (legend), measure=revenue.
 * Deterministic, no Math.random.
 */
import { createDashboardStore, type DashboardStore } from '@sentropic/dataviz-svelte';
import type { DataModel, Row } from '@sentropic/dataviz-svelte';

export const streamgraphModel: DataModel = {
  dimensions: [
    { id: 'month',   label: 'Mois',  type: 'discrete' },
    { id: 'channel', label: 'Canal', type: 'discrete' },
  ],
  measures: [
    { id: 'revenue', label: 'Revenu (k€)', aggregation: 'sum' },
  ],
};

// 3 channels × 6 months
const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jui'];
const CHANNELS: Record<string, number[]> = {
  'Direct':     [120, 135, 128, 145, 160, 172],
  'Partenaire': [ 80,  88,  95, 105,  98, 112],
  'En ligne':   [ 60,  72,  85,  78,  92, 104],
};

export const streamgraphData: Row[] = MONTHS.flatMap((month, i) =>
  Object.entries(CHANNELS).map(([channel, values]) => ({
    month,
    channel,
    revenue: values[i]!,
  })),
);

export function makeStreamgraphStore(): DashboardStore {
  return createDashboardStore({ model: streamgraphModel, data: streamgraphData });
}
