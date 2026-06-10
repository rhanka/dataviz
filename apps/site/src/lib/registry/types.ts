import type { Component } from 'svelte';

export type Section = 'charts' | 'dashboards' | 'grids' | 'guides';

export interface CodeTabs {
  svelte: string;
  react: string;
  vue: string;
}

export interface DemoEntry {
  /** URL slug, unique within its section. */
  slug: string;
  section: Section;
  /** Display name (matches the dataviz component name). */
  name: string;
  /** Sub-group label inside the sidebar section. */
  group: string;
  /** Short tagline shown in the catalogue + page sub-head. */
  tagline: string;
  /** Longer use-case writeup (Markdown-lite: paragraphs split on \n\n). */
  useCase: string;
  /** Live Svelte demo component (mounts the real dataviz component). */
  demo: Component<{ kind?: string; controls?: boolean }>;
  /** Prop passed to the multiplexed demo component (selects the variant). */
  demoProps?: Record<string, unknown>;
  /** Copy-paste code for all three frameworks. */
  code: CodeTabs;
  /** Whether this demo exposes interactive controls (filters/options). */
  hasControls?: boolean;
  /** Optional: matching React/Vue live-island key for true cross-fw preview. */
  islandKey?: string;
}

export interface SectionGroup {
  label: string;
  entries: DemoEntry[];
}
