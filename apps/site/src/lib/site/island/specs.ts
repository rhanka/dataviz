/**
 * Framework-agnostic demo specs.
 *
 * Each live demo is described as an ordered list of `{ comp, props }` entries —
 * a dataviz component NAME plus a plain props object. The props are identical
 * across Svelte / React / Vue (the dataviz adapters share one prop contract and
 * one framework-agnostic `DashboardStore`), so a single spec drives all three
 * frameworks. The Svelte path keeps rendering its hand-written demo components;
 * the React / Vue islands consume these specs to mount the REAL React / Vue
 * dataviz components against the same seeded store.
 *
 * `kind` here is the registry `demoProps.kind` (charts/geo/grids) or the BI
 * `kind`. `section` disambiguates the `records` kind shared by grids and the BI
 * record table. A spec of `null` means "no cross-framework island for this
 * demo" — the Svelte demo stays the source of truth (a handful of authoring
 * panels carry mutable local state that doesn't reduce to static props).
 */
import type { DashboardStore } from '@sentropic/dataviz-svelte';
import { lineAnnotation, regionAnnotation, makeFormatter, rule } from '@sentropic/dataviz-core';
import { model, DEMO_NOW } from '../../data/dataset';
import type { Section } from '../../registry/types';
import { makeOhlcStore } from '../../data/ohlc-store';
import { makeRangeStore } from '../../data/range';
import { makeVariablePieStore, makeItemStore } from '../../data/variablePie';
import { makeColumnPyramidStore } from '../../data/columnPyramid';
import { makeForceGraphStore } from '../../data/forceGraph';
import { makeArcDiagramStore } from '../../data/arcDiagram';
import { makeDependencyWheelStore } from '../../data/dependencyWheel';
import { makeBellCurveStore } from '../../data/bellCurve';
import { makeGanttStore } from '../../data/gantt';
import { makeTimelineStore } from '../../data/timeline';
import { makeStreamgraphStore } from '../../data/streamgraph';
import { makeTilemapStore } from '../../data/tilemap';
import { makeHierarchyStore } from '../../data/hierarchy';
import { makeWordCloudStore } from '../../data/wordCloud';
import { makePolygonStore } from '../../data/polygon';
import { vennAreas } from '../../data/venn';

/** One mounted dataviz component: its export name + props. */
export interface NodeSpec {
  comp: string;
  props: Record<string, unknown>;
}

/** Inputs the spec builder may need beyond the store (control values, etc.). */
export interface SpecContext {
  store: DashboardStore;
  /** Active measure from the demo's measure switcher. */
  measure?: 'revenue' | 'units' | 'margin';
  /** Active dimension from the demo's dimension switcher. */
  dimension?: 'category' | 'country' | 'channel' | 'segment';
}

// ── Dedicated stores for lot-A charts ────────────────────────────────────────
const ohlcStore = makeOhlcStore();
const rangeStore = makeRangeStore();
const variablePieStore = makeVariablePieStore();
const itemStore = makeItemStore();
const columnPyramidStore = makeColumnPyramidStore();
const forceGraphStore = makeForceGraphStore();
const arcDiagramStore = makeArcDiagramStore();
const dependencyWheelStore = makeDependencyWheelStore();
const bellCurveStore = makeBellCurveStore();

// ── Dedicated stores for lot-C charts ────────────────────────────────────────
const ganttStore = makeGanttStore();
const timelineStore = makeTimelineStore();
const streamgraphStore = makeStreamgraphStore();
const tilemapStore = makeTilemapStore();
const hierarchyStore = makeHierarchyStore();
const wordCloudStore = makeWordCloudStore();
const polygonStore = makePolygonStore();

// ── Conditional-format rules (gridSpec) ──────────────────────────────────────
const revenueFormat = [
  rule('gt', 50000, 'positive', { icon: 'trending-up' }),
  rule('lt', 10000, 'negative', { icon: 'trending-down' }),
];
const marginRateFormat = [
  rule('gte', 0.40, 'positive'),
  rule('lt', 0.25, 'warning'),
];

