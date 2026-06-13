# Five New Chart Wrappers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wrap five DS chart components (OHLCChart, GanttChart, TimelineChart, StreamgraphChart, TileMapChart) as dataviz charts at strict 3-framework parity (Svelte/React/Vue), mirroring the existing CandlestickChart pattern.

**Architecture:** Each chart gets a core builder module (framework-agnostic, maps DataModel rows → DS datum shape), three framework wrappers that call the builder and forward to the DS component, plus a registry demo entry. All presentation is 100% from the DS — zero hand-rolled markup. Synthetic data files are placed under `apps/site/src/lib/data/`.

**Tech Stack:** TypeScript, Svelte 5 (`$props()` / `$derived.by()`), React (function component + `useDashboard`), Vue 3 (`defineComponent` + `setup` render function), Vitest (unit tests), `@sentropic/design-system-{svelte,react,vue}` (nested 0.36.33), `@sentropic/dataviz-core` (DataModel / Row helpers).

---

## Key DS Contracts (from nested 0.36.33 path)

### OHLCChart
```typescript
// datum: { label: string; open: number; high: number; low: number; close: number }
// props: data, label, width?, height?, annotations?, dataLabels?, hoverKey?, onHoverKeyChange?, keyboardNav?, onSelectKey?, className?
```

### GanttChart
```typescript
// datum: { task: string; start: number; end: number; category?: string }
// props: data, label, width?, height?, marker?, className?
```

### TimelineChart
```typescript
// tone: "category1" | "category2" | ... | "category8"
// datum: { position: number; label: string; description?: string; tone?: TimelineChartTone }
// props: data, label, width?, height?, className?
```

### StreamgraphChart
```typescript
// tone: "category1" | ... | "category8"
// series value: { label: string; value: number; tone?: StreamgraphChartTone }
// datum: { category: string; values: StreamgraphChartSeriesValue[] }
// props: data, label, width?, height?, smooth?, showLegend?, className?
```

### TileMapChart
```typescript
// datum: { label: string; col: number; row: number; value: number }
// props: data, label, width?, height?, className?
```

---

## File Map

### New files to CREATE

**dataviz-core:**
- `packages/dataviz-core/src/ohlc.ts` — `OhlcDatum`, `OhlcConfig`, `buildOhlcData`
- `packages/dataviz-core/src/ohlc.test.ts`
- `packages/dataviz-core/src/gantt.ts` — `GanttDatum`, `GanttConfig`, `buildGanttData`
- `packages/dataviz-core/src/gantt.test.ts`
- `packages/dataviz-core/src/timeline.ts` — `TimelineDatum`, `TimelineConfig`, `TimelineTone`, `buildTimelineData`
- `packages/dataviz-core/src/timeline.test.ts`
- `packages/dataviz-core/src/streamgraph.ts` — `StreamgraphSeriesValue`, `StreamgraphDatum`, `StreamgraphConfig`, `buildStreamgraphData`
- `packages/dataviz-core/src/streamgraph.test.ts`
- `packages/dataviz-core/src/tilemap.ts` — `TileMapTile`, `TileMapConfig`, `buildTileMapData`
- `packages/dataviz-core/src/tilemap.test.ts`

**dataviz-svelte:**
- `packages/dataviz-svelte/src/lib/OHLCChart.svelte`
- `packages/dataviz-svelte/src/lib/GanttChart.svelte`
- `packages/dataviz-svelte/src/lib/TimelineChart.svelte`
- `packages/dataviz-svelte/src/lib/StreamgraphChart.svelte`
- `packages/dataviz-svelte/src/lib/TileMapChart.svelte`

**dataviz-react:**
- `packages/dataviz-react/src/lib/OHLCChart.tsx`
- `packages/dataviz-react/src/lib/GanttChart.tsx`
- `packages/dataviz-react/src/lib/TimelineChart.tsx`
- `packages/dataviz-react/src/lib/StreamgraphChart.tsx`
- `packages/dataviz-react/src/lib/TileMapChart.tsx`

**dataviz-vue:**
- `packages/dataviz-vue/src/lib/OHLCChart.ts`
- `packages/dataviz-vue/src/lib/GanttChart.ts`
- `packages/dataviz-vue/src/lib/TimelineChart.ts`
- `packages/dataviz-vue/src/lib/StreamgraphChart.ts`
- `packages/dataviz-vue/src/lib/TileMapChart.ts`

**site data:**
- `apps/site/src/lib/data/gantt.ts` — `ganttModel`, `ganttData`, `makeGanttStore`
- `apps/site/src/lib/data/timeline.ts` — `timelineModel`, `timelineData`, `makeTimelineStore`
- `apps/site/src/lib/data/streamgraph.ts` — `streamgraphModel`, `streamgraphData`, `makeStreamgraphStore`
- `apps/site/src/lib/data/tilemap.ts` — `tilemapModel`, `tilemapData`, `makeTilemapStore`

### Files to MODIFY

- `packages/dataviz-core/src/index.ts` — add 5 new export blocks
- `packages/dataviz-svelte/src/index.ts` — add 5 new component exports
- `packages/dataviz-react/src/index.ts` — add 5 new component exports
- `packages/dataviz-vue/src/index.ts` — add 5 new component exports
- `apps/site/src/lib/registry/entries/charts.ts` — add 5 new chart entries
- `apps/site/src/lib/registry/charts/ChartDemo.svelte` — add 5 new `{:else if}` branches + imports

---

## Task 1: OHLCChart core builder + test

**Files:**
- Create: `packages/dataviz-core/src/ohlc.ts`
- Create: `packages/dataviz-core/src/ohlc.test.ts`

OHLCChart is identical in datum shape to CandlestickChart; `buildOhlcData` is a thin wrapper around the same logic (avoids importing from candlestick to keep the module independent).

- [ ] **Step 1: Write the failing test**

Create `packages/dataviz-core/src/ohlc.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { type DataModel, type Row } from './index.js';
import { buildOhlcData } from './ohlc.js';

const model: DataModel = {
  dimensions: [{ id: 'session', label: 'Séance', type: 'discrete' }],
  measures: [
    { id: 'open', label: 'Ouverture', aggregation: 'avg' },
    { id: 'high', label: 'Plus haut', aggregation: 'avg' },
    { id: 'low', label: 'Plus bas', aggregation: 'avg' },
    { id: 'close', label: 'Clôture', aggregation: 'avg' },
  ],
};

const rows: Row[] = [
  { session: '02 jan', open: 142.50, high: 146.80, low: 141.20, close: 145.30 },
  { session: '03 jan', open: 145.30, high: 148.50, low: 143.00, close: 144.10 },
];

const config = { label: 'session', open: 'open', high: 'high', low: 'low', close: 'close' };

describe('buildOhlcData', () => {
  it('maps OHLC fields and label per row', () => {
    const result = buildOhlcData(model, rows, config);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ label: '02 jan', open: 142.50, high: 146.80, low: 141.20, close: 145.30 });
    expect(result[1]).toEqual({ label: '03 jan', open: 145.30, high: 148.50, low: 143.00, close: 144.10 });
  });

  it('skips rows where any OHLC value is non-finite', () => {
    const sparseRows: Row[] = [
      { session: '02 jan', open: 142.50, high: 146.80, low: 141.20, close: 145.30 },
      { session: '03 jan', open: null, high: 148.50, low: 143.00, close: 144.10 },
      { session: '04 jan', open: 144.10, high: NaN, low: 142.60, close: 146.80 },
    ];
    const result = buildOhlcData(model, sparseRows, config);
    expect(result).toHaveLength(1);
    expect(result[0]!.label).toBe('02 jan');
  });

  it('coerces the label field to a string', () => {
    const numericRows: Row[] = [
      { session: 20240102, open: 142.50, high: 146.80, low: 141.20, close: 145.30 },
    ];
    const result = buildOhlcData(model, numericRows, config);
    expect(result[0]!.label).toBe('20240102');
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd /home/antoinefa/src/dataviz && npx vitest run packages/dataviz-core/src/ohlc.test.ts 2>&1 | tail -20
```
Expected: error "Cannot find module './ohlc.js'"

- [ ] **Step 3: Write the core builder**

Create `packages/dataviz-core/src/ohlc.ts`:

```typescript
/**
 * OHLC chart data builder.
 *
 * Datum shape is identical to CandlestickDatum. This independent module keeps
 * OHLCChart concerns separate from CandlestickChart concerns — neither imports
 * the other.
 */

import { type DataModel, type Row, findMeasure, findDimension } from './model.js';

export interface OhlcDatum {
  label: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface OhlcConfig {
  /** Field id whose value becomes the bar label. */
  label: string;
  /** Field id whose numeric value becomes the open price. */
  open: string;
  /** Field id whose numeric value becomes the high price. */
  high: string;
  /** Field id whose numeric value becomes the low price. */
  low: string;
  /** Field id whose numeric value becomes the close price. */
  close: string;
}

function toFiniteNumber(value: unknown): number | undefined {
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function fieldLabel(model: DataModel, fieldId: string): string {
  return findMeasure(model, fieldId)?.label ?? findDimension(model, fieldId)?.label ?? fieldId;
}

/**
 * Build OHLC chart data from raw rows.
 *
 * @param _model  DataModel — reserved for future label/format lookup
 * @param rows    Filtered rows from `store.applyCrossfilter(viewId)`
 * @param config  { label, open, high, low, close } — field ids
 */
export function buildOhlcData(
  _model: DataModel,
  rows: readonly Row[],
  config: OhlcConfig,
): OhlcDatum[] {
  void fieldLabel;
  const data: OhlcDatum[] = [];

  for (const row of rows) {
    const open = toFiniteNumber(row[config.open]);
    const high = toFiniteNumber(row[config.high]);
    const low = toFiniteNumber(row[config.low]);
    const close = toFiniteNumber(row[config.close]);

    if (open === undefined || high === undefined || low === undefined || close === undefined) {
      continue;
    }

    const labelRaw = row[config.label];
    const label = labelRaw == null ? '' : String(labelRaw);

    data.push({ label, open, high, low, close });
  }

  return data;
}
```

- [ ] **Step 4: Run test to confirm pass**

```bash
cd /home/antoinefa/src/dataviz && npx vitest run packages/dataviz-core/src/ohlc.test.ts 2>&1 | tail -10
```
Expected: all 3 tests PASS

- [ ] **Step 5: Export from core index**

In `packages/dataviz-core/src/index.ts`, after the candlestick block (line 208), add:

```typescript
// OHLC chart model
export type { OhlcDatum, OhlcConfig } from './ohlc.js';
export { buildOhlcData } from './ohlc.js';
```

- [ ] **Step 6: Commit**

```bash
cd /home/antoinefa/src/dataviz && git add packages/dataviz-core/src/ohlc.ts packages/dataviz-core/src/ohlc.test.ts packages/dataviz-core/src/index.ts
git commit -m "feat(core): add OhlcDatum/OhlcConfig/buildOhlcData (OHLC chart builder)"
```

