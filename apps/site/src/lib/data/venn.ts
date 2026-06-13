/**
 * Curated static data for VennChart demo.
 *
 * Compétences partagées entre 3 équipes : Dev, Data, Design.
 * La structure Venn (ensembles + intersections) est définie
 * explicitement — elle ne peut pas être dérivée de données tabulaires
 * génériques.
 * Deterministic, no Math.random.
 */
import type { VennChartArea } from '@sentropic/design-system-svelte';

export const vennAreas: VennChartArea[] = [
  // Singletons
  { sets: ['Dev'],    value: 60 },
  { sets: ['Data'],   value: 50 },
  { sets: ['Design'], value: 45 },
  // Paires
  { sets: ['Dev', 'Data'],    value: 20 },
  { sets: ['Dev', 'Design'],  value: 15 },
  { sets: ['Data', 'Design'], value: 12 },
  // Intersection totale
  { sets: ['Dev', 'Data', 'Design'], value: 8 },
];
