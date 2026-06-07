# dataviz — ROADMAP (couverture BI intégrale)

**Objectif : 100 % de l'inventaire BI** (Tableau / Qlik / Power BI / Superset / Metabase).
Source de vérité : `~/src/sent-tech-design-system/docs/bi-study/INVENTORY.md` (165 items ;
29 ✅ déjà couverts par le DS, 71 🟡 partiels, 91 ❌ manquants). **LOT ZÉRO (état partagé)
= FAIT** dans `@sentropic/dataviz-core`.

## Règles (non négociables)

1. **Présentation = design system.** Toute pièce présentationnelle vient de
   `@sentropic/design-system-{svelte,react,vue}`. Si un composant de rendu manque, on
   l'ajoute au **DS** (contrôlé, `value`/`onChange`) **en coordination avec
   `claude:sent-tech-design-system` via h2a**, puis on le consomme ici. JAMAIS de
   présentationnel cuit dans dataviz.
2. **dataviz = état + orchestration.** Cross-filter, drill, sync, bookmarks, scoping,
   modèle de données — tout consomme `dataviz-core`.
3. **Parité stricte 3 frameworks** + revue « en tant que DS » : tokens réels, contraste
   WCAG, a11y (rôles/clavier/focus/reduced-motion).
4. **Définition de FAIT** par famille : réf Svelte → double-revue Opus+Codex
   (`codex exec … < /dev/null`) → port React/Vue à parité → gate
   `npx vitest run src --no-cache --no-file-parallelism` vert → commit+push → CI verte →
   case cochée ici.
5. **Boucle jusqu'à 100 %.** Ne PAS s'arrêter après quelques familles. Pousser main
   régulièrement. Publier par tag `v<version>` (les 4 packages en lockstep) quand une
   vague est stable.

## Répartition

- **`codex:dataviz`** → Moteur de viz + contrat de données (Vague 1 + Vague 3).
- **`claude:dataviz`** → Consommateurs d'état + authoring + démo + revue (Vague 2 + 4 + 5 + apps/docs + Pages).
- Se coordonner via h2a ; cocher les cases ; ne pas se marcher dessus (claim une famille avant de la prendre).

---

## Vague 1 — Contrat de données & gains rapides  *(codex:dataviz)*
- [x] Field pane + modèle dimension/mesure & discret/continu, hiérarchies/dossiers, pilule de champ — contrats core `fields` + adapter `FieldPane` 3 fw livrés (display/`selectedId` + `onSelect` authoring, fallback TreeView interactif React/Vue quand l'événement DS n'est pas exposé)
- [x] Pivot / matrice agrégé (réutilise `DataTable`) — contrat core `buildPivotTable` + adapters DS `PivotDataTable` 3 fw
- [x] KPI / cartes data (display, delta-vs-période, goal/progress, KPI+sparkline, multi-card) — contrat core `buildKpiCards` + adapters DS `KpiCardGroup` 3 fw

## Vague 2 — Consommateurs d'état & multiplicateur  *(claude:dataviz)*
- [x] Cross-filter / cross-highlight (callbacks charts, highlight, scoping) — **complet à parité 3 fw** : DashboardFilterBar, SelectionLegend, CrossfilteredBarChart (sortie via `applyCrossfilter` + brushing-clic via DS BarChart `selectedKeys`/`onSelect` → `toggleSelection`, échelle partagée `domain`, opt-out `selectable`)
- [x] Drill & exploration (down/up/expand, through/by, show records, back+historique) — **complet à parité 3 fw** : `DrillBarChart` (clic = setFilter valeur + `drillDown` ; sélection à la feuille), `DrillBreadcrumb` (DS Breadcrumb + bouton « Remonter » = `drillUp` + clear filtre), `RecordsTable` (show records via DS DataTable) ; consomme `state.drill`/`drillDown`/`drillUp`/`clearDrill` du core
- [x] Small multiples / faceting — **complet à parité 3 fw** : `SmallMultiples`
  consomme `Grid` + `BarChart` DS, facette par dimension, agrège via core,
  applique `store.applyCrossfilter(viewId)` et partage un domaine de valeur
  commun entre facettes.

