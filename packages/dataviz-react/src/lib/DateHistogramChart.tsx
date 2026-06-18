import { BarChart, type BarChartDatum, type BarChartTone } from '@sentropic/design-system-react';
import {
  buildDateHistogramModel,
  rangeSelectionKey,
  type DashboardStore,
  type DateHistogramBin,
  type DateHistogramConfig,
  type DateHistogramModel,
} from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type DateHistogramChartTone = BarChartTone;
export type DateHistogramLabelFormatter = (bin: DateHistogramBin, model: DateHistogramModel) => string;

export type DateHistogramChartProps = {
  store: DashboardStore;
  viewId?: string;
  date: DateHistogramConfig['date'];
  interval?: DateHistogramConfig['interval'];
  bins?: DateHistogramConfig['bins'];
  domain?: DateHistogramConfig['domain'];
  label: string;
  tone?: DateHistogramChartTone;
  selectable?: boolean;
  width?: number;
  height?: number;
  hoverKey?: string | null;
  onHoverKeyChange?: (key: string | null) => void;
  onSelectKey?: (key: string | null) => void;
  formatLabel?: DateHistogramLabelFormatter;
  className?: string;
};

const DATE_LABEL = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

function defaultFormatLabel(bin: DateHistogramBin): string {
  return DATE_LABEL.format(new Date(bin.start));
}

function emptyModel(dateId: string): DateHistogramModel {
  return { dateId, domain: [Number.NaN, Number.NaN], bins: [] };
}

function filterFor(bin: DateHistogramBin) {
  const max = bin.end > bin.start ? bin.end - 1 : bin.end;
  return { min: bin.start, max };
}

function selectionKeyFor(bin: DateHistogramBin): string {
  const range = filterFor(bin);
  return rangeSelectionKey(range.min, range.max);
}

export function DateHistogramChart({
  store,
  viewId,
  date,
  interval,
  bins,
  domain,
  label,
  tone,
  selectable = true,
  width,
  height,
  hoverKey,
  onHoverKeyChange,
  onSelectKey,
  formatLabel = defaultFormatLabel,
  className,
}: DateHistogramChartProps) {
  const state = useDashboard(store);
  const model = (() => {
    try {
      return buildDateHistogramModel(store.model, store.applyCrossfilter(viewId), { date, interval, bins, domain });
    } catch {
      return emptyModel(date);
    }
  })();
  const labels = model.bins.map((bin) => formatLabel(bin, model));
  const data: BarChartDatum[] = model.bins.map((bin, index) => {
    const datum = { label: labels[index] ?? String(index + 1), value: bin.count };
    return tone ? { ...datum, tone } : datum;
  });

  const activeKeys = viewId ? (state.selections[viewId] ?? []) : [];
  const selectedKeys = model.bins.flatMap((bin, index) =>
    activeKeys.includes(selectionKeyFor(bin)) ? [labels[index] ?? String(index + 1)] : [],
  );

  const handleSelect = selectable && viewId
    ? (key: string) => {
        const index = labels.indexOf(key);
        const bin = model.bins[index];
        if (!bin) return;
        store.toggleSelection(viewId, selectionKeyFor(bin));
      }
    : undefined;

  return (
    <BarChart
      data={data}
      label={label}
      width={width}
      height={height}
      selectedKeys={selectable && viewId ? selectedKeys : []}
      onSelect={handleSelect}
      hoverKey={hoverKey}
      onHoverKeyChange={onHoverKeyChange}
      onSelectKey={onSelectKey}
      className={['st-dateHistogramChart', className].filter(Boolean).join(' ') || undefined}
    />
  );
}
