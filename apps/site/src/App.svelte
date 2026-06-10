<!--
  Site shell. Mirrors the design-system docs site: sticky header (brand + top
  nav + palette / framework / color-mode switchers), a left sidebar, and a
  router-driven content outlet. Themes/tokens are injected the same way the DS
  site does it (compileTheme → managed <style> on :root), with palette overlays
  and a dark token overlay layered on top.
-->
<script lang="ts">
  import { Moon, Sun, Palette as PaletteIcon, Boxes, Menu, X, Github } from '@lucide/svelte';
  import { router, onLinkClick } from './lib/site/router.svelte';
  import { colorMode, framework, palette, FRAMEWORKS } from './lib/site/stores.svelte';
  import { PALETTES, baseThemeCss, paletteCss, darkModeCss } from './lib/site/theme';
  import { findEntry, SECTION_META } from './lib/registry/index';
  import type { Section } from './lib/registry/types';
  import Sidebar from './lib/site/Sidebar.svelte';
  import LandingPage from './lib/site/LandingPage.svelte';
  import CataloguePage from './lib/site/CataloguePage.svelte';
  import DemoPage from './lib/site/DemoPage.svelte';
  import GuidesPage from './lib/site/GuidesPage.svelte';

  // ── Init stores (client) ─────────────────────────────────────────────────
  router.init();
  colorMode.init();
  framework.init();
  palette.init();

  // ── Theme injection ──────────────────────────────────────────────────────
  // Base DS tokens (light) — static, injected once.
  const baseCss = baseThemeCss();
  const darkCss = darkModeCss();
  // Palette overlay — reactive to the palette store.
  const palCss = $derived(paletteCss(palette.value));

  let isPaletteOpen = $state(false);
  let isFwOpen = $state(false);
  let sidebarOpen = $state(false);

  function colorIcon() {
    return colorMode.value;
  }

  // ── Route resolution ─────────────────────────────────────────────────────
  type Route =
    | { kind: 'home' }
    | { kind: 'guides' }
    | { kind: 'catalogue'; section: Section }
    | { kind: 'demo'; section: Section; slug: string }
    | { kind: 'notfound' };

  const route = $derived.by<Route>(() => {
    const path = router.path;
    if (path === '/' || path === '') return { kind: 'home' };
    if (path === '/guides') return { kind: 'guides' };
    const parts = path.split('/').filter(Boolean);
    const section = parts[0] as Section;
    if (!['charts', 'dashboards', 'grids'].includes(section)) return { kind: 'notfound' };
    if (parts.length === 1) return { kind: 'catalogue', section };
    return { kind: 'demo', section, slug: parts[1] };
  });

  const demoEntry = $derived.by(() =>
    route.kind === 'demo' ? findEntry(route.section, route.slug) : undefined,
  );

  const TOP_NAV: { label: string; href: string; section?: Section }[] = [
    { label: 'Charts', href: '/charts', section: 'charts' },
    { label: 'Dashboards', href: '/dashboards', section: 'dashboards' },
    { label: 'Grilles', href: '/grids', section: 'grids' },
    { label: 'Guides', href: '/guides' },
  ];
  function topActive(href: string): boolean {
    return href === '/guides' ? router.path === '/guides' : router.path.startsWith(href);
  }
</script>

<svelte:head>
  {@html `<style data-dv-base>${baseCss}</style>`}
  {@html `<style data-dv-dark>${darkCss}</style>`}
  {@html `<style data-dv-palette>${palCss}</style>`}
</svelte:head>

<svelte:window
  onclick={(e) => {
    const t = e.target as Element | null;
    if (isPaletteOpen && t && !t.closest('.dv-palette-wrap')) isPaletteOpen = false;
    if (isFwOpen && t && !t.closest('.dv-fw-wrap')) isFwOpen = false;
  }}
  onkeydown={(e) => {
    if (e.key === 'Escape') {
      isPaletteOpen = false;
      isFwOpen = false;
      sidebarOpen = false;
    }
  }}
/>

