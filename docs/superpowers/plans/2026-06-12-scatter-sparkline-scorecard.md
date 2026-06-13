# ScatterPlot / Sparkline / ScoreCard Wrappers — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add ScatterPlot, Sparkline, and ScoreCard dataviz wrappers across Svelte/React/Vue, with a core builder for ScatterPlot, registered demos, green `npm run verify`, and green `DV_SITE_BASE=/ npm run build --workspace apps/site`.

**Architecture:**
- Each wrapper is a thin 3-framework component (Svelte `.svelte`, React `.tsx`, Vue `.ts`) that maps the dataviz data model + a few prop-level parameters to the DS component's data shape.
- ScatterPlot needs a new core builder `buildScatterModel` in `packages/dataviz-core/src/scatter.ts` (pure function, tested) — it maps two measures (x, y) over the filtered rows to `ScatterPlotDatum[]`. An optional `series` dimension maps to 8-cycle tones.
- Sparkline maps a measure over a categorical/time dimension using the existing `buildSimpleCategoricalSeries` + extracts the `values` array. No new core builder needed.
- ScoreCard wraps `KpiCard` (the DS "score card" primitive) and maps one measure + optional comparison/sparklineDimension via the existing `buildKpiCards` core builder. Single-card variant of `KpiCardGroup`.
- Demos registered in `apps/site/src/lib/registry/entries/charts.ts` and wired into `apps/site/src/lib/registry/charts/ChartDemo.svelte`.

**Tech Stack:** Svelte 5, React 18, Vue 3, TypeScript, Vitest, @sentropic/dataviz-core, @sentropic/design-system-{svelte,react,vue}

---

## File Structure

### New files — core
- `packages/dataviz-core/src/scatter.ts` — `buildScatterModel()` pure function + types
- `packages/dataviz-core/src/scatter.test.ts` — Vitest unit tests

### Modified files — core
- `packages/dataviz-core/src/index.ts` — export `buildScatterModel` + its types

### New files — svelte
- `packages/dataviz-svelte/src/lib/ScatterPlot.svelte`
- `packages/dataviz-svelte/src/lib/Sparkline.svelte`
- `packages/dataviz-svelte/src/lib/ScoreCard.svelte`

### Modified files — svelte
- `packages/dataviz-svelte/src/index.ts` — add 3 exports

### New files — react
- `packages/dataviz-react/src/lib/ScatterPlot.tsx`
- `packages/dataviz-react/src/lib/Sparkline.tsx`
- `packages/dataviz-react/src/lib/ScoreCard.tsx`

### Modified files — react
- `packages/dataviz-react/src/index.ts` — add 3 exports

### New files — vue
- `packages/dataviz-vue/src/lib/ScatterPlot.ts`
- `packages/dataviz-vue/src/lib/Sparkline.ts`
- `packages/dataviz-vue/src/lib/ScoreCard.ts`

### Modified files — vue
- `packages/dataviz-vue/src/index.ts` — add 3 exports

### Modified files — site
- `apps/site/src/lib/registry/charts/ChartDemo.svelte` — wire 3 new `kind` branches
- `apps/site/src/lib/registry/entries/charts.ts` — add 3 new `chart(...)` entries

---

## Design notes / DS API mapping

### ScatterPlot
DS `ScatterPlot` (all 3 fw) takes:
```ts
data: ScatterPlotDatum[]     // { x: number; y: number; label?: string; tone?: ScatterPlotTone; r?: number }
centroids?: ScatterPlotCentroid[]
xLabel?: string; yLabel?: string
width?: number; height?: number; radius?: number; label: string
```
Mapping: rows → `{ x: row[xMeasure], y: row[yMeasure], label?: row[labelField] }`. Optional `series` dimension cycles tones `category1`…`category8`. No centroids (those come from `AnalyticsClusterPlot`).

The new `buildScatterModel(model, rows, { x, y, series?, labelField? })` returns `{ data: ScatterPlotDatum[], xLabel: string, yLabel: string }`. It reads each row's x/y values (finite-number-coerced), assigns tone from the `series` dimension value if provided, and emits a label from `labelField` if provided.

### Sparkline
DS `Sparkline` (all 3 fw) takes:
```ts
data: number[]
width?: number; height?: number; tone?: SparklineTone; strokeWidth?: number; area?: boolean; label?: string
```
Mapping: `buildSimpleCategoricalSeries(model, rows, dimension, measure)` → extract `series[0].values ?? []`. That's it. No new core builder.

### ScoreCard
DS `KpiCard` (all 3 fw) is the "ScoreCard" — no separate `ScoreCard` DS component exists. The wrapper is named `ScoreCard` in dataviz but maps to DS `KpiCard`. It uses the existing `buildKpiCards` with one config entry.
```ts
// DS KpiCard props used:
value: number; label: string
delta?: number; deltaFormat?: KpiCardDeltaFormat; format?: KpiCardFormat
unit?: string; currency?: string; locale?: string
sparkline?: number[]; size?: KpiCardSize; tone?: KpiCardTone
```
Mapping: `buildKpiCards(model, rows, [{ id: 'card', label, measure, goal?, sparklineDimension? }], { comparisonData? })` returns one `KpiCard`. Pass `delta = finite(deltaFormat==='absolute' ? card.delta : card.deltaPercent)`. ScoreCard wraps a **single** KPI card (unlike KpiCardGroup which renders N).

