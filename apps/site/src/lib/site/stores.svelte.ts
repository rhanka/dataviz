/**
 * Shared reactive stores (Svelte 5 runes singletons), mirroring the DS docs
 * site: color mode (light/dark/auto) and framework (svelte/react/vue). Each
 * persists to localStorage. Chart colours come from the DS theme tokens — there
 * is no app-level palette store.
 */
const browser = typeof window !== 'undefined';

// ── Color mode ───────────────────────────────────────────────────────────────
export type ColorMode = 'light' | 'dark' | 'auto';
const COLOR_KEY = 'dv-site-color-mode';
const MODES: ColorMode[] = ['light', 'dark', 'auto'];

function applyColorMode(mode: ColorMode): void {
  if (!browser) return;
  const root = document.documentElement;
  if (mode === 'auto') root.removeAttribute('data-color-mode');
  else root.setAttribute('data-color-mode', mode);
}

class ColorModeStore {
  value = $state<ColorMode>('auto');
  init(): void {
    if (!browser) return;
    const stored = localStorage.getItem(COLOR_KEY) as ColorMode | null;
    this.value = stored && MODES.includes(stored) ? stored : 'auto';
    applyColorMode(this.value);
  }
  set(mode: ColorMode): void {
    this.value = mode;
    if (browser) {
      localStorage.setItem(COLOR_KEY, mode);
      applyColorMode(mode);
    }
  }
  cycle(): void {
    const next: ColorMode =
      this.value === 'light' ? 'dark' : this.value === 'dark' ? 'auto' : 'light';
    this.set(next);
  }
}
export const colorMode = new ColorModeStore();

// ── Framework ────────────────────────────────────────────────────────────────
export type FrameworkId = 'svelte' | 'react' | 'vue';
export const FRAMEWORKS: { id: FrameworkId; label: string }[] = [
  { id: 'svelte', label: 'Svelte' },
  { id: 'react', label: 'React' },
  { id: 'vue', label: 'Vue' },
];
const FW_KEY = 'dv-site-framework';

class FrameworkStore {
  value = $state<FrameworkId>('svelte');
  init(): void {
    if (!browser) return;
    const stored = localStorage.getItem(FW_KEY) as FrameworkId | null;
    if (stored && FRAMEWORKS.some((f) => f.id === stored)) this.value = stored;
  }
  set(id: FrameworkId): void {
    this.value = id;
    if (browser) localStorage.setItem(FW_KEY, id);
  }
}
export const framework = new FrameworkStore();