---

## Task 2: GanttChart core builder + test

**Files:**
- Create: `packages/dataviz-core/src/gantt.ts`
- Create: `packages/dataviz-core/src/gantt.test.ts`

GanttChartTask has `task: string`, `start: number`, `end: number`, `category?: string`. The builder maps one label field → `task`, two numeric fields → `start`/`end`, and an optional string field → `category`. Rows with non-finite start or end are dropped.

- [ ] **Step 1: Write the failing test**

Create `packages/dataviz-core/src/gantt.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { type DataModel, type Row } from './index.js';
import { buildGanttData } from './gantt.js';

const model: DataModel = {
  dimensions: [
    { id: 'task', label: 'Tâche', type: 'discrete' },
    { id: 'category', label: 'Catégorie', type: 'discrete' },
  ],
  measures: [
    { id: 'start', label: 'Début', aggregation: 'min' },
    { id: 'end', label: 'Fin', aggregation: 'max' },
  ],
};

const rows: Row[] = [
  { task: 'Analyse', start: 0, end: 3, category: 'Planification' },
  { task: 'Conception', start: 2, end: 7, category: 'Planification' },
  { task: 'Développement', start: 5, end: 14, category: 'Réalisation' },
];

const config = { task: 'task', start: 'start', end: 'end', category: 'category' };

describe('buildGanttData', () => {
  it('maps task/start/end/category fields per row', () => {
    const result = buildGanttData(model, rows, config);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ task: 'Analyse', start: 0, end: 3, category: 'Planification' });
    expect(result[1]).toEqual({ task: 'Conception', start: 2, end: 7, category: 'Planification' });
    expect(result[2]).toEqual({ task: 'Développement', start: 5, end: 14, category: 'Réalisation' });
  });

  it('skips rows where start or end is non-finite', () => {
    const sparseRows: Row[] = [
      { task: 'Analyse', start: 0, end: 3, category: 'A' },
      { task: 'Conception', start: null, end: 7, category: 'A' },
      { task: 'Dev', start: 5, end: NaN, category: 'B' },
    ];
    const result = buildGanttData(model, sparseRows, config);
    expect(result).toHaveLength(1);
    expect(result[0]!.task).toBe('Analyse');
  });

  it('omits category field when no category config provided', () => {
    const configNoCategory = { task: 'task', start: 'start', end: 'end' };
    const result = buildGanttData(model, rows, configNoCategory);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ task: 'Analyse', start: 0, end: 3 });
  });

  it('coerces task field to a string', () => {
    const numericRows: Row[] = [{ task: 42, start: 0, end: 3 }];
    const result = buildGanttData(model, numericRows, { task: 'task', start: 'start', end: 'end' });
    expect(result[0]!.task).toBe('42');
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd /home/antoinefa/src/dataviz && npx vitest run packages/dataviz-core/src/gantt.test.ts 2>&1 | tail -10
```
Expected: error "Cannot find module './gantt.js'"

- [ ] **Step 3: Write the core builder**

Create `packages/dataviz-core/src/gantt.ts`:

```typescript
/**
 * Gantt chart data builder.
 *
 * Maps a task-label field and two numeric fields (start/end day-indices or
 * epoch ms) plus an optional category field from raw rows into GanttChartTask-
 * compatible objects, as expected by the DS GanttChart component.
 *
 * A row is dropped silently when start or end is non-finite.
 */

import { type DataModel, type Row, findMeasure, findDimension } from './model.js';

export interface GanttDatum {
  task: string;
  start: number;
  end: number;
  category?: string;
}

export interface GanttConfig {
  /** Field id whose value becomes the task name (string-coerced). */
  task: string;
  /** Field id whose numeric value becomes the start (e.g. day index or epoch ms). */
  start: string;
  /** Field id whose numeric value becomes the end. */
  end: string;
  /** Optional field id whose string value becomes the category grouping. */
  category?: string;
}

function toFiniteNumber(value: unknown): number | undefined {
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function fieldLabel(model: DataModel, fieldId: string): string {
  return findMeasure(model, fieldId)?.label ?? findDimension(model, fieldId)?.label ?? fieldId;
}

/**
 * Build Gantt chart data from raw rows.
 *
 * @param _model  DataModel — reserved for future label/format lookup
 * @param rows    Filtered rows from `store.applyCrossfilter(viewId)`
 * @param config  { task, start, end, category? } — field ids
 */
export function buildGanttData(
  _model: DataModel,
  rows: readonly Row[],
  config: GanttConfig,
): GanttDatum[] {
  void fieldLabel;
  const data: GanttDatum[] = [];

  for (const row of rows) {
    const start = toFiniteNumber(row[config.start]);
    const end = toFiniteNumber(row[config.end]);

    if (start === undefined || end === undefined) continue;

    const taskRaw = row[config.task];
    const task = taskRaw == null ? '' : String(taskRaw);

    const datum: GanttDatum = { task, start, end };

    if (config.category !== undefined) {
      const catRaw = row[config.category];
      if (catRaw != null) datum.category = String(catRaw);
    }

    data.push(datum);
  }

  return data;
}
```

- [ ] **Step 4: Run test to confirm pass**

```bash
cd /home/antoinefa/src/dataviz && npx vitest run packages/dataviz-core/src/gantt.test.ts 2>&1 | tail -10
```
Expected: all 4 tests PASS

- [ ] **Step 5: Export from core index**

In `packages/dataviz-core/src/index.ts`, after the OHLC block added in Task 1, add:

```typescript
// Gantt chart model
export type { GanttDatum, GanttConfig } from './gantt.js';
export { buildGanttData } from './gantt.js';
```

- [ ] **Step 6: Commit**

```bash
cd /home/antoinefa/src/dataviz && git add packages/dataviz-core/src/gantt.ts packages/dataviz-core/src/gantt.test.ts packages/dataviz-core/src/index.ts
git commit -m "feat(core): add GanttDatum/GanttConfig/buildGanttData (Gantt chart builder)"
```

---

## Task 3: TimelineChart core builder + test

**Files:**
- Create: `packages/dataviz-core/src/timeline.ts`
- Create: `packages/dataviz-core/src/timeline.test.ts`

TimelineChartEvent: `{ position: number; label: string; description?: string; tone?: TimelineChartTone }`. The builder maps a numeric position field, a label field, an optional description field, and an optional tone field. Rows with non-finite position are dropped. The `TimelineTone` type mirrors the DS union.

- [ ] **Step 1: Write the failing test**

Create `packages/dataviz-core/src/timeline.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { type DataModel, type Row } from './index.js';
import { buildTimelineData } from './timeline.js';

const model: DataModel = {
  dimensions: [
    { id: 'event', label: 'Évènement', type: 'discrete' },
    { id: 'description', label: 'Description', type: 'discrete' },
    { id: 'tone', label: 'Ton', type: 'discrete' },
  ],
  measures: [
    { id: 'position', label: 'Position', aggregation: 'avg' },
  ],
};

const rows: Row[] = [
  { event: 'Lancement', position: 0, description: 'Démarrage du projet', tone: 'category1' },
  { event: 'Livraison v1', position: 5, description: 'Première livraison', tone: 'category3' },
  { event: 'Clôture', position: 12 },
];

const config = { label: 'event', position: 'position', description: 'description', tone: 'tone' };

describe('buildTimelineData', () => {
  it('maps position/label/description/tone per row', () => {
    const result = buildTimelineData(model, rows, config);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ position: 0, label: 'Lancement', description: 'Démarrage du projet', tone: 'category1' });
    expect(result[1]).toEqual({ position: 5, label: 'Livraison v1', description: 'Première livraison', tone: 'category3' });
    expect(result[2]).toEqual({ position: 12, label: 'Clôture' });
  });

  it('skips rows with non-finite position', () => {
    const sparseRows: Row[] = [
      { event: 'A', position: 0 },
      { event: 'B', position: null },
      { event: 'C', position: NaN },
    ];
    const result = buildTimelineData(model, sparseRows, config);
    expect(result).toHaveLength(1);
    expect(result[0]!.label).toBe('A');
  });

  it('omits description and tone when not configured', () => {
    const result = buildTimelineData(model, rows, { label: 'event', position: 'position' });
    expect(result[0]).toEqual({ position: 0, label: 'Lancement' });
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd /home/antoinefa/src/dataviz && npx vitest run packages/dataviz-core/src/timeline.test.ts 2>&1 | tail -10
```
Expected: error "Cannot find module './timeline.js'"

- [ ] **Step 3: Write the core builder**

Create `packages/dataviz-core/src/timeline.ts`:

```typescript
/**
 * Timeline chart data builder.
 *
 * Maps a numeric position field and a label field from raw rows into
 * TimelineChartEvent-compatible objects, as expected by the DS TimelineChart.
 *
 * A row is dropped silently when position is non-finite.
 */

import { type DataModel, type Row, findMeasure, findDimension } from './model.js';

/** Mirrors TimelineChartTone from the DS (presentation-free). */
export type TimelineTone =
  | 'category1' | 'category2' | 'category3' | 'category4'
  | 'category5' | 'category6' | 'category7' | 'category8';

export interface TimelineDatum {
  position: number;
  label: string;
  description?: string;
  tone?: TimelineTone;
}

export interface TimelineConfig {
  /** Field id whose value becomes the event label (string-coerced). */
  label: string;
  /** Field id whose numeric value becomes the event position on the axis. */
  position: string;
  /** Optional field id whose string value becomes the event description. */
  description?: string;
  /** Optional field id whose string value becomes the tone (e.g. "category1"). */
  tone?: string;
}

function toFiniteNumber(value: unknown): number | undefined {
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function fieldLabel(model: DataModel, fieldId: string): string {
  return findMeasure(model, fieldId)?.label ?? findDimension(model, fieldId)?.label ?? fieldId;
}

/**
 * Build timeline chart data from raw rows.
 *
 * @param _model  DataModel — reserved for future label/format lookup
 * @param rows    Filtered rows from `store.applyCrossfilter(viewId)`
 * @param config  { label, position, description?, tone? } — field ids
 */
export function buildTimelineData(
  _model: DataModel,
  rows: readonly Row[],
  config: TimelineConfig,
): TimelineDatum[] {
  void fieldLabel;
  const data: TimelineDatum[] = [];

  for (const row of rows) {
    const position = toFiniteNumber(row[config.position]);
    if (position === undefined) continue;

    const labelRaw = row[config.label];
    const label = labelRaw == null ? '' : String(labelRaw);

    const datum: TimelineDatum = { position, label };

    if (config.description !== undefined) {
      const descRaw = row[config.description];
      if (descRaw != null) datum.description = String(descRaw);
    }

    if (config.tone !== undefined) {
      const toneRaw = row[config.tone];
      if (toneRaw != null) datum.tone = String(toneRaw) as TimelineTone;
    }

    data.push(datum);
  }

  return data;
}
```

- [ ] **Step 4: Run test to confirm pass**

