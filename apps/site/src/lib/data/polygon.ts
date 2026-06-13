/**
 * Synthetic dataset for PolygonChart demo.
 *
 * Contour d'un hexagone régulier centré sur (0, 0), rayon 10.
 * Deterministic, no Math.random.
 */
import { createDashboardStore, type DashboardStore } from '@sentropic/dataviz-svelte';
import type { DataModel, Row } from '@sentropic/dataviz-svelte';

export const polygonModel: DataModel = {
  dimensions: [],
  measures: [
    { id: 'x', label: 'X', aggregation: 'sum' },
    { id: 'y', label: 'Y', aggregation: 'sum' },
  ],
};

// An irregular polygon representing a simplified building floor plan (in meters)
export const polygonData: Row[] = [
  { x: 0,   y: 0   },
  { x: 10,  y: 0   },
  { x: 10,  y: 4   },
  { x: 15,  y: 4   },
  { x: 15,  y: 12  },
  { x: 10,  y: 12  },
  { x: 10,  y: 8   },
  { x: 4,   y: 8   },
  { x: 4,   y: 12  },
  { x: 0,   y: 12  },
  { x: 0,   y: 0   },
];

export function makePolygonStore(): DashboardStore {
  return createDashboardStore({ model: polygonModel, data: polygonData });
}