const kpiConfigs = [
  { id: 'revenue', measure: 'revenue', label: 'Revenu total' },
  { id: 'units', measure: 'units', label: 'Unités vendues' },
  { id: 'margin', measure: 'margin', label: 'Marge brute' },
];

// ── Chart specs (ChartDemo kinds) ────────────────────────────────────────────
function chartSpec(kind: string, ctx: SpecContext): NodeSpec[] | null {
  const store = ctx.store;
  const measure = ctx.measure ?? 'revenue';
  const dimension = ctx.dimension ?? 'category';
  const base = { store, viewId: 'c' };
  switch (kind) {
    case 'area':
      return [{ comp: 'AreaChart', props: {
        ...base, category: dimension, measure, label: `Revenu par ${dimension}`, smooth: true,
        annotations: [
          lineAnnotation('y', 400000, { label: 'Objectif' }),
          regionAnnotation('y', 350000, 500000, { label: 'Zone cible' }),
        ],
        dataLabels: { format: makeFormatter({ style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }) },
      } }];
    case 'combo':
      return [{ comp: 'ComboChart', props: { ...base, category: 'category', measures: [{ measure: 'revenue', mode: 'bar', label: 'Revenu' }, { measure: 'units', mode: 'line', label: 'Unités' }], leftAxisLabel: 'Revenu (€)', rightAxisLabel: 'Unités', label: 'Revenu & unités par catégorie', legend: true } }];
    case 'stacked':
      return [{ comp: 'StackedBarChart', props: { ...base, category: dimension, series: 'channel', measure, mode: 'stacked', label: `Par ${dimension} et canal`, hiddenSeries: [] } }];
    case 'lollipop':
      return [{ comp: 'LollipopChart', props: { ...base, category: dimension, measure, label: 'Lollipop', orientation: 'horizontal' } }];
    case 'step':
      return [{ comp: 'StepLineChart', props: { ...base, category: 'month', measure, label: 'Évolution mensuelle' } }];
    case 'pareto':
      return [{ comp: 'ParetoChart', props: { ...base, category: dimension, measure, label: 'Pareto' } }];
    case 'diverging':
      return [{ comp: 'DivergingBarChart', props: { ...base, category: dimension, measure: 'margin', label: `Marge par ${dimension}`, showLegend: true } }];
    case 'donut':
      return [{ comp: 'DonutChart', props: { ...base, category: dimension, measure, centerLabel: 'Total', label: 'Répartition' } }];
    case 'funnel':
      return [{ comp: 'FunnelChart', props: { ...base, category: 'channel', measure, showPercentages: true, label: 'Entonnoir par canal', legend: true } }];
    case 'waterfall':
      return [{ comp: 'WaterfallChart', props: { ...base, category: 'category', measure, totalLabel: 'Total', label: 'Cascade par catégorie' } }];
    case 'treemap':
      return [{ comp: 'TreemapChart', props: { ...base, hierarchy: ['region', 'country', 'city'], measure, label: 'Treemap géographique' } }];
    case 'sunburst':
      return [{ comp: 'SunburstChart', props: { ...base, hierarchy: ['region', 'category', 'product'], measure, label: 'Sunburst', legend: true } }];
    case 'sankey':
      return [{ comp: 'SankeyChart', props: { ...base, source: 'region', target: 'category', measure, label: 'Flux région → catégorie' } }];
    case 'radar':
      return [{ comp: 'RadarChart', props: { ...base, axes: ['Capteurs', 'Réseau', 'Contrôleurs', 'Énergie', 'Affichage'], series: 'category', measure, label: 'Profil par catégorie', legend: true } }];
    case 'mekko':
      return [{ comp: 'MekkoChart', props: { ...base, category: dimension, series: 'channel', measure, label: 'Marimekko' } }];
    case 'chord':
      return [{ comp: 'ChordChart', props: { ...base, source: 'region', target: 'channel', measure, label: 'Chord région ↔ canal' } }];
    case 'rose':
      return [{ comp: 'RoseChart', props: { ...base, category: dimension, measure, label: 'Rose polaire' } }];
    case 'packed':
      return [{ comp: 'PackedBubbleChart', props: { ...base, category: dimension, measure, label: 'Bulles' } }];
    case 'histogram':
      return [{ comp: 'HistogramChart', props: { store, value: 'price', bins: 16, label: 'Distribution des prix' } }];
    case 'box':
      return [{ comp: 'BoxPlotChart', props: { store, value: 'price', group: 'category', label: 'Prix par catégorie' } }];
    case 'heatmap':
      return [{ comp: 'HeatmapChart', props: { ...base, x: 'category', y: 'channel', measure, label: 'Catégorie × canal', legend: true } }];
    case 'calendar':
      return [{ comp: 'CalendarHeatmapChart', props: { store, date: 'date', measure, label: 'Activité par jour' } }];
    case 'bullet':
      return [{ comp: 'BulletChart', props: { store, value: 'revenue', target: 1500000, category: 'Revenu', ranges: [800000, 1200000, 1600000], label: 'Objectif de revenu' } }];
    case 'gauge':
      return [{ comp: 'GaugeChart', props: { store, value: 'revenue', min: 0, max: 2000000, label: 'Revenu', thresholds: [{ value: 800000, tone: 'warning' }, { value: 1400000, tone: 'success' }], unit: '€' } }];
    case 'reference':
      return [{ comp: 'ReferenceLineChart', props: { ...base, measure: 'revenue', referenceLabel: 'Moyenne', label: 'Revenu par mois + ligne de référence' } }];
    case 'percentile':
      return [{ comp: 'PercentileBandChart', props: { ...base, value: 'price', lower: 0.1, upper: 0.9, label: 'Bande 10–90e percentile (prix)' } }];
    case 'trend':
      return [{ comp: 'TrendLineChart', props: { ...base, x: 'date', y: 'revenue', label: 'Tendance du revenu' } }];
    case 'forecast':
      return [{ comp: 'ForecastLineChart', props: { ...base, x: 'date', y: 'revenue', periods: 6, label: 'Prévision du revenu (6 mois)' } }];
    case 'errorbars':
      return [{ comp: 'ErrorBarsChart', props: { ...base, category: 'category', value: 'price', interval: 'stdev', label: 'Prix moyen ± écart-type' } }];
    case 'cluster':
      return [{ comp: 'AnalyticsClusterPlot', props: { ...base, fields: ['price', 'marginRate'], k: 3, label: 'Clusters prix/marge' } }];
    case 'ohlc':
      return [{ comp: 'OHLCChart', props: { store: ohlcStore, viewId: 'ohlc', label_field: 'session', open: 'open', high: 'high', low: 'low', close: 'close', label: 'Cours boursiers OHLC (28 séances)' } }];
    case 'candlestick':
      return [{ comp: 'CandlestickChart', props: { store: ohlcStore, viewId: 'ohlc', label_field: 'session', open: 'open', high: 'high', low: 'low', close: 'close', label: 'Cours boursiers (28 séances)' } }];
    case 'area-range':
      return [{ comp: 'AreaRangeChart', props: { store: rangeStore, viewId: 'r', x_field: 'month', low: 'low', high: 'high', label: 'Températures min/max (°C)' } }];
    case 'area-spline-range':
      return [{ comp: 'AreaSplineRangeChart', props: { store: rangeStore, viewId: 'r', x_field: 'month', low: 'low', high: 'high', label: 'Plage lissée min/max (°C)' } }];
    case 'column-range':
      return [{ comp: 'ColumnRangeChart', props: { store: rangeStore, viewId: 'r', category: 'month', low: 'low', high: 'high', label: 'Amplitude mensuelle (°C)' } }];
    case 'dumbbell':
      return [{ comp: 'DumbbellChart', props: { store: rangeStore, viewId: 'r', category: 'month', low: 'low', high: 'high', lowLabel: 'Min', highLabel: 'Max', label: 'Écart mensuel (°C)' } }];
    case 'column-pyramid':
      return [{ comp: 'ColumnPyramidChart', props: { store: columnPyramidStore, viewId: 'cp', category: 'stage', value: 'users', label: 'Funnel d\'acquisition' } }];
    case 'item-chart':
      return [{ comp: 'ItemChart', props: { store: itemStore, viewId: 'ic', label_field: 'party', value: 'seats', label: 'Répartition des sièges' } }];
    case 'variable-pie':
      return [{ comp: 'VariablePieChart', props: { store: variablePieStore, viewId: 'vp', label_field: 'party', value: 'votes', z: 'seats', label: 'Partis : voix (angle) × sièges (rayon)' } }];
    // ── Lot C ─────────────────────────────────────────────────────────────────
    case 'gantt':
      return [{ comp: 'GanttChart', props: { store: ganttStore, viewId: 'gantt', task: 'task', start: 'start', end: 'end', category: 'category', marker: 10, label: 'Planning de projet' } }];
    case 'timeline':
      return [{ comp: 'TimelineChart', props: { store: timelineStore, viewId: 'timeline', label_field: 'event', position: 'position', description: 'description', tone: 'tone', label: 'Jalons du projet' } }];
    case 'streamgraph':
      return [{ comp: 'StreamgraphChart', props: { store: streamgraphStore, viewId: 'sg', category: 'month', series: 'channel', measure: 'revenue', smooth: true, showLegend: true, label: 'Revenu par canal (flux)' } }];
    case 'tilemap':
      return [{ comp: 'TileMapChart', props: { store: tilemapStore, viewId: 'tm', label_field: 'region', col: 'col', row: 'row', value: 'revenue', label: 'Revenu régional (grille)' } }];
    case 'organization':
      return [{ comp: 'OrganizationChart', props: { store: hierarchyStore, viewId: 'org', id_field: 'id', parent_field: 'parentId', label_field: 'name', label: 'Organigramme' } }];
    case 'treegraph':
      return [{ comp: 'TreegraphChart', props: { store: hierarchyStore, viewId: 'org', id_field: 'id', parent_field: 'parentId', label_field: 'name', label: 'Arbre hiérarchique' } }];
    case 'word-cloud':
      return [{ comp: 'WordCloudChart', props: { store: wordCloudStore, viewId: 'wc', word_field: 'keyword', weight: 'frequency', label: 'Mots-clés tech (fréquence)' } }];
    case 'polygon':
      return [{ comp: 'PolygonChart', props: { store: polygonStore, viewId: 'pg', x: 'x', y: 'y', label: 'Plan d\'étage simplifié (m)' } }];
    case 'venn':
      return [{ comp: 'VennChart', props: { areas: vennAreas, label: 'Compétences partagées (Dev / Data / Design)' } }];
    // ── Lot B ─────────────────────────────────────────────────────────────────
    case 'scatter':
      return [{ comp: 'ScatterPlot', props: { store, viewId: 'c', x: 'revenue', y: 'units', series: 'category', labelField: 'category', label: 'Revenu vs unités par catégorie' } }];
    case 'sparkline':
      return [{ comp: 'Sparkline', props: { store, viewId: 'c', dimension: 'month', measure: 'revenue', area: true, label: 'Tendance mensuelle du revenu' } }];
    case 'scorecard':
      return [{ comp: 'ScoreCard', props: { store, viewId: 'c', measure: 'revenue', sparklineDimension: 'month', format: 'currency', label: 'Revenu total', tone: 'category1' } }];
    case 'violin':
      return [{ comp: 'ViolinChart', props: { store, viewId: 'c', groupBy: 'category', measure: 'price', label: 'Distribution des prix par catégorie' } }];
    case 'bump':
      return [{ comp: 'BumpChart', props: { store, viewId: 'c', series: 'category', category: 'month', measure: 'revenue', label: 'Classement mensuel des catégories' } }];
    case 'parallel':
      return [{ comp: 'ParallelCoordinatesChart', props: { store, viewId: 'c', measures: ['price', 'units', 'marginRate'], series: 'category', label: 'Profil multivarié (prix / unités / marge)' } }];
    case 'bell-curve':
      return [{ comp: 'BellCurveChart', props: { store: bellCurveStore, viewId: 'bc', measure: 'score', label: 'Distribution des scores (/100)' } }];
    case 'force-graph':
      return [{ comp: 'ForceGraph', props: { store: forceGraphStore, viewId: 'fg', source: 'source', target: 'target', weight: 'weight', label: 'Dépendances entre microservices' } }];
    case 'arc-diagram':
      return [{ comp: 'ArcDiagramChart', props: { store: arcDiagramStore, viewId: 'ad', source: 'source', target: 'target', weight: 'weight', label: 'Collaborations entre équipes' } }];
    case 'dependency-wheel':
      return [{ comp: 'DependencyWheelChart', props: { store: dependencyWheelStore, viewId: 'dw', source: 'source', target: 'target', weight: 'weight', label: 'Dépendances entre modules' } }];
    case 'heikin-ashi':
      return [{ comp: 'HeikinAshiChart', props: { store: ohlcStore, viewId: 'ohlc', label_field: 'session', open: 'open', high: 'high', low: 'low', close: 'close', label: 'Cours Heikin-Ashi (28 séances)' } }];
    case 'hollow-candlestick':
      return [{ comp: 'HollowCandlestickChart', props: { store: ohlcStore, viewId: 'ohlc', label_field: 'session', open: 'open', high: 'high', low: 'low', close: 'close', label: 'Bougies creuses (28 séances)' } }];
    case 'hlc':
      return [{ comp: 'HLCChart', props: { store: ohlcStore, viewId: 'ohlc', label_field: 'session', high: 'high', low: 'low', close: 'close', label: 'Cours HLC (28 séances)' } }];
    default:
      return null;
  }
}