## Vague 3 — Moteur de viz  *(codex:dataviz)*
- [x] Catégoriels & combo (multi-série lignes/aires, barres groupées & 100 %, combo+2e axe, step, Pareto, lollipop, divergentes) — contrats core `buildCategoricalSeries` + wrappers DS Combo/Stacked/Lollipop/Step/Area/Pareto/Diverging livrés en Svelte/React/Vue
- [x] Flux & part-of-whole (pie plein, funnel, waterfall+variance, treemap, sunburst, sankey, chord, radar, mekko, packed bubbles, rose) — contrats core part/hiérarchie/waterfall/flow/radar/rose/mekko/packed bubbles faits ; wrappers Donut/Funnel/Waterfall/Treemap/Sunburst/Sankey/Radar/Mekko/Chord/Rose/PackedBubble livrés en Svelte/React/Vue (SVG fallback pour les types non exposés côté DS)
- [x] Pivot avancé (cross-tab agrégé, sous-totaux, expand/collapse, heat de cellule, sparkline en cellule) — contrat core `buildAdvancedPivotTable` + wrappers DS `AdvancedPivotDataTable` livrés en Svelte/React/Vue (sous-totaux, `collapsedRowPaths`, `onToggleRowPath`, heat/sparkline)
- [x] Distribution & statistique (box plot, histogramme/bins, distribution, heatmap cat.+calendaire, bullet, gauge) — contrats core histogram/box/heatmap/bullet/gauge + wrappers DS Histogram/BoxPlot/Heatmap/CalendarHeatmap/Bullet/Gauge livrés en Svelte/React/Vue
- [x] Couche analytique (réf lines, bandes/percentiles, tendance, prévision, cluster, barres d'erreur, goal line) — contrats core ref/percentile/trend/forecast/cluster/error bars faits ; wrappers ReferenceLine/PercentileBand/TrendLine/ForecastLine/ErrorBars/AnalyticsCluster livrés en Svelte/React/Vue. WP15 clos côté dataviz : les wrappers utilisent les surfaces DS LineChart/ScatterPlot/BarChart, y compris forecast pointillé et centroïdes cluster.
- [x] Cartographie géo (pin, choroplèthe/filled, densité, GeoJSON/shape, flux/arcs, hexbin, clustering/couches ; 3D hors-DS) — contrats core pin/choropleth/densité/GeoJSON/flow/hexbin/cluster faits ; wrappers GeoPoint/Choropleth/GeoFlow/GeoHexbin/GeoCluster/GeoDensity/GeoJson livrés en Svelte/React/Vue. WP15 clos côté dataviz : les 7 wrappers passent par la surface DS GeoMap en Svelte/React/Vue.

## Vague 4 — Authoring & signets  *(claude:dataviz)*
- [x] Filtres BI avancés (range slider 2 poignées, date relative, time range, granularité, filtre et/ou, Top N) — **faits à parité 3 fw** : `TopNFilter` (Top N par mesure), `ValueSlicer` (filtre OU multi-valeurs, CheckboxGroup), `DateRangeFilter` (DatePicker range → filtre range dates), `RelativeDateFilter` (DS `Select` de presets → filtre `range` fenêtre glissante : tout / 7 / 30 / 90 j / 12 mois, `now` injectable), `RangeSliderFilter` (2 poignées numériques min/max → filtre `range` sur dimension continue ; bâti sur le **vrai DS `RangeSlider`** 1 piste/2 poignées `value:[number,number]`+onChange/v-model, livré par le DS — svelte 0.27/react+vue 0.23 ; helpers purs `numericDomain`/`rangeBoundsToSpec`)
- [x] Signets & actions (bookmarks, navigateur/diaporama, actions filtre/URL/set/aller-à, click behavior) — contrats core `DashboardBookmark`/`DashboardAction` + `runDashboardAction`/`applyDashboardBookmark` et `BookmarkNavigator` DS livrés en Svelte/React/Vue
- [x] Panneau format & axes (volet Format, éditeur d'axe plage/log/inversé, légendes éditables, marqueurs/forme) — contrats core `format` immutable + `FormatPanel` DS livré en Svelte/React/Vue pour axes min/max/log/inversé, légendes titre/visible et marqueurs forme/taille/couleur
- [x] Éditeur de calcul / expression (champ calculé, formule+autocomplétion, calculs table/visuels, variables, bins, groupes, sets) — core `calculations` livré : parser sûr `[field]`/`$variable`/arithmétique, champs calculés + extension modèle, suggestions autocomplete, table calcs running total/% total/rank, bins/groupes/sets ; `CalculationEditor` DS livré en Svelte/React/Vue

## Vague 5 — Génériques courts  *(claude:dataviz)*
- [x] Range slider à 2 poignées (utile hors BI) — `RangeSliderFilter` sur le DS `RangeSlider` 2 poignées, helpers purs, parité 3 fw
- [x] Menu d'export / téléchargement (UI) — **complet à parité 3 fw** :
  `ExportMenu` consomme un `Button` DS, exporte les rows cross-filtrées en CSV
  via `store.applyCrossfilter(viewId)`, supporte colonnes/filename/label et
  expose `rowsToCsv` testé.
- [x] Wrapper iframe / page web ; Image data-driven ; Object/layer panel (réutilise `TreeView`) — core `objects` livré : résolution iframe avec sandbox/referrer/loading, image data-driven par champ/template/fallback, état de panel de calques immutable et arbre compatible `TreeView` ; wrappers `WebFrame`, `DataImage`, `ObjectLayerPanel` livrés en Svelte/React/Vue

## Démo & revue  *(claude:dataviz)*
- [x] `apps/docs` — dashboard de démo cross-filter sur les 3 frameworks — démos Svelte (`apps/docs`), React (`apps/docs-react`), Vue (`apps/docs-vue`), même dashboard (FilterBar, SelectionLegend, CrossfilteredBarChart ×2 liés, SmallMultiples, Drill, RecordsTable, TopNFilter, ValueSlicer, RelativeDateFilter, RangeSliderFilter, ExportMenu ; modèle démo enrichi de dimensions continues `date`/`price`) ; `vite build` vert (alias workspace)
- [x] Déploiement GitHub Pages — workflow `.github/workflows/pages.yml` (build des 3 démos + landing, deploy-pages) ; **live sur https://rhanka.github.io/dataviz/** (Pages activé source = GitHub Actions par le créateur du dépôt ; 3 démos + landing déployées, HTTP 200)
- [x] Revue intégrale « en tant que design system » (tokens/contraste/a11y/parité) — couverture fonctionnelle complète publiée, puis audit DS post-v0.4.17 repris dans `sent-tech-design-system` commit `e04c970` / WP15 : les fallbacks SVG analytics+geo ne satisfont pas la règle « Présentation = design system » comme état final. Le suivi correctif est tracé ci-dessous.

## Demandes d'évolution DS post-v0.4.17  *(WP15 sent-tech-design-system)*
- [x] Analytics : `ReferenceLineChart`, `PercentileBandChart`, `TrendLineChart`, `ForecastLineChart`, `ErrorBarsChart` et `AnalyticsClusterPlot` utilisent les surfaces DS (`LineChart`/`ScatterPlot`/`BarChart`) en Svelte/React/Vue ; tests analytics verrouillés sur les classes DS et l'absence des anciennes classes fallback.
- [x] Geo : les 7 wrappers dataviz (`GeoPointMap`, `ChoroplethMap`, `GeoFlowMap`, `GeoHexbinMap`, `GeoClusterMap`, `GeoDensityMap`, `GeoJsonMap`) utilisent la surface DS `GeoMap` en Svelte/React/Vue ; tests geo verrouillés sur les layers DS et l'absence des anciennes classes fallback. `ChoroplethMap` accepte désormais `geometry?: string` pour fournir les vraies géométries régionales attendues par DS.
- [x] Versions DS : dataviz packages + apps démo repinnés sur `@sentropic/design-system-react`/`vue` 0.29.0 et `@sentropic/design-system-svelte` 0.33.0.

## Hors couverture (assumé)
SQL Lab/IDE · semantic models · IA/smart narrative · embed/SDK · subscriptions ·
permissions/partage · alerting serveur · carto 3D deck.gl · rapport paginé ·
paradigme marks-card/shelves drag-drop (différé).