```bash
cd /home/antoinefa/src/dataviz && npx vitest run packages/dataviz-core/src/timeline.test.ts 2>&1 | tail -10
```
Expected: all 3 tests PASS

- [ ] **Step 5: Export from core index**

In `packages/dataviz-core/src/index.ts`, after the Gantt block, add:

```typescript
// Timeline chart model
export type { TimelineTone, TimelineDatum, TimelineConfig } from './timeline.js';
export { buildTimelineData } from './timeline.js';
```

- [ ] **Step 6: Commit**

```bash
cd /home/antoinefa/src/dataviz && git add packages/dataviz-core/src/timeline.ts packages/dataviz-core/src/timeline.test.ts packages/dataviz-core/src/index.ts
git commit -m "feat(core): add TimelineTone/TimelineDatum/TimelineConfig/buildTimelineData"
```

---

## Task 4: StreamgraphChart core builder + test

**Files:**
- Create: `packages/dataviz-core/src/streamgraph.ts`
- Create: `packages/dataviz-core/src/streamgraph.test.ts`

StreamgraphChartDatum: `{ category: string; values: { label: string; value: number; tone?: StreamgraphChartTone }[] }`. The builder pivots: for each unique value of the category field, it groups all rows into one datum, and within each group creates a `values` entry per row using the `label` field and a measure field. This lets one store row = one value within a category.

- [ ] **Step 1: Write the failing test**

Create `packages/dataviz-core/src/streamgraph.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { type DataModel, type Row } from './index.js';
import { buildStreamgraphData } from './streamgraph.js';

const model: DataModel = {
  dimensions: [
    { id: 'month', label: 'Mois', type: 'discrete' },
    { id: 'series', label: 'Série', type: 'discrete' },
  ],
  measures: [
    { id: 'revenue', label: 'Revenu', aggregation: 'sum' },
  ],
};

// category=month (x-axis), label=series (legend series), value=revenue
const rows: Row[] = [
  { month: 'Jan', series: 'A', revenue: 100 },
  { month: 'Jan', series: 'B', revenue: 200 },
  { month: 'Feb', series: 'A', revenue: 150 },
  { month: 'Feb', series: 'B', revenue: 250 },
];

const config = { category: 'month', label: 'series', value: 'revenue' };

describe('buildStreamgraphData', () => {
  it('pivots rows into one datum per category with values array', () => {
    const result = buildStreamgraphData(model, rows, config);
    expect(result).toHaveLength(2);
    const jan = result.find((d) => d.category === 'Jan');
    expect(jan).toBeDefined();
    expect(jan!.values).toHaveLength(2);
    expect(jan!.values[0]).toEqual({ label: 'A', value: 100 });
    expect(jan!.values[1]).toEqual({ label: 'B', value: 200 });

    const feb = result.find((d) => d.category === 'Feb');
    expect(feb).toBeDefined();
    expect(feb!.values).toHaveLength(2);
    expect(feb!.values[0]).toEqual({ label: 'A', value: 150 });
    expect(feb!.values[1]).toEqual({ label: 'B', value: 250 });
  });

  it('skips values with non-finite measure', () => {
    const sparseRows: Row[] = [
      { month: 'Jan', series: 'A', revenue: 100 },
      { month: 'Jan', series: 'B', revenue: null },
      { month: 'Jan', series: 'C', revenue: NaN },
    ];
    const result = buildStreamgraphData(model, sparseRows, config);
    expect(result).toHaveLength(1);
    expect(result[0]!.values).toHaveLength(1);
    expect(result[0]!.values[0]).toEqual({ label: 'A', value: 100 });
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd /home/antoinefa/src/dataviz && npx vitest run packages/dataviz-core/src/streamgraph.test.ts 2>&1 | tail -10
```
Expected: error "Cannot find module './streamgraph.js'"

- [ ] **Step 3: Write the core builder**

Create `packages/dataviz-core/src/streamgraph.ts`:

```typescript
/**
 * Streamgraph chart data builder.
 *
 * Pivots raw rows into StreamgraphChartDatum-compatible objects as expected by
 * the DS StreamgraphChart component. Each unique value of the category field
 * becomes one datum; within each datum, each row (possibly filtered to that
 * category if the data is already grouped) produces one value entry.
 *
 * Use case: category = time period (x-axis), label = series name, value = measure.
 * Rows where the measure is non-finite are silently dropped.
 */

import { type DataModel, type Row, findMeasure, findDimension } from './model.js';

/** Mirrors StreamgraphChartTone from the DS (presentation-free). */
export type StreamgraphTone =
  | 'category1' | 'category2' | 'category3' | 'category4'
  | 'category5' | 'category6' | 'category7' | 'category8';

export interface StreamgraphSeriesValue {
  label: string;
  value: number;
  tone?: StreamgraphTone;
}

export interface StreamgraphDatum {
  category: string;
  values: StreamgraphSeriesValue[];
}

export interface StreamgraphConfig {
  /** Field id whose value becomes the category (x-axis bucket, e.g. month). */
  category: string;
  /** Field id whose value becomes the series label within each category. */
  label: string;
  /** Field id whose numeric value becomes the stream height. */
  value: string;
  /** Optional field id whose string value becomes the tone for each value entry. */
  tone?: string;
}

function toFiniteNumber(value: unknown): number | undefined {
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function fieldLabel(model: DataModel, fieldId: string): string {
  return findMeasure(model, fieldId)?.label ?? findDimension(model, fieldId)?.label ?? fieldId;
}

/**
 * Build streamgraph chart data by pivoting rows into one datum per category.
 *
 * @param _model  DataModel — reserved for future label/format lookup
 * @param rows    Filtered rows from `store.applyCrossfilter(viewId)`
 * @param config  { category, label, value, tone? } — field ids
 */
export function buildStreamgraphData(
  _model: DataModel,
  rows: readonly Row[],
  config: StreamgraphConfig,
): StreamgraphDatum[] {
  void fieldLabel;
  // Preserve category insertion order using a Map.
  const categoryMap = new Map<string, StreamgraphSeriesValue[]>();

  for (const row of rows) {
    const numericValue = toFiniteNumber(row[config.value]);
    if (numericValue === undefined) continue;

    const categoryRaw = row[config.category];
    const category = categoryRaw == null ? '' : String(categoryRaw);

    const labelRaw = row[config.label];
    const label = labelRaw == null ? '' : String(labelRaw);

    const entry: StreamgraphSeriesValue = { label, value: numericValue };

    if (config.tone !== undefined) {
      const toneRaw = row[config.tone];
      if (toneRaw != null) entry.tone = String(toneRaw) as StreamgraphTone;
    }

    if (!categoryMap.has(category)) {
      categoryMap.set(category, []);
    }
    categoryMap.get(category)!.push(entry);
  }

  const data: StreamgraphDatum[] = [];
  for (const [category, values] of categoryMap) {
    data.push({ category, values });
  }
  return data;
}
```

- [ ] **Step 4: Run test to confirm pass**

```bash
cd /home/antoinefa/src/dataviz && npx vitest run packages/dataviz-core/src/streamgraph.test.ts 2>&1 | tail -10
```
Expected: all 2 tests PASS

- [ ] **Step 5: Export from core index**

In `packages/dataviz-core/src/index.ts`, after the Timeline block, add:

```typescript
// Streamgraph chart model
export type { StreamgraphTone, StreamgraphSeriesValue, StreamgraphDatum, StreamgraphConfig } from './streamgraph.js';
export { buildStreamgraphData } from './streamgraph.js';
```

- [ ] **Step 6: Commit**

```bash
cd /home/antoinefa/src/dataviz && git add packages/dataviz-core/src/streamgraph.ts packages/dataviz-core/src/streamgraph.test.ts packages/dataviz-core/src/index.ts
git commit -m "feat(core): add StreamgraphTone/StreamgraphDatum/StreamgraphConfig/buildStreamgraphData"
```

---

## Task 5: TileMapChart core builder + test

**Files:**
- Create: `packages/dataviz-core/src/tilemap.ts`
- Create: `packages/dataviz-core/src/tilemap.test.ts`

TileMapChartTile: `{ label: string; col: number; row: number; value: number }`. The builder maps a label field, two numeric grid position fields (col/row), and a numeric value field. Rows with non-finite col, row, or value are dropped.

- [ ] **Step 1: Write the failing test**

Create `packages/dataviz-core/src/tilemap.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { type DataModel, type Row } from './index.js';
import { buildTileMapData } from './tilemap.js';

const model: DataModel = {
  dimensions: [
    { id: 'region', label: 'Région', type: 'discrete' },
  ],
  measures: [
    { id: 'col', label: 'Colonne', aggregation: 'avg' },
    { id: 'row', label: 'Ligne', aggregation: 'avg' },
    { id: 'revenue', label: 'Revenu', aggregation: 'sum' },
  ],
};

const rows: Row[] = [
  { region: 'Nord', col: 2, row: 0, revenue: 420 },
  { region: 'Sud', col: 2, row: 4, revenue: 310 },
  { region: 'Est', col: 4, row: 2, revenue: 550 },
];

const config = { label: 'region', col: 'col', row: 'row', value: 'revenue' };

describe('buildTileMapData', () => {
  it('maps label/col/row/value per tile row', () => {
    const result = buildTileMapData(model, rows, config);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ label: 'Nord', col: 2, row: 0, value: 420 });
    expect(result[1]).toEqual({ label: 'Sud', col: 2, row: 4, value: 310 });
    expect(result[2]).toEqual({ label: 'Est', col: 4, row: 2, value: 550 });
  });

  it('skips rows where col, row, or value is non-finite', () => {
    const sparseRows: Row[] = [
      { region: 'Nord', col: 2, row: 0, revenue: 420 },
      { region: 'Sud', col: null, row: 4, revenue: 310 },
      { region: 'Est', col: 4, row: NaN, revenue: 550 },
      { region: 'Ouest', col: 0, row: 2, revenue: null },
    ];
    const result = buildTileMapData(model, sparseRows, config);
    expect(result).toHaveLength(1);
    expect(result[0]!.label).toBe('Nord');
  });

  it('coerces label to string', () => {
    const numericRows: Row[] = [{ region: 99, col: 0, row: 0, revenue: 100 }];
    const result = buildTileMapData(model, numericRows, config);
    expect(result[0]!.label).toBe('99');
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd /home/antoinefa/src/dataviz && npx vitest run packages/dataviz-core/src/tilemap.test.ts 2>&1 | tail -10
```
Expected: error "Cannot find module './tilemap.js'"

- [ ] **Step 3: Write the core builder**

Create `packages/dataviz-core/src/tilemap.ts`:

