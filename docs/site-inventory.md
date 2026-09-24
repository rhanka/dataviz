# Inventaire du site dataviz (avant retrait — lot C)

> Contexte : les paquets `@sentropic/dataviz-*` et le paquet `graph` ont été
> rapatriés dans le design system Sentropic (dépôt de référence, site
> https://design-system.sent-tech.ca). Ce document décrit ce que le site
> dataviz présentait réellement, pour décider ce qui se redirige et ce qui se
> conserve. La galerie SPA n'est plus publiée : racine et liens profonds
> redirigent tous vers le design system (voir § 8). Ce document reste la trace
> de son contenu.

## 1. Assemblage déployé (`.github/workflows/pages.yml`)

État courant :

- `apps/site/dist` n'est plus copié : la galerie SPA n'est pas publiée.
- `apps/site/redirect.html` est copié DEUX fois — `_site/index.html` (racine)
  et `_site/404.html` (repli Pages pour toute URL non résolue). Toute adresse
  du domaine sert donc la page de renvoi.
- Les trois démos frameworks (`apps/docs`, `apps/docs-react`, `apps/docs-vue`,
  base relative) restent copiées sous `_site/demos/svelte|react|vue` : chemins
  réels, résolus avant le repli 404.
- `CNAME` (`dataviz.sent-tech.ca`) conservé à l'assemblage.

Historique (avant ce retrait) : `apps/site/dist` était copié à la racine et son
`index.html` dupliqué en `404.html`, ce qui faisait servir la galerie en repli
pour toute URL profonde ; le lot C n'avait remplacé que `_site/index.html`.

## 2. `apps/site` — docs + galerie (Vite 8 + Svelte 5, SPA History API)

Référence : `apps/site/README.md`, `apps/site/src/App.svelte`,
`apps/site/src/lib/site/router.svelte.ts`.

| Route | Contenu |
|---|---|
| `/` | Landing : hero, 3 cartes de sections, tableau de bord « en direct » (BiDemo) + bandeau de renvoi vers le site du design system |
| `/charts`, `/dashboards`, `/grids` | Catalogues groupés (tuiles vers chaque page démo) |
| `/charts/:slug` (87) | Page démo par chart (voir § 3) |
| `/dashboards/:slug` (21) | Page démo par composant BI (voir § 4) |
| `/grids/:slug` (4) | Page démo par grille (voir § 5) |
| `/coverage` | Matrice de couverture « marché total » : composants dataviz × 9 solutions de référence (Grafana, New Relic, Kibana/Elastic, Highcharts, Tableau, Power BI, Qlik Sense, Dataiku, SAS Visual Analytics), statuts couvert / comblé / FR DS |

Chaque page démo (`DemoPage`) combine : démo live interactive sur dataset
seedé, contrôles (mesure/dimension, filtres), texte de cas d'usage, onglets de
code copiable Svelte / React / Vue. Recherche plein-texte (`search-index.ts`,
raccourci `/`), fil d'Ariane, page 404 interne.

## 3. Charts : 87 pages (`entries/charts.ts`)

81 charts + 6 cartes géo, regroupés : Catégoriels & combo, Part-of-whole &
flux, Distribution & statistique, Couche analytique, Finance (chandeliers,
OHLC/HLC, Renko, Point-and-Figure…), Projet & temps (Gantt, Timeline),
Évolution & classements, Plages & intervalles, Proportions, Hiérarchie,
Ensembles, Texte & nuages, Formes, Réseaux & graphes (Force, Arc, Dependency
Wheel), Observabilité (StateTimeline, StatusHistory, AnomalySwimLane,
Flamegraph, TraceWaterfall, EventFeed), Cartographie géo (points, choroplèthe,
flux, hexbin, cluster, densité).

## 4. Dashboards / BI : 21 pages (`entries/dashboards.ts`)

2 vitrines (Explorateur de données, Tableau de bord complet) + 19 composants
consommateurs d'état : CrossfilteredBarChart, DashboardActiveFilters,
SelectionLegend, SmallMultiples, DrillBarChart (+ fil d'Ariane), KpiCardGroup,
FieldPane, TopNFilter, ValueSlicer, RelativeDateFilter, RangeSliderFilter,
DateRangeFilter, BookmarkNavigator, FormatPanel, CalculationEditor,
ExportMenu, WebFrame, DataImage, ObjectLayerPanel.

## 5. Grilles : 4 pages (`entries/grids.ts`)

Conditional Formatting, RecordsTable, PivotDataTable, AdvancedPivotDataTable
(sous-totaux, heat, sparkline).

## 6. Socle transversal (non repris dans le site du design system)

- **Dataset démo** (`lib/data/dataset.ts`) : ~700 lignes déterministes
  (revendeur B2B : région/pays/ville/catégorie/produit/canal sur 12 mois,
  revenu/unités/marge/prix + lat/lng ; LCG seedé, sans `Math.random`) + ~30
  jeux dédiés par chart (`ohlc.ts`, `gantt.ts`, `forceGraph.ts`…).
- **Chrome** : `AppHeader` du DS, sidebar, 6 thèmes locataires (Sent Tech,
  DSFR, Carbon, Airbus, Canada, Québec) via `compileTheme`, mode
  clair/sombre/auto, sélecteur Svelte/React/Vue (aperçu live en Svelte,
  onglets de code tri-framework), locale FR/EN, 5 palettes.
- **Démos `/demos/*`** : tableaux cross-filter à parité stricte Svelte, React,
  Vue sur le même store `dataviz-core` (filtres partagés, brushing-and-linking,
  slicers, drill, export).
- Couverture côté design system (croisement § 9) : 83 des 112 démos
  existent déjà sur le site du design system — 68 sous le même nom, 15 sous
  un autre nom ou dans une page parapluie. Restent 29 démos sans équivalent
  (27 composants + 2 vitrines), visibles uniquement dans cette galerie, avec
  le dataset démo et la matrice § 2 → racine redirigée, pages conservées.

## 7. Écarts README vs code (constatés pendant l'inventaire)

- Le README de `apps/site` annonce un guide de démarrage (install / modèle /
  store / theming) : aucune route `/guide` n'existe dans le routeur.
- `GeoJsonMap` listé en TODO (aucune entrée au registre).
- Le README de `apps/site` décrivait un déploiement sous `/dataviz/site/` ;
  le workflow déploie à la racine du domaine dédié (`DV_SITE_BASE=/`).

## 8. Redirection (lot C)

- Cible : `https://design-system.sent-tech.ca/components` (page existante,
  vérifiée en production : répond 200 sans `/` final, 404 avec `/` final —
  d'où l'URL sans `/`). Cible provisoire : la cible visée est une section
  dataviz dédiée du site du design system, qui n'existe pas encore (voir le
  commentaire dans `apps/site/redirect.html`).
- Mécanisme : `apps/site/redirect.html` statique, publié comme
  `_site/index.html` ET `_site/404.html` — `meta refresh` à 1 s +
  `location.replace` + `canonical` + message court (FR) et un lien visible
  vers le site du design system. Sans JS, le `meta refresh` et le lien
  couvrent le repli.
- Portée : toutes les adresses du domaine. La racine sert la page de renvoi ;
  toute URL non résolue (donc `/charts`, `/charts/:slug`, `/dashboards/*`,
  `/grids/*`, `/coverage`, et tout lien profond historique) est servie par
  `404.html`, qui est la même page de renvoi.
- Limite du support statique : GitHub Pages renvoie le **statut HTTP 404** pour
  ces URL non résolues (aucun 301 possible sans serveur ; le domaine n'est pas
  derrière un CDN — `server: GitHub.com`). Le corps servi est bien la page de
  renvoi, donc le navigateur redirige ; seul le code de statut reste 404.
- Contenu encore publié : la page de renvoi (racine + repli), `/demos/*`,
  `CNAME`. Plus aucun fragment de la galerie SPA.
- Renvoi inverse : le plan initial était de faire pointer le site du design
  system vers cette galerie pour les 29 démos sans équivalent (§ 9 C). Ce
  renvoi n'est plus possible — la galerie n'est plus publiée, et toute URL
  de `dataviz.sent-tech.ca` redirige vers le design system. Les 29 démos
  restent donc à porter dans le design system ; le tableau § 9 C en est la
  liste de travail. Le bandeau « Ouvrir le site dataviz » présent sur
  `design-system.sent-tech.ca/components` renvoie désormais sur la page de
  renvoi (aller-retour) : à reformuler dans l'autre dépôt.

## 9. Croisement démo par démo avec le site du design system

Méthode (revérifiée le 2026-09-24) : catalogue
`apps/docs/src/lib/components-catalog.ts` du dépôt du design system sur
`origin/main` (`7c3fbbc`, 203 entrées, toutes `documented`), comparé par nom
de composant aux 112 entrées des registres `apps/site/src/lib/registry/entries/`
(`charts.ts`, `dashboards.ts`, `grids.ts`) ; chaque page DS correspondante a
ensuite été requêtée en production (`https://design-system.sent-tech.ca`,
toutes répondent 200, les slugs absents répondent 404).

Résultat : 68 présents à l'identique (même nom) + 15 présents sous un autre
nom ou dans une page parapluie + 29 absents (27 composants + 2 vitrines) =
112. Soit 83 démos déjà couvertes côté design system. Écart avec la revue :
elle annonçait 64/19/29 ; la revérification trouve 4 démos de plus à nom
strictement identique (68/15/29), le total couvert restant 83.

L'ajout au site du design system des 29 démos sans équivalent (et le renvoi
du site du design system vers cette galerie en attendant) est une dépendance
de fusion, suivie dans l'autre dépôt.

