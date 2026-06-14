<!--
  One multiplexed chart demo. `kind` selects which dataviz chart wrapper to
  render; all share a single seeded store and react to a measure + a "Top-N
  categories" control so the demos feel like real, explorable visuals (not toy
  3-row charts). Colour comes entirely from the active DS palette (tone tokens).
-->
<script lang="ts">
  import {
    AreaChart,
    ComboChart,
    StackedBarChart,
    LollipopChart,
    StepLineChart,
    ParetoChart,
    DivergingBarChart,
    DonutChart,
    FunnelChart,
    WaterfallChart,
    TreemapChart,
    SunburstChart,
    SankeyChart,
    RadarChart,
    MekkoChart,
    ChordChart,
    RoseChart,
    PackedBubbleChart,
    HistogramChart,
    BoxPlotChart,
    HeatmapChart,
    CalendarHeatmapChart,
    BulletChart,
    GaugeChart,
    ReferenceLineChart,
    PercentileBandChart,
    TrendLineChart,
    ForecastLineChart,
    ErrorBarsChart,
    AnalyticsClusterPlot,
    ScatterPlot,
    CandlestickChart,
    ViolinChart,
    BumpChart,
    ParallelCoordinatesChart,
    OHLCChart,
    GanttChart,
    TimelineChart,
    StreamgraphChart,
    TileMapChart,
    Sparkline,
    ScoreCard,
    AreaRangeChart,
    AreaSplineRangeChart,
    ColumnRangeChart,
    DumbbellChart,
    VariablePieChart,
    ItemChart,
    ColumnPyramidChart,
    BellCurveChart,
    OrganizationChart,
    TreegraphChart,
    VennChart,
    WordCloudChart,
    PolygonChart,
    ForceGraph,
    ArcDiagramChart,
    DependencyWheelChart,
    HeikinAshiChart,
    HollowCandlestickChart,
    HLCChart,
    CorrelationMatrix,
    ScatterPlotMatrix,
    AnimatedBubbleChart,
    StateTimelineChart,
    SolidGaugeChart,
    StatusHistoryChart,
    WaffleChart,
    RibbonChart,
    AnomalySwimLaneChart,
  } from '@sentropic/dataviz-svelte';
  import { ContentSwitcher } from '@sentropic/design-system-svelte';
  import { lineAnnotation, regionAnnotation, makeFormatter } from '@sentropic/dataviz-core';
  import { makeStore } from '../../data/store';
  import { makeOhlcStore } from '../../data/ohlc-store';
  import { makeGanttStore } from '../../data/gantt';
  import { makeTimelineStore } from '../../data/timeline';
  import { makeStreamgraphStore } from '../../data/streamgraph';
  import { makeTilemapStore } from '../../data/tilemap';
  import { makeRangeStore } from '../../data/range';
  import { makeVariablePieStore, makeItemStore } from '../../data/variablePie';
  import { makeColumnPyramidStore } from '../../data/columnPyramid';
  import { makeForceGraphStore } from '../../data/forceGraph';
  import { makeArcDiagramStore } from '../../data/arcDiagram';
  import { makeDependencyWheelStore } from '../../data/dependencyWheel';
  import { makeAnimatedBubbleStore } from '../../data/animatedBubble';
  import { makeStateTimelineStore } from '../../data/stateTimeline';
  import { makeStatusHistoryStore } from '../../data/statusHistory';
  import { makeRibbonStore } from '../../data/ribbon';
  import { makeAnomalySwimLaneStore } from '../../data/anomalySwimLane';
  import { makeBellCurveStore } from '../../data/bellCurve';
  import { makeHierarchyStore } from '../../data/hierarchy';
  import { makeWordCloudStore } from '../../data/wordCloud';
  import { makePolygonStore } from '../../data/polygon';
  import { vennAreas } from '../../data/venn';

  let { kind, controls = true }: { kind: string; controls?: boolean } = $props();

  const store = makeStore();
  const ohlcStore = makeOhlcStore();
  const ganttStore = makeGanttStore();
  const timelineStore = makeTimelineStore();
  const streamgraphStore = makeStreamgraphStore();
  const tilemapStore = makeTilemapStore();
  const rangeStore = makeRangeStore();
  const variablePieStore = makeVariablePieStore();
  const itemStore = makeItemStore();
  const columnPyramidStore = makeColumnPyramidStore();
  const forceGraphStore = makeForceGraphStore();
  const arcDiagramStore = makeArcDiagramStore();
  const dependencyWheelStore = makeDependencyWheelStore();
  const animatedBubbleStore = makeAnimatedBubbleStore();
  const stateTimelineStore = makeStateTimelineStore();
  const statusHistoryStore = makeStatusHistoryStore();
  const ribbonStore = makeRibbonStore();
  const anomalySwimLaneStore = makeAnomalySwimLaneStore();
  const bellCurveStore = makeBellCurveStore();
  const hierarchyStore = makeHierarchyStore();
  const wordCloudStore = makeWordCloudStore();
  const polygonStore = makePolygonStore();

  let measure = $state<'revenue' | 'units' | 'margin'>('revenue');
  const measureItems = [
    { value: 'revenue', label: 'Revenu (€)' },
    { value: 'units', label: 'Unités' },
    { value: 'margin', label: 'Marge (€)' },
  ];

  // A category dimension control for the "by X" charts.
  let dimension = $state<'category' | 'country' | 'channel' | 'segment'>('category');
  const dimItems = [
    { value: 'category', label: 'Catégorie' },
    { value: 'country', label: 'Pays' },
    { value: 'channel', label: 'Canal' },
    { value: 'segment', label: 'Segment' },
  ];

  const showDim = $derived(
    [
      'area', 'lollipop', 'step', 'pareto', 'diverging', 'donut', 'funnel',
      'waterfall', 'rose', 'packed', 'stacked', 'mekko',
    ].includes(kind),
  );
  const showMeasure = $derived(kind !== 'gauge' && kind !== 'box' && kind !== 'histogram');

  // ── AreaChart: annotations + data-labels ──────────────────────────────────
  const areaAnnotations = [
    lineAnnotation('y', 400000, { label: 'Objectif' }),
    regionAnnotation('y', 350000, 500000, { label: 'Zone cible' }),
  ];
  const areaDataLabels = { format: makeFormatter({ style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }) };

  // ── StackedBarChart: legend toggle ────────────────────────────────────────
  let hiddenSeries = $state<string[]>([]);
  function onToggleSeries(seriesId: string) {
    hiddenSeries = hiddenSeries.includes(seriesId)
      ? hiddenSeries.filter((id) => id !== seriesId)
      : [...hiddenSeries, seriesId];
  }
