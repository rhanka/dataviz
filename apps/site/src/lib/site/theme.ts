/**
 * Theme + dark-mode token layer.
 *
 * Golden rule: presentation comes from the design system. We never hand-roll
 * component visuals — we only re-emit design-system *tokens*. The site mirrors
 * the DS docs site's theme switcher: the official tenant themes are compiled to
 * `:root` tokens via `compileTheme`, switchable at runtime.
 *
 *  - THEME : `compileTheme(activeTheme, { selector: ':root' })` — the full DS
 *            token set for the chosen tenant (sent-tech / dsfr / carbon / airbus),
 *            including its brand font (`--st-font-sans`) and the 8
 *            `--st-semantic-data-categoryN` chart colours. There is no app-level
 *            "palette" concept; chart colours come straight from these tokens.
 *  - DARK  : a neutral token overlay applied under `[data-color-mode="dark"]`
 *            (and the `prefers-color-scheme` query) re-mapping the surface/text/
 *            border tokens. It is theme-agnostic, so every tenant gets a
 *            consistent dark surface while keeping its own accent/data colours.
 */
import { compileTheme, sentTechTheme, type TenantTheme } from '@sentropic/design-system-themes';
import { dsfrTheme } from '@sentropic/design-system-theme-dsfr';
import { carbonTheme } from '@sentropic/design-system-theme-carbon';
import { airbusTheme } from '@sentropic/design-system-theme-airbus';

export interface ThemeOption {
  id: string;
  label: string;
  theme: TenantTheme;
}

// The official tenant themes offered in the switcher — the same set the DS docs
// site exposes (forge / entropic are internal demo tenants and are excluded).
// Each theme's own brand font is loaded globally in index.html.
export const THEMES: ThemeOption[] = [
  { id: sentTechTheme.id, label: 'Sent Tech', theme: sentTechTheme },
  { id: dsfrTheme.id, label: 'DSFR', theme: dsfrTheme },
  { id: carbonTheme.id, label: 'Carbon', theme: carbonTheme },
  { id: airbusTheme.id, label: 'Airbus', theme: airbusTheme },
];

export const DEFAULT_THEME_ID = sentTechTheme.id;

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

/** Full theme CSS (light) for a tenant — the DS token set injected on :root. */
export function themeCss(themeId: string): string {
  const opt = THEMES.find((t) => t.id === themeId) ?? THEMES[0];
  return `${compileTheme(opt.theme, { selector: ':root' })}\n:root { color-scheme: light; }`;
}

/** Dark-mode token overlay: explicit toggle + auto via prefers-color-scheme. */
export function darkModeCss(): string {
  const auto = `@media (prefers-color-scheme: dark) {\n${darkBlock(
    ':root:not([data-color-mode="light"])',
  )}\n}`;
  const toggle = darkBlock(':root[data-color-mode="dark"]');
  return `${auto}\n${toggle}`;
}
