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
- [x] Field pane + modèle dimension/mesure & discret/continu, hiérarchies/dossiers, pilule de champ — contrats core `fields`
- [x] Pivot / matrice agrégé (réutilise `DataTable`) — contrat core `buildPivotTable`
- [x] KPI / cartes data (display, delta-vs-période, goal/progress, KPI+sparkline, multi-card) — contrat core `buildKpiCards`

## Vague 2 — Consommateurs d'état & multiplicateur  *(claude:dataviz)*
- [x] Cross-filter / cross-highlight (callbacks charts, highlight, scoping) — **complet à parité 3 fw** : DashboardFilterBar, SelectionLegend, CrossfilteredBarChart (sortie via `applyCrossfilter` + brushing-clic via DS BarChart `selectedKeys`/`onSelect` → `toggleSelection`, échelle partagée `domain`, opt-out `selectable`)
- [ ] Drill & exploration (down/up/expand, through/by, show records, back+historique)
- [ ] Small multiples / faceting (trellis via `Grid`, échelle partagée)

## Vague 3 — Moteur de viz  *(codex:dataviz)*
- [~] Catégoriels & combo (multi-série lignes/aires, barres groupées & 100 %, combo+2e axe, step, Pareto, lollipop, divergentes) — contrats core `buildCategoricalSeries` faits ; reste câblage DS / sous-types spécialisés
- [~] Flux & part-of-whole (pie plein, funnel, waterfall+variance, treemap, sunburst, sankey, chord, radar, mekko, packed bubbles, rose) — contrats core part/hiérarchie/waterfall/flow faits ; reste câblage DS / sous-types spécialisés
- [~] Pivot avancé (cross-tab agrégé, sous-totaux, expand/collapse, heat de cellule, sparkline en cellule) — contrat core `buildAdvancedPivotTable` fait ; reste câblage DS
- [~] Distribution & statistique (box plot, histogramme/bins, distribution, heatmap cat.+calendaire, bullet, gauge) — contrats core histogram/box/heatmap faits ; reste bullet/gauge + câblage DS
- [~] Couche analytique (réf lines, bandes/percentiles, tendance, prévision, cluster, barres d'erreur, goal line) — contrats core ref/percentile/trend/forecast/cluster/error bars faits ; reste câblage DS
- [~] Cartographie géo (pin, choroplèthe/filled, densité, GeoJSON/shape, flux/arcs, hexbin, clustering/couches ; 3D hors-DS) — contrats core pin/choropleth/flow/hexbin/cluster faits ; reste densité/GeoJSON couches + câblage DS

## Vague 4 — Authoring & signets  *(claude:dataviz)*
- [ ] Filtres BI avancés (range slider 2 poignées, date relative, time range, granularité, filtre et/ou, Top N)
- [ ] Signets & actions (bookmarks, navigateur/diaporama, actions filtre/URL/set/aller-à, click behavior)
- [ ] Panneau format & axes (volet Format, éditeur d'axe plage/log/inversé, légendes éditables, marqueurs/forme)
- [ ] Éditeur de calcul / expression (champ calculé, formule+autocomplétion, calculs table/visuels, variables, bins, groupes, sets)

## Vague 5 — Génériques courts  *(claude:dataviz)*
- [ ] Range slider à 2 poignées (utile hors BI)
- [ ] Menu d'export / téléchargement (UI)
- [ ] Wrapper iframe / page web ; Image data-driven ; Object/layer panel (réutilise `TreeView`)

## Démo & revue  *(claude:dataviz)*
- [ ] `apps/docs` — dashboard de démo cross-filter sur les 3 frameworks
- [ ] Déploiement GitHub Pages
- [ ] Revue intégrale « en tant que design system » (tokens/contraste/a11y/parité)

## Hors couverture (assumé)
SQL Lab/IDE · semantic models · IA/smart narrative · embed/SDK · subscriptions ·
permissions/partage · alerting serveur · carto 3D deck.gl · rapport paginé ·
paradigme marks-card/shelves drag-drop (différé).
