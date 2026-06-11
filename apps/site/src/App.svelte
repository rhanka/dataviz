<!--
  Site shell. Mirrors the design-system docs site: sticky header (brand + top
  nav + framework / color-mode switchers), a left sidebar, and a router-driven
  content outlet. Themes/tokens are injected the same way the DS site does it
  (compileTheme → managed <style> on :root), with a dark token overlay on top.
  Chart colours come from the DS data-category tokens — no app-level palette.
-->
<script lang="ts">
  import { Moon, Sun, Boxes, Github } from '@lucide/svelte';
  import {
    AppHeader,
    MenuTriggerButton,
    MenuPopover,
    Menu as DsMenu,
    IconButton,
    Link as DsLink,
    type MenuItem,
  } from '@sentropic/design-system-svelte';
  import { router, onLinkClick } from './lib/site/router.svelte';
  import { colorMode, framework, FRAMEWORKS } from './lib/site/stores.svelte';
  import { baseThemeCss, darkModeCss } from './lib/site/theme';
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

  // ── Theme injection ──────────────────────────────────────────────────────
  // Base DS tokens (light) — static, injected once.
  const baseCss = baseThemeCss();
  const darkCss = darkModeCss();

  // ── Header control state ─────────────────────────────────────────────────
  // The framework switcher is a DS anchored menu (MenuTriggerButton ->
  // MenuPopover -> Menu): it needs an open flag and a ref to its trigger button
  // (MenuPopover anchors off the trigger element).
  let isFwOpen = $state(false);
  let fwTrigger = $state<HTMLElement | null>(null);
  let sidebarOpen = $state(false);

  // Compact (burger) mode: AppHeader's `compact` prop is controlled, so we drive
  // it from a matchMedia query at the same 860px breakpoint the sidebar uses.
  let compact = $state(false);
  $effect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 860px)');
    const sync = () => (compact = mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  });

  // Framework menu rendered as DS Menu items (text + value).
  const frameworkItems = $derived<MenuItem[]>(
    FRAMEWORKS.map((f) => ({ label: f.label, value: f.id })),
  );
  const frameworkLabel = $derived(
    FRAMEWORKS.find((f) => f.id === framework.value)?.label ?? '',
  );

  function colorIcon() {
    return colorMode.value;
  }
  function colorModeLabel(): string {
    return colorMode.value === 'dark'
      ? 'Mode sombre — passer à auto'
      : colorMode.value === 'light'
        ? 'Mode clair — passer au sombre'
        : 'Mode auto — passer au clair';
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
</svelte:head>

<svelte:window
  onkeydown={(e) => {
    if (e.key === 'Escape') sidebarOpen = false;
  }}
/>

{#snippet brand()}
  <a class="dv-brand" href={router.href('/')} onclick={(e) => onLinkClick(e, '/')}>
    <img
      class="dv-brand__mark"
      src="{import.meta.env.BASE_URL}SENT-logo-squared.svg"
      alt="Sentropic"
    />
    <span class="dv-brand__copy">
      <span class="dv-brand__name">Sentropic</span>
      <span class="dv-brand__product">dataviz</span>
    </span>
  </a>
{/snippet}

{#snippet topNav()}
  {#each TOP_NAV as item (item.href)}
    <DsLink
      href={router.href(item.href)}
      variant="muted"
      aria-current={topActive(item.href) ? 'page' : undefined}
      onclick={(e) => onLinkClick(e, item.href)}>{item.label}</DsLink
    >
  {/each}
{/snippet}

{#snippet headerActions()}
  <!-- Framework switcher — DS anchored menu (MenuTriggerButton + MenuPopover + Menu).
       The trigger button is wrapped in a tight inline-flex span so MenuPopover gets
       a real HTMLElement to anchor off (bind:this on a component yields the instance,
       not the DOM node). -->
  <span class="dv-menu-anchor" bind:this={fwTrigger}>
    <MenuTriggerButton
      aria-label="Changer de framework"
      expanded={isFwOpen}
      variant="ghost"
      onclick={() => (isFwOpen = !isFwOpen)}
    >
      <Boxes size={14} aria-hidden="true" />
      <span>{frameworkLabel}</span>
    </MenuTriggerButton>
  </span>
  <MenuPopover bind:open={isFwOpen} trigger={fwTrigger} placement="bottom-end" label="Framework">
    <DsMenu
      label="Framework"
      items={frameworkItems}
      onselect={(value) => {
        framework.set(value as typeof framework.value);
        isFwOpen = false;
      }}
    />
  </MenuPopover>

  <!-- Color-mode toggle — DS IconButton (ghost). -->
  <IconButton aria-label={colorModeLabel()} variant="ghost" onclick={() => colorMode.cycle()}>
    {#if colorIcon() === 'dark'}<Moon size={16} aria-hidden="true" />{:else if colorIcon() === 'light'}<Sun
        size={16}
        aria-hidden="true"
      />{:else}<Sun size={16} aria-hidden="true" style="opacity:.6" />{/if}
  </IconButton>

  <!-- GitHub — DS Link (anchor) wrapping the icon. -->
  <DsLink href="https://github.com/rhanka/dataviz" external variant="muted" aria-label="GitHub">
    <Github size={16} aria-hidden="true" />
  </DsLink>
{/snippet}

{#snippet drawer()}
  <nav class="dv-drawer-nav" aria-label="Navigation principale">
    {#each TOP_NAV as item (item.href)}
      <DsLink
        href={router.href(item.href)}
        variant="muted"
        aria-current={topActive(item.href) ? 'page' : undefined}
        onclick={(e) => {
          onLinkClick(e, item.href);
          sidebarOpen = false;
        }}>{item.label}</DsLink
      >
    {/each}
  </nav>
{/snippet}

<div class="dv-shell">
  <AppHeader
    {compact}
    menuOpen={sidebarOpen}
    onMenuToggle={() => (sidebarOpen = !sidebarOpen)}
    menuLabel="Menu"
    logo={brand}
    nav={topNav}
    actions={headerActions}
    {drawer}
  />

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