```typescript
/**
 * Tile map chart data builder.
 *
 * Maps a label field, two numeric grid-position fields (col/row) and a numeric
 * value field from raw rows into TileMapChartTile-compatible objects, as
 * expected by the DS TileMapChart component.
 *
 * A row is dropped silently when col, row, or value is non-finite.
 */

import { type DataModel, type Row, findMeasure, findDimension } from './model.js';

export interface TileMapTile {
  label: string;
  col: number;
  row: number;
  value: number;
}

export interface TileMapConfig {
  /** Field id whose value becomes the tile label (string-coerced). */
  label: string;
  /** Field id whose numeric value becomes the column position (0-based). */
  col: string;
  /** Field id whose numeric value becomes the row position (0-based). */
  row: string;
  /** Field id whose numeric value encodes the tile intensity. */
  value: string;
}

function toFiniteNumber(value: unknown): number | undefined {
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function fieldLabel(model: DataModel, fieldId: string): string {
  return findMeasure(model, fieldId)?.label ?? findDimension(model, fieldId)?.label ?? fieldId;
}

/**
 * Build tile map chart data from raw rows.
 *
 * @param _model  DataModel — reserved for future label/format lookup
 * @param rows    Filtered rows from `store.applyCrossfilter(viewId)`
 * @param config  { label, col, row, value } — field ids
 */
export function buildTileMapData(
  _model: DataModel,
  rows: readonly Row[],
  config: TileMapConfig,
): TileMapTile[] {
  void fieldLabel;
  const data: TileMapTile[] = [];

  for (const row of rows) {
    const col = toFiniteNumber(row[config.col]);
    const rowVal = toFiniteNumber(row[config.row]);
    const value = toFiniteNumber(row[config.value]);

    if (col === undefined || rowVal === undefined || value === undefined) continue;

    const labelRaw = row[config.label];
    const label = labelRaw == null ? '' : String(labelRaw);

    data.push({ label, col, row: rowVal, value });
  }

  return data;
}
```

- [ ] **Step 4: Run test to confirm pass**

```bash
cd /home/antoinefa/src/dataviz && npx vitest run packages/dataviz-core/src/tilemap.test.ts 2>&1 | tail -10
```
Expected: all 3 tests PASS

- [ ] **Step 5: Export from core index**

In `packages/dataviz-core/src/index.ts`, after the Streamgraph block, add:

```typescript
// Tile map chart model
export type { TileMapTile, TileMapConfig } from './tilemap.js';
export { buildTileMapData } from './tilemap.js';
```

- [ ] **Step 6: Commit**

```bash
cd /home/antoinefa/src/dataviz && git add packages/dataviz-core/src/tilemap.ts packages/dataviz-core/src/tilemap.test.ts packages/dataviz-core/src/index.ts
git commit -m "feat(core): add TileMapTile/TileMapConfig/buildTileMapData"
```

---

## Task 6: OHLCChart wrappers (Svelte + React + Vue)

**Files:**
- Create: `packages/dataviz-svelte/src/lib/OHLCChart.svelte`
- Create: `packages/dataviz-react/src/lib/OHLCChart.tsx`
- Create: `packages/dataviz-vue/src/lib/OHLCChart.ts`
- Modify: `packages/dataviz-svelte/src/index.ts`
- Modify: `packages/dataviz-react/src/index.ts`
- Modify: `packages/dataviz-vue/src/index.ts`

OHLCChart mirrors CandlestickChart exactly but forwards `annotations`, `dataLabels`, `hoverKey`, `onHoverKeyChange`, `keyboardNav`, and `onSelectKey` to the DS component.

- [ ] **Step 1: Create Svelte wrapper**

Create `packages/dataviz-svelte/src/lib/OHLCChart.svelte`:

```svelte
<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';
  import type { ChartAnnotation } from '@sentropic/dataviz-core';
  import type { DataLabelsProp } from '@sentropic/design-system-svelte';

  export type OHLCChartProps = {
    store: DashboardStore;
    viewId: string;
    /** Field id whose value becomes each bar's label. */
    label_field: string;
    /** Field id whose numeric value becomes the open price. */
    open: string;
    /** Field id whose numeric value becomes the high price. */
    high: string;
    /** Field id whose numeric value becomes the low price. */
    low: string;
    /** Field id whose numeric value becomes the close price. */
    close: string;
    width?: number;
    height?: number;
    /** Accessible label for the chart (aria-label). */
    label: string;
    annotations?: ChartAnnotation[];
    dataLabels?: DataLabelsProp;
    hoverKey?: string | null;
    onHoverKeyChange?: (key: string | null) => void;
    keyboardNav?: boolean;
    onSelectKey?: (key: string | null) => void;
    class?: string;
  };
</script>

<script lang="ts">
  import { OHLCChart as DsOHLCChart } from '@sentropic/design-system-svelte';
  import type { OHLCChartDatum } from '@sentropic/design-system-svelte';
  import { buildOhlcData } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    label_field,
    open,
    high,
    low,
    close,
    width,
    height,
    label,
    annotations,
    dataLabels,
    hoverKey,
    onHoverKeyChange,
    keyboardNav,
    onSelectKey,
    class: className,
  }: OHLCChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildOhlcData(store.model, store.applyCrossfilter(viewId), {
      label: label_field,
      open,
      high,
      low,
      close,
    });
  });
</script>

<DsOHLCChart
  data={data as OHLCChartDatum[]}
  {label}
  {width}
  {height}
  {annotations}
  {dataLabels}
  {hoverKey}
  {onHoverKeyChange}
  {keyboardNav}
  {onSelectKey}
  class={className}
/>
```

- [ ] **Step 2: Create React wrapper**

Create `packages/dataviz-react/src/lib/OHLCChart.tsx`:

```tsx
import {
  OHLCChart as DsOHLCChart,
  type OHLCChartDatum,
  type ChartAnnotation,
  type DataLabelsProp,
} from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildOhlcData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type OHLCChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose value becomes each bar's label. */
  label_field: string;
  /** Field id whose numeric value becomes the open price. */
  open: string;
  /** Field id whose numeric value becomes the high price. */
  high: string;
  /** Field id whose numeric value becomes the low price. */
  low: string;
  /** Field id whose numeric value becomes the close price. */
  close: string;
  width?: number;
  height?: number;
  /** Accessible label for the chart (aria-label). */
  label: string;
  annotations?: ChartAnnotation[];
  dataLabels?: DataLabelsProp;
  hoverKey?: string | null;
  onHoverKeyChange?: (key: string | null) => void;
  keyboardNav?: boolean;
  onSelectKey?: (key: string | null) => void;
  className?: string;
};

export function OHLCChart({
  store,
  viewId,
  label_field,
  open,
  high,
  low,
  close,
  width,
  height,
  label,
  annotations,
  dataLabels,
  hoverKey,
  onHoverKeyChange,
  keyboardNav,
  onSelectKey,
  className,
}: OHLCChartProps) {
  const state = useDashboard(store);
  void state;

  const data = buildOhlcData(store.model, store.applyCrossfilter(viewId), {
    label: label_field,
    open,
    high,
    low,
    close,
  });

  return (
    <DsOHLCChart
      data={data as OHLCChartDatum[]}
      label={label}
      width={width}
      height={height}
      annotations={annotations}
      dataLabels={dataLabels}
      hoverKey={hoverKey}
      onHoverKeyChange={onHoverKeyChange}
      keyboardNav={keyboardNav}
      onSelectKey={onSelectKey}
      className={className}
    />
  );
}
```

- [ ] **Step 3: Create Vue wrapper**

Create `packages/dataviz-vue/src/lib/OHLCChart.ts`:

```typescript
import { defineComponent, h, type PropType } from 'vue';
import {
  OHLCChart as DsOHLCChart,
  type OHLCChartDatum,
  type ChartAnnotation,
  type DataLabelsProp,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildOhlcData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type OHLCChartProps = {
  store: DashboardStore;
  viewId: string;
  label_field: string;
  open: string;
  high: string;
  low: string;
  close: string;
  width?: number;
  height?: number;
  label: string;
  annotations?: ChartAnnotation[];
  dataLabels?: DataLabelsProp;
  hoverKey?: string | null;
  onHoverKeyChange?: (key: string | null) => void;
  keyboardNav?: boolean;
  onSelectKey?: (key: string | null) => void;
  class?: string;
};

export const OHLCChart = defineComponent({
  name: 'OHLCChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    label_field: { type: String, required: true },
    open: { type: String, required: true },
    high: { type: String, required: true },
    low: { type: String, required: true },
    close: { type: String, required: true },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    label: { type: String, required: true },
    annotations: { type: Array as PropType<ChartAnnotation[]>, default: undefined },
    dataLabels: { type: Object as PropType<DataLabelsProp>, default: undefined },
    hoverKey: { type: String as PropType<string | null>, default: undefined },
    onHoverKeyChange: { type: Function as PropType<(key: string | null) => void>, default: undefined },
    keyboardNav: { type: Boolean, default: undefined },
    onSelectKey: { type: Function as PropType<(key: string | null) => void>, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const data = buildOhlcData(
        props.store.model,
        props.store.applyCrossfilter(props.viewId),
        {
          label: props.label_field,
          open: props.open,
          high: props.high,
          low: props.low,
          close: props.close,
        },
      );
      return h(DsOHLCChart, {
        data: data as OHLCChartDatum[],
        label: props.label,
        width: props.width,
        height: props.height,
        annotations: props.annotations,
        dataLabels: props.dataLabels,
        hoverKey: props.hoverKey,
        onHoverKeyChange: props.onHoverKeyChange,
        keyboardNav: props.keyboardNav,
        onSelectKey: props.onSelectKey,
        class: props.class,
      });
    };
  },
});
```

- [ ] **Step 4: Export from package indices**

In `packages/dataviz-svelte/src/index.ts`, after the `CandlestickChart` export lines, add:
```typescript
export { default as OHLCChart } from './lib/OHLCChart.svelte';
export type { OHLCChartProps } from './lib/OHLCChart.svelte';
```

In `packages/dataviz-react/src/index.ts`, after the `CandlestickChart` export lines, add:
```typescript
export { OHLCChart } from './lib/OHLCChart.js';
export type { OHLCChartProps } from './lib/OHLCChart.js';
```

In `packages/dataviz-vue/src/index.ts`, after the `CandlestickChart` export lines, add:
```typescript
export { OHLCChart } from './lib/OHLCChart.js';
export type { OHLCChartProps } from './lib/OHLCChart.js';
```

- [ ] **Step 5: Commit**

```bash
cd /home/antoinefa/src/dataviz && git add \
  packages/dataviz-svelte/src/lib/OHLCChart.svelte \
  packages/dataviz-react/src/lib/OHLCChart.tsx \
  packages/dataviz-vue/src/lib/OHLCChart.ts \
  packages/dataviz-svelte/src/index.ts \
  packages/dataviz-react/src/index.ts \
  packages/dataviz-vue/src/index.ts
git commit -m "feat(charts): OHLCChart wrapper — svelte/react/vue (annotations/dataLabels/crosshair/a11y)"
```

---

## Task 7: GanttChart wrappers (Svelte + React + Vue)

