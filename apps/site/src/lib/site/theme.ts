/**
 * Theme + dark-mode token layer.
 *
 * Golden rule: presentation comes from the design system. We never hand-roll
 * component visuals — we only re-emit design-system *tokens*:
 *
 *  1. BASE — `compileTheme(sentTechTheme)` injects the full DS token set on
 *            `:root` (surfaces, text, spacing, motion, and the 8
 *            `--st-semantic-data-categoryN` chart colours), exactly like the DS
 *            docs site. Charts read their colours straight from these official
 *            DS category tokens — there is no app-level "palette" concept.
 *  2. DARK — a token overlay applied under `[data-color-mode="dark"]` (and the
 *            `prefers-color-scheme` media query) that re-maps the neutral
 *            surface/text/border tokens, mirroring the DS site's
 *            `compileThemeModes` mechanism (the bundled themes@0.11 ship no
 *            `tokensDark`, so we provide the dark token map here).
 */
import { compileTheme, sentTechTheme } from '@sentropic/design-system-themes';

// Dark token overlay: re-maps the neutral DS tokens for a comfortable dark
// surface. The DS data-category colours carry across unchanged (they already
// read well on the dark surface), so chart colour identity stays consistent.
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

/** Dark-mode token overlay: explicit toggle + auto via prefers-color-scheme. */
export function darkModeCss(): string {
  const auto = `@media (prefers-color-scheme: dark) {\n${darkBlock(
    ':root:not([data-color-mode="light"])',
  )}\n}`;
  const toggle = darkBlock(':root[data-color-mode="dark"]');
  return `${auto}\n${toggle}`;
}
