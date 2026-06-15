/**
 * Sample palettes for the PalettePicker demo — these are DEMO INPUT DATA (the
 * colors to visualise), not component styling. In a real app the categorical
 * swatches would receive design-system tone tokens (`var(--st-color-…)`) and
 * the sequential/diverging anchors would be resolved from DS tokens; here we
 * pass well-known scientific palettes so the three scale TYPES are obvious.
 *
 * - categorical: distinct hues (Tableau-10-like) — for unordered categories.
 * - sequential: light→dark single hue — for a continuous Low→High measure.
 * - diverging: two hues through a neutral midpoint — for a signed/centred value.
 */

/** Categorical: 8 distinct hues (unordered categories). */
export const CATEGORICAL_DEMO: string[] = [
  '#4e79a7',
  '#f28e2b',
  '#e15759',
  '#76b7b2',
  '#59a14f',
  '#edc948',
  '#b07aa1',
  '#ff9da7',
];

/** Sequential: light→dark blue (continuous Low→High). */
export const SEQUENTIAL_DEMO: string[] = ['#eff3ff', '#08519c'];

/** Diverging: red → neutral → blue (signed / centred value). */
export const DIVERGING_DEMO: string[] = ['#b2182b', '#f7f7f7', '#2166ac'];