**Files:**
- Create: `packages/dataviz-svelte/src/lib/GanttChart.svelte`
- Create: `packages/dataviz-react/src/lib/GanttChart.tsx`
- Create: `packages/dataviz-vue/src/lib/GanttChart.ts`
- Modify: `packages/dataviz-svelte/src/index.ts`
- Modify: `packages/dataviz-react/src/index.ts`
- Modify: `packages/dataviz-vue/src/index.ts`

- [ ] **Step 1: Create Svelte wrapper**

Create `packages/dataviz-svelte/src/lib/GanttChart.svelte`:

```svelte
<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type GanttChartProps = {
    store: DashboardStore;
    viewId: string;
    /** Field id whose value becomes the task name. */
    task: string;
    /** Field id whose numeric value becomes the start position. */
    start: string;
    /** Field id whose numeric value becomes the end position. */
    end: string;
    /** Optional field id whose string value becomes the category. */
    category?: string;
    width?: number;
    height?: number;
    /** Optional numeric marker position (e.g. "today" indicator). */
    marker?: number;
    /** Accessible label for the chart (aria-label). */
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { GanttChart as DsGanttChart } from '@sentropic/design-system-svelte';
  import type { GanttChartTask } from '@sentropic/design-system-svelte';
  import { buildGanttData } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    task,
    start,
    end,
    category,
    width,
    height,
    marker,
    label,
    class: className,
  }: GanttChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildGanttData(store.model, store.applyCrossfilter(viewId), {
      task,
      start,
      end,
      category,
    });
  });
</script>

<DsGanttChart
  data={data as GanttChartTask[]}
  {label}
  {width}
  {height}
  {marker}
  class={className}
/>
```

- [ ] **Step 2: Create React wrapper**

Create `packages/dataviz-react/src/lib/GanttChart.tsx`:

```tsx
import {
  GanttChart as DsGanttChart,
  type GanttChartTask,
} from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildGanttData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type GanttChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose value becomes the task name. */
  task: string;
  /** Field id whose numeric value becomes the start position. */
  start: string;
  /** Field id whose numeric value becomes the end position. */
  end: string;
  /** Optional field id whose string value becomes the category. */
  category?: string;
  width?: number;
  height?: number;
  /** Optional numeric marker position. */
  marker?: number;
  /** Accessible label for the chart (aria-label). */
  label: string;
  className?: string;
};

export function GanttChart({
  store,
  viewId,
  task,
  start,
  end,
  category,
  width,
  height,
  marker,
  label,
  className,
}: GanttChartProps) {
  const state = useDashboard(store);
  void state;

  const data = buildGanttData(store.model, store.applyCrossfilter(viewId), {
    task,
    start,
    end,
    category,
  });

  return (
    <DsGanttChart
      data={data as GanttChartTask[]}
      label={label}
      width={width}
      height={height}
      marker={marker}
      className={className}
    />
  );
}
```

- [ ] **Step 3: Create Vue wrapper**

Create `packages/dataviz-vue/src/lib/GanttChart.ts`:

```typescript
import { defineComponent, h, type PropType } from 'vue';
import {
  GanttChart as DsGanttChart,
  type GanttChartTask,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildGanttData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type GanttChartProps = {
  store: DashboardStore;
  viewId: string;
  task: string;
  start: string;
  end: string;
  category?: string;
  width?: number;
  height?: number;
  marker?: number;
  label: string;
  class?: string;
};

export const GanttChart = defineComponent({
  name: 'GanttChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    task: { type: String, required: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
    category: { type: String, default: undefined },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    marker: { type: Number, default: undefined },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const data = buildGanttData(
        props.store.model,
        props.store.applyCrossfilter(props.viewId),
        {
          task: props.task,
          start: props.start,
          end: props.end,
          category: props.category,
        },
      );
      return h(DsGanttChart, {
        data: data as GanttChartTask[],
        label: props.label,
        width: props.width,
        height: props.height,
        marker: props.marker,
        class: props.class,
      });
    };
  },
});
```

- [ ] **Step 4: Export from package indices**

In `packages/dataviz-svelte/src/index.ts`, after the OHLCChart export lines, add:
```typescript
export { default as GanttChart } from './lib/GanttChart.svelte';
export type { GanttChartProps } from './lib/GanttChart.svelte';
```

In `packages/dataviz-react/src/index.ts`, after the OHLCChart export lines, add:
```typescript
export { GanttChart } from './lib/GanttChart.js';
export type { GanttChartProps } from './lib/GanttChart.js';
```

In `packages/dataviz-vue/src/index.ts`, after the OHLCChart export lines, add:
```typescript
export { GanttChart } from './lib/GanttChart.js';
export type { GanttChartProps } from './lib/GanttChart.js';
```

- [ ] **Step 5: Commit**

```bash
cd /home/antoinefa/src/dataviz && git add \
  packages/dataviz-svelte/src/lib/GanttChart.svelte \
  packages/dataviz-react/src/lib/GanttChart.tsx \
  packages/dataviz-vue/src/lib/GanttChart.ts \
  packages/dataviz-svelte/src/index.ts \
  packages/dataviz-react/src/index.ts \
  packages/dataviz-vue/src/index.ts
git commit -m "feat(charts): GanttChart wrapper — svelte/react/vue"
```

---

## Task 8: TimelineChart wrappers (Svelte + React + Vue)

**Files:**
- Create: `packages/dataviz-svelte/src/lib/TimelineChart.svelte`
- Create: `packages/dataviz-react/src/lib/TimelineChart.tsx`
- Create: `packages/dataviz-vue/src/lib/TimelineChart.ts`
- Modify: `packages/dataviz-svelte/src/index.ts`
- Modify: `packages/dataviz-react/src/index.ts`
- Modify: `packages/dataviz-vue/src/index.ts`

- [ ] **Step 1: Create Svelte wrapper**

Create `packages/dataviz-svelte/src/lib/TimelineChart.svelte`:

```svelte
<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type TimelineChartProps = {
    store: DashboardStore;
    viewId: string;
    /** Field id whose string value becomes the event label. */
    label_field: string;
    /** Field id whose numeric value becomes the event position. */
    position: string;
    /** Optional field id whose string value becomes the event description. */
    description?: string;
    /** Optional field id whose string value becomes the event tone (e.g. "category1"). */
    tone?: string;
    width?: number;
    height?: number;
    /** Accessible label for the chart (aria-label). */
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { TimelineChart as DsTimelineChart } from '@sentropic/design-system-svelte';
  import type { TimelineChartEvent } from '@sentropic/design-system-svelte';
  import { buildTimelineData } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    label_field,
    position,
    description,
    tone,
    width,
    height,
    label,
    class: className,
  }: TimelineChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildTimelineData(store.model, store.applyCrossfilter(viewId), {
      label: label_field,
      position,
      description,
      tone,
    });
  });
</script>

<DsTimelineChart
  data={data as TimelineChartEvent[]}
  {label}
  {width}
  {height}
  class={className}
/>
```

- [ ] **Step 2: Create React wrapper**

Create `packages/dataviz-react/src/lib/TimelineChart.tsx`:

```tsx
import {
  TimelineChart as DsTimelineChart,
  type TimelineChartEvent,
} from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildTimelineData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type TimelineChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose string value becomes the event label. */
  label_field: string;
  /** Field id whose numeric value becomes the event position. */
  position: string;
  /** Optional field id whose string value becomes the event description. */
  description?: string;
  /** Optional field id whose string value becomes the event tone. */
  tone?: string;
  width?: number;
  height?: number;
  /** Accessible label for the chart (aria-label). */
  label: string;
  className?: string;
};

export function TimelineChart({
  store,
  viewId,
  label_field,
  position,
  description,
  tone,
  width,
  height,
  label,
  className,
}: TimelineChartProps) {
  const state = useDashboard(store);
  void state;

  const data = buildTimelineData(store.model, store.applyCrossfilter(viewId), {
    label: label_field,
    position,
    description,
    tone,
  });

  return (
    <DsTimelineChart
      data={data as TimelineChartEvent[]}
      label={label}
      width={width}
      height={height}
      className={className}
    />
  );
}
```

- [ ] **Step 3: Create Vue wrapper**

Create `packages/dataviz-vue/src/lib/TimelineChart.ts`:

```typescript
import { defineComponent, h, type PropType } from 'vue';
import {
  TimelineChart as DsTimelineChart,
  type TimelineChartEvent,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildTimelineData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type TimelineChartProps = {
  store: DashboardStore;
  viewId: string;
  label_field: string;
  position: string;
  description?: string;
  tone?: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

export const TimelineChart = defineComponent({
  name: 'TimelineChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    label_field: { type: String, required: true },
    position: { type: String, required: true },
    description: { type: String, default: undefined },
    tone: { type: String, default: undefined },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const data = buildTimelineData(
        props.store.model,
        props.store.applyCrossfilter(props.viewId),
        {
          label: props.label_field,
          position: props.position,
          description: props.description,
          tone: props.tone,
        },
      );
      return h(DsTimelineChart, {
        data: data as TimelineChartEvent[],
        label: props.label,
        width: props.width,
        height: props.height,
        class: props.class,
      });
    };
  },
});
```

- [ ] **Step 4: Export from package indices**

In `packages/dataviz-svelte/src/index.ts`, after the GanttChart export lines, add:
```typescript
export { default as TimelineChart } from './lib/TimelineChart.svelte';
export type { TimelineChartProps } from './lib/TimelineChart.svelte';
```

In `packages/dataviz-react/src/index.ts`, after the GanttChart export lines, add:
```typescript
export { TimelineChart } from './lib/TimelineChart.js';
export type { TimelineChartProps } from './lib/TimelineChart.js';
```

In `packages/dataviz-vue/src/index.ts`, after the GanttChart export lines, add:
```typescript
export { TimelineChart } from './lib/TimelineChart.js';
export type { TimelineChartProps } from './lib/TimelineChart.js';
```

- [ ] **Step 5: Commit**

```bash
cd /home/antoinefa/src/dataviz && git add \
  packages/dataviz-svelte/src/lib/TimelineChart.svelte \
  packages/dataviz-react/src/lib/TimelineChart.tsx \
  packages/dataviz-vue/src/lib/TimelineChart.ts \
  packages/dataviz-svelte/src/index.ts \
  packages/dataviz-react/src/index.ts \
  packages/dataviz-vue/src/index.ts
git commit -m "feat(charts): TimelineChart wrapper — svelte/react/vue"
```

---

## Task 9: StreamgraphChart wrappers (Svelte + React + Vue)

**Files:**
- Create: `packages/dataviz-svelte/src/lib/StreamgraphChart.svelte`
- Create: `packages/dataviz-react/src/lib/StreamgraphChart.tsx`
- Create: `packages/dataviz-vue/src/lib/StreamgraphChart.ts`
- Modify: `packages/dataviz-svelte/src/index.ts`
- Modify: `packages/dataviz-react/src/index.ts`
- Modify: `packages/dataviz-vue/src/index.ts`

- [ ] **Step 1: Create Svelte wrapper**

