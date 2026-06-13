/**
 * Synthetic dataset for OrganizationChart and TreegraphChart demos.
 *
 * A small company org chart with 12 employees across 3 levels.
 * Deterministic, no Math.random.
 */
import { createDashboardStore, type DashboardStore } from '@sentropic/dataviz-svelte';
import type { DataModel, Row } from '@sentropic/dataviz-svelte';

export const hierarchyModel: DataModel = {
  dimensions: [
    { id: 'id',       label: 'ID',       type: 'discrete' },
    { id: 'parentId', label: 'Parent',   type: 'discrete' },
    { id: 'name',     label: 'Nom',      type: 'discrete' },
  ],
  measures: [],
};

export const hierarchyData: Row[] = [
  { id: '1', parentId: null,  name: 'Marie Dupont — PDG' },
  { id: '2', parentId: '1',   name: 'Pierre Martin — CTO' },
  { id: '3', parentId: '1',   name: 'Sophie Bernard — CFO' },
  { id: '4', parentId: '1',   name: 'Lucas Petit — CMO' },
  { id: '5', parentId: '2',   name: 'Emma Thomas — Lead Dev' },
  { id: '6', parentId: '2',   name: 'Hugo Robert — Arch.' },
  { id: '7', parentId: '3',   name: 'Chloé Richard — Contrôle' },
  { id: '8', parentId: '3',   name: 'Antoine Leroy — Audit' },
  { id: '9', parentId: '4',   name: 'Léa Moreau — Brand' },
  { id: '10', parentId: '4',  name: 'Nathan Simon — Digital' },
  { id: '11', parentId: '5',  name: 'Jade Laurent — Dev' },
  { id: '12', parentId: '5',  name: 'Arthur Michel — Dev' },
];

export function makeHierarchyStore(): DashboardStore {
  return createDashboardStore({ model: hierarchyModel, data: hierarchyData });
}