---

## Task 1: Core builder — `buildScatterModel`

**Files:**
- Create: `packages/dataviz-core/src/scatter.ts`
- Create: `packages/dataviz-core/src/scatter.test.ts`
- Modify: `packages/dataviz-core/src/index.ts` (lines ~195–200, after the analytics exports)

- [ ] **Step 1: Write the failing test**

Create `/home/antoinefa/src/dataviz/packages/dataviz-core/src/scatter.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { type DataModel, type Row } from './index.js';
import { buildScatterModel } from './scatter.js';

const model: DataModel = {
  dimensions: [
    { id: 'category', label: 'Catégorie', type: 'discrete' },
  ],
  measures: [
    { id: 'revenue', label: 'Revenu', aggregation: 'sum' },
    { id: 'units', label: 'Unités', aggregation: 'sum' },
  ],
};

const rows: Row[] = [
  { category: 'A', revenue: 100, units: 10 },
  { category: 'B', revenue: 200, units: 20 },
  { category: 'A', revenue: 50, units: 5 },
];

describe('buildScatterModel', () => {
  it('maps two measures as x/y coordinates per row', () => {
    const result = buildScatterModel(model, rows, { x: 'revenue', y: 'units' });
    expect(result.data).toHaveLength(3);
    expect(result.data[0]).toEqual({ x: 100, y: 10 });
    expect(result.data[1]).toEqual({ x: 200, y: 20 });
    expect(result.data[2]).toEqual({ x: 50, y: 5 });
    expect(result.xLabel).toBe('revenue');
    expect(result.yLabel).toBe('units');
  });

  it('skips rows where x or y is not a finite number', () => {
    const sparseRows: Row[] = [
      { revenue: 100, units: 10 },
      { revenue: null, units: 20 },
      { revenue: 50, units: null },
      { revenue: NaN, units: 5 },
    ];
    const result = buildScatterModel(model, sparseRows, { x: 'revenue', y: 'units' });
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toEqual({ x: 100, y: 10 });
  });

  it('assigns tones cycling through category1–8 when series is provided', () => {
    const result = buildScatterModel(model, rows, { x: 'revenue', y: 'units', series: 'category' });
    // A → category1, B → category2, A → category1 (same tone for same value)
    expect(result.data[0]!.tone).toBe('category1');
    expect(result.data[1]!.tone).toBe('category2');
    expect(result.data[2]!.tone).toBe('category1');
  });

  it('assigns label from labelField when provided', () => {
    const result = buildScatterModel(model, rows, { x: 'revenue', y: 'units', labelField: 'category' });
    expect(result.data[0]!.label).toBe('A');
    expect(result.data[1]!.label).toBe('B');
  });
});
```

- [ ] **Step 2: Run test — verify it fails**

```bash
cd /home/antoinefa/src/dataviz && npx vitest run packages/dataviz-core/src/scatter.test.ts 2>&1 | tail -20
```
Expected: FAIL with "Cannot find module" or "buildScatterModel is not a function".

- [ ] **Step 3: Implement `scatter.ts`**

Create `/home/antoinefa/src/dataviz/packages/dataviz-core/src/scatter.ts`:

```ts
/**
 * Scatter plot data builder.
 *
 * Maps two numeric fields (x, y) from raw rows into ScatterPlotDatum-compatible
 * objects. An optional `series` dimension assigns categorical tones
 * (category1…category8, cycling). An optional `labelField` emits a per-point label.
 *
 * No aggregation: each row becomes one datum, non-finite x or y values are
 * dropped silently (mirrors the null-handling pattern in analyticsDsData.ts).
 */

const SCATTER_TONES = [
  'category1',
  'category2',
  'category3',
  'category4',
  'category5',
  'category6',
  'category7',
  'category8',
] as const;

export type ScatterTone = (typeof SCATTER_TONES)[number];

export interface ScatterDatum {
  x: number;
  y: number;
  label?: string;
  tone?: ScatterTone;
}

export interface ScatterConfig {
  /** Field id whose numeric value becomes the x coordinate. */
  x: string;
  /** Field id whose numeric value becomes the y coordinate. */
  y: string;
  /** Optional dimension whose distinct values are mapped to categorical tones. */
  series?: string;
  /** Optional field whose string value is used as the per-point label. */
  labelField?: string;
}

export interface ScatterModel {
  data: ScatterDatum[];
  xLabel: string;
  yLabel: string;
}

function toFiniteNumber(value: unknown): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

/**
 * Build scatter-plot data from raw rows by mapping two numeric fields to x/y.
 *
 * @param _model  DataModel (reserved for future measure-label lookup)
 * @param rows    Filtered rows from `store.applyCrossfilter(viewId)`
 * @param config  { x, y, series?, labelField? }
 */
export function buildScatterModel(
  _model: unknown,
  rows: readonly Record<string, unknown>[],
  config: ScatterConfig,
): ScatterModel {
  // Build tone map lazily: series value → tone (stable across rows)
  const toneMap = new Map<string, ScatterTone>();
  let toneIndex = 0;

  const data: ScatterDatum[] = [];

  for (const row of rows) {
    const x = toFiniteNumber(row[config.x]);
    const y = toFiniteNumber(row[config.y]);
    if (x === undefined || y === undefined) continue;

    const datum: ScatterDatum = { x, y };

    if (config.series !== undefined) {
      const key = row[config.series] == null ? 'null' : String(row[config.series]);
      if (!toneMap.has(key)) {
        toneMap.set(key, SCATTER_TONES[toneIndex % SCATTER_TONES.length]!);
        toneIndex++;
      }
      datum.tone = toneMap.get(key);
    }

    if (config.labelField !== undefined) {
      const rawLabel = row[config.labelField];
      if (rawLabel != null) {
        datum.label = String(rawLabel);
      }
    }

    data.push(datum);
  }

  return {
    data,
    xLabel: config.x,
    yLabel: config.y,
  };
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
cd /home/antoinefa/src/dataviz && npx vitest run packages/dataviz-core/src/scatter.test.ts 2>&1 | tail -20
```
Expected: all 4 tests PASS.

