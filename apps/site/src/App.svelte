<!--
  Site shell. The header is the design-system `AppChrome` component (brand + top
  nav + color-mode/GitHub controls + mobile drawer) — ZERO cloned markup, 100 %
  presentation from @sentropic/design-system-svelte, so it matches the DS site
  (design-system.sent-tech.ca) by construction. A tiny click-delegation action
  routes AppChrome's internal <a> links through the SPA router (external/GitHub
  links fall through). The DS theme selector (Sent Tech / DSFR / Carbon / Airbus)
  is a first-class AppChrome control (themes/theme/onThemeChange), so switching
  tenant re-emits the whole DS token set on :root. The framework switcher
  (Svelte/React/Vue) is the dataviz-specific control: it is mounted in AppChrome's
  `identity` slot via DS Menu pieces, and only on pages where a live demo makes
  the switch meaningful. Tokens are injected the way the DS site does it
  (compileTheme on the active tenant → managed <style> on :root) + a dark overlay;
  chart colours come from the DS data-category tokens — there is no app-level
  palette.
-->
<script lang="ts">
  import { Boxes } from '@lucide/svelte';
  import {
    AppChrome,
    MenuTriggerButton,
    MenuPopover,
    Menu as DsMenu,
    type MenuItem,
    type AppChromeNavItem,
  } from '@sentropic/design-system-svelte';
  import { router, onLinkClick } from './lib/site/router.svelte';
  import { colorMode, framework, theme, FRAMEWORKS } from './lib/site/stores.svelte';
  import { themeCss, darkModeCss, THEMES } from './lib/site/theme';
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
  theme.init();

  // ── Theme injection ──────────────────────────────────────────────────────
  // Active tenant theme tokens (light) — reactive to the theme store, so
  // switching theme re-emits the :root token set. Dark overlay is static.
  const themeCssStr = $derived(themeCss(theme.value));
  const darkCss = darkModeCss();
  // Theme options for AppChrome's selector (DS official tenants).
  const chromeThemes = THEMES.map((t) => ({ id: t.id, label: t.label }));

  // ── Header state ─────────────────────────────────────────────────────────
  let mobileMenuOpen = $state(false);
  let sidebarOpen = $state(false);
  // Framework switcher (DS anchored menu): own open flag + trigger ref for the
  // MenuPopover to anchor off (bind:this on a component yields the instance,
  // not the DOM node — so we wrap the trigger in an inline-flex span).
  let isFwOpen = $state(false);
  let fwTrigger = $state<HTMLElement | null>(null);

  const frameworkItems = $derived<MenuItem[]>(
    FRAMEWORKS.map((f) => ({ label: f.label, value: f.id })),
  );
  const frameworkLabel = $derived(
    FRAMEWORKS.find((f) => f.id === framework.value)?.label ?? '',
  );

  const COLOR_MODE_LABELS = { light: 'Mode clair', dark: 'Mode sombre', auto: 'Mode auto' };

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

  // Nav items for AppChrome (the DS renders real <a href>; SPA routing happens
  // through the click-delegation action below).
  const chromeNav = $derived<AppChromeNavItem[]>(
    TOP_NAV.map((it) => ({ label: it.label, href: router.href(it.href), active: topActive(it.href) })),
  );

  // The framework switch only changes something where a live demo is rendered
  // (demo + catalogue pages), exactly like the DS site shows it contextually.
  const showFwSwitch = $derived(route.kind === 'demo' || route.kind === 'catalogue');

  // Click-delegation action: route AppChrome's internal brand/nav <a> through
  // the SPA router; let external / new-tab links (GitHub) fall through to the
  // browser. Implemented as an action (not an onclick attribute) so it adds no
  // static-element a11y warning — the real interactive elements are the <a>s.
  function chromeRouting(node: HTMLElement) {
    const handler = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.('a');
      if (!a || a.target === '_blank') return;
      const href = a.getAttribute('href');
      if (!href || /^https?:\/\//i.test(href)) return;
      if (href === router.href('/')) {
        e.preventDefault();
        router.navigate('/');
        return;
      }
      const item = TOP_NAV.find((it) => router.href(it.href) === href);
      if (item) {
        e.preventDefault();
        router.navigate(item.href);
      }
    };
    node.addEventListener('click', handler);
    return { destroy: () => node.removeEventListener('click', handler) };
  }
</script>

<svelte:head>
  {@html `<style data-dv-theme>${themeCssStr}</style>`}
  {@html `<style data-dv-dark>${darkCss}</style>`}
</svelte:head>

<svelte:window
  onkeydown={(e) => {
    if (e.key === 'Escape') {
      sidebarOpen = false;
      mobileMenuOpen = false;
    }
  }}
/>

<!-- Framework switcher mounted in AppChrome's right-hand identity slot (DS Menu
     pieces only — no hand-rolled control). -->
{#snippet fwSwitch()}
  <span style="display:inline-flex" bind:this={fwTrigger}>
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
{/snippet}

<div class="dv-shell">
  <a class="dv-skip-link" href="#main-content">Aller au contenu</a>
  <div class="dv-chrome" use:chromeRouting>
    <AppChrome
      brandName="Sentropic"
      productName="dataviz"
      logoSrc={`${import.meta.env.BASE_URL}SENT-logo-squared.svg`}
      logoAlt="Sentropic"
      brandHref={router.href('/')}
      nav={chromeNav}
      navLabel="Navigation principale"
      colorMode={colorMode.value}
      onColorModeChange={(m) => colorMode.set(m)}
      colorModeLabels={COLOR_MODE_LABELS}
      githubHref="https://github.com/rhanka/dataviz"
      githubLabel="GitHub"
      themes={chromeThemes}
      theme={theme.value}
      onThemeChange={(id) => theme.set(id)}
      themeLabel="Changer de thème"
      identity={showFwSwitch ? fwSwitch : undefined}
      {mobileMenuOpen}
      onMobileMenuToggle={() => (mobileMenuOpen = !mobileMenuOpen)}
      menuLabel="Menu"
    />
  </div>

  {#if route.kind === 'home'}
    <main id="main-content" class="dv-content" style="max-width:none;margin:0 auto;">
      <LandingPage />
    </main>
  {:else}
    <div class="dv-body">
      <Sidebar open={sidebarOpen} />
      <main id="main-content" class="dv-content">
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
