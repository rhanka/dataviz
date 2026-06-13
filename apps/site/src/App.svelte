<script lang="ts">
  import { tick } from 'svelte';
  import { Boxes, ChevronDown, Github, Search as SearchIcon, User, X } from '@lucide/svelte';
  import {
    AppChrome,
    type AppChromeNavItem,
    type AppChromeThemeOption,
  } from '@sentropic/design-system-svelte';
  import { router, onLinkClick } from './lib/site/router.svelte';
  import { normalizeAppHref, isExternalHref } from './lib/site/route-utils';
  import { colorMode, framework, theme, FRAMEWORKS, type ColorMode } from './lib/site/stores.svelte';
  import { darkModeCss, themeCss, THEMES } from './lib/site/theme';
  import {
    DOCS_UTILITY_NAV,
    buildComponentNavGroups,
    buildFoundationNav,
    buildTopNav,
    resolveBreadcrumb,
    type ComponentNavItem,
  } from './lib/site/docs-navigation';
  import { findEntry } from './lib/registry/index';
  import { locale } from './lib/site/locale.svelte';
  import type { Section } from './lib/registry/types';
  import LandingPage from './lib/site/LandingPage.svelte';
  import CataloguePage from './lib/site/CataloguePage.svelte';
  import DemoPage from './lib/site/DemoPage.svelte';
  import DatavizSearch from './lib/site/search/DatavizSearch.svelte';

  router.init();
  colorMode.init();
  framework.init();
  theme.init();

  const themeCssStr = $derived(themeCss(theme.value));
  const darkCss = darkModeCss();
  const activeTheme = $derived(THEMES.find((option) => option.id === theme.value) ?? THEMES[0]);

  let isLocaleOpen = $state(false);
  let isThemeOpen = $state(false);
  let isFrameworkOpen = $state(false);
  let isMobileMenuOpen = $state(false);
  let isSidebarOpen = $state(false);
  let searchOpen = $state(false);
  let searchOverlayPanel = $state<HTMLDivElement | null>(null);

  type Route =
    | { kind: 'home' }
    | { kind: 'catalogue'; section: Section }
    | { kind: 'demo'; section: Section; slug: string }
    | { kind: 'notfound' };

  const route = $derived.by<Route>(() => {
    const path = router.path;
    if (path === '/' || path === '') return { kind: 'home' };
    const parts = path.split('/').filter(Boolean);
    const section = parts[0] as Section;
    if (!['charts', 'dashboards', 'grids'].includes(section)) return { kind: 'notfound' };
    if (parts.length === 1) return { kind: 'catalogue', section };
    return { kind: 'demo', section, slug: parts[1] };
  });

  const demoEntry = $derived.by(() =>
    route.kind === 'demo' ? findEntry(route.section, route.slug) : undefined,
  );
  const topNavItems = $derived(buildTopNav(locale.value));
  const foundationNavItems = $derived(buildFoundationNav(locale.value));
  const componentGroups = $derived(buildComponentNavGroups(locale.value));
  const breadcrumbs = $derived(resolveBreadcrumb(router.path, locale.value));
  const frameworkLabel = $derived(FRAMEWORKS.find((f) => f.id === framework.value)?.label ?? 'Svelte');
  const showFrameworkSwitcher = $derived(route.kind === 'demo' || route.kind === 'catalogue');

  // ── Données pour le composant DS AppChrome (source de vérité du chrome) ──────
  const appNavItems = $derived<AppChromeNavItem[]>(
    topNavItems.map((item) => ({ label: item.label, href: item.href, active: isActive(item.href) })),
  );
  const appThemeOptions = $derived<AppChromeThemeOption[]>(
    THEMES.map((option) => ({ id: option.id, label: option.label })),
  );
  const colorModeLabels = $derived(
    locale.value === 'fr'
      ? { light: 'Clair', dark: 'Sombre', auto: 'Auto' }
      : { light: 'Light', dark: 'Dark', auto: 'Auto' },
  );

  function isActive(href: string): boolean {
    const path = router.path;
    const appPath = normalizeAppHref(href);
    if (appPath === '/') return path === '/';
    return path === appPath || path.startsWith(`${appPath}/`);
  }

  function isComponentActive(item: ComponentNavItem): boolean {
    return router.path === normalizeAppHref(item.href);
  }

  function isSidebarDocActive(href: string): boolean {
    return isActive(href);
  }

  function isGroupOpen(items: ComponentNavItem[]): boolean {
    return items.some((item) => isComponentActive(item));
  }

  function openSearch() {
    searchOpen = true;
  }

  async function focusSearchInput() {
    await tick();
    searchOverlayPanel
      ?.querySelector<HTMLInputElement>(".docs-search input[type='search']")
      ?.focus();
  }

  $effect(() => {
    if (!searchOpen) return;
    void focusSearchInput();
  });

  function chromeRouting(node: HTMLElement) {
    const handler = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const anchor = (event.target as HTMLElement | null)?.closest?.('a');
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || isExternalHref(href)) return;

      const appPath = normalizeAppHref(href);
      event.preventDefault();
      router.navigate(appPath);
      isMobileMenuOpen = false;
      isSidebarOpen = false;
      searchOpen = false;
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
  onclick={(event) => {
    const target = event.target as Element | null;
    if (isThemeOpen && target && !target.closest('.docs-theme-wrapper')) isThemeOpen = false;
    if (isFrameworkOpen && target && !target.closest('.docs-framework-wrapper')) isFrameworkOpen = false;
    if (isLocaleOpen && target && !target.closest('.docs-locale-wrapper')) isLocaleOpen = false;
  }}
  onkeydown={(event) => {
    if (event.key === 'Escape') {
      isLocaleOpen = false;
      isThemeOpen = false;
      isFrameworkOpen = false;
      isMobileMenuOpen = false;
      isSidebarOpen = false;
      searchOpen = false;
    }
    const el = event.target as HTMLElement | null;
    const typing = !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
    if (event.key === '/' && !typing && !searchOpen) {
      event.preventDefault();
      openSearch();
    }
  }}
