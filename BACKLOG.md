# dataviz — Backlog « classe Highcharts » (capacités transverses) + plan

Le gap des **types** de charts est traité par **WP19** (DS = composants SVG ; `codex:dataviz` = wrappers + modèles core). Le vrai manque = **capacités transverses**, absentes partout (ni DS, ni core, ni consumer). Inventaire différentiel Opus/Fable, 2026-06-10 (dataviz v0.4.19, 61 composants, BI 100%).

## Par propriétaire

### DS chart-feature — `claude:sent-tech-design-system`
Annotations (layer rendu) · Data labels (prop uniforme tous charts) · Zoom/pan/brush (API extremes contrôlée) · Boost/large-data (seuil canvas) · Tooltip formatter + shared tooltip · Legend toggle série · Clavier-dans-les-points (a11y) · Palette couleurs (cat/seq/div) · Pattern fills · ⚠️ **BUG i18n** : `Référence:`/`Objectif:` en dur dans BarChart/LineChart (bloque non-FR).

### DS grid (DataTable → Grid Lite/Pro)
Virtualisation lignes · resize/reorder colonnes · filtres par colonne · colonnes épinglées · multi-tri · édition cellule.

### core — `codex:dataviz` / partagé
Modèle annotations (coords data, sérialisable) · downsampling LTTB/min-max · canal extremes-sync · undo/redo · API append/streaming · data connectors/pool · sérialisation dashboard COMPLET (pas que filtres) · règles conditional-format · formatteur locale (Intl).

### dataviz-consumer — `claude:dataviz` (MOI)
Tooltips/crosshair synchronisés · **Export PNG/SVG/PDF** (🛠️ agent en cours) · Canvas dashboard + edit-mode (drag-resize) · color-palette picker · URL state sync · multi-pages · focus mode · drilldown généralisé · **Site docs/galerie** (🛠️ agent en cours).

## MVP-12 transverse (ordre de valeur)
1. Annotations (DS+core) · 2. Data labels (DS) · 3. Zoom/pan/brush (DS) · 4. Tooltips synchronisés (consumer) · 5. **Export PNG/SVG/PDF** (consumer) · 6. Boost/large-data (DS) · 7. Downsampling (core) · 8. Grid virtualisation (DS) · 9. Grid resize/filtres (DS) · 10. Dashboard canvas/edit-mode (consumer) · 11. Palette couleurs (DS + picker consumer) · 12. Formatteur locale + fix i18n (core+DS).

## Exécution
- **Site `dataviz.sent-tech.ca`** : mappé sur le site du design-system, cas d'usage **réalistes** + contrôles interactifs (style highcharts.com/docs), thèmes/palettes (sortir du monochrome). Déploiement GitHub Pages + `CNAME dataviz.sent-tech.ca` (DNS = repo owner DS). **Vérification du rendu live via Playwright (CDN)**.
- **/loop** : ≥2 agents background (1 = site docs/galerie ; 2 = capacités consumer prioritaires). Intégration + `npm run verify` + push + CI verte + bump npm assurés par le superviseur (discipline gate-before-push). Tag lockstep pré-autorisé.
- **track** : items dataviz à organiser avec le design-system (WP20 « capacités transverses » proposé via h2a). Le store track canonique est dans le repo DS.

_Source détaillée : inventaire différentiel (≈70 items, owners, statut PRESENT/PARTIAL/MISSING) produit le 2026-06-10._
