/**
 * Synthetic dataset for the FlamegraphChart demo.
 *
 * Pile d'appels (call stack) d'une requête HTTP profilée : un arbre parent/
 * enfant unique enraciné sur `request`. La valeur de chaque nœud est son temps
 * CPU en millisecondes ; les feuilles portent un temps propre, les nœuds
 * internes portent un petit temps propre (overhead) + la somme de leurs
 * enfants. Largeurs variées pour un rendu visuellement lisible. Deterministic,
 * no Math.random.
 */
import { createDashboardStore, type DashboardStore } from '@sentropic/dataviz-svelte';
import type { DataModel, Row } from '@sentropic/dataviz-svelte';

export const flamegraphModel: DataModel = {
  dimensions: [
    { id: 'id',     label: 'Id',     type: 'discrete' },
    { id: 'parent', label: 'Parent', type: 'discrete' },
    { id: 'name',   label: 'Nom',    type: 'discrete' },
  ],
  measures: [
    { id: 'value', label: 'Temps CPU (ms)', aggregation: 'sum' },
  ],
};

// HTTP request profile — single root, 13 nodes, varied widths.
export const flamegraphData: Row[] = [
  { id: 'request',    parent: '',          name: 'request',    value: 4 },
  { id: 'router',     parent: 'request',   name: 'router',     value: 3 },
  { id: 'middleware', parent: 'request',   name: 'middleware', value: 6 },
  { id: 'auth',       parent: 'middleware', name: 'auth',      value: 18 },
  { id: 'cors',       parent: 'middleware', name: 'cors',      value: 5 },
  { id: 'handler',    parent: 'router',    name: 'handler',    value: 4 },
  { id: 'db.query',   parent: 'handler',   name: 'db.query',   value: 72 },
  { id: 'cache.get',  parent: 'handler',   name: 'cache.get',  value: 9 },
  { id: 'render',     parent: 'handler',   name: 'render',     value: 3 },
  { id: 'template',   parent: 'render',    name: 'template',   value: 21 },
  { id: 'serialize',  parent: 'render',    name: 'serialize',  value: 14 },
  { id: 'compress',   parent: 'request',   name: 'compress',   value: 11 },
  { id: 'log.write',  parent: 'request',   name: 'log.write',  value: 2 },
];

export function makeFlamegraphStore(): DashboardStore {
  return createDashboardStore({ model: flamegraphModel, data: flamegraphData });
}
