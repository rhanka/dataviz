/**
 * Synthetic tile-grid dataset for the TileMapChart demo.
 * A 5×5 regional grid where each cell is a region with a revenue value.
 * col/row are 0-based grid positions. Deterministic, no Math.random.
 */
import { createDashboardStore, type DashboardStore } from '@sentropic/dataviz-svelte';
import type { DataModel, Row } from '@sentropic/dataviz-svelte';

export const tilemapModel: DataModel = {
  dimensions: [
    { id: 'region', label: 'Région', type: 'discrete' },
  ],
  measures: [
    { id: 'col',     label: 'Colonne',     aggregation: 'avg' },
    { id: 'row',     label: 'Ligne',       aggregation: 'avg' },
    { id: 'revenue', label: 'Revenu (k€)', aggregation: 'sum' },
  ],
};

// 5×5 grid — sparse, 16 regions out of 25 cells
export const tilemapData: Row[] = [
  // row 0
  { region: 'Ouest-Nord',   col: 1, row: 0, revenue: 312 },
  { region: 'Centre-Nord',  col: 2, row: 0, revenue: 445 },
  { region: 'Est-Nord',     col: 3, row: 0, revenue: 280 },
  // row 1
  { region: 'Ouest-1',      col: 0, row: 1, revenue: 195 },
  { region: 'Nord-Ouest',   col: 1, row: 1, revenue: 370 },
  { region: 'Nord-Centre',  col: 2, row: 1, revenue: 520 },
  { region: 'Nord-Est',     col: 3, row: 1, revenue: 310 },
  { region: 'Est-1',        col: 4, row: 1, revenue: 220 },
  // row 2
  { region: 'Ouest',        col: 0, row: 2, revenue: 410 },
  { region: 'Centre-Ouest', col: 1, row: 2, revenue: 480 },
  { region: 'Centre',       col: 2, row: 2, revenue: 680 },
  { region: 'Centre-Est',   col: 3, row: 2, revenue: 540 },
  { region: 'Est',          col: 4, row: 2, revenue: 390 },
  // row 3
  { region: 'Sud-Ouest',    col: 1, row: 3, revenue: 290 },
  { region: 'Sud-Centre',   col: 2, row: 3, revenue: 460 },
  { region: 'Sud-Est',      col: 3, row: 3, revenue: 330 },
];

export function makeTilemapStore(): DashboardStore {
  return createDashboardStore({ model: tilemapModel, data: tilemapData });
}
