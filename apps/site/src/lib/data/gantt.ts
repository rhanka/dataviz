/**
 * Synthetic project-plan dataset for the GanttChart demo.
 * 6 tasks with start/end expressed as day indices (0 = project start).
 * Deterministic, no Math.random.
 */
import { createDashboardStore, type DashboardStore } from '@sentropic/dataviz-svelte';
import type { DataModel, Row } from '@sentropic/dataviz-svelte';

export const ganttModel: DataModel = {
  dimensions: [
    { id: 'task', label: 'Tâche', type: 'discrete' },
    { id: 'category', label: 'Phase', type: 'discrete' },
  ],
  measures: [
    { id: 'start', label: 'Début (j)', aggregation: 'min' },
    { id: 'end', label: 'Fin (j)', aggregation: 'max' },
  ],
};

export const ganttData: Row[] = [
  { task: 'Cadrage',        start: 0,  end: 4,  category: 'Planification' },
  { task: 'Architecture',   start: 3,  end: 8,  category: 'Planification' },
  { task: 'Développement',  start: 7,  end: 20, category: 'Réalisation'   },
  { task: 'Intégration',    start: 18, end: 24, category: 'Réalisation'   },
  { task: 'Tests & QA',     start: 22, end: 28, category: 'Validation'    },
  { task: 'Déploiement',    start: 27, end: 30, category: 'Validation'    },
];

export function makeGanttStore(): DashboardStore {
  return createDashboardStore({ model: ganttModel, data: ganttData });
}