- [ ] **Step 5: Export from `packages/dataviz-core/src/index.ts`**

After the analytics exports block (after line 200, before the Geographic models section), add:

```ts
// Scatter plot model
export type { ScatterDatum, ScatterConfig, ScatterModel, ScatterTone } from './scatter.js';
export { buildScatterModel } from './scatter.js';
```

- [ ] **Step 6: Commit**

```bash
cd /home/antoinefa/src/dataviz && git add packages/dataviz-core/src/scatter.ts packages/dataviz-core/src/scatter.test.ts packages/dataviz-core/src/index.ts && git commit -m "feat(core): add buildScatterModel — row-level x/y mapper with tone+label support"
```

---

## Task 2: ScatterPlot wrappers (Svelte / React / Vue)

**Files:**
- Create: `packages/dataviz-svelte/src/lib/ScatterPlot.svelte`
- Modify: `packages/dataviz-svelte/src/index.ts`
- Create: `packages/dataviz-react/src/lib/ScatterPlot.tsx`
- Modify: `packages/dataviz-react/src/index.ts`
- Create: `packages/dataviz-vue/src/lib/ScatterPlot.ts`
- Modify: `packages/dataviz-vue/src/index.ts`

- [ ] **Step 1: Create `packages/dataviz-svelte/src/lib/ScatterPlot.svelte`**

```svelte
<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';
  import type { ScatterPlotTone } from '@sentropic/design-system-svelte';

  export type ScatterPlotProps = {
    store: DashboardStore;
    viewId: string;
    /** Field id for x-axis values (numeric). */
    x: string;
    /** Field id for y-axis values (numeric). */
    y: string;
    /** Optional dimension whose values drive categorical tones. */
    series?: string;
    /** Optional field used as per-point tooltip label. */
    labelField?: string;
    width?: number;
    height?: number;
    radius?: number;
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { ScatterPlot as DsScatterPlot } from '@sentropic/design-system-svelte';
  import type { ScatterPlotDatum } from '@sentropic/design-system-svelte';
  import { buildScatterModel } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    x,
    y,
    series,
    labelField,
    width,
    height,
    radius,
    label,
    class: className,
  }: ScatterPlotProps = $props();

  const dash = $derived(useDashboard(store));
  const model = $derived.by(() => {
    void $dash;
    return buildScatterModel(store.model, store.applyCrossfilter(viewId), { x, y, series, labelField });
  });
</script>

<DsScatterPlot
  data={model.data as ScatterPlotDatum[]}
  xLabel={model.xLabel}
  yLabel={model.yLabel}
  {width}
  {height}
  {radius}
  {label}
  class={className}
/>
```

- [ ] **Step 2: Create `packages/dataviz-react/src/lib/ScatterPlot.tsx`**

```tsx
import {
  ScatterPlot as DsScatterPlot,
  type ScatterPlotDatum,
} from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildScatterModel } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type ScatterPlotProps = {
  store: DashboardStore;
  viewId: string;
  x: string;
  y: string;
  series?: string;
  labelField?: string;
  width?: number;
  height?: number;
  radius?: number;
  label: string;
  className?: string;
};

export function ScatterPlot({
  store,
  viewId,
  x,
  y,
  series,
  labelField,
  width,
  height,
  radius,
  label,
  className,
}: ScatterPlotProps) {
  const state = useDashboard(store);
  void state;

  const model = buildScatterModel(store.model, store.applyCrossfilter(viewId), { x, y, series, labelField });

  return (
    <DsScatterPlot
      data={model.data as ScatterPlotDatum[]}
      xLabel={model.xLabel}
      yLabel={model.yLabel}
      width={width}
      height={height}
      radius={radius}
      label={label}
      className={className}
    />
  );
}
```

- [ ] **Step 3: Create `packages/dataviz-vue/src/lib/ScatterPlot.ts`**

```ts
import { defineComponent, h, type PropType } from 'vue';
import {
  ScatterPlot as DsScatterPlot,
  type ScatterPlotDatum,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildScatterModel } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type ScatterPlotProps = {
  store: DashboardStore;
  viewId: string;
  x: string;
  y: string;
  series?: string;
  labelField?: string;
  width?: number;
  height?: number;
  radius?: number;
  label: string;
  class?: string;
};

export const ScatterPlot = defineComponent({
  name: 'ScatterPlot',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    x: { type: String, required: true },
    y: { type: String, required: true },
    series: { type: String, default: undefined },
    labelField: { type: String, default: undefined },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    radius: { type: Number, default: undefined },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const model = buildScatterModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
        x: props.x,
        y: props.y,
        series: props.series,
        labelField: props.labelField,
      });
      return h(DsScatterPlot, {
        data: model.data as ScatterPlotDatum[],
        xLabel: model.xLabel,
        yLabel: model.yLabel,
        width: props.width,
        height: props.height,
        radius: props.radius,
        label: props.label,
        class: props.class,
      });
    };
  },
});
```