// ── Geo specs (GeoDemo kinds) ────────────────────────────────────────────────
function geoSpec(kind: string, ctx: SpecContext): NodeSpec[] | null {
  const store = ctx.store;
  const measure = ctx.measure ?? 'revenue';
  const base = { store, viewId: 'g' };
  switch (kind) {
    case 'point':
      return [{ comp: 'GeoPointMap', props: { ...base, latitude: 'lat', longitude: 'lng', labelField: 'city', value: measure, label: 'Ventes par ville' } }];
    case 'choropleth':
      return [{ comp: 'ChoroplethMap', props: { ...base, region: 'country', measure, label: 'Revenu par pays' } }];
    case 'flow':
      return [{ comp: 'GeoFlowMap', props: { ...base, sourceLatitude: 'lat', sourceLongitude: 'lng', targetLatitude: 'lat', targetLongitude: 'lng', value: 'revenue', label: 'Flux logistiques' } }];
    case 'hexbin':
      return [{ comp: 'GeoHexbinMap', props: { ...base, latitude: 'lat', longitude: 'lng', value: measure, cellSize: 28, label: 'Densité hexagonale' } }];
    case 'cluster':
      return [{ comp: 'GeoClusterMap', props: { ...base, latitude: 'lat', longitude: 'lng', value: measure, radius: 40, label: 'Clustering de points' } }];
    case 'density':
      return [{ comp: 'GeoDensityMap', props: { ...base, latitude: 'lat', longitude: 'lng', value: measure, label: 'Carte de densité' } }];
    default:
      return null;
  }
}

