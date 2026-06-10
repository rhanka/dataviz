/**
 * Theme + palette + dark-mode token layer.
 *
 * Golden rule: presentation comes from the design system. We never hand-roll
 * component visuals — we only re-emit design-system *tokens*:
 *
 *  1. BASE   — `compileTheme(sentTechTheme)` injects the full DS token set on
 *              `:root` (surfaces, text, spacing, motion, chart categories …),
 *              exactly like the DS docs site does.
 *  2. PALETTE — curated multi-colour overlays that override the 8
 *              `--st-semantic-data-categoryN` chart tokens (the same surface the
 *              DS exposes). This is how charts escape monochrome — by swapping
 *              the DS data palette, not by colouring components by hand.
 *  3. DARK   — a token overlay applied under `[data-color-mode="dark"]`
 *              (and the `prefers-color-scheme` media query) that re-maps the
 *              neutral surface/text/border tokens, mirroring the DS site's
 *              `compileThemeModes` mechanism (the bundled themes@0.11 ship no
 *              `tokensDark`, so we provide the dark token map here).
 */
import { compileTheme, sentTechTheme } from '@sentropic/design-system-themes';

export interface Palette {
  id: string;
  label: string;
  /** 8 chart category colours, mapped to --st-semantic-data-category1..8. */
  colors: [string, string, string, string, string, string, string, string];
}

// Multi-colour, explicitly non-monochrome palettes. All are colour-blind aware
// (Tableau-10 derived hues) and tuned for both light and dark surfaces.
export const PALETTES: Palette[] = [
  {
    id: 'sentropic',
    label: 'Sentropic',
    colors: ['#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F', '#EDC948', '#B07AA1', '#FF9DA7'],
  },
  {
    id: 'aurora',
    label: 'Aurora',
    colors: ['#5B8FF9', '#61DDAA', '#65789B', '#F6BD16', '#7262FD', '#78D3F8', '#9661BC', '#F6903D'],
  },
  {
    id: 'sunset',
    label: 'Sunset',
    colors: ['#E6663E', '#F4A259', '#F7C548', '#5B8C5A', '#2A7F8E', '#3D5A80', '#9B5DE5', '#EE6C9C'],
  },
  {
    id: 'ocean',
    label: 'Océan',
    colors: ['#0B6E99', '#1CA4A6', '#2DC2BD', '#7AD7C8', '#3D5A80', '#98C1D9', '#5C6F8A', '#E0A458'],
  },
  {
    id: 'vivid',
    label: 'Vif',
    colors: ['#2563EB', '#DB2777', '#16A34A', '#F59E0B', '#7C3AED', '#0891B2', '#DC2626', '#65A30D'],
  },
];

export const DEFAULT_PALETTE_ID = PALETTES[0].id;

// Dark token overlay: re-maps the neutral DS tokens for a comfortable dark
// surface. Chart category tokens stay palette-driven (the palettes read well on
// dark) so colour identity is consistent across modes.
const DARK_TOKENS: Record<string, string> = {
  '--st-semantic-surface-default': '#0f172a',
  '--st-semantic-surface-subtle': '#0b1220',
  '--st-semantic-surface-raised': '#1e293b',
  '--st-semantic-surface-inverse': '#f8fafc',
  '--st-semantic-surface-overlay': 'rgb(2 6 23 / 0.62)',
  '--st-semantic-text-primary': '#f1f5f9',
  '--st-semantic-text-secondary': '#cbd5e1',
  '--st-semantic-text-muted': '#94a3b8',
  '--st-semantic-text-inverse': '#0f172a',
  '--st-semantic-text-link': '#7dd3fc',
  '--st-semantic-border-subtle': '#334155',
  '--st-semantic-border-strong': '#475569',
  '--st-field-fillBg': '#1e293b',
  '--st-foundation-field-fillBg': '#1e293b',
};

function paletteBlock(palette: Palette, selector: string): string {
  const lines = palette.colors
    .map((c, i) => `  --st-semantic-data-category${i + 1}: ${c};`)
    .join('\n');
  return `${selector} {\n${lines}\n}`;
}

function darkBlock(selector: string): string {
  const lines = Object.entries(DARK_TOKENS)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');
  return `${selector} {\n  color-scheme: dark;\n${lines}\n}`;
}

/** Full base-theme CSS (light) — the DS token set on :root. */
export function baseThemeCss(): string {
  return `${compileTheme(sentTechTheme, { selector: ':root' })}\n:root { color-scheme: light; }`;
}

/** CSS for the active palette (light + a dark variant under data-color-mode). */
export function paletteCss(paletteId: string): string {
  const palette = PALETTES.find((p) => p.id === paletteId) ?? PALETTES[0];
  return paletteBlock(palette, ':root');
}

/** Dark-mode token overlay: explicit toggle + auto via prefers-color-scheme. */
export function darkModeCss(): string {
  const auto = `@media (prefers-color-scheme: dark) {\n${darkBlock(
    ':root:not([data-color-mode="light"])',
  )}\n}`;
  const toggle = darkBlock(':root[data-color-mode="dark"]');
  return `${auto}\n${toggle}`;
}
