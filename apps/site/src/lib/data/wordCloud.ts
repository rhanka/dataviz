/**
 * Synthetic dataset for WordCloudChart demo.
 *
 * Fréquences de mots-clés tech dans des offres d'emploi.
 * Deterministic, no Math.random.
 */
import { createDashboardStore, type DashboardStore } from '@sentropic/dataviz-svelte';
import type { DataModel, Row } from '@sentropic/dataviz-svelte';

export const wordCloudModel: DataModel = {
  dimensions: [
    { id: 'keyword', label: 'Mot-clé', type: 'discrete' },
  ],
  measures: [
    { id: 'frequency', label: 'Fréquence', aggregation: 'sum' },
  ],
};

export const wordCloudData: Row[] = [
  { keyword: 'TypeScript',  frequency: 320 },
  { keyword: 'React',       frequency: 290 },
  { keyword: 'Python',      frequency: 260 },
  { keyword: 'Docker',      frequency: 230 },
  { keyword: 'Kubernetes',  frequency: 195 },
  { keyword: 'AWS',         frequency: 185 },
  { keyword: 'GraphQL',     frequency: 160 },
  { keyword: 'PostgreSQL',  frequency: 150 },
  { keyword: 'Node.js',     frequency: 145 },
  { keyword: 'CI/CD',       frequency: 135 },
  { keyword: 'Svelte',      frequency: 120 },
  { keyword: 'Rust',        frequency: 110 },
  { keyword: 'Terraform',   frequency: 100 },
  { keyword: 'Redis',       frequency:  90 },
  { keyword: 'Vue',         frequency:  85 },
  { keyword: 'Go',          frequency:  80 },
  { keyword: 'MongoDB',     frequency:  75 },
  { keyword: 'Kafka',       frequency:  70 },
  { keyword: 'Elasticsearch', frequency: 65 },
  { keyword: 'Machine Learning', frequency: 60 },
];

export function makeWordCloudStore(): DashboardStore {
  return createDashboardStore({ model: wordCloudModel, data: wordCloudData });
}