- [ ] **Step 4: Add exports to `packages/dataviz-svelte/src/index.ts`**

After the `AnalyticsClusterPlot` export lines (lines 91–92), add:

```ts
export { default as ScatterPlot } from './lib/ScatterPlot.svelte';
export type { ScatterPlotProps } from './lib/ScatterPlot.svelte';
```

- [ ] **Step 5: Add exports to `packages/dataviz-react/src/index.ts`**

After the `AnalyticsClusterPlot` export lines (lines 87–88), add:

```ts
export { ScatterPlot } from './lib/ScatterPlot.js';
export type { ScatterPlotProps } from './lib/ScatterPlot.js';
```

- [ ] **Step 6: Add exports to `packages/dataviz-vue/src/index.ts`**

After the `AnalyticsClusterPlot` export lines (lines 87–88), add:

```ts
export { ScatterPlot } from './lib/ScatterPlot.js';
export type { ScatterPlotProps } from './lib/ScatterPlot.js';
```

- [ ] **Step 7: Run type-check to verify no errors**

```bash
cd /home/antoinefa/src/dataviz && npm run check --workspace packages/dataviz-svelte 2>&1 | tail -30
cd /home/antoinefa/src/dataviz && npm run check --workspace packages/dataviz-react 2>&1 | tail -30
cd /home/antoinefa/src/dataviz && npm run check --workspace packages/dataviz-vue 2>&1 | tail -30
```
Expected: 0 errors each.

- [ ] **Step 8: Commit**

```bash
cd /home/antoinefa/src/dataviz && git add \
  packages/dataviz-svelte/src/lib/ScatterPlot.svelte \
  packages/dataviz-svelte/src/index.ts \
  packages/dataviz-react/src/lib/ScatterPlot.tsx \
  packages/dataviz-react/src/index.ts \
  packages/dataviz-vue/src/lib/ScatterPlot.ts \
  packages/dataviz-vue/src/index.ts \
  && git commit -m "feat(charts): ScatterPlot wrapper — 3-fw, maps x/y measures + optional series tones via buildScatterModel"
```

---

## Task 3: Sparkline wrappers (Svelte / React / Vue)

**Files:**
- Create: `packages/dataviz-svelte/src/lib/Sparkline.svelte`
- Modify: `packages/dataviz-svelte/src/index.ts`
- Create: `packages/dataviz-react/src/lib/Sparkline.tsx`
- Modify: `packages/dataviz-react/src/index.ts`
- Create: `packages/dataviz-vue/src/lib/Sparkline.ts`
- Modify: `packages/dataviz-vue/src/index.ts`

- [ ] **Step 1: Create `packages/dataviz-svelte/src/lib/Sparkline.svelte`**

```svelte
<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type SparklineTone = 'neutral' | 'success' | 'warning' | 'error';

  export type SparklineProps = {
    store: DashboardStore;
    viewId: string;
    /** Dimension (e.g. 'month') over which values are ordered. */
    dimension: string;
    /** Measure whose aggregated per-key values form the sparkline series. */
    measure: string;
    tone?: SparklineTone;
    strokeWidth?: number;
    area?: boolean;
    width?: number;
    height?: number;
    label?: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { Sparkline as DsSparkline } from '@sentropic/design-system-svelte';
  import { useDashboard } from '../adapter.js';
  import { buildSimpleCategoricalSeries } from './categoricalData.js';

  let {
    store,
    viewId,
    dimension,
    measure,
    tone,
    strokeWidth,
    area,
    width,
    height,
    label,
    class: className,
  }: SparklineProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by((): number[] => {
    void $dash;
    const seriesModel = buildSimpleCategoricalSeries(store.model, store.applyCrossfilter(viewId), dimension, measure);
    return seriesModel.series[0]?.values ?? [];
  });
</script>

<DsSparkline {data} {tone} {strokeWidth} {area} {width} {height} {label} class={className} />
```

- [ ] **Step 2: Create `packages/dataviz-react/src/lib/Sparkline.tsx`**

```tsx
import { Sparkline as DsSparkline } from '@sentropic/design-system-react';
import type { SparklineTone } from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSimpleCategoricalSeries } from './categoricalData.js';

export type SparklineProps = {
  store: DashboardStore;
  viewId: string;
  dimension: string;
  measure: string;
  tone?: SparklineTone;
  strokeWidth?: number;
  area?: boolean;
  width?: number;
  height?: number;
  label?: string;
  className?: string;
};

export function Sparkline({
  store,
  viewId,
  dimension,
  measure,
  tone,
  strokeWidth,
  area,
  width,
  height,
  label,
  className,
}: SparklineProps) {
  const state = useDashboard(store);
  void state;

  const seriesModel = buildSimpleCategoricalSeries(store.model, store.applyCrossfilter(viewId), dimension, measure);
  const data: number[] = seriesModel.series[0]?.values ?? [];

  return (
    <DsSparkline
      data={data}
      tone={tone}
      strokeWidth={strokeWidth}
      area={area}
      width={width}
      height={height}
      label={label}
      className={className}
    />
  );
}
```

