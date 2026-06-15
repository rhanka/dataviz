# Chart UX & QA — tooltip nearest-X + grille de QA réutilisable

> Veille deep-research (Opus 4.8, 2026-06-15) suite au feedback user sur les démos.
> Référence pour les FR au design-system + la QA systématique des charts dataviz.

## 1. Le défaut tooltip (récurrent) et sa correction

**Symptôme** (ex BellCurve) : le tooltip/annotation ne suit le curseur que s'il est **près de la courbe**, et ne disparaît pas en sortant du plot ; la valeur affichée est incohérente.

**Diagnostic** : les composants chart DS font du hit-testing **« proximité du mark »** (listeners sur le `<path>`/markers) au lieu de **capture sur tout le plot + snap nearest-X**. C'est le **mauvais défaut**. Tout l'écosystème fait l'inverse par défaut :

| Lib | Mécanisme | Option |
|---|---|---|
| Highcharts | tout le plot capture le mouvement, snap au point le plus proche en X | `series.stickyTracking:true` (défaut), `tooltip.shared`, `xAxis.crosshair`, `findNearestPointBy:'x'` |
| ECharts | tooltip déclenché par l'axe + curseur croix | `tooltip.trigger:'axis'` + `axisPointer.type:'cross'`, `snap:true` |
| Plotly | suit la coordonnée X sur toutes les traces | `hovermode:'x'` / `'x unified'`, `spikesnap:'data'` |
| Vega-Lite | sélection point `nearest:true` (Voronoi) + `clear:'pointerout'` | — |
| Observable Plot | `pointerX` : distance en **une seule dimension** (l'axe dominant, ex temps) | `Plot.crosshairX`, `Plot.pointerX` |
| d3 (manuel) | overlay `<rect>` plein-plot + `d3.bisector(...).center` | — |

**Modèle recommandé** : `nearest-x` — capture plein-plot, distance sur X seul, snap au datum, crosshair vertical, tooltip partagé multi-séries, **hide on pointer-leave**, edge-flip pour ne jamais déborder. Réserver `nearest-point` (2D/Voronoi) aux scatter/bubble.

### Algorithme de référence (SVG, framework-agnostique)
```
bisectX = bisector(d => d.x).center   // .center = vraiment le plus proche (pas .left/.right)
// overlay <rect> transparent couvrant TOUT le plot (inside margins), pointer-events:all
onpointermove(e):
  px = clamp(pointerX_relative_plot(e), 0, plotWidth)
  xValue = xScale.invert(px + plotLeft)
  i = clamp(bisectX(data, xValue), 0, data.length-1)
  datum = data[i]; snapX = xScale(datum.x)
  rows = series.map(s => ({name, color, value: valueAt(s, datum.x)}))   // tooltip partagé
  showCrosshair(snapX); showMarkers(rows); positionTooltip(snapX, py, rows); announce(datum)
onpointerleave(): hideCrosshair(); hideMarkers(); hideTooltip()   // <-- le morceau manquant
// edge-flip : left = snapX+OFF ; si left+tw>plotWidth → left = snapX-tw-OFF ; clamp dans la boundary
```
Edge cases : clamp avant `invert` ET après `bisect` (padding d'axe) ; x catégoriel → index = round(px/bandWidth) ; `pointermove`/`pointerleave` (Pointer Events, touch) ; throttle rAF pour grand N ; **le hit-area = le rect plein-plot, pas le path** (cause racine du bug).

### Accessibilité (obligatoire — WCAG 2.1.1)
Équivalent clavier : focus sur le chart → flèches G/D déplacent le crosshair point-à-point, H/B entre séries, Home/End extrêmes ; annonce du datum focalisé via une région `aria-live="polite"` off-screen (débouncée). ARIA décrit le quoi, pas le comportement clavier → à implémenter. Tester contre Chartability (tooltips cachés par défaut, parité souris/clavier, ne pas obstruer le chart) — le user-testing low-vision confirme : tooltip utile MAIS ne doit pas couvrir le chart (→ edge-flip).

## 2. FR au design-system (spec déclarative, quad-fw)

Props (défauts = le bon comportement par défaut) :

| Prop | Type | Défaut | Sémantique |
|---|---|---|---|
| `tooltipMode` | `'nearest-x' \| 'nearest-point' \| 'none'` | `'nearest-x'` | nearest-x = capture plein-plot + snap X (line/area/curve/temps) ; nearest-point = 2D (scatter/bubble) |
| `crosshair` | `boolean \| {x?,y?}` | `true` (x) | règle crosshair snappée au datum |
| `tooltipShared` | `boolean` | `true` (multi-séries line/area) | un tooltip listant toutes les séries au X partagé |
| `hideTooltipOnLeave` | `boolean` | `true` | clear crosshair+tooltip sur pointerleave/blur — **corrige le « ne disparaît pas »** |
| `snap` | `boolean` | `true` | snap au datum |
| `tooltipBoundary` | `'plot'\|'container'\|'viewport'` | `'container'` | edge-flip/clamp, jamais de clip |
| `maxPointerDistance` | `number\|null` px | `null` | échappatoire (Plot `maxRadius` / Plotly `hoverdistance`) ; null = plein-plot |
| `keyboardNavigation` | `boolean` | `true` | flèches + aria-live |
| `tooltipFormatter` | `(ctx)=>string\|VNode` | défaut | rendu custom |

Events : `onHover(ctx)`, `onHoverEnd()`, `onPointFocus(ctx)`.

Critères d'acceptation : (1) bouger n'importe où dans le plot (même loin verticalement) met à jour tooltip+crosshair au nearest-X ; (2) sortir/blur cache (si `hideTooltipOnLeave`) ; (3) jamais de clip (flip/clamp) ; (4) multi-séries = 1 crosshair / N markers / 1 tooltip ; (5) flèches clavier + aria-live ; (6) nearest-point seulement scatter/bubble ; (7) Pointer Events + rAF + touch.

## 3. Grille de QA par chart (à passer sur CHAQUE démo)

PASS/FAIL/N-A + note par cellule. Classes = les 5 catégories du user (a-e) + a11y.

**A. Style par défaut** — palette = tokens DS (zéro couleur inventée), contraste, colorblind-safe (pas hue-only) ; typo/spacing cohérents ; gridlines discrètes ; séries distinguables sans la couleur seule.

**B. Chevauchement & texte coupé** — labels axe X sans overlap (rotation ~45°/every-Nth/ellipsis) ; labels Y non clippés, formatés ; légende wrap/paginée, non coupée ; data-labels collision-detect (hide/dodge) + ellipsis ; densité de ticks adaptée à la largeur.

**C. Sizing & responsive (« trop gros »)** — ratio par défaut sensé, min/max respectés ; pas d'overflow/clip (axes/légende/tooltip) hors conteneur ; reflow mobile/medium/wide (ResizeObserver) ; `viewBox`/`preserveAspectRatio` corrects, pas de px fixes qui débordent la grille.

**D. Interactions (la classe du bug rapporté)** — **tooltip suit le X sur tout le plot** (pas proximité) ; crosshair snap nearest (bisector `.center`) ; **tooltip+crosshair cachés sur pointerleave/blur** ; tooltip partagé multi-séries ; pas de clip/flip aux bords ; touch OK + rAF ; **les contrôles range/filter filtrent vraiment** (régression : set range → asserter le sous-ensemble change — le bug « filter qui ne filtre pas ») ; toggle légende ; brush/zoom met à jour axes+data ; clavier (flèches + aria-live + focus visible).

**E. Animation** — entrée brève (≤300-400ms) skippable + `prefers-reduced-motion` ; **pas de transition trompeuse** (barres poussent du zéro pas du haut ; draw-on de ligne n'implique pas d'ordre temporel faux) ; update = mapping old→new par clé (object constancy) ; pas d'anim sur updates haute-fréquence (flicker) ; tooltip/crosshair instantanés (pas d'easing sur le hover).

**F. A11y (transverse)** — équivalent clavier de chaque interaction pointeur ; `aria-label`/`role` + alternative texte (table ou aria-live) ; contraste ≥3:1 non-texte / 4.5:1 texte, pas color-only ; spot-check Chartability.

**Automatisation** : Playwright (1) déplacer le pointeur en travers du plot à Y constant LOIN de la ligne → asserter que le tooltip change avec X ; (2) sortir du plot → asserter tooltip caché ; (3) piloter le range filter → asserter le sous-ensemble change ; visual-regression par breakpoint (B+C) ; axe-core `prefers-reduced-motion` (E) + passe SR (F).

## Sources principales
Highcharts (`tooltip.snap`, `stickyTracking`, accessibility module), ECharts (axisPointer), Plotly (hovermode), Observable Plot (pointer/crosshair), Vega-Lite (selection nearest), d3 (bisector + overlay), WAI-ARIA APG, Chartability, A11Y Collective.
