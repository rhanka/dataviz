/**
 * Synthetic microservices dependency dataset for the ForceGraph demo.
 *
 * 7 services, ~10 directed edges representing call-volume relationships
 * between services in a fictional e-commerce backend. Each row is one
 * directed dependency: source calls target with an approximate weekly
 * request weight. Deterministic, no Math.random.
 */
import { createDashboardStore, type DashboardStore } from '@sentropic/dataviz-svelte';
import type { DataModel, Row } from '@sentropic/dataviz-svelte';

export const forceGraphModel: DataModel = {
  dimensions: [
    { id: 'source', label: 'Service source', type: 'discrete' },
    { id: 'target', label: 'Service cible', type: 'discrete' },
  ],
  measures: [
    { id: 'weight', label: 'Volume (k req/semaine)', aggregation: 'sum' },
  ],
};

// 7 services: api-gateway, auth, users, orders, payments, inventory, notifications
// ~10 directed edges representing typical microservice call patterns
export const forceGraphData: Row[] = [
  { source: 'api-gateway',    target: 'auth',          weight: 120 },
  { source: 'api-gateway',    target: 'users',         weight: 95  },
  { source: 'api-gateway',    target: 'orders',        weight: 80  },
  { source: 'orders',         target: 'payments',      weight: 60  },
  { source: 'orders',         target: 'inventory',     weight: 55  },
  { source: 'orders',         target: 'notifications', weight: 40  },
  { source: 'users',          target: 'auth',          weight: 70  },
  { source: 'payments',       target: 'notifications', weight: 30  },
  { source: 'inventory',      target: 'notifications', weight: 15  },
  { source: 'auth',           target: 'users',         weight: 50  },
];

export function makeForceGraphStore(): DashboardStore {
  return createDashboardStore({ model: forceGraphModel, data: forceGraphData });
}