<div class="dv-shell">
  <header class="dv-header">
    <button
      class="dv-ctrl dv-ctrl--icon dv-sidebar-toggle"
      type="button"
      aria-label="Menu"
      onclick={() => (sidebarOpen = !sidebarOpen)}
    >
      {#if sidebarOpen}<X size={18} />{:else}<Menu size={18} />{/if}
    </button>

    <a class="dv-brand" href={router.href('/')} onclick={(e) => onLinkClick(e, '/')}>
      <span class="dv-brand__mark">dv</span>
      <span class="dv-brand__copy">
        <span class="dv-brand__name">Sentropic</span>
        <span class="dv-brand__product">dataviz</span>
      </span>
    </a>

    <nav class="dv-topnav" aria-label="Navigation principale">
      {#each TOP_NAV as item (item.href)}
        <a
          href={router.href(item.href)}
          aria-current={topActive(item.href) ? 'page' : undefined}
          onclick={(e) => onLinkClick(e, item.href)}>{item.label}</a
        >
      {/each}
    </nav>

    <div class="dv-actions">
      <!-- Palette switcher (multi-colour, non-monochrome) -->
      <div class="dv-palette-wrap dv-menu-wrap">
        <button
          class="dv-ctrl"
          type="button"
          aria-haspopup="true"
          aria-expanded={isPaletteOpen}
          onclick={() => (isPaletteOpen = !isPaletteOpen)}
        >
          <PaletteIcon size={14} />
          <span>{PALETTES.find((p) => p.id === palette.value)?.label}</span>
        </button>
        {#if isPaletteOpen}
          <div class="dv-menu" role="menu">
            {#each PALETTES as p (p.id)}
              <button
                class:active={palette.value === p.id}
                role="menuitem"
                onclick={() => {
                  palette.set(p.id);
                  isPaletteOpen = false;
                }}
              >
                <span>{p.label}</span>
                <span class="dv-swatch">
                  {#each p.colors.slice(0, 5) as c (c)}
                    <span style="background:{c}"></span>
                  {/each}
                </span>
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Framework switcher -->
      <div class="dv-fw-wrap dv-menu-wrap">
        <button
          class="dv-ctrl"
          type="button"
          aria-haspopup="true"
          aria-expanded={isFwOpen}
          onclick={() => (isFwOpen = !isFwOpen)}
        >
          <Boxes size={14} />
          <span>{FRAMEWORKS.find((f) => f.id === framework.value)?.label}</span>
        </button>
        {#if isFwOpen}
          <div class="dv-menu" role="menu">
            {#each FRAMEWORKS as f (f.id)}
              <button
                class:active={framework.value === f.id}
                role="menuitem"
                onclick={() => {
                  framework.set(f.id);
                  isFwOpen = false;
                }}>{f.label}</button
              >
            {/each}
          </div>
        {/if}
      </div>

      <!-- Color mode toggle -->
      <button
        class="dv-ctrl dv-ctrl--icon"
        type="button"
        aria-label="Mode couleur"
        title="Mode : {colorMode.value}"
        onclick={() => colorMode.cycle()}
      >
        {#if colorIcon() === 'dark'}<Moon size={16} />{:else if colorIcon() === 'light'}<Sun
            size={16}
          />{:else}<Sun size={16} style="opacity:.6" />{/if}
      </button>

      <a
        class="dv-ctrl dv-ctrl--icon"
        href="https://github.com/rhanka/dataviz"
        target="_blank"
        rel="noreferrer"
        aria-label="GitHub"
      >
        <Github size={16} />
      </a>
    </div>
  </header>

  {#if route.kind === 'home'}
    <main class="dv-content" style="max-width:none;margin:0 auto;">
      <LandingPage />
    </main>
  {:else}
    <div class="dv-body">
      <Sidebar open={sidebarOpen} />
      <main class="dv-content">
        {#if route.kind === 'guides'}
          <GuidesPage />
        {:else if route.kind === 'catalogue'}
          <CataloguePage section={route.section} />
        {:else if route.kind === 'demo' && demoEntry}
          <DemoPage entry={demoEntry} />
        {:else}
          <div class="dv-prose">
            <h1 class="dv-h1">Page introuvable</h1>
            <p>
              Cette page n'existe pas. Retour à
              <a href={router.href('/')} onclick={(e) => onLinkClick(e, '/')}>l'accueil</a>.
            </p>
          </div>
        {/if}
      </main>
    </div>
  {/if}
</div>
