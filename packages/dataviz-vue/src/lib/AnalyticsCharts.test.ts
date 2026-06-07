import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { AnalyticsClusterPlot } from './AnalyticsClusterPlot.js';
import { ErrorBarsChart } from './ErrorBarsChart.js';
import { ForecastLineChart } from './ForecastLineChart.js';
import { PercentileBandChart } from './PercentileBandChart.js';
import { ReferenceLineChart } from './ReferenceLineChart.js';
import { TrendLineChart } from './TrendLineChart.js';

const model: DataModel = {
  dimensions: [
    { id: 'category', label: 'Category', type: 'discrete' },
    { id: 'x', label: 'X', type: 'continuous' },
  ],
  measures: [
    { id: 'y', label: 'Y', aggregation: 'sum' },
    { id: 'value', label: 'Value', aggregation: 'avg' },
    { id: 'revenue', label: 'Revenue', aggregation: 'sum' },
  ],
};

const data: Row[] = [
  { category: 'A', x: 1, y: 10, value: 8, revenue: 100 },
  { category: 'A', x: 2, y: 20, value: 12, revenue: 150 },
  { category: 'B', x: 3, y: 25, value: 24, revenue: 200 },
  { category: 'B', x: 4, y: 35, value: 26, revenue: 250 },
];

const newStore = () => createDashboardStore({ model, data });

describe('analytics charts (vue)', () => {
  it('renders analytic models as accessible SVG fallbacks', () => {
    const store = newStore();
    const reference = mount(ReferenceLineChart, {
      props: { store, viewId: 'ref', value: 30, referenceLabel: 'Goal', label: 'Goal line' },
    });
    const band = mount(PercentileBandChart, {
      props: { store, viewId: 'band', value: 'value', lower: 0.25, upper: 0.75, label: 'Band' },
    });
    const trend = mount(TrendLineChart, { props: { store, viewId: 'trend', x: 'x', y: 'y', label: 'Trend' } });
    const forecast = mount(ForecastLineChart, {
      props: { store, viewId: 'forecast', x: 'x', y: 'y', periods: 2, label: 'Forecast' },
    });
    const errors = mount(ErrorBarsChart, {
      props: { store, viewId: 'errors', category: 'category', value: 'value', label: 'Errors' },
    });
    const clusters = mount(AnalyticsClusterPlot, {
      props: { store, viewId: 'clusters', fields: ['x', 'y'], k: 2, label: 'Clusters' },
    });

    expect(reference.find('[role="img"]').attributes('aria-label')).toBe('Goal line');
    expect(band.find('[role="img"]').attributes('aria-label')).toBe('Band');
    expect(trend.find('[role="img"]').attributes('aria-label')).toBe('Trend');
    expect(forecast.find('[role="img"]').attributes('aria-label')).toBe('Forecast');
    expect(errors.find('[role="img"]').attributes('aria-label')).toBe('Errors');
    expect(clusters.find('[role="img"]').attributes('aria-label')).toBe('Clusters');
    expect(reference.findAll('.st-referenceLineChart__line')).toHaveLength(1);
    expect(band.findAll('.st-percentileBandChart__band')).toHaveLength(1);
    expect(trend.findAll('.st-trendLineChart__line')).toHaveLength(1);
    expect(forecast.findAll('.st-forecastLineChart__point')).toHaveLength(2);
    expect(errors.findAll('.st-errorBarsChart__bar')).toHaveLength(2);
    expect(clusters.findAll('.st-analyticsClusterPlot__centroid')).toHaveLength(2);
    expect(reference.text()).toContain('Goal: 30');
    expect(errors.text()).toContain('A: mean');
  });
});
