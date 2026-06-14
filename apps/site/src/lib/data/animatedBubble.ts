/**
 * Gapminder-style dataset for the AnimatedBubbleChart demo.
 *
 * 4 countries × 6 years = 24 rows.
 * Columns: country (series), year (time), gdpPerCapita (x), lifeExpectancy (y),
 * population (size → bubble radius).
 *
 * Values are simplified but directionally realistic. No Math.random.
 */
import { createDashboardStore, type DashboardStore } from '@sentropic/dataviz-svelte';
import type { DataModel, Row } from '@sentropic/dataviz-svelte';

export const animatedBubbleModel: DataModel = {
  dimensions: [
    { id: 'country',         label: 'Pays',              type: 'discrete' },
    { id: 'year',            label: 'Année',             type: 'discrete' },
  ],
  measures: [
    { id: 'gdpPerCapita',    label: 'PIB/hab (USD)',      aggregation: 'sum' },
    { id: 'lifeExpectancy',  label: 'Espérance de vie',   aggregation: 'sum' },
    { id: 'population',      label: 'Population',         aggregation: 'sum' },
  ],
};

export const animatedBubbleData: Row[] = [
  // France
  { country: 'France',    year: '1990', gdpPerCapita: 20070, lifeExpectancy: 77.0, population: 56_700_000 },
  { country: 'France',    year: '1995', gdpPerCapita: 26220, lifeExpectancy: 78.1, population: 57_800_000 },
  { country: 'France',    year: '2000', gdpPerCapita: 33760, lifeExpectancy: 79.0, population: 59_300_000 },
  { country: 'France',    year: '2005', gdpPerCapita: 35440, lifeExpectancy: 80.3, population: 61_000_000 },
  { country: 'France',    year: '2010', gdpPerCapita: 40880, lifeExpectancy: 81.5, population: 62_800_000 },
  { country: 'France',    year: '2020', gdpPerCapita: 39890, lifeExpectancy: 82.3, population: 67_400_000 },

  // Allemagne
  { country: 'Allemagne', year: '1990', gdpPerCapita: 22200, lifeExpectancy: 75.2, population: 79_400_000 },
  { country: 'Allemagne', year: '1995', gdpPerCapita: 30050, lifeExpectancy: 76.5, population: 81_700_000 },
  { country: 'Allemagne', year: '2000', gdpPerCapita: 37100, lifeExpectancy: 77.9, population: 82_200_000 },
  { country: 'Allemagne', year: '2005', gdpPerCapita: 34440, lifeExpectancy: 79.1, population: 82_500_000 },
  { country: 'Allemagne', year: '2010', gdpPerCapita: 41700, lifeExpectancy: 80.3, population: 81_800_000 },
  { country: 'Allemagne', year: '2020', gdpPerCapita: 45730, lifeExpectancy: 81.1, population: 83_200_000 },

  // Inde
  { country: 'Inde',      year: '1990', gdpPerCapita:   370, lifeExpectancy: 58.5, population: 849_000_000 },
  { country: 'Inde',      year: '1995', gdpPerCapita:   470, lifeExpectancy: 60.4, population: 916_000_000 },
  { country: 'Inde',      year: '2000', gdpPerCapita:   580, lifeExpectancy: 62.5, population: 1_000_000_000 },
  { country: 'Inde',      year: '2005', gdpPerCapita:   880, lifeExpectancy: 64.4, population: 1_094_000_000 },
  { country: 'Inde',      year: '2010', gdpPerCapita:  1530, lifeExpectancy: 66.8, population: 1_186_000_000 },
  { country: 'Inde',      year: '2020', gdpPerCapita:  1920, lifeExpectancy: 69.7, population: 1_380_000_000 },

  // Brésil
  { country: 'Brésil',    year: '1990', gdpPerCapita:  3100, lifeExpectancy: 65.8, population: 149_000_000 },
  { country: 'Brésil',    year: '1995', gdpPerCapita:  4750, lifeExpectancy: 67.4, population: 160_000_000 },
  { country: 'Brésil',    year: '2000', gdpPerCapita:  7520, lifeExpectancy: 69.8, population: 174_000_000 },
  { country: 'Brésil',    year: '2005', gdpPerCapita:  8660, lifeExpectancy: 71.4, population: 186_000_000 },
  { country: 'Brésil',    year: '2010', gdpPerCapita: 11290, lifeExpectancy: 73.4, population: 195_000_000 },
  { country: 'Brésil',    year: '2020', gdpPerCapita:  7510, lifeExpectancy: 75.9, population: 213_000_000 },
];

export function makeAnimatedBubbleStore(): DashboardStore {
  return createDashboardStore({ model: animatedBubbleModel, data: animatedBubbleData });
}
