# dataviz — Backlog « classe Highcharts » (capacités transverses)

Audit différentiel rafraîchi le 2026-06-11. Le store de vérité est `track` (workspace `dataviz`) ; ce fichier en est le reflet lisible. Statut = `done` / `partial` / `missing`. Priorité = P0 (bloquant valeur) → P2.

## Déjà livré (DONE)

Capacités confirmées présentes et expédiées — ne plus les lister comme manquantes :

- **Cross-filter** (sélection inter-charts) — done
- **Drilldown généralisé** (tous types de charts) — done
- **Bookmarks** (états sauvegardés) — done
- **URL state sync** (deep-linking de l'état dashboard) — done
- **Export PNG / SVG / print / CSV** (ChartExport + helpers, 3 frameworks) — done
- **Calculated fields** (champs calculés) — done
- **Small multiples** — done
- **Header AppChrome + sélecteur de thème** (composant DS, golden rule) — done
- Site docs/galerie (apps/site), deep-links SPA (fix 404 Pages), switch framework React/Vue live, domaine custom dataviz.sent-tech.ca, logo sent-tech — done

## Gaps restants — par propriétaire

### dataviz-consumer — `claude:dataviz`

- **[P1] Crosshair / tooltip synchronisés multi-panneaux** — missing (canal hover à câbler côté consumer + rendu DS)
- **[P1] Légende interactive : toggle visibilité de série** — missing (interactivité consumer + état core)
- **[P1] Palettes / picker de couleur (consumer)** — missing (UI picker ; voir scales DS)
  - _Note : l'item track « Color-palette picker (consumer) » (`01KTSSEWPC3PGTVFYN16Z690C4`) recouvre partiellement le nouvel item « Palettes/échelles de couleur » (`01KTV6JKT40ZPJ58JJBMSZV1N9`). Les deux sont conservés : le 1er = UI picker consumer, le 2nd = scales DS + picker. À fusionner ultérieurement._
- **[P1] Dashboard canvas / edit-mode (drag-resize)** — partial : layout existe mais `serialize.ts` ne couvre que filtres / sélections / drill → sérialisation complète du layout manquante
- **[golden-rule] apps/site : adopter DS Badge / Card / Breadcrumb / CodeSnippet** — in-progress (actuellement hand-rollés)
- **[régression mobile] sidebar catalogue inatteignable post-AppChrome** — in-progress : `sidebarOpen` jamais mis à `true` → fix consumer ou FR slot sidebar AppChrome

### dataviz-core — `codex:dataviz` / partagé

- **[P0] Modèle d'annotations sérialisable** (coords data) — missing (FR-DS déposée pour le rendu)
- **[P1] Formatage localisé Intl** (nombre / devise / % / date) — missing ; + fix chaînes FR en dur (ex. ChartExport « Imprimer »)
- **[P1] Conditional formatting** (moteur de règles seuil → couleur / icône) — missing ; à appliquer pivot / table / KPI
- **[P1] Sérialisation complète du dashboard** — partial : `serialize.ts` limité aux filtres / sélections / drill (lié au canvas consumer)
- Canal hover / extremes-sync (support du crosshair synchronisé) — missing

### DS-feature-request — `claude:sent-tech-design-system`

- **[P0] Annotations de chart (rendu)** — FR-DS déposée (modèle côté core)
- **[P0] Data labels uniformes sur tous les charts** (prop DS + formatter) — FR-DS déposée
- **[P1] Échelles / palettes de couleur** (catégoriel / séquentiel / divergent) — missing (scales DS, alimente le picker consumer)
- **[P1] Légende interactive** (toggle série, côté rendu DS) — missing
- **[golden-rule] Rose / Chord / PackedBubble : consommer les composants DS** — in-progress (agent dédié)
- Slot sidebar dans AppChrome (alternative à la FR pour la régression mobile) — à évaluer

## Hors-priorité

- **[P2] PDF vectoriel natif** — missing (aujourd'hui : impression navigateur uniquement)

---

_Synthèse : tout l'axe « interaction & navigation » (cross-filter, drilldown, bookmarks, URL-sync, export, calculated fields, small-multiples, AppChrome+thème) est livré. Les gaps restants sont concentrés sur (1) l'enrichissement visuel des charts (annotations, data labels, palettes, légende interactive, conditional formatting), (2) la localisation (Intl + FR en dur), (3) la sérialisation/édition complète du dashboard, et (4) la discipline golden-rule (consommer le DS partout). Deux régressions/chantiers golden-rule sont actifs (Rose/Chord/PackedBubble, apps/site DS, sidebar mobile)._
