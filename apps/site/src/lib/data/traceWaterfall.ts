/**
 * Synthetic distributed-trace dataset for the TraceWaterfallChart demo.
 *
 * Une requête HTTP traversant 11 spans imbriqués : la passerelle racine
 * (parentSpanId '') délègue à l'authentification, au service utilisateur (qui
 * lit la base et le cache) puis au rendu. start/duration en ms cascadent pour
 * mettre en valeur le waterfall hiérarchique. Deterministic, no Math.random.
 */
import { createDashboardStore, type DashboardStore } from '@sentropic/dataviz-svelte';
import type { DataModel, Row } from '@sentropic/dataviz-svelte';

export const traceWaterfallModel: DataModel = {
  dimensions: [
    { id: 'spanId',       label: 'Span',    type: 'discrete' },
    { id: 'parentSpanId', label: 'Parent',  type: 'discrete' },
    { id: 'service',      label: 'Service', type: 'discrete' },
  ],
  measures: [
    { id: 'start',    label: 'Début (ms)', aggregation: 'sum' },
    { id: 'duration', label: 'Durée (ms)', aggregation: 'sum' },
  ],
};

// 11 spans — gateway root, two parallel branches (auth, user), nested DB/cache.
export const traceWaterfallData: Row[] = [
  { spanId: 's0',  parentSpanId: '',   service: 'api-gateway',  start: 0,   duration: 300 },
  { spanId: 's1',  parentSpanId: 's0', service: 'auth-service', start: 10,  duration: 55  },
  { spanId: 's2',  parentSpanId: 's1', service: 'cache',        start: 15,  duration: 12  },
  { spanId: 's3',  parentSpanId: 's1', service: 'db',           start: 30,  duration: 28  },
  { spanId: 's4',  parentSpanId: 's0', service: 'user-service', start: 70,  duration: 140 },
  { spanId: 's5',  parentSpanId: 's4', service: 'db',           start: 80,  duration: 60  },
  { spanId: 's6',  parentSpanId: 's4', service: 'cache',        start: 145, duration: 18  },
  { spanId: 's7',  parentSpanId: 's4', service: 'search',       start: 165, duration: 40  },
  { spanId: 's8',  parentSpanId: 's0', service: 'render',       start: 215, duration: 70  },
  { spanId: 's9',  parentSpanId: 's8', service: 'template',     start: 220, duration: 35  },
  { spanId: 's10', parentSpanId: 's8', service: 'cdn',          start: 258, duration: 24  },
];

export function makeTraceWaterfallStore(): DashboardStore {
  return createDashboardStore({ model: traceWaterfallModel, data: traceWaterfallData });
}