- [ ] **Step 3: Create `packages/dataviz-vue/src/lib/Sparkline.ts`**

```ts
import { defineComponent, h, type PropType } from 'vue';
import { Sparkline as DsSparkline, type SparklineTone } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSimpleCategoricalSeries } from './categoricalData.js';

export type SparklineProps = {
  store: DashboardStore;
  viewId: string;
  dimension: string;
  measure: string;
  tone?: SparklineTone;
  strokeWidth?: number;
  area?: boolean;
  width?: number;
  height?: number;
  label?: string;
  class?: string;
};

export const Sparkline = defineComponent({
  name: 'Sparkline',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    dimension: { type: String, required: true },
    measure: { type: String, required: true },
    tone: { type: String as PropType<SparklineTone>, default: undefined },
    strokeWidth: { type: Number, default: undefined },
    area: { type: Boolean, default: undefined },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    label: { type: String, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const seriesModel = buildSimpleCategoricalSeries(
        props.store.model,
        props.store.applyCrossfilter(props.viewId),
        props.dimension,
        props.measure,
      );
      const data: number[] = seriesModel.series[0]?.values ?? [];
      return h(DsSparkline, {
        data,
        tone: props.tone,
        strokeWidth: props.strokeWidth,
        area: props.area,
        width: props.width,
        height: props.height,
        label: props.label,
        class: props.class,
      });
    };
  },
});
```

- [ ] **Step 4: Add exports to `packages/dataviz-svelte/src/index.ts`**

After the ScatterPlot exports just added, add:

```ts
export { default as Sparkline } from './lib/Sparkline.svelte';
export type { SparklineProps } from './lib/Sparkline.svelte';
```

- [ ] **Step 5: Add exports to `packages/dataviz-react/src/index.ts`**

After the ScatterPlot exports just added, add:

```ts
export { Sparkline } from './lib/Sparkline.js';
export type { SparklineProps } from './lib/Sparkline.js';
```

- [ ] **Step 6: Add exports to `packages/dataviz-vue/src/index.ts`**

After the ScatterPlot exports just added, add:

```ts
export { Sparkline } from './lib/Sparkline.js';
export type { SparklineProps } from './lib/Sparkline.js';
```

- [ ] **Step 7: Run type-check**

```bash
cd /home/antoinefa/src/dataviz && npm run check --workspace packages/dataviz-svelte 2>&1 | tail -30
cd /home/antoinefa/src/dataviz && npm run check --workspace packages/dataviz-react 2>&1 | tail -30
cd /home/antoinefa/src/dataviz && npm run check --workspace packages/dataviz-vue 2>&1 | tail -30
```
Expected: 0 errors.

- [ ] **Step 8: Commit**

```bash
cd /home/antoinefa/src/dataviz && git add \
  packages/dataviz-svelte/src/lib/Sparkline.svelte \
  packages/dataviz-svelte/src/index.ts \
  packages/dataviz-react/src/lib/Sparkline.tsx \
  packages/dataviz-react/src/index.ts \
  packages/dataviz-vue/src/lib/Sparkline.ts \
  packages/dataviz-vue/src/index.ts \
  && git commit -m "feat(charts): Sparkline wrapper — 3-fw, maps measure over dimension via buildSimpleCategoricalSeries"
```

---

## Task 4: ScoreCard wrappers (Svelte / React / Vue)

**Files:**
- Create: `packages/dataviz-svelte/src/lib/ScoreCard.svelte`
- Modify: `packages/dataviz-svelte/src/index.ts`
- Create: `packages/dataviz-react/src/lib/ScoreCard.tsx`
- Modify: `packages/dataviz-react/src/index.ts`
- Create: `packages/dataviz-vue/src/lib/ScoreCard.ts`
- Modify: `packages/dataviz-vue/src/index.ts`

- [ ] **Step 1: Create `packages/dataviz-svelte/src/lib/ScoreCard.svelte`**

```svelte
<script lang="ts" module>
  import type { DashboardStore, Row } from '@sentropic/dataviz-core';
  import type {
    KpiCardDeltaFormat,
    KpiCardFormat,
    KpiCardSize,
    KpiCardTone,
  } from '@sentropic/design-system-svelte';

  export type ScoreCardProps = {
    store: DashboardStore;
    viewId?: string;
    /** The measure to aggregate and display as the primary value. */
    measure: string;
    /** Display label for the card. Defaults to the measure's label. */
    label?: string;
    /** Optional goal value; enables progress display when set. */
    goal?: number;
    /** Dimension used to build the inline sparkline (e.g. 'month'). */
    sparklineDimension?: string;
    /** Previous-period rows for delta computation. */
    comparisonData?: readonly Row[];
    format?: KpiCardFormat;
    deltaFormat?: KpiCardDeltaFormat;
    size?: KpiCardSize;
    tone?: KpiCardTone;
    class?: string;
  };
</script>

<script lang="ts">
  import { KpiCard } from '@sentropic/design-system-svelte';
  import { buildKpiCards } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    measure,
    label,
    goal,
    sparklineDimension,
    comparisonData,
    format,
    deltaFormat = 'percent',
    size,
    tone,
    class: className,
  }: ScoreCardProps = $props();

  const dash = $derived(useDashboard(store));
  const card = $derived.by(() => {
    void $dash;
    const [c] = buildKpiCards(
      store.model,
      store.applyCrossfilter(viewId),
      [{ id: 'card', label, measure, goal, sparklineDimension }],
      { comparisonData },
    );
    return c!;
  });

  const finite = (value: number | undefined): number | undefined =>
    value === undefined || !Number.isFinite(value) ? undefined : value;
</script>

<KpiCard
  value={card.value}
  label={card.label}
  delta={finite(deltaFormat === 'absolute' ? card.delta : card.deltaPercent)}
  {deltaFormat}
  {format}
  {size}
  {tone}
  sparkline={card.sparkline?.map((point) => point.value)}
  class={className}
/>
```

