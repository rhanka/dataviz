import { createDashboardStore, type DashboardStore } from '@sentropic/dataviz-svelte';
import { model, data } from './dataset';

/**
 * Factory for a fresh dashboard store bound to the demo dataset. Each demo gets
 * its own store so cross-filter / drill state is isolated per component page.
 */
export function makeStore(): DashboardStore {
  return createDashboardStore({ model, data });
}
