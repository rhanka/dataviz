/**
 * Synthetic dataset for the EventFeedPanel demo.
 *
 * Flux d'observabilité d'un déploiement : ~13 événements horodatés (deploy,
 * scale, healthcheck, alert, rollback…) avec des sévérités mélangées pour
 * varier les pastilles (info / success / warning / error). Les horodatages
 * partent d'une base epoch fixe et s'incrémentent de façon déterministe —
 * jamais Date.now / Math.random.
 */
import { createDashboardStore, type DashboardStore } from '@sentropic/dataviz-svelte';
import type { DataModel, Row } from '@sentropic/dataviz-svelte';

export const eventFeedModel: DataModel = {
  dimensions: [
    { id: 'type',     label: 'Type',     type: 'discrete' },
    { id: 'severity', label: 'Sévérité', type: 'discrete' },
    { id: 'message',  label: 'Message',  type: 'discrete' },
  ],
  measures: [
    { id: 'at', label: 'Horodatage', aggregation: 'sum' },
  ],
};

// Fixed epoch base (ms) + deterministic increasing offsets — no Date.now.
const BASE = 1718500000000;
const MIN = 60_000;

const EVENTS: Array<{ off: number; type: string; severity: string; message: string }> = [
  { off: 0,    type: 'deploy',      severity: 'info',    message: 'Déploiement v2.4.1 lancé' },
  { off: 2,    type: 'healthcheck', severity: 'success', message: 'Health-check OK sur 12 pods' },
  { off: 5,    type: 'scale',       severity: 'info',    message: 'Auto-scaling : 4 → 8 réplicas' },
  { off: 9,    type: 'deploy',      severity: 'success', message: 'Rollout terminé (100 %)' },
  { off: 14,   type: 'alert',       severity: 'warning', message: 'Latence p95 à 480 ms' },
  { off: 18,   type: 'alert',       severity: 'warning', message: "Taux d'erreur 5xx à 1,2 %" },
  { off: 23,   type: 'incident',    severity: 'error',   message: 'Pic d’erreurs 500 sur /checkout' },
  { off: 27,   type: 'rollback',    severity: 'error',   message: 'Rollback automatique vers v2.4.0' },
  { off: 31,   type: 'healthcheck', severity: 'success', message: 'Service rétabli, p95 à 120 ms' },
  { off: 38,   type: 'scale',       severity: 'info',    message: 'Réduction : 8 → 5 réplicas' },
  { off: 45,   type: 'deploy',      severity: 'success', message: 'Hotfix v2.4.2 déployé' },
  { off: 52,   type: 'audit',       severity: 'info',    message: 'Scan de sécurité : 0 vulnérabilité' },
  { off: 60,   type: 'alert',       severity: 'warning', message: 'Quota CPU à 82 % sur node-3' },
];

export const eventFeedData: Row[] = EVENTS.map(({ off, type, severity, message }) => ({
  at: BASE + off * MIN,
  type,
  severity,
  message,
}));

export function makeEventFeedStore(): DashboardStore {
  return createDashboardStore({ model: eventFeedModel, data: eventFeedData });
}