- [ ] **Step 2: Create `packages/dataviz-react/src/lib/ScoreCard.tsx`**

```tsx
import {
  KpiCard,
  type KpiCardDeltaFormat,
  type KpiCardFormat,
  type KpiCardSize,
  type KpiCardTone,
} from '@sentropic/design-system-react';
import {
  buildKpiCards,
  type DashboardStore,
  type Row,
} from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type ScoreCardProps = {
  store: DashboardStore;
  viewId?: string;
  measure: string;
  label?: string;
  goal?: number;
  sparklineDimension?: string;
  comparisonData?: readonly Row[];
  format?: KpiCardFormat;
  deltaFormat?: KpiCardDeltaFormat;
  size?: KpiCardSize;
  tone?: KpiCardTone;
  className?: string;
};

function finite(value: number | undefined): number | undefined {
  return value === undefined || !Number.isFinite(value) ? undefined : value;
}

export function ScoreCard({
  store,
  viewId,
  measure,
  label,
  goal,
  sparklineDimension,
  comparisonData,
  format,
  deltaFormat = 'percent',
  size,
  tone,
  className,
}: ScoreCardProps) {
  useDashboard(store);

  const [card] = buildKpiCards(
    store.model,
    store.applyCrossfilter(viewId),
    [{ id: 'card', label, measure, goal, sparklineDimension }],
    { comparisonData },
  );

  return (
    <KpiCard
      value={card!.value}
      label={card!.label}
      delta={finite(deltaFormat === 'absolute' ? card!.delta : card!.deltaPercent)}
      deltaFormat={deltaFormat}
      format={format}
      size={size}
      tone={tone}
      sparkline={card!.sparkline?.map((point) => point.value)}
      className={className}
    />
  );
}
```

- [ ] **Step 3: Create `packages/dataviz-vue/src/lib/ScoreCard.ts`**

```ts
import { defineComponent, h, type PropType } from 'vue';
import {
  KpiCard,
  type KpiCardDeltaFormat,
  type KpiCardFormat,
  type KpiCardSize,
  type KpiCardTone,
} from '@sentropic/design-system-vue';
import {
  buildKpiCards,
  type DashboardStore,
  type Row,
} from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type ScoreCardProps = {
  store: DashboardStore;
  viewId?: string;
  measure: string;
  label?: string;
  goal?: number;
  sparklineDimension?: string;
  comparisonData?: readonly Row[];
  format?: KpiCardFormat;
  deltaFormat?: KpiCardDeltaFormat;
  size?: KpiCardSize;
  tone?: KpiCardTone;
  class?: string;
};

function finite(value: number | undefined): number | undefined {
  return value === undefined || !Number.isFinite(value) ? undefined : value;
}

export const ScoreCard = defineComponent({
  name: 'ScoreCard',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, default: undefined },
    measure: { type: String, required: true },
    label: { type: String, default: undefined },
    goal: { type: Number, default: undefined },
    sparklineDimension: { type: String, default: undefined },
    comparisonData: { type: Array as unknown as PropType<readonly Row[]>, default: undefined },
    format: { type: String as PropType<KpiCardFormat>, default: undefined },
    deltaFormat: { type: String as PropType<KpiCardDeltaFormat>, default: 'percent' },
    size: { type: String as PropType<KpiCardSize>, default: undefined },
    tone: { type: String as PropType<KpiCardTone>, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const [card] = buildKpiCards(
        props.store.model,
        props.store.applyCrossfilter(props.viewId),
        [{ id: 'card', label: props.label, measure: props.measure, goal: props.goal, sparklineDimension: props.sparklineDimension }],
        { comparisonData: props.comparisonData },
      );
      return h(KpiCard, {
        value: card!.value,
        label: card!.label,
        delta: finite(props.deltaFormat === 'absolute' ? card!.delta : card!.deltaPercent),
        deltaFormat: props.deltaFormat,
        format: props.format,
        size: props.size,
        tone: props.tone,
        sparkline: card!.sparkline?.map((point) => point.value),
        class: props.class,
      });
    };
  },
});
```

- [ ] **Step 4: Add exports to `packages/dataviz-svelte/src/index.ts`**

After the Sparkline exports, add:

```ts
export { default as ScoreCard } from './lib/ScoreCard.svelte';
export type { ScoreCardProps } from './lib/ScoreCard.svelte';
```

- [ ] **Step 5: Add exports to `packages/dataviz-react/src/index.ts`**