/>

{#snippet searchTrigger()}
  <button
    type="button"
    class="st-appChrome__control st-appHeader__control docs-search-trigger"
    onclick={openSearch}
    aria-label={locale.value === 'fr' ? 'Rechercher dans la documentation' : 'Search the documentation'}
    aria-haspopup="dialog"
  >
    <SearchIcon size={14} strokeWidth={2.1} aria-hidden="true" />
    <span>{locale.value === 'fr' ? 'Rechercher...' : 'Search...'}</span>
    <kbd class="docs-search-trigger__kbd">/</kbd>
  </button>
{/snippet}

{#snippet frameworkSelector()}
  <div class="docs-framework-wrapper st-appChrome__menuWrap">
    <button
      type="button"
      class="st-appChrome__control st-appHeader__control"
      onclick={() => (isFrameworkOpen = !isFrameworkOpen)}
      aria-expanded={isFrameworkOpen}
      aria-haspopup="true"
      aria-label={locale.value === 'fr' ? 'Changer de framework' : 'Change framework'}
    >
      <Boxes size={14} aria-hidden="true" />
      <span>{frameworkLabel}</span>
      <ChevronDown size={12} class="st-appChrome__chevron {isFrameworkOpen ? 'is-rotated' : ''}" aria-hidden="true" />
    </button>

    {#if isFrameworkOpen}
      <div class="st-appChrome__menu" role="menu">
        {#each FRAMEWORKS as option (option.id)}
          <button
            type="button"
            class="st-appChrome__menuItem"
            class:is-active={framework.value === option.id}
            role="menuitem"
            onclick={() => {
              framework.set(option.id);
              isFrameworkOpen = false;
            }}
          >
            <span class="st-appChrome__check" aria-hidden="true">{#if framework.value === option.id}✓{/if}</span>
            <span>{option.label}</span>
          </button>
        {/each}
      </div>
    {/if}
  </div>
{/snippet}

{#snippet identityControl()}
  <button
    type="button"
    class="st-appChrome__control st-appChrome__iconControl st-appHeader__control"
    aria-label={locale.value === 'fr' ? 'Se connecter' : 'Sign in'}
  >
    <User size={16} strokeWidth={2.1} aria-hidden="true" />
  </button>
{/snippet}

{#snippet extraControls()}
  {@render searchTrigger()}
  {#if showFrameworkSwitcher}
    {@render frameworkSelector()}
  {/if}
{/snippet}

{#snippet routeContent()}
  <main class="docs-main" id="main-content">
    {#if route.kind === 'home'}
      <LandingPage />
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
{/snippet}

{#snippet pageContent()}
  <div class="docs-content-area">
    <nav class="docs-breadcrumb" aria-label="Fil d'Ariane">
      <ol>
        {#each breadcrumbs as crumb, index (crumb.href)}
          <li>
            {#if index === breadcrumbs.length - 1}
              <span aria-current="page">{crumb.label}</span>
            {:else}
              <a href={crumb.href}>{crumb.label}</a>
            {/if}
          </li>
        {/each}
      </ol>
    </nav>
    {@render routeContent()}
  </div>
{/snippet}

<a class="docs-skip-link" href="#main-content">Aller au contenu</a>
<div class="docs-shell" data-st-theme={theme.value} use:chromeRouting>
  <AppChrome
    brandName="Sentropic"
    productName="dataviz"
    logoSrc={`${import.meta.env.BASE_URL}SENT-logo-squared.svg`}
    brandHref={router.href('/')}
    brandLabel="Sentropic dataviz"
    nav={appNavItems}
    navLabel={locale.value === 'fr' ? 'Navigation principale' : 'Primary navigation'}
    themes={appThemeOptions}
    theme={theme.value}
    onThemeChange={(id) => theme.set(id)}
    themeLabel={locale.value === 'fr' ? 'Changer le thème' : 'Change theme'}
    colorMode={colorMode.value}
    onColorModeChange={(mode) => colorMode.set(mode)}
    colorModeLabels={colorModeLabels}
    locale={locale.value}
    onLocaleChange={(value) => (locale.value = value)}
    localeLabel={locale.value === 'fr' ? 'Changer la langue' : 'Change language'}
    mobileMenuOpen={isMobileMenuOpen}
    onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    menuLabel={locale.value === 'fr' ? 'Menu principal' : 'Main menu'}
    identity={identityControl}
    extraSelectors={extraControls}
  />

    <div class="docs-body">
      <div class="docs-sidebar-mobile-trigger-wrap">
        <button
          type="button"
          class="docs-sidebar-mobile-trigger"
          onclick={() => (isSidebarOpen = !isSidebarOpen)}
          aria-expanded={isSidebarOpen}
          aria-controls="docs-sidebar"
        >
          <span>{isSidebarOpen ? '▲' : '▼'}</span>
          <span>
            {isSidebarOpen
              ? (locale.value === 'fr' ? 'Masquer le sommaire' : 'Hide table of contents')
              : (locale.value === 'fr' ? 'Sommaire / Table des matières' : 'Table of contents')}
          </span>
        </button>
      </div>
      <aside class="docs-sidebar" id="docs-sidebar" class:docs-sidebar--open={isSidebarOpen}>
        <nav class="docs-side-nav" aria-label="Navigation de la documentation">
          <section class="docs-side-section" aria-labelledby="docs-foundations-heading">
            <h2 id="docs-foundations-heading">{locale.value === 'fr' ? 'Documentation' : 'Documentation'}</h2>
            <ul>
              {#each foundationNavItems as item (item.href)}
                <li>
                  <a
                    class="docs-side-link docs-side-link--docs"
                    href={item.href}
                    aria-current={isSidebarDocActive(item.href) ? 'page' : undefined}
                  >
                    {item.label}
                  </a>
                </li>
              {/each}
            </ul>
          </section>

          <section class="docs-side-section" aria-labelledby="docs-components-heading">
            <h2 id="docs-components-heading">{locale.value === 'fr' ? 'Composants' : 'Components'}</h2>
            {#each componentGroups as group (group.section)}
              <details class="docs-side-group" open={isGroupOpen(group.items)}>
                <summary>
                  <ChevronDown class="docs-side-group-icon" size={16} strokeWidth={2.25} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul>
                  {#each group.items as item (item.href)}
                    <li>
                      <a
                        class="docs-side-link docs-side-link--component"
                        href={item.href}
                        aria-current={isComponentActive(item) ? 'page' : undefined}
                      >
                        <span class="docs-side-status docs-side-status--documented" aria-hidden="true"></span>
                        <span>{item.label}</span>
                      </a>
                    </li>
                  {/each}
                </ul>
              </details>
            {/each}
          </section>
        </nav>

        <div class="docs-sidebar-footer">
          <span class="docs-sidebar-version">dataviz</span>
          {#each DOCS_UTILITY_NAV as item (item.href)}
            <a
              class="docs-sidebar-github"
              href={item.href}
              rel={item.external ? 'noreferrer' : undefined}
              target={item.external ? '_blank' : undefined}
              aria-label={item.label}
            >
              <Github size={16} strokeWidth={2.1} aria-hidden="true" />
              <span>{item.label}</span>
            </a>
          {/each}
        </div>
      </aside>

      {@render pageContent()}
    </div>
  </div>

{#if searchOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div
    class="docs-search-overlay"
    role="dialog"
    tabindex="-1"
    aria-modal="true"
    aria-label="Recherche de la documentation"
    onclick={(event) => {
      if (event.target === event.currentTarget) searchOpen = false;
    }}
  >
    <div class="docs-search-overlay__panel" bind:this={searchOverlayPanel}>
      <button
        type="button"
        class="docs-search-overlay__close"
        onclick={() => (searchOpen = false)}
        aria-label="Fermer la recherche"
      >
        <X size={18} aria-hidden="true" />
      </button>
      <DatavizSearch onSelect={() => (searchOpen = false)} />
    </div>
  </div>
{/if}