// ── BI / dashboard specs (BiDemo kinds) ──────────────────────────────────────
function biSpec(kind: string, ctx: SpecContext): NodeSpec[] | null {
  const store = ctx.store;
  switch (kind) {
    case 'crossfilter':
      return [
        { comp: 'DashboardFilterBar', props: { store } },
        { comp: 'SelectionLegend', props: { store, labels: { byCat: 'Catégorie', byChannel: 'Canal' } } },
        { comp: 'CrossfilteredBarChart', props: { store, viewId: 'byCat', dimension: 'category', measure: 'revenue', label: 'Revenu par catégorie' } },
        { comp: 'CrossfilteredBarChart', props: { store, viewId: 'byChannel', dimension: 'channel', measure: 'revenue', tone: 'category2', label: 'Revenu par canal' } },
        { comp: 'RecordsTable', props: { store, pageSize: 6, fields: ['region', 'category', 'channel', 'revenue', 'units'] } },
      ];
    case 'filterbar':
      return [
        { comp: 'DashboardFilterBar', props: { store } },
        { comp: 'ValueSlicer', props: { store, dimension: 'region', orientation: 'horizontal' } },
        { comp: 'RecordsTable', props: { store, pageSize: 6 } },
      ];
    case 'selectionlegend':
      return [
        { comp: 'SelectionLegend', props: { store, labels: { a: 'Région', b: 'Canal' } } },
        { comp: 'CrossfilteredBarChart', props: { store, viewId: 'a', dimension: 'region', measure: 'revenue', label: 'Région' } },
        { comp: 'CrossfilteredBarChart', props: { store, viewId: 'b', dimension: 'channel', measure: 'revenue', tone: 'category3', label: 'Canal' } },
      ];
    case 'smallmultiples':
      return [{ comp: 'SmallMultiples', props: { store, viewId: 'sm', facetBy: 'region', dimension: 'category', measure: 'revenue', columns: 3, label: 'Revenu' } }];
    case 'drill':
      return [
        { comp: 'DrillBreadcrumb', props: { store, viewId: 'drill', hierarchy: ['region', 'country', 'city'] } },
        { comp: 'DrillBarChart', props: { store, viewId: 'drill', hierarchy: ['region', 'country', 'city'], measure: 'revenue', tone: 'category4', label: 'Drill géographique' } },
      ];
    case 'kpi':
      return [{ comp: 'KpiCardGroup', props: { store, configs: kpiConfigs } }];
    case 'fieldpane':
      return [{ comp: 'FieldPane', props: { model, label: 'Champs du modèle' } }];
    case 'topn':
      return [
        { comp: 'TopNFilter', props: { store, dimension: 'product', measure: 'revenue', defaultN: 4, label: 'Top N produits' } },
        { comp: 'CrossfilteredBarChart', props: { store, viewId: 'topn', dimension: 'product', measure: 'revenue', selectable: false, orientation: 'horizontal', label: 'Produits' } },
      ];
    case 'valueslicer':
      return [
        { comp: 'ValueSlicer', props: { store, dimension: 'category' } },
        { comp: 'RecordsTable', props: { store, pageSize: 6, fields: ['category', 'product', 'revenue'] } },
      ];
    case 'relativedate':
      return [
        { comp: 'RelativeDateFilter', props: { store, dimension: 'date', now: DEMO_NOW, label: 'Période' } },
        { comp: 'RecordsTable', props: { store, pageSize: 6, fields: ['month', 'category', 'revenue'] } },
      ];
    case 'rangeslider':
      return [
        { comp: 'RangeSliderFilter', props: { store, dimension: 'price', step: 1, label: 'Prix unitaire (€)' } },
        { comp: 'RecordsTable', props: { store, pageSize: 6, fields: ['product', 'price', 'units', 'revenue'] } },
      ];
    case 'daterange':
      return [
        { comp: 'DateRangeFilter', props: { store, dimension: 'date', label: 'Plage de dates' } },
        { comp: 'RecordsTable', props: { store, pageSize: 6, fields: ['month', 'category', 'revenue'] } },
      ];
    case 'export':
      return [
        { comp: 'ExportMenu', props: { store, filename: 'ventes.csv', label: 'Exporter en CSV' } },
        { comp: 'RecordsTable', props: { store, pageSize: 6 } },
      ];
    case 'webframe':
      return [{ comp: 'WebFrame', props: { frame: { url: 'https://www.openstreetmap.org/export/embed.html?bbox=2.2,48.8,2.4,48.9&layer=mapnik', title: 'Carte intégrée', sandbox: ['allow-scripts', 'allow-same-origin'], height: 320 } } }];
    case 'dataimage':
      return [{ comp: 'DataImage', props: { image: { srcTemplate: 'https://placehold.co/160x100?text={category}', altTemplate: 'Visuel — {category}', fallbackSrc: 'https://placehold.co/160x100?text=N%2FA' }, row: { category: 'Capteurs' } } }];
    case 'objectpanel':
      return [{ comp: 'ObjectLayerPanel', props: { layers: BI_LAYERS, defaultExpandedIds: ['kpis', 'charts'], label: 'Calques du tableau de bord' } }];
    // bookmarks / formatpanel / calculation carry mutable local state in the
    // Svelte demo (play/pause timer, onChange-driven panels) — left Svelte-only.
    default:
      return null;
  }
}

