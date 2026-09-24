# Inventaire du site dataviz (avant redirection — lot C)

> Contexte : les paquets `@sentropic/dataviz-*` et le paquet `graph` ont été
> rapatriés dans le design system Sentropic (dépôt de référence, site
> https://design-system.sent-tech.ca). Ce document décrit ce que le site
> dataviz présente réellement, pour décider ce qui se redirige et ce qui se
> conserve. Le site historique reste accessible sur ses pages profondes ;
> seule la racine redirige (voir § 6).

## 1. Assemblage déployé (`.github/workflows/pages.yml`)

- `apps/site/dist` (base `DV_SITE_BASE=/`) copié à la racine du domaine
  `dataviz.sent-tech.ca` (fichier `CNAME` conservé à l'assemblage).
- `apps/site/dist/index.html` dupliqué en `_site/404.html` : la SPA est servie
  en repli pour toute URL profonde (liens directs type `/charts/treemap`).
- Les trois démos frameworks (`apps/docs`, `apps/docs-react`, `apps/docs-vue`,
  base relative) copiées sous `_site/demos/svelte|react|vue`.
- Depuis le lot C : `_site/index.html` est remplacé par la page de redirection
  `apps/site/redirect.html` ; `404.html`, les pages profondes et `/demos/*`
  sont inchangés.

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
- Le site du design system documente ses composants sous `/components/*`
  sans section dataviz dédiée observée : la galerie (112 démos + dataset +
  matrice § 2) est un contenu unique → racine redirigée, pages conservées.

## 7. Écarts README vs code (constatés pendant l'inventaire)

- Le README de `apps/site` annonce un guide de démarrage (install / modèle /
  store / theming) : aucune route `/guide` n'existe dans le routeur.
- `GeoJsonMap` listé en TODO (aucune entrée au registre).
- Le README de `apps/site` décrivait un déploiement sous `/dataviz/site/` ;
  le workflow déploie à la racine du domaine dédié (`DV_SITE_BASE=/`).

## 8. Redirection (lot C)

- Cible : `https://design-system.sent-tech.ca` (racine : aucune sous-URL
  dataviz stable observée côté design system — une URL devinée risquerait le
  404 ; l'owner ajustera la cible si une section dataviz apparaît).
- Mécanisme : `_site/index.html` statique (`apps/site/redirect.html`) —
  `meta refresh` + `location.replace` + `canonical` + lien visible et message
  court (FR). Sans JS, le `meta refresh` et le lien couvrent le repli.
- Contenu conservé et accessible : `404.html` (SPA), toutes les pages
  profondes, `/demos/*`, `CNAME`.
