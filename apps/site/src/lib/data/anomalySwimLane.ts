/**
 * Synthetic ML anomaly-score dataset for the AnomalySwimLaneChart demo.
 * 3 ML jobs × 10 hourly point-in-time anomaly score buckets (0–100).
 * `at` expressed as hour index (0–9). Deterministic, no Math.random.
 */
import { createDashboardStore, type DashboardStore } from '@sentropic/dataviz-svelte';
import type { DataModel, Row } from '@sentropic/dataviz-svelte';

export const anomalySwimLaneModel: DataModel = {
  dimensions: [
    { id: 'job', label: 'Job ML', type: 'discrete' },
  ],
  measures: [
    { id: 'at',    label: 'Heure',          aggregation: 'min' },
    { id: 'score', label: 'Score anomalie', aggregation: 'max' },
  ],
};

export const anomalySwimLaneData: Row[] = [
  // ── fraud-detector ────────────────────────────────────────────────────────
  { job: 'fraud-detector',  at: 0, score: 8  },
  { job: 'fraud-detector',  at: 1, score: 12 },
  { job: 'fraud-detector',  at: 2, score: 45 },
  { job: 'fraud-detector',  at: 3, score: 82 },
  { job: 'fraud-detector',  at: 4, score: 91 },
  { job: 'fraud-detector',  at: 5, score: 67 },
  { job: 'fraud-detector',  at: 6, score: 34 },
  { job: 'fraud-detector',  at: 7, score: 18 },
  { job: 'fraud-detector',  at: 8, score: 10 },
  { job: 'fraud-detector',  at: 9, score: 5  },
  // ── churn-predictor ───────────────────────────────────────────────────────
  { job: 'churn-predictor', at: 0, score: 5  },
  { job: 'churn-predictor', at: 1, score: 7  },
  { job: 'churn-predictor', at: 2, score: 15 },
  { job: 'churn-predictor', at: 3, score: 28 },
  { job: 'churn-predictor', at: 4, score: 55 },
  { job: 'churn-predictor', at: 5, score: 88 },
  { job: 'churn-predictor', at: 6, score: 72 },
  { job: 'churn-predictor', at: 7, score: 40 },
  { job: 'churn-predictor', at: 8, score: 20 },
  { job: 'churn-predictor', at: 9, score: 9  },
  // ── anomaly-ranker ────────────────────────────────────────────────────────
  { job: 'anomaly-ranker',  at: 0, score: 3  },
  { job: 'anomaly-ranker',  at: 1, score: 5  },
  { job: 'anomaly-ranker',  at: 2, score: 9  },
  { job: 'anomaly-ranker',  at: 3, score: 22 },
  { job: 'anomaly-ranker',  at: 4, score: 38 },
  { job: 'anomaly-ranker',  at: 5, score: 61 },
  { job: 'anomaly-ranker',  at: 6, score: 95 },
  { job: 'anomaly-ranker',  at: 7, score: 74 },
  { job: 'anomaly-ranker',  at: 8, score: 42 },
  { job: 'anomaly-ranker',  at: 9, score: 17 },
];

export function makeAnomalySwimLaneStore(): DashboardStore {
  return createDashboardStore({ model: anomalySwimLaneModel, data: anomalySwimLaneData });
}
