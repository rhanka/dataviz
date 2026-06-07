import type { GeoCoordinate, GeoJsonGeometry } from '@sentropic/dataviz-core';

export const GEO_TONES = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ca8a04', '#0891b2', '#db2777', '#4f46e5'];

export function projectCoordinate(
  coordinate: GeoCoordinate,
  width: number,
  height: number,
  padding = 24,
): { x: number; y: number } {
  const x = padding + ((coordinate.longitude + 180) / 360) * (width - padding * 2);
  const y = padding + ((90 - coordinate.latitude) / 180) * (height - padding * 2);
  return { x, y };
}

export function scaleNumber(value: number, min: number, max: number, start: number, end: number): number {
  return max === min ? (start + end) / 2 : start + ((value - min) / (max - min)) * (end - start);
}

export function hexagonPoints(cx: number, cy: number, radius: number): string {
  return Array.from({ length: 6 }, (_, index) => {
    const angle = (Math.PI / 3) * index - Math.PI / 6;
    return `${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`;
  }).join(' ');
}

function coordinatePair(value: unknown): GeoCoordinate | undefined {
  if (!Array.isArray(value) || value.length < 2) return undefined;
  const longitude = Number(value[0]);
  const latitude = Number(value[1]);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return undefined;
  return { latitude, longitude };
}

function linePath(coordinates: unknown[], width: number, height: number): string {
  return coordinates
    .map((item, index) => {
      const coordinate = coordinatePair(item);
      if (!coordinate) return '';
      const point = projectCoordinate(coordinate, width, height);
      return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
    })
    .filter(Boolean)
    .join(' ');
}

function polygonPath(coordinates: unknown[], width: number, height: number): string {
  const firstRing = coordinates[0];
  const path = Array.isArray(firstRing) ? linePath(firstRing, width, height) : '';
  return path === '' ? '' : `${path} Z`;
}

export function geometryPath(geometry: GeoJsonGeometry, width: number, height: number): string {
  switch (geometry.type) {
    case 'Point': {
      const coordinate = coordinatePair(geometry.coordinates);
      if (!coordinate) return '';
      const point = projectCoordinate(coordinate, width, height);
      return `M ${point.x - 5} ${point.y} a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0`;
    }
    case 'MultiPoint':
      return geometry.coordinates
        .map((coordinate) => geometryPath({ type: 'Point', coordinates: coordinate as unknown[] }, width, height))
        .join(' ');
    case 'LineString':
      return linePath(geometry.coordinates, width, height);
    case 'MultiLineString':
      return geometry.coordinates
        .map((line) => (Array.isArray(line) ? linePath(line, width, height) : ''))
        .filter(Boolean)
        .join(' ');
    case 'Polygon':
      return polygonPath(geometry.coordinates, width, height);
    case 'MultiPolygon': {
      const firstPolygon = geometry.coordinates[0];
      return Array.isArray(firstPolygon) ? polygonPath(firstPolygon, width, height) : '';
    }
  }
}
