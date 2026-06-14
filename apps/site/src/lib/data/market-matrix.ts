/**
 * Matrice de couverture « marché total » — mapping des composants dataviz aux
 * solutions du marché (New Relic, Kibana, Grafana, Highcharts, Tableau,
 * Power BI, Qlik, Dataiku, SAS Visual Analytics).
 *
 * Source : audit des galeries/docs officielles (2026-06-14, voir BACKLOG.md).
 * Données prêtes à être rendues en page de doc dès que la structure de pages se
 * stabilise (le rendu se fera via les surfaces du design system, pas de markup
 * maison). `status` : covered = couvert d'origine ; gap-filled = écart comblé
 * (avec `since` = version dataviz) ; fr-ds = composant demandé au design system
 * (en attente de publication, je câble au tag).
 */

export type MarketCategory = 'observability' | 'charting' | 'bi' | 'analytics';

export interface MarketSolution {
  id: string;
  name: string;
  category: MarketCategory;
}

/** Les 9 solutions de référence (colonnes de la matrice). */
export const MARKET_SOLUTIONS: MarketSolution[] = [
  { id: 'grafana', name: 'Grafana', category: 'observability' },
  { id: 'newrelic', name: 'New Relic', category: 'observability' },
  { id: 'kibana', name: 'Kibana / Elastic', category: 'observability' },
  { id: 'highcharts', name: 'Highcharts', category: 'charting' },
  { id: 'tableau', name: 'Tableau', category: 'bi' },
  { id: 'powerbi', name: 'Power BI', category: 'bi' },
  { id: 'qlik', name: 'Qlik Sense', category: 'bi' },
  { id: 'dataiku', name: 'Dataiku', category: 'analytics' },
  { id: 'sas', name: 'SAS Visual Analytics', category: 'analytics' },
];

export type CoverageStatus = 'covered' | 'gap-filled' | 'fr-ds';

export interface ComponentMapping {
  /** Composant dataviz (ou nom prévu si fr-ds). */
  component: string;
  /** Famille / groupe sidebar. */
  group: string;
  status: CoverageStatus;
  /** Version dataviz si l'écart a été comblé. */
  since?: string;
  /** Ids des solutions où un équivalent existe nativement. */
  inSolutions: string[];
  /** Noms sous lesquels la capacité apparaît sur le marché. */
  marketNames: string;
}

const ALL = MARKET_SOLUTIONS.map((s) => s.id);

