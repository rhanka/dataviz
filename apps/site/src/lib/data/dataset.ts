/**
 * Realistic, fully-deterministic demo dataset for the dataviz site.
 *
 * Models a B2B hardware reseller: orders by region / country / city / category /
 * product / channel over a 12-month window, with revenue, units, margin, unit
 * price and (lat,lng) coordinates. ~700 rows — enough that filters, Top-N,
 * drill-downs, pivots and maps all have something real to bite on.
 *
 * No Math.random: a small LCG seeded from stable string hashes makes every
 * build (and every framework) produce byte-identical data.
 */
import type { DataModel, Row } from '@sentropic/dataviz-svelte';

// ── Deterministic PRNG ──────────────────────────────────────────────────────
function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function lcg(seed: number): () => number {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 48271) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

// ── Reference dimensions ────────────────────────────────────────────────────
interface CityDef {
  city: string;
  country: string;
  region: string;
  lat: number;
  lng: number;
  weight: number;
}

const CITIES: CityDef[] = [
  { city: 'Montréal', country: 'Canada', region: 'Amériques', lat: 45.5, lng: -73.57, weight: 1.4 },
  { city: 'Toronto', country: 'Canada', region: 'Amériques', lat: 43.65, lng: -79.38, weight: 1.6 },
  { city: 'Vancouver', country: 'Canada', region: 'Amériques', lat: 49.28, lng: -123.12, weight: 1.1 },
  { city: 'New York', country: 'États-Unis', region: 'Amériques', lat: 40.71, lng: -74.0, weight: 2.2 },
  { city: 'Austin', country: 'États-Unis', region: 'Amériques', lat: 30.27, lng: -97.74, weight: 1.3 },
  { city: 'San Francisco', country: 'États-Unis', region: 'Amériques', lat: 37.77, lng: -122.42, weight: 1.8 },
  { city: 'Paris', country: 'France', region: 'Europe', lat: 48.86, lng: 2.35, weight: 1.9 },
  { city: 'Lyon', country: 'France', region: 'Europe', lat: 45.76, lng: 4.84, weight: 1.0 },
  { city: 'Berlin', country: 'Allemagne', region: 'Europe', lat: 52.52, lng: 13.4, weight: 1.5 },
  { city: 'Munich', country: 'Allemagne', region: 'Europe', lat: 48.14, lng: 11.58, weight: 1.2 },
  { city: 'Londres', country: 'Royaume-Uni', region: 'Europe', lat: 51.51, lng: -0.13, weight: 2.0 },
  { city: 'Madrid', country: 'Espagne', region: 'Europe', lat: 40.42, lng: -3.7, weight: 1.1 },
  { city: 'Tokyo', country: 'Japon', region: 'Asie-Pacifique', lat: 35.68, lng: 139.69, weight: 1.7 },
  { city: 'Singapour', country: 'Singapour', region: 'Asie-Pacifique', lat: 1.35, lng: 103.82, weight: 1.0 },
  { city: 'Sydney', country: 'Australie', region: 'Asie-Pacifique', lat: -33.87, lng: 151.21, weight: 1.2 },
];

interface ProductDef {
  product: string;
  category: string;
  basePrice: number;
  baseMargin: number;
}

const PRODUCTS: ProductDef[] = [
  { product: 'Sonde Aurora', category: 'Capteurs', basePrice: 89, baseMargin: 0.42 },
  { product: 'Sonde Lumen', category: 'Capteurs', basePrice: 64, baseMargin: 0.38 },
  { product: 'Passerelle Orbit', category: 'Réseau', basePrice: 320, baseMargin: 0.31 },
  { product: 'Routeur Mesh-X', category: 'Réseau', basePrice: 210, baseMargin: 0.28 },
  { product: 'Contrôleur Nimbus', category: 'Contrôleurs', basePrice: 540, baseMargin: 0.35 },
  { product: 'Contrôleur Pulse', category: 'Contrôleurs', basePrice: 410, baseMargin: 0.33 },
  { product: 'Module Solaris', category: 'Énergie', basePrice: 175, baseMargin: 0.46 },
  { product: 'Batterie Volt+', category: 'Énergie', basePrice: 260, baseMargin: 0.4 },
  { product: 'Écran Vista 12"', category: 'Affichage', basePrice: 145, baseMargin: 0.24 },
  { product: 'Écran Vista 24"', category: 'Affichage', basePrice: 295, baseMargin: 0.22 },
];

