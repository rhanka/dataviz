/**
 * Component registry — the single source of truth for the gallery.
 *
 * Every dataviz component gets an entry: section, slug, group, tagline, a
 * use-case writeup, the live Svelte demo (a multiplexed component selected via
 * `demoProps.kind`) and copy-paste code for Svelte / React / Vue.
 *
 * The code snippets follow the real component APIs (verified against the
 * dataviz-svelte/react/vue adapters): every chart/consumer binds to a
 * `DashboardStore` created from a `{ model, data }` model.
 */
import type { DemoEntry, Section, SectionGroup } from './types';
import ChartDemo from './charts/ChartDemo.svelte';
import GeoDemo from './charts/GeoDemo.svelte';
import BiDemo from './dashboards/BiDemo.svelte';
import FullDashboardDemo from './dashboards/FullDashboardDemo.svelte';
import DataExplorerDemo from './dashboards/DataExplorerDemo.svelte';
import GridDemo from './grids/GridDemo.svelte';
import { CHART_ENTRIES } from './entries/charts';
import { DASHBOARD_ENTRIES } from './entries/dashboards';
import { GRID_ENTRIES } from './entries/grids';

export const ENTRIES: DemoEntry[] = [
  ...CHART_ENTRIES(ChartDemo, GeoDemo),
  ...DASHBOARD_ENTRIES(BiDemo, FullDashboardDemo, DataExplorerDemo),
  ...GRID_ENTRIES(GridDemo),
];

export function entriesFor(section: Section): DemoEntry[] {
  return ENTRIES.filter((e) => e.section === section);
}

export function findEntry(section: Section, slug: string): DemoEntry | undefined {
  return ENTRIES.find((e) => e.section === section && e.slug === slug);
}

export function groupsFor(section: Section): SectionGroup[] {
  const entries = entriesFor(section);
  const order: string[] = [];
  const map = new Map<string, DemoEntry[]>();
  for (const e of entries) {
    if (!map.has(e.group)) {
      map.set(e.group, []);
      order.push(e.group);
    }
    map.get(e.group)!.push(e);
  }
  return order.map((label) => ({ label, entries: map.get(label)! }));
}

export const SECTION_META: Record<Section, { label: string; href: string; blurb: string }> = {
  charts: {
    label: 'Charts',
    href: '/charts',
    blurb:
      'Wrappers de graphiques bâtis sur les surfaces du design system : catégoriels, part-of-whole, distribution, analytique et cartographie.',
  },
  dashboards: {
    label: 'Dashboards / BI',
    href: '/dashboards',
    blurb:
      "Consommateurs d'état : cross-filter, drill, Top-N, slicers, KPI, signets, format, calculs et objets — tout piloté par l'état partagé dataviz-core.",
  },
  grids: {
    label: 'Grilles',
    href: '/grids',
    blurb:
      'Tables et pivots bâtis sur DataTable : enregistrements cross-filtrés, pivot agrégé et pivot avancé (sous-totaux, heat, sparkline).',
  },
};