const BI_LAYERS = [
  { id: 'kpis', label: 'Bandeau KPI', visible: true, children: [
    { id: 'kpi-rev', label: 'Revenu', visible: true },
    { id: 'kpi-units', label: 'Unités', visible: true },
  ] },
  { id: 'charts', label: 'Graphiques', visible: true, children: [
    { id: 'map', label: 'Carte des ventes', visible: true },
    { id: 'trend', label: 'Tendance', visible: false },
  ] },
];

// ── Grid specs (GridDemo kinds) ──────────────────────────────────────────────
function gridSpec(kind: string, ctx: SpecContext): NodeSpec[] | null {
  const store = ctx.store;
  switch (kind) {
    case 'records':
      return [{ comp: 'RecordsTable', props: { store, pageSize: 12, caption: 'Commandes (cross-filtrées)' } }];
    case 'pivot':
      return [{ comp: 'PivotDataTable', props: { store, rows: ['region', 'country'], columns: ['channel'], measures: ['revenue'], caption: 'Revenu par région/pays × canal' } }];
    case 'advancedpivot':
      return [{ comp: 'AdvancedPivotDataTable', props: { store, rows: ['region', 'category'], columns: ['channel'], measures: ['revenue', 'units'], includeSubtotals: true, heatmap: true, sparklineDimension: 'month', caption: 'Pivot avancé — sous-totaux, heat & sparkline' } }];
    case 'conditional-format':
      return [{ comp: 'RecordsTable', props: { store, fields: ['region', 'category', 'channel', 'revenue', 'margin', 'marginRate'], conditionalFormat: { revenue: revenueFormat, marginRate: marginRateFormat }, pageSize: 15, caption: 'Mise en forme conditionnelle — revenu & taux de marge' } }];
    default:
      return null;
  }
}

/**
 * Resolve the spec list for a demo. Returns `null` when the demo has no
 * cross-framework island (Svelte-only this pass).
 */
export function buildSpec(section: Section, kind: string, ctx: SpecContext): NodeSpec[] | null {
  switch (section) {
    case 'charts':
      return chartSpec(kind, ctx) ?? geoSpec(kind, ctx);
    case 'dashboards':
      return biSpec(kind, ctx);
    case 'grids':
      return gridSpec(kind, ctx);
    default:
      return null;
  }
}

/** Whether a demo has a React/Vue island available (used to gate the UI). */
export function hasIsland(section: Section, kind: string): boolean {
  // Probe with a throwaway context: spec builders only branch on section/kind,
  // not on the store identity, so a null store is fine for a presence check.
  return buildSpec(section, kind, { store: null as unknown as DashboardStore }) !== null;
}