Create `packages/dataviz-svelte/src/lib/StreamgraphChart.svelte`:

```svelte
<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type StreamgraphChartProps = {
    store: DashboardStore;
    viewId: string;
    /** Field id whose value becomes the category (x-axis bucket, e.g. month). */
    category: string;
    /** Field id whose value becomes the series label within each category. */
    series: string;
    /** Field id whose numeric value becomes the stream height. */
    measure: string;
    /** Optional field id whose value becomes the series tone. */
    tone?: string;
    smooth?: boolean;
    showLegend?: boolean;
    width?: number;
    height?: number;
    /** Accessible label for the chart (aria-label). */
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { StreamgraphChart as DsStreamgraphChart } from '@sentropic/design-system-svelte';
  import type { StreamgraphChartDatum } from '@sentropic/design-system-svelte';
  import { buildStreamgraphData } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    category,
    series,
    measure,
    tone,
    smooth,
    showLegend,
    width,
    height,
    label,
    class: className,
  }: StreamgraphChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildStreamgraphData(store.model, store.applyCrossfilter(viewId), {
      category,
      label: series,
      value: measure,
      tone,
    });
  });
</script>

<DsStreamgraphChart
  data={data as StreamgraphChartDatum[]}
  {label}
  {smooth}
  {showLegend}
  {width}
  {height}
  class={className}
/>
```

- [ ] **Step 2: Create React wrapper**

Create `packages/dataviz-react/src/lib/StreamgraphChart.tsx`:

```tsx
import {
  StreamgraphChart as DsStreamgraphChart,
  type StreamgraphChartDatum,
} from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildStreamgraphData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type StreamgraphChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose value becomes the category (x-axis bucket). */
  category: string;
  /** Field id whose value becomes the series label within each category. */
  series: string;
  /** Field id whose numeric value becomes the stream height. */
  measure: string;
  /** Optional field id whose value becomes the series tone. */
  tone?: string;
  smooth?: boolean;
  showLegend?: boolean;
  width?: number;
  height?: number;
  /** Accessible label for the chart (aria-label). */
  label: string;
  className?: string;
};

export function StreamgraphChart({
  store,
  viewId,
  category,
  series,
  measure,
  tone,
  smooth,
  showLegend,
  width,
  height,
  label,
  className,
}: StreamgraphChartProps) {
  const state = useDashboard(store);
  void state;

  const data = buildStreamgraphData(store.model, store.applyCrossfilter(viewId), {
    category,
    label: series,
    value: measure,
    tone,
  });

  return (
    <DsStreamgraphChart
      data={data as StreamgraphChartDatum[]}
      label={label}
      smooth={smooth}
      showLegend={showLegend}
      width={width}
      height={height}
      className={className}
    />
  );
}
```

- [ ] **Step 3: Create Vue wrapper**

Create `packages/dataviz-vue/src/lib/StreamgraphChart.ts`:

```typescript
import { defineComponent, h, type PropType } from 'vue';
import {
  StreamgraphChart as DsStreamgraphChart,
  type StreamgraphChartDatum,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildStreamgraphData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type StreamgraphChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  series: string;
  measure: string;
  tone?: string;
  smooth?: boolean;
  showLegend?: boolean;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

export const StreamgraphChart = defineComponent({
  name: 'StreamgraphChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    category: { type: String, required: true },
    series: { type: String, required: true },
    measure: { type: String, required: true },
    tone: { type: String, default: undefined },
    smooth: { type: Boolean, default: undefined },
    showLegend: { type: Boolean, default: undefined },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const data = buildStreamgraphData(
        props.store.model,
        props.store.applyCrossfilter(props.viewId),
        {
          category: props.category,
          label: props.series,
          value: props.measure,
          tone: props.tone,
        },
      );
      return h(DsStreamgraphChart, {
        data: data as StreamgraphChartDatum[],
        label: props.label,
        smooth: props.smooth,
        showLegend: props.showLegend,
        width: props.width,
        height: props.height,
        class: props.class,
      });
    };
  },
});
```

- [ ] **Step 4: Export from package indices**

In `packages/dataviz-svelte/src/index.ts`, after the TimelineChart export lines, add:
```typescript
export { default as StreamgraphChart } from './lib/StreamgraphChart.svelte';
export type { StreamgraphChartProps } from './lib/StreamgraphChart.svelte';
```

In `packages/dataviz-react/src/index.ts`, after the TimelineChart export lines, add:
```typescript
export { StreamgraphChart } from './lib/StreamgraphChart.js';
export type { StreamgraphChartProps } from './lib/StreamgraphChart.js';
```

In `packages/dataviz-vue/src/index.ts`, after the TimelineChart export lines, add:
```typescript
export { StreamgraphChart } from './lib/StreamgraphChart.js';
export type { StreamgraphChartProps } from './lib/StreamgraphChart.js';
```

- [ ] **Step 5: Commit**

```bash
cd /home/antoinefa/src/dataviz && git add \
  packages/dataviz-svelte/src/lib/StreamgraphChart.svelte \
  packages/dataviz-react/src/lib/StreamgraphChart.tsx \
  packages/dataviz-vue/src/lib/StreamgraphChart.ts \
  packages/dataviz-svelte/src/index.ts \
  packages/dataviz-react/src/index.ts \
  packages/dataviz-vue/src/index.ts
git commit -m "feat(charts): StreamgraphChart wrapper — svelte/react/vue"
```

---

## Task 10: TileMapChart wrappers (Svelte + React + Vue)

**Files:**
- Create: `packages/dataviz-svelte/src/lib/TileMapChart.svelte`
- Create: `packages/dataviz-react/src/lib/TileMapChart.tsx`
- Create: `packages/dataviz-vue/src/lib/TileMapChart.ts`
- Modify: `packages/dataviz-svelte/src/index.ts`
- Modify: `packages/dataviz-react/src/index.ts`
- Modify: `packages/dataviz-vue/src/index.ts`

- [ ] **Step 1: Create Svelte wrapper**

Create `packages/dataviz-svelte/src/lib/TileMapChart.svelte`:

```svelte
<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type TileMapChartProps = {
    store: DashboardStore;
    viewId: string;
    /** Field id whose value becomes the tile label. */
    label_field: string;
    /** Field id whose numeric value becomes the column position. */
    col: string;
    /** Field id whose numeric value becomes the row position. */
    row: string;
    /** Field id whose numeric value encodes tile intensity. */
    value: string;
    width?: number;
    height?: number;
    /** Accessible label for the chart (aria-label). */
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { TileMapChart as DsTileMapChart } from '@sentropic/design-system-svelte';
  import type { TileMapChartTile } from '@sentropic/design-system-svelte';
  import { buildTileMapData } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    label_field,
    col,
    row,
    value,
    width,
    height,
    label,
    class: className,
  }: TileMapChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildTileMapData(store.model, store.applyCrossfilter(viewId), {
      label: label_field,
      col,
      row,
      value,
    });
  });
</script>

<DsTileMapChart
  data={data as TileMapChartTile[]}
  {label}
  {width}
  {height}
  class={className}
/>
```

- [ ] **Step 2: Create React wrapper**

Create `packages/dataviz-react/src/lib/TileMapChart.tsx`:

```tsx
import {
  TileMapChart as DsTileMapChart,
  type TileMapChartTile,
} from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildTileMapData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type TileMapChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose value becomes the tile label. */
  label_field: string;
  /** Field id whose numeric value becomes the column position. */
  col: string;
  /** Field id whose numeric value becomes the row position. */
  row: string;
  /** Field id whose numeric value encodes tile intensity. */
  value: string;
  width?: number;
  height?: number;
  /** Accessible label for the chart (aria-label). */
  label: string;
  className?: string;
};

export function TileMapChart({
  store,
  viewId,
  label_field,
  col,
  row,
  value,
  width,
  height,
  label,
  className,
}: TileMapChartProps) {
  const state = useDashboard(store);
  void state;

  const data = buildTileMapData(store.model, store.applyCrossfilter(viewId), {
    label: label_field,
    col,
    row,
    value,
  });

  return (
    <DsTileMapChart
      data={data as TileMapChartTile[]}
      label={label}
      width={width}
      height={height}
      className={className}
    />
  );
}
```

- [ ] **Step 3: Create Vue wrapper**

Create `packages/dataviz-vue/src/lib/TileMapChart.ts`:

```typescript
import { defineComponent, h, type PropType } from 'vue';
import {
  TileMapChart as DsTileMapChart,
  type TileMapChartTile,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildTileMapData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type TileMapChartProps = {
  store: DashboardStore;
  viewId: string;
  label_field: string;
  col: string;
  row: string;
  value: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

export const TileMapChart = defineComponent({
  name: 'TileMapChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    label_field: { type: String, required: true },
    col: { type: String, required: true },
    row: { type: String, required: true },
    value: { type: String, required: true },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const data = buildTileMapData(
        props.store.model,
        props.store.applyCrossfilter(props.viewId),
        {
          label: props.label_field,
          col: props.col,
          row: props.row,
          value: props.value,
        },
      );
      return h(DsTileMapChart, {
        data: data as TileMapChartTile[],
        label: props.label,
        width: props.width,
        height: props.height,
        class: props.class,
      });
    };
  },
});
```

- [ ] **Step 4: Export from package indices**

In `packages/dataviz-svelte/src/index.ts`, after the StreamgraphChart export lines, add:
```typescript
export { default as TileMapChart } from './lib/TileMapChart.svelte';
export type { TileMapChartProps } from './lib/TileMapChart.svelte';
```

In `packages/dataviz-react/src/index.ts`, after the StreamgraphChart export lines, add:
```typescript
export { TileMapChart } from './lib/TileMapChart.js';
export type { TileMapChartProps } from './lib/TileMapChart.js';
```

In `packages/dataviz-vue/src/index.ts`, after the StreamgraphChart export lines, add:
```typescript
export { TileMapChart } from './lib/TileMapChart.js';
export type { TileMapChartProps } from './lib/TileMapChart.js';
```

- [ ] **Step 5: Commit**

```bash
cd /home/antoinefa/src/dataviz && git add \
  packages/dataviz-svelte/src/lib/TileMapChart.svelte \
  packages/dataviz-react/src/lib/TileMapChart.tsx \
  packages/dataviz-vue/src/lib/TileMapChart.ts \
  packages/dataviz-svelte/src/index.ts \
  packages/dataviz-react/src/index.ts \
  packages/dataviz-vue/src/index.ts
git commit -m "feat(charts): TileMapChart wrapper — svelte/react/vue"
```

---

## Task 11: Demo data files (Gantt, Timeline, Streamgraph, TileMap)

OHLCChart reuses the existing `ohlc.ts` / `ohlc-store.ts` data files. The four new charts need synthetic datasets + store factories.

**Files:**
- Create: `apps/site/src/lib/data/gantt.ts`
- Create: `apps/site/src/lib/data/timeline.ts`
- Create: `apps/site/src/lib/data/streamgraph.ts`
- Create: `apps/site/src/lib/data/tilemap.ts`