After the Sparkline exports, add:

```ts
export { ScoreCard } from './lib/ScoreCard.js';
export type { ScoreCardProps } from './lib/ScoreCard.js';
```

- [ ] **Step 6: Add exports to `packages/dataviz-vue/src/index.ts`**

After the Sparkline exports, add:

```ts
export { ScoreCard } from './lib/ScoreCard.js';
export type { ScoreCardProps } from './lib/ScoreCard.js';
```

- [ ] **Step 7: Run type-check**

```bash
cd /home/antoinefa/src/dataviz && npm run check --workspace packages/dataviz-svelte 2>&1 | tail -30
cd /home/antoinefa/src/dataviz && npm run check --workspace packages/dataviz-react 2>&1 | tail -30
cd /home/antoinefa/src/dataviz && npm run check --workspace packages/dataviz-vue 2>&1 | tail -30
```
Expected: 0 errors.

- [ ] **Step 8: Commit**

```bash
cd /home/antoinefa/src/dataviz && git add \
  packages/dataviz-svelte/src/lib/ScoreCard.svelte \
  packages/dataviz-svelte/src/index.ts \
  packages/dataviz-react/src/lib/ScoreCard.tsx \
  packages/dataviz-react/src/index.ts \
  packages/dataviz-vue/src/lib/ScoreCard.ts \
  packages/dataviz-vue/src/index.ts \
  && git commit -m "feat(charts): ScoreCard wrapper — 3-fw, single KPI card via buildKpiCards"
```

---

## Task 5: Demo registration (ChartDemo + registry entries)

**Files:**
- Modify: `apps/site/src/lib/registry/charts/ChartDemo.svelte`
- Modify: `apps/site/src/lib/registry/entries/charts.ts`

- [ ] **Step 1: Add imports to ChartDemo.svelte**

In the import block at the top of `apps/site/src/lib/registry/charts/ChartDemo.svelte`, add `ScatterPlot, Sparkline, ScoreCard` to the `@sentropic/dataviz-svelte` import:

Current line 8–39:
```svelte
  import {
    AreaChart,
    ...
    AnalyticsClusterPlot,
  } from '@sentropic/dataviz-svelte';
```

Add `ScatterPlot, Sparkline, ScoreCard` to the destructure list.

- [ ] **Step 2: Wire the three new `kind` branches in ChartDemo.svelte**

After the existing `{:else if kind === 'cluster'}` branch (line 169), before the closing `{/if}` (line 170), add:

```svelte
  {:else if kind === 'scatter'}
    <ScatterPlot {store} viewId="c" x="revenue" y="units" series="category" labelField="category" label="Revenu vs unités par catégorie" />
  {:else if kind === 'sparkline'}
    <Sparkline {store} viewId="c" dimension="month" measure="revenue" area label="Tendance mensuelle du revenu" />
  {:else if kind === 'scorecard'}
    <ScoreCard {store} viewId="c" measure="revenue" sparklineDimension="month" format="currency" label="Revenu total" tone="category1" />
```

- [ ] **Step 3: Add to `showDim` list if needed**

The `showDim` derived in ChartDemo.svelte controls which charts show the dimension switcher. `scatter` does not need the dimension switcher (x/y are fixed measures). Sparkline and ScoreCard also don't need it. No change needed to `showDim` or `showMeasure`.

However, ScoreCard has no `measure` switcher interaction in the demo (the measure is hardcoded to `revenue` in the demo). That is acceptable for the demo — the real component is fully parameterized.

- [ ] **Step 4: Add 3 registry entries to `apps/site/src/lib/registry/entries/charts.ts`**

Before the `geo(...)` section (after the `cluster-plot` entry at roughly line 406), add three new `chart(...)` entries in a new sub-group `'Indicateurs'`:

