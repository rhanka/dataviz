/**
 * Synthetic dataset for the DependencyWheelChart demo.
 *
 * Flux de dépendances entre modules d'une application monorepo.
 * Chaque lien représente le nombre d'imports directs entre deux modules.
 * Déterministe, sans Math.random.
 */
import { createDashboardStore, type DashboardStore } from '@sentropic/dataviz-svelte';
import type { DataModel, Row } from '@sentropic/dataviz-svelte';

export const dependencyWheelModel: DataModel = {
  dimensions: [
    { id: 'source', label: 'Module source', type: 'discrete' },
    { id: 'target', label: 'Module cible', type: 'discrete' },
  ],
  measures: [
    { id: 'weight', label: 'Imports', aggregation: 'sum' },
  ],
};

export const dependencyWheelData: Row[] = [
  { source: 'App', target: 'Router', weight: 8 },
  { source: 'App', target: 'Store', weight: 5 },
  { source: 'Router', target: 'Views', weight: 12 },
  { source: 'Views', target: 'Store', weight: 9 },
  { source: 'Views', target: 'Components', weight: 14 },
  { source: 'Store', target: 'API', weight: 7 },
  { source: 'Components', target: 'Store', weight: 6 },
  { source: 'Components', target: 'Utils', weight: 10 },
  { source: 'API', target: 'Utils', weight: 4 },
  { source: 'Utils', target: 'App', weight: 3 },
];

export function makeDependencyWheelStore(): DashboardStore {
  return createDashboardStore({ model: dependencyWheelModel, data: dependencyWheelData });
}
