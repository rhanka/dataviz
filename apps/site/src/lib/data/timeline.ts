/**
 * Synthetic project-milestone dataset for the TimelineChart demo.
 * 7 events with position expressed as day indices (0 = project start).
 * Deterministic, no Math.random.
 */
import { createDashboardStore, type DashboardStore } from '@sentropic/dataviz-svelte';
import type { DataModel, Row } from '@sentropic/dataviz-svelte';

export const timelineModel: DataModel = {
  dimensions: [
    { id: 'event',       label: 'Évènement',  type: 'discrete' },
    { id: 'description', label: 'Description', type: 'discrete' },
    { id: 'tone',        label: 'Ton',         type: 'discrete' },
  ],
  measures: [
    { id: 'position', label: 'Position (j)', aggregation: 'avg' },
  ],
};

export const timelineData: Row[] = [
  { event: 'Lancement',    position: 0,  description: 'Démarrage officiel du projet',   tone: 'category1' },
  { event: 'Revue archi',  position: 8,  description: "Validation de l'architecture",   tone: 'category2' },
  { event: 'Alpha',        position: 14, description: 'Première version fonctionnelle', tone: 'category3' },
  { event: 'Démo client',  position: 20, description: 'Présentation au commanditaire',  tone: 'category4' },
  { event: 'Bêta',         position: 24, description: 'Livraison pour tests externes',  tone: 'category5' },
  { event: 'Go/No-go',     position: 28, description: 'Décision de mise en production', tone: 'category6' },
  { event: 'Mise en prod', position: 30, description: 'Déploiement en production',       tone: 'category1' },
];

export function makeTimelineStore(): DashboardStore {
  return createDashboardStore({ model: timelineModel, data: timelineData });
}