```ts
    // ── Indicateurs ──────────────────────────────────────────────────────
    chart({
      slug: 'scatter', name: 'ScatterPlot', group: 'Indicateurs', kind: 'scatter', hasControls: false,
      tagline: 'Nuage de points (x/y) avec tones catégorielles optionnelles.',
      useCase:
        "Comparer deux mesures numériques (revenu vs unités) point à point. La propriété `series` colore les points par dimension catégorielle (ici la catégorie produit), révélant des groupes sans clustering.\n\nContrairement à `AnalyticsClusterPlot` (k-means), `ScatterPlot` est une lecture directe sans transformation statistique : chaque ligne du dataset devient un point.",
      code: storeCode(['ScatterPlot'], {
        svelte: `<ScatterPlot {store} viewId="c" x="revenue" y="units" series="category" labelField="category" label="Revenu vs unités" />`,
        react: `<ScatterPlot store={store} viewId="c" x="revenue" y="units" series="category" labelField="category" label="Revenu vs unités" />`,
        vue: `<ScatterPlot :store="store" viewId="c" x="revenue" y="units" series="category" labelField="category" label="Revenu vs unités" />`,
      }),
    }, ChartDemo),
    chart({
      slug: 'sparkline', name: 'Sparkline', group: 'Indicateurs', kind: 'sparkline', hasControls: false,
      tagline: 'Mini-courbe de tendance inline.',
      useCase:
        "Intégrer une tendance compacte dans un tableau de bord ou une fiche KPI. `dimension` ordonne les points (ex. 'month'), `measure` fournit les valeurs. `area` ajoute un remplissage semi-transparent pour améliorer la lisibilité.",
      code: storeCode(['Sparkline'], {
        svelte: `<Sparkline {store} viewId="c" dimension="month" measure="revenue" area label="Tendance mensuelle" />`,
        react: `<Sparkline store={store} viewId="c" dimension="month" measure="revenue" area label="Tendance mensuelle" />`,
        vue: `<Sparkline :store="store" viewId="c" dimension="month" measure="revenue" area label="Tendance mensuelle" />`,
      }),
    }, ChartDemo),
    chart({
      slug: 'scorecard', name: 'ScoreCard', group: 'Indicateurs', kind: 'scorecard', hasControls: false,
      tagline: 'Carte KPI unique avec delta, sparkline et objectif.',
      useCase:
        "Afficher un indicateur clé isolé — valeur agrégée, variation par rapport à une période précédente (`comparisonData`), objectif de progression (`goal`) et mini-sparkline. Variante single-card de `KpiCardGroup` : même moteur `buildKpiCards`, un seul slot.",
      code: storeCode(['ScoreCard'], {
        svelte: `<ScoreCard {store} viewId="c" measure="revenue" sparklineDimension="month" format="currency" tone="category1" label="Revenu total" />`,
        react: `<ScoreCard store={store} viewId="c" measure="revenue" sparklineDimension="month" format="currency" tone="category1" label="Revenu total" />`,
        vue: `<ScoreCard :store="store" viewId="c" measure="revenue" sparklineDimension="month" format="currency" tone="category1" label="Revenu total" />`,
      }),
    }, ChartDemo),
```

- [ ] **Step 5: Build the site to check for errors**

```bash
cd /home/antoinefa/src/dataviz && DV_SITE_BASE=/ npm run build --workspace apps/site 2>&1 | tail -40
```
Expected: build succeeds, no type errors, no CSS `*/` issues.

If any error, fix before committing.

- [ ] **Step 6: Commit**

```bash
cd /home/antoinefa/src/dataviz && git add \
  apps/site/src/lib/registry/charts/ChartDemo.svelte \
  apps/site/src/lib/registry/entries/charts.ts \
  && git commit -m "feat(site): register ScatterPlot, Sparkline, ScoreCard chart demos"
```

---

## Task 6: Full gate + push

- [ ] **Step 1: Run `npm run verify` and save output**

```bash
cd /home/antoinefa/src/dataviz && npm run verify > /tmp/verify.log 2>&1; echo "VERIFY_EXIT=$?" >> /tmp/verify.log
```

- [ ] **Step 2: Read and check VERIFY_EXIT**

```bash
grep "VERIFY_EXIT" /tmp/verify.log
```
Expected: `VERIFY_EXIT=0`

If non-zero, read the log for failures:
```bash
cat /tmp/verify.log | grep -E "(error|Error|FAIL|failed)" | head -40
```
Fix any failures and re-run verify before proceeding.

- [ ] **Step 3: Run site build gate**

```bash
cd /home/antoinefa/src/dataviz && DV_SITE_BASE=/ npm run build --workspace apps/site > /tmp/site-build.log 2>&1; echo "SITE_EXIT=$?" >> /tmp/site-build.log && grep "SITE_EXIT" /tmp/site-build.log
```
Expected: `SITE_EXIT=0`

If non-zero, fix errors (most likely type errors in ChartDemo or registry).

- [ ] **Step 4: Push to main**

```bash
cd /home/antoinefa/src/dataviz && git push origin main
```

---

## Self-Review

**Spec coverage check:**
- [x] ScatterPlot — 3 fw wrappers, core builder + tests, demo, registry entry
- [x] Sparkline — 3 fw wrappers, no new builder (uses existing `buildSimpleCategoricalSeries`), demo, registry entry
- [x] ScoreCard — 3 fw wrappers, uses existing `buildKpiCards`, demo, registry entry
- [x] Core builder `buildScatterModel` added to `dataviz-core/src/scatter.ts` with tests
- [x] All 9 framework files created (3 charts × 3 frameworks)
- [x] All 6 package index files updated (3 packages × Svelte/React/Vue, but actually 3 packages total — Svelte/React/Vue — each getting 3 new exports, so 9 export pairs)
- [x] ChartDemo.svelte: imports added, 3 new `kind` branches
- [x] charts.ts: 3 new `chart(...)` entries in group 'Indicateurs'
- [x] Golden rule: presentation 100% from DS; no hand-rolled SVG
- [x] verify + site-build gate before push
- [x] No release tag (conductor cuts v0.4.28)

**DS API note (ScoreCard):** The DS has no `ScoreCard` component — the equivalent is `KpiCard`. The dataviz wrapper is named `ScoreCard` and maps to `KpiCard`. This is documented in the report back to the user.

**Placeholder scan:** All steps contain exact file paths and complete code. No "TBD" or "fill in details".

**Type consistency:** `buildScatterModel` is consistently called with signature `(model, rows, config)` — same in test file and all 3 wrappers. `ScatterDatum` from core matches `ScatterPlotDatum` from DS (both have `x, y, label?, tone?, r?`) — the wrappers cast via `as ScatterPlotDatum[]` since `ScatterDatum` is the core-internal type and `ScatterPlotDatum` is DS-specific (they're structurally identical but distinct types).
