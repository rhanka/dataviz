/**
 * Synthetic dataset for the ArcDiagramChart demo.
 *
 * Relations de collaboration entre 6 équipes d'une organisation tech.
 * Chaque lien représente le nombre de projets menés en commun par deux équipes.
 * Déterministe, sans Math.random.
 */
import { createDashboardStore, type DashboardStore } from '@sentropic/dataviz-svelte';
import type { DataModel, Row } from '@sentropic/dataviz-svelte';

export const arcDiagramModel: DataModel = {
  dimensions: [
    { id: 'source', label: 'Équipe source', type: 'discrete' },
    { id: 'target', label: 'Équipe cible', type: 'discrete' },
  ],
  measures: [
    { id: 'weight', label: 'Projets communs', aggregation: 'sum' },
  ],
};

export const arcDiagramData: Row[] = [
  { source: 'Produit', target: 'Design', weight: 12 },
  { source: 'Produit', target: 'Ingénierie', weight: 9 },
  { source: 'Design', target: 'Ingénierie', weight: 7 },
  { source: 'Ingénierie', target: 'Data', weight: 11 },
  { source: 'Data', target: 'Marketing', weight: 5 },
  { source: 'Marketing', target: 'Produit', weight: 8 },
  { source: 'Design', target: 'Marketing', weight: 4 },
  { source: 'Ingénierie', target: 'Support', weight: 6 },
  { source: 'Data', target: 'Support', weight: 3 },
  { source: 'Support', target: 'Produit', weight: 2 },
];

export function makeArcDiagramStore(): DashboardStore {
  return createDashboardStore({ model: arcDiagramModel, data: arcDiagramData });
}