### A. Présents à l'identique (68)

| Démo dataviz | Page DS |
|---|---|
| `/charts/area` (AreaChart) | [area-chart](https://design-system.sent-tech.ca/components/area-chart) |
| `/charts/combo` (ComboChart) | [combo-chart](https://design-system.sent-tech.ca/components/combo-chart) |
| `/charts/stacked-bar` (StackedBarChart) | [stacked-bar-chart](https://design-system.sent-tech.ca/components/stacked-bar-chart) |
| `/charts/lollipop` (LollipopChart) | [lollipop-chart](https://design-system.sent-tech.ca/components/lollipop-chart) |
| `/charts/step-line` (StepLineChart) | [step-line-chart](https://design-system.sent-tech.ca/components/step-line-chart) |
| `/charts/pareto` (ParetoChart) | [pareto-chart](https://design-system.sent-tech.ca/components/pareto-chart) |
| `/charts/donut` (DonutChart) | [donut-chart](https://design-system.sent-tech.ca/components/donut-chart) |
| `/charts/funnel` (FunnelChart) | [funnel-chart](https://design-system.sent-tech.ca/components/funnel-chart) |
| `/charts/waterfall` (WaterfallChart) | [waterfall-chart](https://design-system.sent-tech.ca/components/waterfall-chart) |
| `/charts/treemap` (TreemapChart) | [treemap-chart](https://design-system.sent-tech.ca/components/treemap-chart) |
| `/charts/sunburst` (SunburstChart) | [sunburst-chart](https://design-system.sent-tech.ca/components/sunburst-chart) |
| `/charts/sankey` (SankeyChart) | [sankey-chart](https://design-system.sent-tech.ca/components/sankey-chart) |
| `/charts/radar` (RadarChart) | [radar-chart](https://design-system.sent-tech.ca/components/radar-chart) |
| `/charts/rose` (RoseChart) | [rose-chart](https://design-system.sent-tech.ca/components/rose-chart) |
| `/charts/bump` (BumpChart) | [bump-chart](https://design-system.sent-tech.ca/components/bump-chart) |
| `/charts/violin` (ViolinChart) | [violin-chart](https://design-system.sent-tech.ca/components/violin-chart) |
| `/charts/histogram` (HistogramChart) | [histogram-chart](https://design-system.sent-tech.ca/components/histogram-chart) |
| `/charts/box-plot` (BoxPlotChart) | [box-plot-chart](https://design-system.sent-tech.ca/components/box-plot-chart) |
| `/charts/heatmap` (HeatmapChart) | [heatmap-chart](https://design-system.sent-tech.ca/components/heatmap-chart) |
| `/charts/calendar-heatmap` (CalendarHeatmapChart) | [calendar-heatmap-chart](https://design-system.sent-tech.ca/components/calendar-heatmap-chart) |
| `/charts/bullet` (BulletChart) | [bullet-chart](https://design-system.sent-tech.ca/components/bullet-chart) |
| `/charts/gauge` (GaugeChart) | [gauge-chart](https://design-system.sent-tech.ca/components/gauge-chart) |
| `/charts/solid-gauge` (SolidGaugeChart) | [solid-gauge-chart](https://design-system.sent-tech.ca/components/solid-gauge-chart) |
| `/charts/parallel-coordinates` (ParallelCoordinatesChart) | [parallel-coordinates-chart](https://design-system.sent-tech.ca/components/parallel-coordinates-chart) |
| `/charts/candlestick` (CandlestickChart) | [candlestick-chart](https://design-system.sent-tech.ca/components/candlestick-chart) |
| `/charts/heikin-ashi` (HeikinAshiChart) | [heikin-ashi-chart](https://design-system.sent-tech.ca/components/heikin-ashi-chart) |
| `/charts/hollow-candlestick` (HollowCandlestickChart) | [hollow-candlestick-chart](https://design-system.sent-tech.ca/components/hollow-candlestick-chart) |
| `/charts/hlc` (HLCChart) | [hlc-chart](https://design-system.sent-tech.ca/components/hlc-chart) |
| `/charts/ohlc` (OHLCChart) | [ohlc-chart](https://design-system.sent-tech.ca/components/ohlc-chart) |
| `/charts/gantt` (GanttChart) | [gantt-chart](https://design-system.sent-tech.ca/components/gantt-chart) |
| `/charts/timeline` (TimelineChart) | [timeline-chart](https://design-system.sent-tech.ca/components/timeline-chart) |
| `/charts/streamgraph` (StreamgraphChart) | [streamgraph-chart](https://design-system.sent-tech.ca/components/streamgraph-chart) |
| `/charts/ribbon` (RibbonChart) | [ribbon-chart](https://design-system.sent-tech.ca/components/ribbon-chart) |
| `/charts/tilemap` (TileMapChart) | [tile-map-chart](https://design-system.sent-tech.ca/components/tile-map-chart) |
| `/charts/scatter` (ScatterPlot) | [scatter-plot](https://design-system.sent-tech.ca/components/scatter-plot) |
| `/charts/sparkline` (Sparkline) | [sparkline](https://design-system.sent-tech.ca/components/sparkline) |
| `/charts/scorecard` (ScoreCard) | [score-card](https://design-system.sent-tech.ca/components/score-card) |
| `/charts/area-range` (AreaRangeChart) | [area-range-chart](https://design-system.sent-tech.ca/components/area-range-chart) |
| `/charts/area-spline-range` (AreaSplineRangeChart) | [area-spline-range-chart](https://design-system.sent-tech.ca/components/area-spline-range-chart) |
| `/charts/column-range` (ColumnRangeChart) | [column-range-chart](https://design-system.sent-tech.ca/components/column-range-chart) |
| `/charts/dumbbell` (DumbbellChart) | [dumbbell-chart](https://design-system.sent-tech.ca/components/dumbbell-chart) |
| `/charts/variable-pie` (VariablePieChart) | [variable-pie-chart](https://design-system.sent-tech.ca/components/variable-pie-chart) |
| `/charts/item-chart` (ItemChart) | [item-chart](https://design-system.sent-tech.ca/components/item-chart) |
| `/charts/waffle` (WaffleChart) | [waffle-chart](https://design-system.sent-tech.ca/components/waffle-chart) |
| `/charts/column-pyramid` (ColumnPyramidChart) | [column-pyramid-chart](https://design-system.sent-tech.ca/components/column-pyramid-chart) |
| `/charts/bell-curve` (BellCurveChart) | [bell-curve-chart](https://design-system.sent-tech.ca/components/bell-curve-chart) |
| `/charts/organization` (OrganizationChart) | [organization-chart](https://design-system.sent-tech.ca/components/organization-chart) |
| `/charts/treegraph` (TreegraphChart) | [treegraph-chart](https://design-system.sent-tech.ca/components/treegraph-chart) |
| `/charts/venn` (VennChart) | [venn-chart](https://design-system.sent-tech.ca/components/venn-chart) |
| `/charts/word-cloud` (WordCloudChart) | [word-cloud-chart](https://design-system.sent-tech.ca/components/word-cloud-chart) |
| `/charts/polygon` (PolygonChart) | [polygon-chart](https://design-system.sent-tech.ca/components/polygon-chart) |
| `/charts/force-graph` (ForceGraph) | [force-graph](https://design-system.sent-tech.ca/components/force-graph) |
| `/charts/arc-diagram` (ArcDiagramChart) | [arc-diagram-chart](https://design-system.sent-tech.ca/components/arc-diagram-chart) |
| `/charts/dependency-wheel` (DependencyWheelChart) | [dependency-wheel-chart](https://design-system.sent-tech.ca/components/dependency-wheel-chart) |
| `/charts/state-timeline` (StateTimelineChart) | [state-timeline-chart](https://design-system.sent-tech.ca/components/state-timeline-chart) |
| `/charts/status-history` (StatusHistoryChart) | [status-history-chart](https://design-system.sent-tech.ca/components/status-history-chart) |
| `/charts/anomaly-swimlane` (AnomalySwimLaneChart) | [anomaly-swim-lane-chart](https://design-system.sent-tech.ca/components/anomaly-swim-lane-chart) |
| `/charts/flamegraph` (FlamegraphChart) | [flamegraph-chart](https://design-system.sent-tech.ca/components/flamegraph-chart) |
| `/charts/trace-waterfall` (TraceWaterfallChart) | [trace-waterfall-chart](https://design-system.sent-tech.ca/components/trace-waterfall-chart) |
| `/charts/decomposition-tree` (DecompositionTreeChart) | [decomposition-tree-chart](https://design-system.sent-tech.ca/components/decomposition-tree-chart) |
| `/charts/density-2d` (Density2DChart) | [density-2d-chart](https://design-system.sent-tech.ca/components/density-2d-chart) |
| `/charts/event-feed` (EventFeedPanel) | [event-feed-panel](https://design-system.sent-tech.ca/components/event-feed-panel) |
| `/charts/vector-field` (VectorFieldChart) | [vector-field-chart](https://design-system.sent-tech.ca/components/vector-field-chart) |
| `/charts/contour` (ContourChart) | [contour-chart](https://design-system.sent-tech.ca/components/contour-chart) |
| `/charts/wind-barb` (WindBarbChart) | [wind-barb-chart](https://design-system.sent-tech.ca/components/wind-barb-chart) |
| `/charts/renko` (RenkoChart) | [renko-chart](https://design-system.sent-tech.ca/components/renko-chart) |
| `/charts/point-and-figure` (PointAndFigureChart) | [point-and-figure-chart](https://design-system.sent-tech.ca/components/point-and-figure-chart) |
| `/dashboards/data-image` (DataImage) | [data-image](https://design-system.sent-tech.ca/components/data-image) |

### B. Présents sous un autre nom ou dans une page parapluie (15)

| Démo dataviz | Page DS |
|---|---|
| `/charts/diverging-bar` (DivergingBarChart) | [divergent-bar-chart](https://design-system.sent-tech.ca/components/divergent-bar-chart) |
| `/charts/chord` (ChordChart) | [chord-diagram](https://design-system.sent-tech.ca/components/chord-diagram) |
| `/charts/mekko` (MekkoChart) | [marimekko-chart](https://design-system.sent-tech.ca/components/marimekko-chart) |
| `/charts/packed-bubble` (PackedBubbleChart) | [packed-bubbles-chart](https://design-system.sent-tech.ca/components/packed-bubbles-chart) |
| `/charts/error-bars` (ErrorBarsChart) | [error-bar-chart](https://design-system.sent-tech.ca/components/error-bar-chart) |
| `/charts/geo-point` (GeoPointMap) | [geo-chart](https://design-system.sent-tech.ca/components/geo-chart) |
| `/charts/choropleth` (ChoroplethMap) | [geo-chart](https://design-system.sent-tech.ca/components/geo-chart) |
| `/charts/geo-flow` (GeoFlowMap) | [geo-chart](https://design-system.sent-tech.ca/components/geo-chart) |
| `/charts/geo-hexbin` (GeoHexbinMap) | [geo-chart](https://design-system.sent-tech.ca/components/geo-chart) |
| `/charts/geo-cluster` (GeoClusterMap) | [geo-chart](https://design-system.sent-tech.ca/components/geo-chart) |
| `/charts/geo-density` (GeoDensityMap) | [geo-chart](https://design-system.sent-tech.ca/components/geo-chart) |
| `/dashboards/kpi-cards` (KpiCardGroup) | [kpi-card](https://design-system.sent-tech.ca/components/kpi-card) |
| `/dashboards/web-frame` (WebFrame) | [embed](https://design-system.sent-tech.ca/components/embed) |
| `/grids/conditional-format` (Conditional Formatting) | [data-table](https://design-system.sent-tech.ca/components/data-table) |
| `/grids/records-table` (RecordsTable) | [data-table](https://design-system.sent-tech.ca/components/data-table) |

### C. Absents du site du design system (29)

| Démo dataviz | Statut DS |
|---|---|
| `/charts/reference-line` (ReferenceLineChart) | absent |
| `/charts/percentile-band` (PercentileBandChart) | absent |
| `/charts/trend-line` (TrendLineChart) | absent |
| `/charts/forecast-line` (ForecastLineChart) | absent |
| `/charts/cluster-plot` (AnalyticsClusterPlot) | absent |
| `/charts/scatter-matrix` (ScatterPlotMatrix) | absent |
| `/charts/animated-bubble` (AnimatedBubbleChart) | absent |
| `/charts/palette-picker` (PalettePicker) | absent |
| `/charts/correlation-matrix` (CorrelationMatrix) | absent |
| `/dashboards/data-explorer` (Explorateur de données) | absent |
| `/dashboards/full-dashboard` (Tableau de bord complet) | absent |
| `/dashboards/crossfilter` (CrossfilteredBarChart) | absent |
| `/dashboards/filter-bar` (DashboardActiveFilters) | absent |
| `/dashboards/selection-legend` (SelectionLegend) | absent |
| `/dashboards/small-multiples` (SmallMultiples) | absent |
| `/dashboards/drill` (DrillBarChart) | absent |
| `/dashboards/field-pane` (FieldPane) | absent |
| `/dashboards/top-n` (TopNFilter) | absent |
| `/dashboards/value-slicer` (ValueSlicer) | absent |
| `/dashboards/relative-date` (RelativeDateFilter) | absent |
| `/dashboards/range-slider` (RangeSliderFilter) | absent |
| `/dashboards/date-range` (DateRangeFilter) | absent |
| `/dashboards/bookmarks` (BookmarkNavigator) | absent |
| `/dashboards/format-panel` (FormatPanel) | absent |
| `/dashboards/calculation-editor` (CalculationEditor) | absent |
| `/dashboards/export-menu` (ExportMenu) | absent |
| `/dashboards/object-layers` (ObjectLayerPanel) | absent |
| `/grids/pivot-table` (PivotDataTable) | absent |
| `/grids/advanced-pivot` (AdvancedPivotDataTable) | absent |
