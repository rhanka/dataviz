import { describe, it, expect } from 'vitest';
import {
  type DataModel,
  type Row,
  buildChoroplethModel,
  buildGeoClusterModel,
  buildGeoDensityModel,
  buildGeoFlowModel,
  buildGeoHexbinModel,
  buildGeoJsonLayerModel,
  buildGeoPointModel,
} from './index.js';

const model: DataModel = {
  dimensions: [
    { id: 'id', label: 'ID', type: 'discrete' },
    { id: 'city', label: 'City', type: 'discrete' },
    { id: 'region', label: 'Region', type: 'discrete' },
    { id: 'lat', label: 'Latitude', type: 'continuous' },
    { id: 'lon', label: 'Longitude', type: 'continuous' },
    { id: 'targetLat', label: 'Target latitude', type: 'continuous' },
    { id: 'targetLon', label: 'Target longitude', type: 'continuous' },
    { id: 'shape', label: 'Shape', type: 'discrete' },
  ],
  measures: [
    { id: 'revenue', label: 'Revenue', aggregation: 'sum' },
    { id: 'orders', label: 'Orders', aggregation: 'count' },
  ],
};

const rows: Row[] = [
  {
    id: 'paris',
    city: 'Paris',
    region: 'FR',
    lat: 48.8566,
    lon: 2.3522,
    targetLat: 45.764,
    targetLon: 4.8357,
    revenue: 100,
    orders: 1,
  },
  {
    id: 'lyon',
    city: 'Lyon',
    region: 'FR',
    lat: 45.764,
    lon: 4.8357,
    targetLat: 48.8566,
    targetLon: 2.3522,
    revenue: 50,
    orders: 1,
  },
  {
    id: 'nyc',
    city: 'New York',
    region: 'US',
    lat: 40.7128,
    lon: -74.006,
    targetLat: 48.8566,
    targetLon: 2.3522,
    revenue: 200,
    orders: 1,
  },
  { id: 'bad', city: 'Bad', region: 'XX', lat: 'north', lon: 2, revenue: 999, orders: 1 },
];