const CHANNELS = ['Direct', 'Revendeur', 'En ligne', 'Partenaire'];
const SEGMENTS = ['PME', 'Grand compte', 'Secteur public'];

/** Stable reference "now" so relative-date / forecast demos stay deterministic. */
export const DEMO_NOW = new Date('2025-06-01T00:00:00Z');
const DAY_MS = 24 * 60 * 60 * 1000;
const WINDOW_DAYS = 364;

const MONTHS_FR = [
  'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
];

function monthLabel(d: Date): string {
  return `${MONTHS_FR[d.getUTCMonth()]} ${String(d.getUTCFullYear()).slice(2)}`;
}

// ── Row generation ──────────────────────────────────────────────────────────
function buildRows(): Row[] {
  const rows: Row[] = [];
  const rand = lcg(hashSeed('sentropic-dataviz-site-v1'));

  // One row per (city × product × ~5 sampled order days) keeps it realistic and
  // bounded (~750 rows) while spreading orders across the full date window.
  for (const c of CITIES) {
    for (const p of PRODUCTS) {
      const orders = 4 + Math.floor(rand() * 4); // 4–7 orders per city/product
      for (let o = 0; o < orders; o++) {
        const dayOffset = Math.floor(rand() * WINDOW_DAYS);
        const ts = DEMO_NOW.getTime() - dayOffset * DAY_MS;
        const d = new Date(ts);

        // Seasonal lift (Q4 push) + city weight + product noise.
        const month = d.getUTCMonth();
        const seasonal = 1 + (month >= 9 ? 0.35 : month <= 1 ? -0.15 : 0) + (rand() - 0.5) * 0.3;
        const units = Math.max(1, Math.round((6 + rand() * 30) * c.weight * seasonal));
        const price = Math.round(p.basePrice * (0.9 + rand() * 0.3));
        const revenue = units * price;
        const margin = +(p.baseMargin + (rand() - 0.5) * 0.12).toFixed(3);
        const channel = CHANNELS[Math.floor(rand() * CHANNELS.length)];
        const segment = SEGMENTS[Math.floor(rand() * SEGMENTS.length)];

        rows.push({
          region: c.region,
          country: c.country,
          city: c.city,
          category: p.category,
          product: p.product,
          channel,
          segment,
          month: monthLabel(d),
          date: ts,
          lat: c.lat,
          lng: c.lng,
          price,
          units,
          revenue,
          margin: Math.round(revenue * margin),
          marginRate: margin,
        });
      }
    }
  }

  // Stable order: by date ascending so time-series demos read left-to-right.
  rows.sort((a, b) => (a.date as number) - (b.date as number));
  return rows;
}

export const data: Row[] = buildRows();

// ── Model (dimensions + measures) ───────────────────────────────────────────
export const model: DataModel = {
  dimensions: [
    { id: 'region', label: 'Région', type: 'discrete' },
    { id: 'country', label: 'Pays', type: 'discrete' },
    { id: 'city', label: 'Ville', type: 'discrete' },
    { id: 'category', label: 'Catégorie', type: 'discrete' },
    { id: 'product', label: 'Produit', type: 'discrete' },
    { id: 'channel', label: 'Canal', type: 'discrete' },
    { id: 'segment', label: 'Segment', type: 'discrete' },
    { id: 'month', label: 'Mois', type: 'discrete' },
    { id: 'date', label: 'Date', type: 'continuous' },
    { id: 'lat', label: 'Latitude', type: 'continuous' },
    { id: 'lng', label: 'Longitude', type: 'continuous' },
    { id: 'price', label: 'Prix unitaire (€)', type: 'continuous' },
    { id: 'marginRate', label: 'Taux de marge', type: 'continuous' },
  ],
  measures: [
    { id: 'revenue', label: 'Revenu (€)', aggregation: 'sum' },
    { id: 'units', label: 'Unités', aggregation: 'sum' },
    { id: 'margin', label: 'Marge (€)', aggregation: 'sum' },
  ],
};

/** Convenience: distinct sorted values for a discrete dimension. */
export function distinct(field: string): string[] {
  return Array.from(new Set(data.map((r) => String(r[field])))).sort();
}

/** Total row count, exposed for the landing copy. */
export const ROW_COUNT = data.length;