/** Lignes de la matrice (composant dataviz → présence par solution). */
export const MARKET_COVERAGE: ComponentMapping[] = [
  // ── Catégoriels & séries temporelles ───────────────────────────────────
  { component: 'AreaChart', group: 'Catégoriels & combo', status: 'covered', inSolutions: ALL, marketNames: 'Area / Stacked area' },
  { component: 'StackedBarChart', group: 'Catégoriels & combo', status: 'covered', inSolutions: ALL, marketNames: 'Bar / Column (grouped, stacked)' },
  { component: 'TrendLineChart', group: 'Catégoriels & combo', status: 'covered', inSolutions: ALL, marketNames: 'Line / Time series' },
  { component: 'StepLineChart', group: 'Catégoriels & combo', status: 'covered', inSolutions: ['grafana', 'highcharts', 'sas', 'kibana'], marketNames: 'Step / Needle' },
  { component: 'ComboChart', group: 'Catégoriels & combo', status: 'covered', inSolutions: ['highcharts', 'tableau', 'powerbi', 'qlik', 'sas'], marketNames: 'Combo / Dual-axis' },
  { component: 'ForecastLineChart', group: 'Catégoriels & combo', status: 'covered', inSolutions: ['newrelic', 'powerbi', 'sas'], marketNames: 'Forecast / Predicted trend' },
  { component: 'DivergingBarChart', group: 'Catégoriels & combo', status: 'covered', inSolutions: ['tableau', 'sas'], marketNames: 'Butterfly / Population pyramid' },
  { component: 'LollipopChart', group: 'Catégoriels & combo', status: 'covered', inSolutions: ['highcharts', 'sas'], marketNames: 'Lollipop / Dot plot' },
  { component: 'DumbbellChart', group: 'Plages & intervalles', status: 'covered', inSolutions: ['highcharts', 'sas'], marketNames: 'Dumbbell / Bubble change' },
  { component: 'BumpChart', group: 'Évolution & classements', status: 'covered', inSolutions: ['highcharts', 'tableau'], marketNames: 'Bump / Slope' },

  // ── Part-of-whole & flux ────────────────────────────────────────────────
  { component: 'DonutChart', group: 'Part-of-whole & flux', status: 'covered', inSolutions: ALL, marketNames: 'Pie / Donut' },
  { component: 'VariablePieChart', group: 'Proportions', status: 'covered', inSolutions: ['highcharts', 'tableau'], marketNames: 'Variable pie' },
  { component: 'TreemapChart', group: 'Part-of-whole & flux', status: 'covered', inSolutions: ALL, marketNames: 'Treemap' },
  { component: 'SunburstChart', group: 'Part-of-whole & flux', status: 'covered', inSolutions: ['highcharts', 'powerbi'], marketNames: 'Sunburst' },
  { component: 'FunnelChart', group: 'Part-of-whole & flux', status: 'covered', inSolutions: ['newrelic', 'highcharts', 'powerbi', 'qlik'], marketNames: 'Funnel' },
  { component: 'ColumnPyramidChart', group: 'Proportions', status: 'covered', inSolutions: ['highcharts'], marketNames: 'Pyramid' },
  { component: 'SankeyChart', group: 'Part-of-whole & flux', status: 'covered', inSolutions: ['highcharts', 'tableau', 'powerbi', 'qlik', 'sas'], marketNames: 'Sankey / Path' },
  { component: 'ChordChart', group: 'Part-of-whole & flux', status: 'covered', inSolutions: ['highcharts', 'powerbi'], marketNames: 'Chord / Dependency wheel' },
  { component: 'MekkoChart', group: 'Part-of-whole & flux', status: 'covered', inSolutions: ['highcharts', 'powerbi', 'qlik'], marketNames: 'Marimekko / Mosaic / Variwide' },
  { component: 'WaterfallChart', group: 'Part-of-whole & flux', status: 'covered', inSolutions: ALL, marketNames: 'Waterfall' },
  { component: 'ItemChart', group: 'Proportions', status: 'covered', inSolutions: ['highcharts'], marketNames: 'Item / Parliament / Pictogram' },

  // ── Distribution & statistique ──────────────────────────────────────────
  { component: 'HistogramChart', group: 'Distribution & statistique', status: 'covered', inSolutions: ALL, marketNames: 'Histogram' },
  { component: 'BoxPlotChart', group: 'Distribution & statistique', status: 'covered', inSolutions: ['highcharts', 'tableau', 'powerbi', 'qlik', 'dataiku', 'sas'], marketNames: 'Box plot' },
  { component: 'ViolinChart', group: 'Distribution & statistique', status: 'covered', inSolutions: ['highcharts', 'qlik'], marketNames: 'Violin / Distribution' },
  { component: 'BellCurveChart', group: 'Distribution & statistique', status: 'covered', inSolutions: ['highcharts'], marketNames: 'Bell curve' },
  { component: 'ParetoChart', group: 'Distribution & statistique', status: 'covered', inSolutions: ['highcharts'], marketNames: 'Pareto' },
  { component: 'ErrorBarsChart', group: 'Distribution & statistique', status: 'covered', inSolutions: ['highcharts', 'sas'], marketNames: 'Error bars / Band' },
  { component: 'HeatmapChart', group: 'Distribution & statistique', status: 'covered', inSolutions: ALL, marketNames: 'Heatmap / Highlight table' },
  { component: 'CalendarHeatmapChart', group: 'Distribution & statistique', status: 'covered', inSolutions: ['grafana', 'kibana'], marketNames: 'Calendar heatmap' },
  { component: 'CorrelationMatrix', group: 'Distribution & statistique', status: 'gap-filled', since: 'v0.4.35', inSolutions: ['sas'], marketNames: 'Correlation matrix' },

  // ── Couche analytique ───────────────────────────────────────────────────
  { component: 'ScatterPlot', group: 'Couche analytique', status: 'covered', inSolutions: ALL, marketNames: 'Scatter / Bubble' },
  { component: 'PackedBubbleChart', group: 'Part-of-whole & flux', status: 'covered', inSolutions: ['highcharts', 'tableau'], marketNames: 'Packed bubble' },
  { component: 'RadarChart', group: 'Part-of-whole & flux', status: 'covered', inSolutions: ['highcharts', 'qlik', 'dataiku', 'powerbi'], marketNames: 'Radar / Spider' },
  { component: 'ParallelCoordinatesChart', group: 'Couche analytique', status: 'covered', inSolutions: ['highcharts', 'sas'], marketNames: 'Parallel coordinates' },
  { component: 'AnalyticsClusterPlot', group: 'Couche analytique', status: 'covered', inSolutions: ['dataiku', 'sas'], marketNames: 'Cluster (k-means) scatter' },
  { component: 'ScatterPlotMatrix', group: 'Couche analytique', status: 'gap-filled', since: 'v0.4.35', inSolutions: ['sas'], marketNames: 'Scatterplot matrix (SPLOM)' },
  { component: 'AnimatedBubbleChart', group: 'Couche analytique', status: 'gap-filled', since: 'v0.4.36', inSolutions: ['sas'], marketNames: 'Animated bubble (Gapminder)' },

  // ── Réseaux & graphes ───────────────────────────────────────────────────
  { component: 'ForceGraph', group: 'Réseaux & graphes', status: 'gap-filled', since: 'v0.4.33', inSolutions: ['grafana', 'newrelic', 'kibana', 'highcharts', 'powerbi', 'qlik', 'sas'], marketNames: 'Network graph / Node graph / Service map' },
  { component: 'ArcDiagramChart', group: 'Réseaux & graphes', status: 'gap-filled', since: 'v0.4.33', inSolutions: ['highcharts'], marketNames: 'Arc diagram' },
  { component: 'DependencyWheelChart', group: 'Réseaux & graphes', status: 'gap-filled', since: 'v0.4.33', inSolutions: ['highcharts'], marketNames: 'Dependency wheel' },
  { component: 'OrganizationChart', group: 'Hiérarchie', status: 'covered', inSolutions: ['highcharts', 'qlik'], marketNames: 'Org chart' },
  { component: 'TreegraphChart', group: 'Hiérarchie', status: 'covered', inSolutions: ['highcharts'], marketNames: 'Treegraph / Tree' },

  // ── Indicateurs / KPI ───────────────────────────────────────────────────
  { component: 'ScoreCard', group: 'Indicateurs', status: 'covered', inSolutions: ALL, marketNames: 'Stat / KPI / Billboard / Card / Metric' },
  { component: 'KpiCardGroup', group: 'Indicateurs', status: 'covered', inSolutions: ALL, marketNames: 'KPI group / Goals' },
  { component: 'GaugeChart', group: 'Distribution & statistique', status: 'covered', inSolutions: ALL, marketNames: 'Gauge (angular)' },
  { component: 'BulletChart', group: 'Distribution & statistique', status: 'covered', inSolutions: ['grafana', 'newrelic', 'highcharts', 'powerbi', 'qlik', 'sas'], marketNames: 'Bullet / Bar gauge / Targeted bar' },
  { component: 'Sparkline', group: 'Indicateurs', status: 'covered', inSolutions: ['highcharts', 'powerbi', 'qlik'], marketNames: 'Sparkline' },

  // ── Finance ─────────────────────────────────────────────────────────────
  { component: 'CandlestickChart', group: 'Finance', status: 'covered', inSolutions: ['grafana', 'highcharts', 'sas'], marketNames: 'Candlestick' },
  { component: 'OHLCChart', group: 'Finance', status: 'covered', inSolutions: ['highcharts', 'sas'], marketNames: 'OHLC' },
  { component: 'HLCChart', group: 'Finance', status: 'gap-filled', since: 'v0.4.34', inSolutions: ['highcharts', 'sas'], marketNames: 'HLC (high-low-close)' },
  { component: 'HeikinAshiChart', group: 'Finance', status: 'gap-filled', since: 'v0.4.33', inSolutions: ['highcharts'], marketNames: 'Heikin-Ashi' },
  { component: 'HollowCandlestickChart', group: 'Finance', status: 'gap-filled', since: 'v0.4.34', inSolutions: ['highcharts'], marketNames: 'Hollow candlestick' },

  // ── Plages / projet / temps / texte / formes ───────────────────────────
  { component: 'AreaRangeChart', group: 'Plages & intervalles', status: 'covered', inSolutions: ['highcharts', 'sas'], marketNames: 'Area range / Band' },
  { component: 'AreaSplineRangeChart', group: 'Plages & intervalles', status: 'covered', inSolutions: ['highcharts'], marketNames: 'Area spline range' },
  { component: 'ColumnRangeChart', group: 'Plages & intervalles', status: 'covered', inSolutions: ['highcharts'], marketNames: 'Column range' },
  { component: 'GanttChart', group: 'Projet & temps', status: 'covered', inSolutions: ['highcharts', 'tableau', 'powerbi', 'sas'], marketNames: 'Gantt / Schedule' },
  { component: 'TimelineChart', group: 'Projet & temps', status: 'covered', inSolutions: ['highcharts', 'powerbi'], marketNames: 'Timeline' },
  { component: 'StreamgraphChart', group: 'Évolution & classements', status: 'covered', inSolutions: ['highcharts', 'kibana'], marketNames: 'Streamgraph' },
  { component: 'WordCloudChart', group: 'Texte & nuages', status: 'covered', inSolutions: ['highcharts', 'kibana', 'powerbi', 'qlik'], marketNames: 'Word cloud / Tag cloud' },
  { component: 'VennChart', group: 'Ensembles', status: 'covered', inSolutions: ['highcharts'], marketNames: 'Venn' },
  { component: 'PolygonChart', group: 'Formes', status: 'covered', inSolutions: ['highcharts'], marketNames: 'Polygon' },
  { component: 'TileMapChart', group: 'Cartographie géo', status: 'covered', inSolutions: ['highcharts'], marketNames: 'Tilemap (cartogram)' },

  // ── Cartographie géo ────────────────────────────────────────────────────
  { component: 'ChoroplethMap', group: 'Cartographie géo', status: 'covered', inSolutions: ALL, marketNames: 'Filled / Region / Choropleth map' },
  { component: 'GeoPointMap', group: 'Cartographie géo', status: 'covered', inSolutions: ALL, marketNames: 'Symbol / Bubble / Point map' },
  { component: 'GeoDensityMap', group: 'Cartographie géo', status: 'covered', inSolutions: ['grafana', 'kibana', 'tableau', 'dataiku'], marketNames: 'Heat map (geo)' },
  { component: 'GeoFlowMap', group: 'Cartographie géo', status: 'covered', inSolutions: ['grafana', 'tableau', 'highcharts'], marketNames: 'Flow / Path map' },
  { component: 'GeoHexbinMap', group: 'Cartographie géo', status: 'covered', inSolutions: ['kibana', 'dataiku'], marketNames: 'Hexbin / Grid map' },
  { component: 'GeoClusterMap', group: 'Cartographie géo', status: 'covered', inSolutions: ['kibana', 'dataiku'], marketNames: 'Cluster map' },
  { component: 'GeoJsonMap', group: 'Cartographie géo', status: 'covered', inSolutions: ['kibana', 'powerbi', 'dataiku'], marketNames: 'GeoJSON / Shape map' },

  // ── Tables / grilles ────────────────────────────────────────────────────
  { component: 'RecordsTable', group: 'Grilles', status: 'covered', inSolutions: ALL, marketNames: 'Table / List' },
  { component: 'PivotDataTable', group: 'Grilles', status: 'covered', inSolutions: ALL, marketNames: 'Matrix / Crosstab / Pivot' },
  { component: 'AdvancedPivotDataTable', group: 'Grilles', status: 'covered', inSolutions: ['powerbi', 'qlik'], marketNames: 'Heatmap table / P&L pivot' },

  // ── Catégorie B — demandés au design system (fr-ds), câblés à la livraison ─
  { component: 'StateTimelineChart', group: 'Observabilité', status: 'gap-filled', since: 'v0.4.38', inSolutions: ['grafana', 'kibana'], marketNames: 'State timeline (xrange)' },
  { component: 'SolidGaugeChart', group: 'Indicateurs', status: 'gap-filled', since: 'v0.4.38', inSolutions: ['highcharts'], marketNames: 'Solid gauge / Progress ring' },
  { component: 'StatusHistoryChart', group: 'Observabilité', status: 'gap-filled', since: 'v0.4.39', inSolutions: ['grafana'], marketNames: 'Status history' },
  { component: 'WaffleChart', group: 'Proportions', status: 'gap-filled', since: 'v0.4.39', inSolutions: ['kibana'], marketNames: 'Waffle' },
  { component: 'RibbonChart', group: 'Évolution & classements', status: 'gap-filled', since: 'v0.4.40', inSolutions: ['powerbi'], marketNames: 'Ribbon' },
  { component: 'AnomalySwimLaneChart', group: 'Observabilité', status: 'gap-filled', since: 'v0.4.40', inSolutions: ['kibana'], marketNames: 'ML anomaly swim lane' },
  { component: 'FlamegraphChart', group: 'Observabilité', status: 'gap-filled', since: 'v0.4.41', inSolutions: ['grafana'], marketNames: 'Flame graph' },
  { component: 'TraceWaterfallChart', group: 'Observabilité', status: 'gap-filled', since: 'v0.4.41', inSolutions: ['grafana'], marketNames: 'Trace waterfall' },
  { component: 'DecompositionTreeChart', group: 'Hiérarchie', status: 'gap-filled', since: 'v0.4.41', inSolutions: ['powerbi'], marketNames: 'Decomposition tree' },
  { component: 'Density2DChart', group: 'Distribution & statistique', status: 'gap-filled', since: 'v0.4.41', inSolutions: ['tableau', 'dataiku'], marketNames: 'Density 2D (hexbin/contour non-géo)' },
  { component: 'EventFeedPanel', group: 'Observabilité', status: 'gap-filled', since: 'v0.4.42', inSolutions: ['newrelic'], marketNames: 'Event feed' },
  { component: 'VectorFieldChart', group: 'Distribution & statistique', status: 'gap-filled', since: 'v0.4.42', inSolutions: ['highcharts', 'sas'], marketNames: 'Vector field' },
  { component: 'ContourChart', group: 'Distribution & statistique', status: 'gap-filled', since: 'v0.4.43', inSolutions: ['highcharts'], marketNames: 'Contour' },
  { component: 'WindBarbChart', group: 'Distribution & statistique', status: 'gap-filled', since: 'v0.4.43', inSolutions: ['highcharts'], marketNames: 'Wind barb' },
  { component: 'RenkoChart', group: 'Finance', status: 'gap-filled', since: 'v0.4.44', inSolutions: ['highcharts'], marketNames: 'Renko' },
  { component: 'PointAndFigureChart', group: 'Finance', status: 'gap-filled', since: 'v0.4.44', inSolutions: ['highcharts'], marketNames: 'Point & figure' },
];

/** Synthèse rapide (pour un bandeau de page). */
export const MARKET_SUMMARY = {
  solutions: MARKET_SOLUTIONS.length,
  total: MARKET_COVERAGE.length,
  covered: MARKET_COVERAGE.filter((c) => c.status === 'covered').length,
  gapFilled: MARKET_COVERAGE.filter((c) => c.status === 'gap-filled').length,
  frDs: MARKET_COVERAGE.filter((c) => c.status === 'fr-ds').length,
};
