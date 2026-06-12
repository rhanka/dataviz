/**
 * Synthetic daily OHLC (open/high/low/close) dataset for the CandlestickChart demo.
 *
 * 28 trading sessions (approx. 5–6 weeks). Values are plausible equity-like
 * prices where low ≤ min(open, close) and max(open, close) ≤ high. Generated
 * deterministically — no Math.random.
 */
import type { DataModel, Row } from '@sentropic/dataviz-svelte';

export const ohlcModel: DataModel = {
  dimensions: [
    { id: 'session', label: 'Séance', type: 'discrete' },
  ],
  measures: [
    { id: 'open', label: 'Ouverture', aggregation: 'avg' },
    { id: 'high', label: 'Plus haut', aggregation: 'avg' },
    { id: 'low', label: 'Plus bas', aggregation: 'avg' },
    { id: 'close', label: 'Clôture', aggregation: 'avg' },
  ],
};

// 28 daily sessions starting 2024-01-02
const RAW: [string, number, number, number, number][] = [
  // [session, open, high, low, close]
  ['02 jan', 142.50, 146.80, 141.20, 145.30],
  ['03 jan', 145.30, 148.50, 143.00, 144.10],
  ['04 jan', 144.10, 147.20, 142.60, 146.80],
  ['05 jan', 146.80, 150.40, 145.50, 149.20],
  ['08 jan', 149.20, 152.10, 147.80, 148.60],
  ['09 jan', 148.60, 151.00, 146.30, 150.40],
  ['10 jan', 150.40, 153.80, 149.00, 152.70],
  ['11 jan', 152.70, 155.50, 151.20, 151.90],
  ['12 jan', 151.90, 154.30, 149.60, 153.50],
  ['15 jan', 153.50, 157.20, 152.40, 156.80],
  ['16 jan', 156.80, 159.00, 154.10, 155.30],
  ['17 jan', 155.30, 158.60, 153.70, 157.90],
  ['18 jan', 157.90, 160.50, 155.80, 158.40],
  ['19 jan', 158.40, 162.10, 157.00, 161.20],
  ['22 jan', 161.20, 164.80, 159.50, 160.70],
  ['23 jan', 160.70, 163.40, 157.80, 159.30],
  ['24 jan', 159.30, 161.90, 156.40, 158.10],
  ['25 jan', 158.10, 160.50, 154.60, 157.50],
  ['26 jan', 157.50, 160.80, 155.20, 159.90],
  ['29 jan', 159.90, 163.50, 158.40, 162.30],
  ['30 jan', 162.30, 165.70, 161.00, 164.80],
  ['31 jan', 164.80, 167.20, 162.50, 163.40],
  ['01 fév', 163.40, 166.90, 161.80, 165.70],
  ['02 fév', 165.70, 169.30, 164.10, 168.20],
  ['05 fév', 168.20, 171.50, 166.30, 167.60],
  ['06 fév', 167.60, 170.80, 165.00, 169.40],
  ['07 fév', 169.40, 172.90, 167.50, 171.80],
  ['08 fév', 171.80, 174.50, 170.00, 173.20],
];

export const ohlcData: Row[] = RAW.map(([session, open, high, low, close]) => ({
  session,
  open,
  high,
  low,
  close,
}));