- [ ] **Step 1: Create gantt.ts**

Create `apps/site/src/lib/data/gantt.ts`:

```typescript
/**
 * Synthetic project-plan dataset for the GanttChart demo.
 * 6 tasks with start/end expressed as day indices (0 = project start).
 * Deterministic, no Math.random.
 */
import { createDashboardStore, type DashboardStore } from '@sentropic/dataviz-svelte';
import type { DataModel, Row } from '@sentropic/dataviz-svelte';

export const ganttModel: DataModel = {
  dimensions: [
    { id: 'task', label: 'Tâche', type: 'discrete' },
    { id: 'category', label: 'Phase', type: 'discrete' },
  ],
  measures: [
    { id: 'start', label: 'Début (j)', aggregation: 'min' },
    { id: 'end', label: 'Fin (j)', aggregation: 'max' },
  ],
};

export const ganttData: Row[] = [
  { task: 'Cadrage',        start: 0,  end: 4,  category: 'Planification' },
  { task: 'Architecture',   start: 3,  end: 8,  category: 'Planification' },
  { task: 'Développement',  start: 7,  end: 20, category: 'Réalisation'   },
  { task: 'Intégration',    start: 18, end: 24, category: 'Réalisation'   },
  { task: 'Tests & QA',     start: 22, end: 28, category: 'Validation'    },
  { task: 'Déploiement',    start: 27, end: 30, category: 'Validation'    },
];

export function makeGanttStore(): DashboardStore {
  return createDashboardStore({ model: ganttModel, data: ganttData });
}
```

- [ ] **Step 2: Create timeline.ts**

Create `apps/site/src/lib/data/timeline.ts`:

```typescript
/**
 * Synthetic project-milestone dataset for the TimelineChart demo.
 * 7 events with position expressed as day indices (0 = project start).
 * Deterministic, no Math.random.
 */
import { createDashboardStore, type DashboardStore } from '@sentropic/dataviz-svelte';
import type { DataModel, Row } from '@sentropic/dataviz-svelte';

export const timelineModel: DataModel = {
  dimensions: [
    { id: 'event',       label: 'Évènement',  type: 'discrete' },
    { id: 'description', label: 'Description', type: 'discrete' },
    { id: 'tone',        label: 'Ton',         type: 'discrete' },
  ],
  measures: [
    { id: 'position', label: 'Position (j)', aggregation: 'avg' },
  ],
};

export const timelineData: Row[] = [
  { event: 'Lancement',      position: 0,  description: 'Démarrage officiel du projet',   tone: 'category1' },
  { event: 'Revue archi',    position: 8,  description: 'Validation de l\'architecture',  tone: 'category2' },
  { event: 'Alpha',          position: 14, description: 'Première version fonctionnelle', tone: 'category3' },
  { event: 'Démo client',    position: 20, description: 'Présentation au commanditaire',  tone: 'category4' },
  { event: 'Bêta',           position: 24, description: 'Livraison pour tests externes',  tone: 'category5' },
  { event: 'Go/No-go',       position: 28, description: 'Décision de mise en production', tone: 'category6' },
  { event: 'Mise en prod',   position: 30, description: 'Déploiement en production',       tone: 'category1' },
];

export function makeTimelineStore(): DashboardStore {
  return createDashboardStore({ model: timelineModel, data: timelineData });
}
```

- [ ] **Step 3: Create streamgraph.ts**

Create `apps/site/src/lib/data/streamgraph.ts`:

```typescript
/**
 * Synthetic monthly series dataset for the StreamgraphChart demo.
 * 3 series × 6 months = 18 rows.
 * category=month (x-axis), series=channel (legend), measure=revenue.
 * Deterministic, no Math.random.
 */
import { createDashboardStore, type DashboardStore } from '@sentropic/dataviz-svelte';
import type { DataModel, Row } from '@sentropic/dataviz-svelte';

export const streamgraphModel: DataModel = {
  dimensions: [
    { id: 'month',   label: 'Mois',  type: 'discrete' },
    { id: 'channel', label: 'Canal', type: 'discrete' },
  ],
  measures: [
    { id: 'revenue', label: 'Revenu (k€)', aggregation: 'sum' },
  ],
};

// 3 channels × 6 months
const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jui'];
const CHANNELS: Record<string, number[]> = {
  'Direct':     [120, 135, 128, 145, 160, 172],
  'Partenaire': [ 80,  88,  95, 105, 98,  112],
  'En ligne':   [ 60,  72,  85,  78,  92,  104],
};

export const streamgraphData: Row[] = MONTHS.flatMap((month, i) =>
  Object.entries(CHANNELS).map(([channel, values]) => ({
    month,
    channel,
    revenue: values[i]!,
  })),
);

export function makeStreamgraphStore(): DashboardStore {
  return createDashboardStore({ model: streamgraphModel, data: streamgraphData });
}
```

- [ ] **Step 4: Create tilemap.ts**

Create `apps/site/src/lib/data/tilemap.ts`:

```typescript
/**
 * Synthetic tile-grid dataset for the TileMapChart demo.
 * A 5×5 regional grid where each cell is a region with a revenue value.
 * col/row are 0-based grid positions. Deterministic, no Math.random.
 */
import { createDashboardStore, type DashboardStore } from '@sentropic/dataviz-svelte';
import type { DataModel, Row } from '@sentropic/dataviz-svelte';

export const tilemapModel: DataModel = {
  dimensions: [
    { id: 'region', label: 'Région', type: 'discrete' },
  ],
  measures: [
    { id: 'col',     label: 'Colonne',     aggregation: 'avg' },
    { id: 'row',     label: 'Ligne',       aggregation: 'avg' },
    { id: 'revenue', label: 'Revenu (k€)', aggregation: 'sum' },
  ],
};

// 5×5 grid — sparse, 16 regions out of 25 cells
export const tilemapData: Row[] = [
  // row 0
  { region: 'Ouest-Nord',  col: 1, row: 0, revenue: 312 },
  { region: 'Centre-Nord', col: 2, row: 0, revenue: 445 },
  { region: 'Est-Nord',    col: 3, row: 0, revenue: 280 },
  // row 1
  { region: 'Ouest-1',     col: 0, row: 1, revenue: 195 },
  { region: 'Nord-Ouest',  col: 1, row: 1, revenue: 370 },
  { region: 'Nord-Centre', col: 2, row: 1, revenue: 520 },
  { region: 'Nord-Est',    col: 3, row: 1, revenue: 310 },
  { region: 'Est-1',       col: 4, row: 1, revenue: 220 },
  // row 2
  { region: 'Ouest',       col: 0, row: 2, revenue: 410 },
  { region: 'Centre-Ouest',col: 1, row: 2, revenue: 480 },
  { region: 'Centre',      col: 2, row: 2, revenue: 680 },
  { region: 'Centre-Est',  col: 3, row: 2, revenue: 540 },
  { region: 'Est',         col: 4, row: 2, revenue: 390 },
  // row 3
  { region: 'Sud-Ouest',   col: 1, row: 3, revenue: 290 },
  { region: 'Sud-Centre',  col: 2, row: 3, revenue: 460 },
  { region: 'Sud-Est',     col: 3, row: 3, revenue: 330 },
];

export function makeTilemapStore(): DashboardStore {
  return createDashboardStore({ model: tilemapModel, data: tilemapData });
}
```

- [ ] **Step 5: Commit**

```bash
cd /home/antoinefa/src/dataviz && git add \
  apps/site/src/lib/data/gantt.ts \
  apps/site/src/lib/data/timeline.ts \
  apps/site/src/lib/data/streamgraph.ts \
  apps/site/src/lib/data/tilemap.ts
git commit -m "feat(site): synthetic demo datasets for Gantt/Timeline/Streamgraph/TileMap charts"
```

---

## Task 12: Registry entries (charts.ts) + ChartDemo.svelte

**Files:**
- Modify: `apps/site/src/lib/registry/entries/charts.ts`
- Modify: `apps/site/src/lib/registry/charts/ChartDemo.svelte`

- [ ] **Step 1: Add 5 entries to charts.ts**

In `apps/site/src/lib/registry/entries/charts.ts`, add OHLC to the `// ── Finance ──` group (after the candlestick entry), and add a new `// ── Projet & temps ──` section plus a new `// ── Évolution & flux ──` section and `// ── Cartographie ──` section with the remaining charts.

After the candlestick entry (after line 455 which closes the candlestick entry), add:

