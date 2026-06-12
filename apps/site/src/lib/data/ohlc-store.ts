import { createDashboardStore, type DashboardStore } from '@sentropic/dataviz-svelte';
import { ohlcModel, ohlcData } from './ohlc';

/**
 * Factory for a fresh dashboard store bound to the OHLC demo dataset.
 * Used by the CandlestickChart demo in ChartDemo.svelte.
 */
export function makeOhlcStore(): DashboardStore {
  return createDashboardStore({ model: ohlcModel, data: ohlcData });
}