describe('geo model builders', () => {
  it('builds point data and skips invalid coordinates', () => {
    expect(
      buildGeoPointModel(model, rows, {
        latitude: 'lat',
        longitude: 'lon',
        id: 'id',
        label: 'city',
        value: 'revenue',
      }),
    ).toEqual({
      points: [
        { id: 'paris', label: 'Paris', latitude: 48.8566, longitude: 2.3522, value: 100 },
        { id: 'lyon', label: 'Lyon', latitude: 45.764, longitude: 4.8357, value: 50 },
        { id: 'nyc', label: 'New York', latitude: 40.7128, longitude: -74.006, value: 200 },
      ],
    });
  });

  it('aggregates choropleth regions with the configured measure', () => {
    expect(buildChoroplethModel(model, rows, { region: 'region', measure: 'revenue' })).toEqual({
      regionId: 'region',
      measureId: 'revenue',
      regions: [
        { key: 'FR', label: 'FR', value: 150 },
        { key: 'US', label: 'US', value: 200 },
        { key: 'XX', label: 'XX', value: 999 },
      ],
    });
  });

  it('builds geo flow arcs with optional value aggregation per duplicate route', () => {
    const links = buildGeoFlowModel(model, [...rows, rows[0]!], {
      sourceLatitude: 'lat',
      sourceLongitude: 'lon',
      targetLatitude: 'targetLat',
      targetLongitude: 'targetLon',
      value: 'revenue',
    }).links;

    expect(links).toEqual([
      {
        id: '48.8566,2.3522\u001f45.764,4.8357',
        source: { latitude: 48.8566, longitude: 2.3522 },
        target: { latitude: 45.764, longitude: 4.8357 },
        count: 2,
        value: 200,
      },
      {
        id: '45.764,4.8357\u001f48.8566,2.3522',
        source: { latitude: 45.764, longitude: 4.8357 },
        target: { latitude: 48.8566, longitude: 2.3522 },
        count: 1,
        value: 50,
      },
      {
        id: '40.7128,-74.006\u001f48.8566,2.3522',
        source: { latitude: 40.7128, longitude: -74.006 },
        target: { latitude: 48.8566, longitude: 2.3522 },
        count: 1,
        value: 200,
      },
    ]);
  });

  it('builds deterministic hex bins with count and summed values', () => {
    expect(
      buildGeoHexbinModel(model, rows, {
        latitude: 'lat',
        longitude: 'lon',
        value: 'revenue',
        cellSize: 10,
      }),
    ).toEqual({
      cellSize: 10,
      bins: [
        { id: '0:5', q: 0, r: 5, center: { latitude: 43.301270189221924, longitude: 0 }, count: 2, value: 150 },
        { id: '-7:4', q: -7, r: 4, center: { latitude: 34.64101615137754, longitude: -70 }, count: 1, value: 200 },
      ],
    });
  });

  it('clusters nearby points by radius in first-seen order', () => {
    expect(
      buildGeoClusterModel(model, rows, {
        latitude: 'lat',
        longitude: 'lon',
        id: 'id',
        value: 'revenue',
        radius: 4,
      }),
    ).toEqual({
      radius: 4,
      clusters: [
        {
          id: 'cluster:0',
          latitude: 47.3103,
          longitude: 3.59395,
          count: 2,
          value: 150,
          pointIds: ['paris', 'lyon'],
        },
        {
          id: 'cluster:1',
          latitude: 40.7128,
          longitude: -74.006,
          count: 1,
          value: 200,
          pointIds: ['nyc'],
        },
      ],
    });
  });

  it('builds deterministic geo density cells with bounds and density values', () => {
    expect(
      buildGeoDensityModel(model, rows, {
        latitude: 'lat',
        longitude: 'lon',
        value: 'revenue',
        cellSize: 10,
      }),
    ).toEqual({
      cellSize: 10,
      cells: [
        {
          id: '18:13',
          x: 18,
          y: 13,
          bounds: { south: 40, west: 0, north: 50, east: 10 },
          center: { latitude: 45, longitude: 5 },
          count: 2,
          value: 150,
          density: 1.5,
        },
        {
          id: '10:13',
          x: 10,
          y: 13,
          bounds: { south: 40, west: -80, north: 50, east: -70 },
          center: { latitude: 45, longitude: -75 },
          count: 1,
          value: 200,
          density: 2,
        },
      ],
    });
  });

  it('builds GeoJSON layer features and skips invalid geometries', () => {
    const geometry = {
      type: 'Polygon',
      coordinates: [
        [
          [2, 48],
          [3, 48],
          [3, 49],
          [2, 48],
        ],
      ],
    } as const;

    expect(
      buildGeoJsonLayerModel(
        model,
        [
          { id: 'fr-shape', city: 'France', shape: geometry, revenue: 150 },
          { id: 'bad-shape', city: 'Bad shape', shape: { type: 'Feature' }, revenue: 999 },
        ],
        { geometry: 'shape', id: 'id', label: 'city', value: 'revenue' },
      ),
    ).toEqual({
      geometryId: 'shape',
      features: [
        {
          id: 'fr-shape',
          label: 'France',
          value: 150,
          geometry,
          properties: { id: 'fr-shape', label: 'France', value: 150 },
        },
      ],
    });
  });

  it('validates configured fields and numeric options', () => {
    expect(() => buildGeoPointModel(model, rows, { latitude: 'ghost', longitude: 'lon' })).toThrow(
      /Unknown geo latitude field: ghost/,
    );
    expect(() =>
      buildChoroplethModel(model, rows, { region: 'region', measure: 'ghost' }),
    ).toThrow(/Unknown choropleth measure: ghost/);
    expect(() =>
      buildGeoHexbinModel(model, rows, { latitude: 'lat', longitude: 'lon', cellSize: 0 }),
    ).toThrow(/Geo hexbin cellSize must be a positive finite number/);
    expect(() =>
      buildGeoClusterModel(model, rows, { latitude: 'lat', longitude: 'lon', radius: -1 }),
    ).toThrow(/Geo cluster radius must be a positive finite number/);
    expect(() =>
      buildGeoDensityModel(model, rows, { latitude: 'lat', longitude: 'lon', cellSize: 0 }),
    ).toThrow(/Geo density cellSize must be a positive finite number/);
    expect(() =>
      buildGeoJsonLayerModel(model, rows, { geometry: 'ghost' }),
    ).toThrow(/Unknown GeoJSON geometry field: ghost/);
  });
});