```typescript
    chart({
      slug: 'ohlc', name: 'OHLCChart', group: 'Finance', kind: 'ohlc', hasControls: false,
      tagline: 'Barres OHLC (Open/High/Low/Close) pour des cours financiers.',
      useCase:
        "Alternative à la bougie japonaise : chaque barre OHLC affiche l'ouverture (tiret gauche), le plus haut, le plus bas et la clôture (tiret droit). Les mêmes données financières que le CandlestickChart, format barres.\n\nSupporte `annotations`, `dataLabels`, `hoverKey`/`onHoverKeyChange` (synchronisation du crosshair) et `keyboardNav`/`onSelectKey` (navigation clavier a11y).",
      code: storeCode(['OHLCChart'], {
        svelte: `<OHLCChart {store} viewId="ohlc" label_field="session" open="open" high="high" low="low" close="close" label="Cours boursiers OHLC (28 séances)" />`,
        react: `<OHLCChart store={store} viewId="ohlc" label_field="session" open="open" high="high" low="low" close="close" label="Cours boursiers OHLC (28 séances)" />`,
        vue: `<OHLCChart :store="store" viewId="ohlc" label_field="session" open="open" high="high" low="low" close="close" label="Cours boursiers OHLC (28 séances)" />`,
      }),
    }, ChartDemo),

    // ── Projet & temps ──────────────────────────────────────────────────────
    chart({
      slug: 'gantt', name: 'GanttChart', group: 'Projet & temps', kind: 'gantt', hasControls: false,
      tagline: 'Diagramme de Gantt pour planifier des tâches sur une timeline.',
      useCase:
        "Visualiser un planning de projet : chaque tâche est une barre entre son début et sa fin (indices de jours). Les `category` groupent les tâches par phase. Le `marker` positionne un indicateur \"aujourd'hui\".\n\n`task` désigne la dimension libellé, `start`/`end` les mesures de borne temporelle.",
      code: storeCode(['GanttChart'], {
        svelte: `<GanttChart {store} viewId="gantt" task="task" start="start" end="end" category="category" marker={10} label="Planning de projet" />`,
        react: `<GanttChart store={store} viewId="gantt" task="task" start="start" end="end" category="category" marker={10} label="Planning de projet" />`,
        vue: `<GanttChart :store="store" viewId="gantt" task="task" start="start" end="end" category="category" :marker="10" label="Planning de projet" />`,
      }),
    }, ChartDemo),
    chart({
      slug: 'timeline', name: 'TimelineChart', group: 'Projet & temps', kind: 'timeline', hasControls: false,
      tagline: "Frise chronologique d'événements jalons.",
      useCase:
        "Représenter des jalons ponctuels sur un axe de temps — ici les étapes clés d'un projet (lancement, alpha, mise en production). Chaque événement a une `position` numérique, un `label`, une `description` optionnelle et un `tone` catégoriel.\n\n`label_field` désigne la dimension libellé, `position` la mesure de position sur l'axe.",
      code: storeCode(['TimelineChart'], {
        svelte: `<TimelineChart {store} viewId="timeline" label_field="event" position="position" description="description" tone="tone" label="Jalons du projet" />`,
        react: `<TimelineChart store={store} viewId="timeline" label_field="event" position="position" description="description" tone="tone" label="Jalons du projet" />`,
        vue: `<TimelineChart :store="store" viewId="timeline" label_field="event" position="position" description="description" tone="tone" label="Jalons du projet" />`,
      }),
    }, ChartDemo),

    // ── Évolution & flux ────────────────────────────────────────────────────
    chart({
      slug: 'streamgraph', name: 'StreamgraphChart', group: 'Évolution & flux', kind: 'streamgraph', hasControls: false,
      tagline: 'Flux empilés lisses pour l\'évolution de séries.',
      useCase:
        "Montrer l'évolution relative de plusieurs séries sur une dimension ordonnée (ici le revenu par canal sur 6 mois). Les flux sont empilés de façon organique ; `smooth` adoucit les transitions.\n\n`category` désigne la dimension X (mois), `series` la dimension couleur/légende, `measure` la valeur de chaque flux.",
      code: storeCode(['StreamgraphChart'], {
        svelte: `<StreamgraphChart {store} viewId="sg" category="month" series="channel" measure="revenue" smooth showLegend label="Revenu par canal (flux)" />`,
        react: `<StreamgraphChart store={store} viewId="sg" category="month" series="channel" measure="revenue" smooth showLegend label="Revenu par canal (flux)" />`,
        vue: `<StreamgraphChart :store="store" viewId="sg" category="month" series="channel" measure="revenue" :smooth="true" :showLegend="true" label="Revenu par canal (flux)" />`,
      }),
    }, ChartDemo),

    // ── Cartographie ────────────────────────────────────────────────────────
    chart({
      slug: 'tilemap', name: 'TileMapChart', group: 'Cartographie', kind: 'tilemap', hasControls: false,
      tagline: 'Cartogramme en grille de tuiles (tile map).',
      useCase:
        "Visualiser des données régionales sur une grille cartographique stylisée où chaque cellule encode le revenu par couleur. Contrairement à la choroplèthe, les tuiles sont toutes de même taille — elles encodent la valeur par couleur, pas par aire.\n\n`label_field` est la dimension région, `col`/`row` les coordonnées grille (0-based), `value` la mesure.",
      code: storeCode(['TileMapChart'], {
        svelte: `<TileMapChart {store} viewId="tm" label_field="region" col="col" row="row" value="revenue" label="Revenu régional (grille)" />`,
        react: `<TileMapChart store={store} viewId="tm" label_field="region" col="col" row="row" value="revenue" label="Revenu régional (grille)" />`,
        vue: `<TileMapChart :store="store" viewId="tm" label_field="region" col="col" row="row" value="revenue" label="Revenu régional (grille)" />`,
      }),
    }, ChartDemo),
```

- [ ] **Step 2: Update ChartDemo.svelte**

In `apps/site/src/lib/registry/charts/ChartDemo.svelte`:

**2a. Add new imports to the import block** (after `ParallelCoordinatesChart` import, before `Sparkline`):
```typescript
    OHLCChart,
    GanttChart,
    TimelineChart,
    StreamgraphChart,
    TileMapChart,
```

**2b. Add new store imports** (after `import { makeOhlcStore } from '../../data/ohlc-store';`):
```typescript
  import { makeGanttStore } from '../../data/gantt';
  import { makeTimelineStore } from '../../data/timeline';
  import { makeStreamgraphStore } from '../../data/streamgraph';
  import { makeTilemapStore } from '../../data/tilemap';
```

**2c. Add new store instances** (after `const ohlcStore = makeOhlcStore();`):
```typescript
  const ganttStore = makeGanttStore();
  const timelineStore = makeTimelineStore();
  const streamgraphStore = makeStreamgraphStore();
  const tilemapStore = makeTilemapStore();
```

**2d. Add 5 new `{:else if}` branches** (after the `{:else if kind === 'candlestick'}` block):
```svelte
  {:else if kind === 'ohlc'}
    <OHLCChart store={ohlcStore} viewId="ohlc" label_field="session" open="open" high="high" low="low" close="close" label="Cours boursiers OHLC (28 séances)" />
  {:else if kind === 'gantt'}
    <GanttChart store={ganttStore} viewId="gantt" task="task" start="start" end="end" category="category" marker={10} label="Planning de projet" />
  {:else if kind === 'timeline'}
    <TimelineChart store={timelineStore} viewId="timeline" label_field="event" position="position" description="description" tone="tone" label="Jalons du projet" />
  {:else if kind === 'streamgraph'}
    <StreamgraphChart store={streamgraphStore} viewId="sg" category="month" series="channel" measure="revenue" smooth showLegend label="Revenu par canal (flux)" />
  {:else if kind === 'tilemap'}
    <TileMapChart store={tilemapStore} viewId="tm" label_field="region" col="col" row="row" value="revenue" label="Revenu régional (grille)" />
```

- [ ] **Step 3: Commit**

```bash
cd /home/antoinefa/src/dataviz && git add \
  apps/site/src/lib/registry/entries/charts.ts \
  apps/site/src/lib/registry/charts/ChartDemo.svelte
git commit -m "feat(site): registry entries + ChartDemo branches for OHLC/Gantt/Timeline/Streamgraph/TileMap"
```

---

## Task 13: Gate (verify) + fix loop

**Files:** No new files — only run the gate command.

- [ ] **Step 1: Run verify gate**

```bash
cd /home/antoinefa/src/dataviz && npm run verify > /tmp/verify_b4.log 2>&1; echo "VERIFY_EXIT=$?" >> /tmp/verify_b4.log
```

- [ ] **Step 2: Read VERIFY_EXIT**

```bash
grep 'VERIFY_EXIT=' /tmp/verify_b4.log
```
If VERIFY_EXIT=0, proceed to Task 14. If non-zero, continue.

- [ ] **Step 3 (if non-zero): Read error log and fix**

```bash
tail -80 /tmp/verify_b4.log
```

Diagnosis checklist for common failures:
- **Missing DS export**: check that the DS package at the nested path actually exports that name. The DS Svelte package is at `packages/dataviz-svelte/node_modules/@sentropic/design-system-svelte/dist/`. If an import like `import { OHLCChartDatum } from '@sentropic/design-system-svelte'` fails, check `packages/dataviz-svelte/node_modules/@sentropic/design-system-svelte/dist/index.d.ts` or `OHLCChart.d.ts` for the actual exported type name.
- **Missing DS type imports in Vue**: `ChartAnnotation` and `DataLabelsProp` may not exist in `@sentropic/design-system-vue` — if not, remove those prop type imports and use `unknown` / `any` for those props in the Vue wrapper.
- **Type cast mismatch**: verify the core `OhlcDatum[]` cast to `OHLCChartDatum[]` is structurally valid — both have `{label, open, high, low, close}`.
- **Registry import path**: if the site build fails on the new store imports, check that the import path matches the file names exactly (case-sensitive).

After fixing, re-run verify:
```bash
cd /home/antoinefa/src/dataviz && npm run verify > /tmp/verify_b4.log 2>&1; echo "VERIFY_EXIT=$?" >> /tmp/verify_b4.log
grep 'VERIFY_EXIT=' /tmp/verify_b4.log
```
Repeat until VERIFY_EXIT=0.

---

## Task 14: Final report

- [ ] **Step 1: Confirm test summary**

```bash
tail -30 /tmp/verify_b4.log
```

- [ ] **Step 2: List all new commits**

```bash
cd /home/antoinefa/src/dataviz && git log --oneline -10
```

- [ ] **Step 3: Push if green**

```bash
cd /home/antoinefa/src/dataviz && git push origin main
```

- [ ] **Step 4: Report (fill in from actual outputs)**

Return a report containing:
- VERIFY_EXIT value
- Test summary (pass/fail counts) 
- Commit SHAs (from `git log --oneline -10`)
- Whether pushed
- For each chart: wrapper component name + props, core builder signature, registry slug/group
- Any DS prop/datum field not mapped
- Confirm: no version/dep edits, no tags, no `.track/`/`docs/` staged, no hand-rolled SVG, contracts read from nested 0.36.33 path

---

## Self-Review

**Spec coverage check:**

| Requirement | Covered by |
|---|---|
| OHLCChart core builder + types | Task 1 |
| GanttChart core builder + types | Task 2 |
| TimelineChart core builder + types | Task 3 |
| StreamgraphChart core builder + types | Task 4 |
| TileMapChart core builder + types | Task 5 |
| Svelte/React/Vue wrappers for OHLC | Task 6 |
| Svelte/React/Vue wrappers for Gantt | Task 7 |
| Svelte/React/Vue wrappers for Timeline | Task 8 |
| Svelte/React/Vue wrappers for Streamgraph | Task 9 |
| Svelte/React/Vue wrappers for TileMap | Task 10 |
| Synthetic datasets (ohlc reused, 4 new) | Task 11 |
| Registry entries + ChartDemo branches | Task 12 |
| verify gate green | Task 13 |
| All core types exported from index.ts | Tasks 1-5 step 5 |
| All wrappers exported from package indices | Tasks 6-10 step 4 |
| Unit tests for each builder | Tasks 1-5 |
| TDD (test-first) | Tasks 1-5 step 1 before step 3 |
| No version bumps, no tags | Enforced by commit steps |
| No `.track/`/`docs/` staged | Not in any git add command |

**Placeholder check:** None found — all steps have complete code blocks.

**Type consistency check:**
- `OhlcDatum` fields (`label/open/high/low/close`) match `OHLCChartDatum` structurally → cast via `as OHLCChartDatum[]` is safe.
- `GanttDatum` fields (`task/start/end/category?`) match `GanttChartTask` structurally → cast safe.
- `TimelineDatum` fields (`position/label/description?/tone?`) match `TimelineChartEvent` structurally → cast safe.
- `StreamgraphDatum` / `StreamgraphSeriesValue` fields match `StreamgraphChartDatum` / `StreamgraphChartSeriesValue` structurally → cast safe.
- `TileMapTile` fields (`label/col/row/value`) match `TileMapChartTile` structurally → cast safe.
- `buildStreamgraphData` called in wrappers with `{ category, label: series, value: measure, tone }` — consistent with `StreamgraphConfig` definition in Task 4.
- `buildGanttData` called with optional `category` prop — consistent with `GanttConfig.category?: string`.
