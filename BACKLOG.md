# dataviz — Backlog couverture « marché total »

Objectif : zéro composant manquant face à **New Relic, Kibana/Elastic, Grafana, Dataiku, SAS Visual Analytics, Qlik Sense, Tableau, Power BI, Highcharts**. Inventaire issu d'une revue des galeries/docs officielles (2026-06-14). Sur ~150 types de viz recensés, **~95 % déjà couverts** par les 77 composants dataviz. Ce backlog liste les écarts réels.

> **Historique (livré)** : le backlog « classe Highcharts / capacités transverses » (cross-filter, drilldown, bookmarks, URL-sync, export, calculated fields, small multiples, crosshair, légende interactive, annotations, data-labels, a11y datapoint-nav, conditional-formatting, header AppChrome) est **100 % livré** (≤ v0.4.27). Les 18 nouveaux types de charts + la parité cross-fw (îlots React/Vue) sont livrés en v0.4.28→v0.4.32. La couverture des composants charts DS existants est complète.

Règle d'or : 100 % composant DS (zéro SVG hand-rollé), parité 3 fw, démo registry + îlot cross-fw, gate vert, release lockstep OIDC. Lire les contrats DS depuis le `node_modules` **nested** (0.36.33), jamais la racine périmée.

Page cible : **matrice de mapping** composants ↔ solutions dans la doc du site.

## Catégorie A — Wrappers de composants DS EXISTANTS (ma lane, prêts à faire)
Le DS exporte déjà ces composants ; il suffit de les wrapper (core builder + 3 fw + démo + îlot cross-fw).

| # | Composant | Prio | Composant DS | data_shape | Vu dans | État |
|---|-----------|------|--------------|-----------|---------|------|
| A1 | **ForceGraph** (= NetworkGraph) | **P1** | `ForceGraph` | `{nodes,edges}` | Grafana, New Relic, Kibana, Qlik, Power BI, SAS | ✅ v0.4.33 |
| A2 | ArcDiagramChart | P2 | `ArcDiagramChart` | `{from,to,weight}[]` | Highcharts | ✅ v0.4.33 |
| A3 | DependencyWheelChart | P2 | `DependencyWheelChart` | `{from,to,weight}[]` | Highcharts | ✅ v0.4.33 |
| A4 | HeikinAshiChart | P2 | `HeikinAshiChart` | `{label,open,high,low,close}` | Highcharts Stock | ✅ v0.4.33 |
| A5 | HollowCandlestickChart | P2 | `HollowCandlestickChart` | `{label,open,high,low,close}` | Highcharts Stock | ✅ v0.4.34 |
| A6 | HLCChart | P2 | `HLCChart` | `{label,high,low,close}` | Highcharts Stock, SAS | ✅ v0.4.34 |

## Catégorie C — Composables core (ma lane, sans FR DS)
Réalisables en composant dataviz qui orchestre/compose des composants DS existants + un builder core.

| # | Composant | Prio | Construit sur | Vu dans | État |
|---|-----------|------|---------------|---------|------|
| C1 | ScatterPlotMatrix (SPLOM) | P2 | grille N×N de `ScatterPlot` DS | SAS | ✅ v0.4.35 |
| C2 | CorrelationMatrix | P2 | calcul corrélation (core) → `HeatmapChart` DS | SAS | ✅ v0.4.35 |
| C3 | AnimatedBubbleChart (Gapminder) | P2 | `ScatterPlot` DS + contrôle temporel/play (dataviz) | SAS | ✅ v0.4.36 |

## Catégorie B — FR au DS (composant DS inexistant → demander, wrapper à livraison)