</script>

{#if controls}
  <div class="ctrls">
    {#if showMeasure}
      <div class="ctrl">
        <span>Mesure</span>
        <ContentSwitcher size="sm" label="Mesure" items={measureItems} value={measure} onchange={(v) => (measure = v as typeof measure)} />
      </div>
    {/if}
    {#if showDim}
      <div class="ctrl">
        <span>Dimension</span>
        <ContentSwitcher size="sm" label="Dimension" items={dimItems} value={dimension} onchange={(v) => (dimension = v as typeof dimension)} />
      </div>
    {/if}
  </div>
{/if}

<div class="stage">
  {#if kind === 'area'}
    <AreaChart {store} viewId="c" category={dimension} {measure} label="Revenu par {dimension}" smooth
      annotations={areaAnnotations} dataLabels={areaDataLabels} />
  {:else if kind === 'combo'}
    <ComboChart {store} viewId="c" category="category"
      measures={[{ measure: 'revenue', mode: 'bar', label: 'Revenu' }, { measure: 'units', mode: 'line', label: 'Unités' }]}
      leftAxisLabel="Revenu (€)" rightAxisLabel="Unités" label="Revenu & unités par catégorie" legend />
  {:else if kind === 'stacked'}
    <StackedBarChart {store} viewId="c" category={dimension} series="channel" {measure} mode="stacked" label="Par {dimension} et canal"
      {hiddenSeries} {onToggleSeries} />
  {:else if kind === 'lollipop'}
    <LollipopChart {store} viewId="c" category={dimension} {measure} label="Lollipop" orientation="horizontal" />
  {:else if kind === 'step'}
    <StepLineChart {store} viewId="c" category="month" {measure} label="Évolution mensuelle" />
  {:else if kind === 'pareto'}
    <ParetoChart {store} viewId="c" category={dimension} {measure} label="Pareto" />
  {:else if kind === 'diverging'}
    <DivergingBarChart {store} viewId="c" category={dimension} measure="margin" label="Marge par {dimension}" showLegend />
  {:else if kind === 'donut'}
    <DonutChart {store} viewId="c" category={dimension} {measure} centerLabel="Total" label="Répartition" />
  {:else if kind === 'funnel'}
    <FunnelChart {store} viewId="c" category="channel" {measure} showPercentages label="Entonnoir par canal" legend />
  {:else if kind === 'waterfall'}
    <WaterfallChart {store} viewId="c" category="category" {measure} totalLabel="Total" label="Cascade par catégorie" />
  {:else if kind === 'treemap'}
    <TreemapChart {store} viewId="c" hierarchy={['region', 'country', 'city']} {measure} label="Treemap géographique" />
  {:else if kind === 'sunburst'}
    <SunburstChart {store} viewId="c" hierarchy={['region', 'category', 'product']} {measure} label="Sunburst" legend />
  {:else if kind === 'sankey'}
    <SankeyChart {store} viewId="c" source="region" target="category" {measure} label="Flux région → catégorie" />
  {:else if kind === 'radar'}
    <RadarChart {store} viewId="c" axes={['Capteurs', 'Réseau', 'Contrôleurs', 'Énergie', 'Affichage']} series="category" {measure} label="Profil par catégorie" legend />
  {:else if kind === 'mekko'}
    <MekkoChart {store} viewId="c" category={dimension} series="channel" {measure} label="Marimekko" />
  {:else if kind === 'chord'}
    <ChordChart {store} viewId="c" source="region" target="channel" {measure} label="Chord région ↔ canal" />
  {:else if kind === 'rose'}
    <RoseChart {store} viewId="c" category={dimension} {measure} label="Rose polaire" />
  {:else if kind === 'packed'}
    <PackedBubbleChart {store} viewId="c" category={dimension} {measure} label="Bulles" />
  {:else if kind === 'histogram'}
    <HistogramChart {store} value="price" bins={16} label="Distribution des prix" />
  {:else if kind === 'box'}
    <BoxPlotChart {store} value="price" group="category" label="Prix par catégorie" />
  {:else if kind === 'heatmap'}
    <HeatmapChart {store} x="category" y="channel" {measure} label="Catégorie × canal" legend />
  {:else if kind === 'calendar'}
    <CalendarHeatmapChart {store} date="date" {measure} label="Activité par jour" />
  {:else if kind === 'bullet'}
    <BulletChart {store} value="revenue" target={1500000} category="Revenu" ranges={[800000, 1200000, 1600000]} label="Objectif de revenu" />
  {:else if kind === 'gauge'}
    <GaugeChart {store} value="revenue" min={0} max={2000000} label="Revenu" thresholds={[{ value: 800000, tone: 'warning' }, { value: 1400000, tone: 'success' }]} unit="€" />
  {:else if kind === 'reference'}
    <ReferenceLineChart {store} viewId="c" measure="revenue" referenceLabel="Moyenne" label="Revenu par mois + ligne de référence" />
  {:else if kind === 'percentile'}
    <PercentileBandChart {store} viewId="c" value="price" lower={0.1} upper={0.9} label="Bande 10–90e percentile (prix)" />
  {:else if kind === 'trend'}
    <TrendLineChart {store} viewId="c" x="date" y="revenue" label="Tendance du revenu" />
  {:else if kind === 'forecast'}
    <ForecastLineChart {store} viewId="c" x="date" y="revenue" periods={6} label="Prévision du revenu (6 mois)" />
  {:else if kind === 'errorbars'}
    <ErrorBarsChart {store} viewId="c" category="category" value="price" interval="stdev" label="Prix moyen ± écart-type" />
  {:else if kind === 'cluster'}
    <AnalyticsClusterPlot {store} viewId="c" fields={['price', 'marginRate']} k={3} label="Clusters prix/marge" />
  {:else if kind === 'scatter'}
    <ScatterPlot {store} viewId="c" x="revenue" y="units" series="category" labelField="category" label="Revenu vs unités par catégorie" />
  {:else if kind === 'candlestick'}
    <CandlestickChart store={ohlcStore} viewId="ohlc" label_field="session" open="open" high="high" low="low" close="close" label="Cours boursiers (28 séances)" />
  {:else if kind === 'ohlc'}
    <OHLCChart store={ohlcStore} viewId="ohlc" label_field="session" open="open" high="high" low="low" close="close" label="Cours boursiers OHLC (28 séances)" />
  {:else if kind === 'gantt'}
    <GanttChart store={ganttStore} viewId="gantt" task="task" start="start" end="end" category="category" marker={10} label="Planning de projet" />
  {:else if kind === 'timeline'}
    <TimelineChart store={timelineStore} viewId="timeline" label_field="event" position="position" description="description" tone="tone" label="Jalons du projet" />
  {:else if kind === 'ribbon'}
    <RibbonChart store={ribbonStore} viewId="rb" category="product" period="quarter" value="sales" label="Parts par trimestre" />
  {:else if kind === 'streamgraph'}
    <StreamgraphChart store={streamgraphStore} viewId="sg" category="month" series="channel" measure="revenue" smooth showLegend label="Revenu par canal (flux)" />
  {:else if kind === 'tilemap'}
    <TileMapChart store={tilemapStore} viewId="tm" label_field="region" col="col" row="row" value="revenue" label="Revenu régional (grille)" />
  {:else if kind === 'sparkline'}
    <Sparkline {store} viewId="c" dimension="month" measure="revenue" area label="Tendance mensuelle du revenu" />
  {:else if kind === 'scorecard'}
    <ScoreCard {store} viewId="c" measure="revenue" sparklineDimension="month" format="currency" label="Revenu total" tone="category1" />
  {:else if kind === 'violin'}
    <ViolinChart {store} viewId="c" groupBy="category" measure="price" label="Distribution des prix par catégorie" />
  {:else if kind === 'bump'}
    <BumpChart {store} viewId="c" series="category" category="month" measure="revenue" label="Classement mensuel des catégories" />
  {:else if kind === 'parallel'}
    <ParallelCoordinatesChart {store} viewId="c" measures={['price', 'units', 'marginRate']} series="category" label="Profil multivarié (prix / unités / marge)" />
  {:else if kind === 'area-range'}
    <AreaRangeChart store={rangeStore} viewId="r" x_field="month" low="low" high="high" label="Températures min/max (°C)" />
  {:else if kind === 'area-spline-range'}
    <AreaSplineRangeChart store={rangeStore} viewId="r" x_field="month" low="low" high="high" label="Plage lissée min/max (°C)" />
  {:else if kind === 'column-range'}
    <ColumnRangeChart store={rangeStore} viewId="r" category="month" low="low" high="high" label="Amplitude mensuelle (°C)" />
  {:else if kind === 'dumbbell'}
    <DumbbellChart store={rangeStore} viewId="r" category="month" low="low" high="high" lowLabel="Min" highLabel="Max" label="Écart mensuel (°C)" />
  {:else if kind === 'variable-pie'}
    <VariablePieChart store={variablePieStore} viewId="vp" label_field="party" value="votes" z="seats" label="Partis : voix (angle) × sièges (rayon)" />
  {:else if kind === 'item-chart'}
    <ItemChart store={itemStore} viewId="ic" label_field="party" value="seats" label="Répartition des sièges" />
  {:else if kind === 'waffle'}
    <WaffleChart store={itemStore} viewId="ic" label_field="party" value="seats" label="Répartition des sièges (waffle)" />
  {:else if kind === 'column-pyramid'}
    <ColumnPyramidChart store={columnPyramidStore} viewId="cp" category="stage" value="users" label="Funnel d'acquisition" />
  {:else if kind === 'bell-curve'}
    <BellCurveChart store={bellCurveStore} viewId="bc" measure="score" label="Distribution des scores (/100)" />
  {:else if kind === 'organization'}
    <OrganizationChart store={hierarchyStore} viewId="org" id_field="id" parent_field="parentId" label_field="name" label="Organigramme" />
  {:else if kind === 'treegraph'}
    <TreegraphChart store={hierarchyStore} viewId="org" id_field="id" parent_field="parentId" label_field="name" label="Arbre hiérarchique" />
  {:else if kind === 'venn'}
    <VennChart areas={vennAreas} label="Compétences partagées (Dev / Data / Design)" />
  {:else if kind === 'word-cloud'}
    <WordCloudChart store={wordCloudStore} viewId="wc" word_field="keyword" weight="frequency" label="Mots-clés tech (fréquence)" />
  {:else if kind === 'polygon'}
    <PolygonChart store={polygonStore} viewId="pg" x="x" y="y" label="Plan d'étage simplifié (m)" />
  {:else if kind === 'force-graph'}
    <ForceGraph store={forceGraphStore} viewId="fg" source="source" target="target" weight="weight" label="Dépendances entre microservices" />
  {:else if kind === 'arc-diagram'}
    <ArcDiagramChart store={arcDiagramStore} viewId="ad" source="source" target="target" weight="weight" label="Collaborations entre équipes" />
  {:else if kind === 'dependency-wheel'}
    <DependencyWheelChart store={dependencyWheelStore} viewId="dw" source="source" target="target" weight="weight" label="Dépendances entre modules" />
  {:else if kind === 'heikin-ashi'}
    <HeikinAshiChart store={ohlcStore} viewId="ohlc" label_field="session" open="open" high="high" low="low" close="close" label="Cours Heikin-Ashi (28 séances)" />
  {:else if kind === 'hollow-candlestick'}
    <HollowCandlestickChart store={ohlcStore} viewId="ohlc" label_field="session" open="open" high="high" low="low" close="close" label="Bougies creuses (28 séances)" />
  {:else if kind === 'hlc'}
    <HLCChart store={ohlcStore} viewId="ohlc" label_field="session" high="high" low="low" close="close" label="Cours HLC (28 séances)" />
  {:else if kind === 'scatter-matrix'}
    <ScatterPlotMatrix {store} viewId="c" measures={['price', 'units', 'marginRate']} label="Matrice de nuages" />
  {:else if kind === 'correlation-matrix'}
    <CorrelationMatrix {store} viewId="c" measures={['price', 'units', 'marginRate', 'revenue']} label="Corrélations" />
  {:else if kind === 'animated-bubble'}
    <AnimatedBubbleChart store={animatedBubbleStore} viewId="ab" x="gdpPerCapita" y="lifeExpectancy" size="population" time="year" series="country" label="Espérance de vie vs PIB/hab" />
  {:else if kind === 'state-timeline'}
    <StateTimelineChart store={stateTimelineStore} viewId="st" series="service" start="start" end="end" state="state" label="États des services (24 h)" />
  {:else if kind === 'status-history'}
    <StatusHistoryChart store={statusHistoryStore} viewId="sh" series="service" at="at" value="status" label="Historique de statut (8 h)" />
  {:else if kind === 'anomaly-swimlane'}
    <AnomalySwimLaneChart store={anomalySwimLaneStore} viewId="asl" job="job" at="at" score="score" max={100} label="Scores d'anomalie ML" />
  {:else if kind === 'solid-gauge'}
    <SolidGaugeChart {store} viewId="c" value="revenue" min={0} max={2000000} label="Revenu vs objectif" format="number" unit="€" thresholds={[{ value: 800000, tone: 'warning' }, { value: 1400000, tone: 'success' }]} />
  {/if}
</div>

<style>
  .ctrls {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-4, 1rem);
    margin-bottom: var(--st-spacing-4, 1rem);
  }
  .ctrl {
    display: inline-flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--st-semantic-text-secondary, #475569);
  }
  .stage {
    min-height: 0;
  }
</style>
