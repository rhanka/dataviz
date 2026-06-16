# Échelles de couleur (`@sentropic/dataviz-core`)

Module `color.ts` (depuis v0.4.46/47) — math de couleur **framework-agnostique**,
**sans couleur hardcodée** : toutes les fonctions opèrent sur des couleurs
**fournies par l'appelant** (typiquement résolues depuis les tokens du design
system au call site), donc le DS reste la source unique de vérité couleur.
L'interpolation se fait en **OKLab** (perceptuellement uniforme) → des rampes
régulières en luminosité, sans zone terne au milieu (contrairement à un dégradé
sRGB naïf).

## Choisir la bonne famille d'échelle

| Donnée | Échelle | Pourquoi |
|---|---|---|
| Catégories **non ordonnées** (canal, segment, produit) | **catégorielle** (`buildCategoricalScale`, ou les tons DS `category1..8`) | teintes distinctes ; l'ordre n'a pas de sens |
| Mesure **continue** Low→High (heatmap, densité, score) | **séquentielle** (`buildSequentialScale`) | rampe mono-teinte clair→foncé, monotone et lisible |
| Valeur **signée / centrée** (écart à une moyenne, delta) | **divergente** (`buildDivergingScale`) | deux teintes via un neutre central |

> ⚠️ **Ne jamais utiliser une palette catégorielle pour une valeur continue**
> (le « rainbow » Low→High est perceptuellement faux et non-monotone). Un heatmap
> = échelle **séquentielle**.

## API

```ts
import {
  parseHex, toHex, mix, sampleScale,
  buildCategoricalScale, buildSequentialScale, buildDivergingScale,
  colorAt, makeColorScale,
} from '@sentropic/dataviz-core';
```

- `parseHex(str)` → `{r,g,b} | null` · `toHex({r,g,b})` → `'#rrggbb'`.
- `mix(a, b, t)` → couleur interpolée en **OKLab** (`t` clampé `[0,1]`). Entrée
  invalide → fallback (jamais d'exception).
- `sampleScale(stops, t)` → échantillonne un gradient multi-stops à `t∈[0,1]`.
- `buildCategoricalScale(palette, count)` → `string[]` (cycle la palette).
- `buildSequentialScale(stops, count)` → `string[]` (rampe OKLab de `count` pas).
- `buildDivergingScale(low, mid, high, count)` → `string[]`.
- `colorAt(value, min, max, stops)` → mappe une **valeur continue** `[min,max]`
  vers une couleur le long du gradient (clamp hors-domaine ; non-fini → 1er stop).
- `makeColorScale(min, max, stops)` → `(value) => couleur` (mapper réutilisable,
  forme `makeFormatter`).

## Exemples

```ts
// Rampe séquentielle de 9 couleurs (anchors résolus depuis des tokens DS) :
const ramp = buildSequentialScale(['#eff3ff', '#08519c'], 9);

// Heatmap / severity ramp : valeur → couleur
const colorFor = makeColorScale(0, 100, ['#eff3ff', '#08519c']);
cells.forEach(c => c.color = colorFor(c.value));   // ex. score d'anomalie 0..100

// Divergente (delta autour de 0) :
const diverging = buildDivergingScale('#b2182b', '#f7f7f7', '#2166ac', 11);
```

## Aperçu visuel

Le composant **`PalettePicker`** (3 fw, v0.4.48) prévisualise les 3 familles via
les composants DS `ColorSwatch` (catégoriel) + `ColorScaleBar` (séquentiel /
divergent). Démo : page `palette-picker` du site.

Voir aussi `docs/chart-ux-qa.md` (grille QA — la couleur fait partie de la classe
« style par défaut »).