**FR envoyée + relancée + ACCEPTÉE par le DS** (claude:sent-tech-design-system). Ordre de livraison DS par lots : **LOT1** = StateTimeline (P1) + SolidGauge → **LOT2** = StatusHistory + Waffle + Ribbon → **LOT3** = AnomalySwimLane + Flamegraph + TraceWaterfall → **LOT4** = DecompositionTree + Density2D + EventFeedPanel → **LOT5** (P3) = Vector + Contour + WindBarb + Renko + PointAndFigure. Ping DS à chaque tag npm ; je câble chaque lot sous ~10 min (3 fw + core builder + démo + îlot + matrice fr-ds→covered + release lockstep, bump deps DS). ✅ **DÉCOUPLAGE OBTENU** (mon driving) : le DS a accepté de lancer B en parallèle de son chantier header (pas d'attente de la validation rhanka). **LOT1 (StateTimeline + SolidGauge) EN CONSTRUCTION côté DS** (part de svelte 0.34.33) — tag imminent, je câble dès le ping. Ordre lots révisé DS : LOT1 StateTimeline+SolidGauge → LOT2 StatusHistory+Waffle → LOT3 Ribbon+AnomalySwimLane → LOT4 Flamegraph+TraceWaterfall+DecompositionTree+Density2D+EventFeed → LOT5(P3) Vector/Contour/WindBarb/Renko/PointAndFigure.

| # | Composant | Prio | Highcharts equiv | Vu dans | État |
|---|-----------|------|------------------|---------|------|
| B1 | StateTimelineChart (bandes d'états dans le temps) | **P1** | xrange | Grafana, Kibana | ✅ v0.4.38 |
| B2 | SolidGaugeChart (arc plein / progress ring) | P2 | solidgauge | Highcharts, KPI dashboards | ✅ v0.4.38 |
| B3 | StatusHistoryChart (grille temps×entité statut) | P2 | heatmap | Grafana | ✅ v0.4.39 |
| B4 | WaffleChart (grille proportionnelle) | P2 | item parliament | Kibana | ✅ v0.4.39 |
| B5 | RibbonChart (rang empilé dans le temps) | P2 | — | Power BI | ✅ v0.4.40 |
| B6 | AnomalySwimLaneChart (heatmap scoring ML) | P2 | heatmap | Kibana | ✅ v0.4.40 |
| B7 | FlamegraphChart (call stacks profiling) | P2 | — | Grafana | ✅ v0.4.41 |
| B8 | TraceWaterfallChart (spans distribués imbriqués) | P2 | gantt | Grafana | ✅ v0.4.41 |
| B9 | DecompositionTreeChart (drill hiérarchique interactif) | P2 | — | Power BI | ✅ v0.4.41 |
| B10 | Density2DChart (hexbin/contour non-géo) | P2 | heatmap binned | Tableau, Dataiku | ✅ v0.4.41 |
| B11 | EventFeedPanel (flux d'événements daté) | P2 | — | New Relic | ✅ v0.4.42 |
| B12 | VectorFieldChart (champ de vecteurs) | P3 | vector | Highcharts, SAS | ✅ v0.4.42 |
| B13 | ContourChart (isolignes) | P3 | contour | Highcharts | ✅ v0.4.43 |
| B14 | WindBarbChart (barbules de vent) | P3 | windbarb | Highcharts | ✅ v0.4.43 |
| B15 | RenkoChart (briques Renko) | P3 | renko | Highcharts Stock | ✅ v0.4.44 |
| B16 | PointAndFigureChart (X/O) | P3 | pointandfigure | Highcharts Stock | ✅ v0.4.44 |

## Hors scope (sauf demande explicite)
- Variants 3D décoratifs : funnel3d, pyramid3d, cylinder, scatter3d.
- Features plateforme (non-viz) : NLQ/Q&A, Smart Narrative/NLG, Key Influencers AI, R/Python visuals, paginated report, decision tree ML, ETL/modélisation/gouvernance.
- Indicateurs techniques financiers calculés (SMA/EMA/MACD/RSI/Bollinger/VWAP) : moteur de calcul, pas un composant viz — à étudier comme builders core si demandé.

## Suivi
**ÉTAT au 2026-06-14 : tout ce qui est faisable côté dataviz est livré.**
- ✅ **Catégorie A** complète (v0.4.33 + v0.4.34) — 6 wrappers de composants DS existants (dont ForceGraph/NetworkGraph P1).
- ✅ **Catégorie C** complète (v0.4.35 + v0.4.36) — 3 composables (SPLOM, CorrelationMatrix, AnimatedBubble).
- ✅ **Matrice de mapping** : données (`apps/site/src/lib/data/market-matrix.ts`, 9 solutions × ~85 composants) + **PAGE livrée** (route `/coverage`, `MarketMatrixPage.svelte`, lien nav « Couverture marché ») — intégration additive pure (chrome de l'autre agent intact), build vert, déployée.
- ✅ **Catégorie B** (16 composants) : **SOLDÉE 16/16** 🎉. LOT1 v0.4.38 (StateTimeline+SolidGauge), LOT2 v0.4.39 (StatusHistory+Waffle), LOT3 v0.4.40 (Ribbon+AnomalySwimLane), LOT4 v0.4.41 (Flamegraph+TraceWaterfall+DecompositionTree+Density2D), LOT6a v0.4.42 (EventFeedPanel+VectorField), LOT7b v0.4.43 (Contour+WindBarb), LOT8 v0.4.44 (Renko+PointAndFigure). Les 16 composants FR-au-DS sont livrés (composants DS + core builders + 3 fw + démos + îlots cross-fw), matrice marché 100% gap-filled.

Méthode : `/loop` 2 agents (un composant disjoint par agent), intégration registry/index/specs + gate + release lockstep par le conducteur, publication régulière sur `main`.

## WP20 — Capacités transverses & site docs (état réel 2026-06-15)

Le track « WP20 » était partiellement **périmé** (des items « to-do/in-progress » étaient déjà livrés). État réel vérifié sur main :

**✅ Livré :**
- **i18n / formatage localisé** : `dataviz-core/format-value.ts` 100% Intl (number/currency/percent/compact + date), locale/currency/timeZone paramétrables ; labels d'export surchargeables (prop `labels`). Rien à faire.
- **Golden-rule Rose/Chord/PackedBubble** : `RoseChart`/`ChordChart`/`PackedBubbleChart` (3 fw) **consomment déjà** les composants DS (`RoseChart`/`ChordDiagram`/`PackedBubblesChart`), zéro SVG hand-rollé.
- **Export PDF vectoriel** : ✅ **v0.4.45** — `downloadPdf` (svg→pdf vectoriel via jspdf+svg2pdf.js en import lazy, hors bundle), bouton PDF dans ChartExport (3 fw).
- **Échelles de couleur** : ✅ **v0.4.46** — `dataviz-core/color.ts` (categorical/sequential/diverging, interpolation OKLab, zéro couleur hardcodée).
- **Modèle de layout dashboard** : ✅ **DÉJÀ présent** — `dataviz-core/layout.ts` (`DashboardLayout`/`PanelLayout`, createLayout/addPanel/movePanel/resizePanel/normalizeLayout, serializeLayout/deserializeLayout, `LayoutState`, guards `isDashboardLayout`). NB : non encore consommé par une UI (cf dashboard edit-mode ci-dessous). [Doublon `dashboardLayout.ts` que j'avais commencé → supprimé, le gate a attrapé la collision.]

**🟡 DS-bloqué (FR déposée au DS, je câble à livraison) :**
- **Palette picker + page doc « échelles de couleur »** : besoin d'un composant DS **ColorSwatch** (afficher une couleur arbitraire) + **ColorScaleBar** (gradient) — Tag/Badge ne prennent qu'un tone category1..8. FR déposée 2026-06-15. Le core (color.ts) est prêt.
- **Dashboard edit-mode (UI drag-resize)** : DS a Grid/Tile/TileGroup mais pas de resize/drag — heads-up déposé au DS. Le modèle (dashboardLayout.ts) est prêt à être consommé.

**⚪ À confirmer (probablement déjà résolus) :** régression sidebar mobile (`sidebarOpen` introuvable dans apps/site/src → vraisemblablement corrigé/renommé) ; header chrome parité (repris par un autre agent).
