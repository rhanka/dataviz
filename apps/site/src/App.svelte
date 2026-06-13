<script lang="ts">
  import { tick } from 'svelte';
  import { Boxes, ChevronDown, Github, Globe, Menu, Moon, Palette, Search as SearchIcon, Sun, User, X } from '@lucide/svelte';
  import { Header } from '@sentropic/design-system-svelte';
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
  import ChromeAirbus from './lib/site/chrome/ChromeAirbus.svelte';
  import ChromeCanada from './lib/site/chrome/ChromeCanada.svelte';
  import ChromeCarbon from './lib/site/chrome/ChromeCarbon.svelte';
  import ChromeDsfr from './lib/site/chrome/ChromeDsfr.svelte';
  import ChromeQuebec from './lib/site/chrome/ChromeQuebec.svelte';

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
  const useCustomChrome = $derived(['airbus', 'canada', 'carbon', 'dsfr', 'quebec'].includes(theme.value));

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

{#snippet docsBrand()}
  <a class="docs-brand" href={router.href('/')} aria-label="Sentropic dataviz">
    <img
      class="docs-brand-mark"
      src={`${import.meta.env.BASE_URL}SENT-logo-squared.svg`}
      alt=""
      aria-hidden="true"
    />
    <span class="docs-brand-copy">
      <span class="docs-brand-name">Sentropic</span>
      <span class="docs-brand-product">dataviz</span>
    </span>
  </a>
{/snippet}

{#snippet docsTopNav()}
  <nav class="docs-top-nav" aria-label="Navigation principale">
    {#each topNavItems as item (item.href)}
      <a href={item.href} aria-current={isActive(item.href) ? 'page' : undefined}>
        {item.label}
      </a>
    {/each}
  </nav>
{/snippet}

{#snippet searchTrigger()}
  <button
    type="button"
    class="docs-header-control docs-search-trigger"
    onclick={openSearch}
    aria-label={locale.value === 'fr' ? 'Rechercher dans la documentation' : 'Search the documentation'}
    aria-haspopup="dialog"
  >
    <SearchIcon size={16} strokeWidth={2.1} aria-hidden="true" />
    <span class="docs-search-trigger__label">{locale.value === 'fr' ? 'Rechercher...' : 'Search...'}</span>
    <kbd class="docs-search-trigger__kbd">/</kbd>
  </button>
{/snippet}

{#snippet frameworkSelector()}
  <div class="docs-framework-wrapper">
    <button
      type="button"
      class="docs-header-control docs-header-menuButton docs-locale-trigger docs-framework-trigger"
      onclick={() => (isFrameworkOpen = !isFrameworkOpen)}
      aria-expanded={isFrameworkOpen}
      aria-haspopup="true"
      aria-label={locale.value === 'fr' ? 'Changer de framework' : 'Change framework'}
    >
      <Boxes size={14} aria-hidden="true" />
      <span>{frameworkLabel}</span>
      <ChevronDown
        size={12}
        class="docs-locale-trigger-chevron {isFrameworkOpen ? 'rotated' : ''}"
        aria-hidden="true"
      />
    </button>

    {#if isFrameworkOpen}
      <div class="docs-locale-menu" role="menu">
        {#each FRAMEWORKS as option (option.id)}
          <button
            type="button"
            class="docs-locale-item"
            class:active={framework.value === option.id}
            role="menuitem"
            onclick={() => {
              framework.set(option.id);
              isFrameworkOpen = false;
            }}
          >
            <span class="locale-check">{#if framework.value === option.id}✓{/if}</span>
            <span>{option.label}</span>
          </button>
        {/each}
      </div>
    {/if}
  </div>
{/snippet}

{#snippet themeSelector()}
  <div class="docs-theme-wrapper">
    <button
      type="button"
      class="docs-header-control docs-header-menuButton docs-locale-trigger docs-theme-trigger"
      onclick={() => (isThemeOpen = !isThemeOpen)}
      aria-expanded={isThemeOpen}
      aria-haspopup="true"
      aria-label={locale.value === 'fr' ? 'Changer le thème' : 'Change theme'}
    >
      <Palette size={14} aria-hidden="true" />
      <span>{activeTheme.label}</span>
      <ChevronDown
        size={12}
        class="docs-locale-trigger-chevron {isThemeOpen ? 'rotated' : ''}"
        aria-hidden="true"
      />
    </button>

    {#if isThemeOpen}
      <div class="docs-locale-menu" role="menu">
        {#each THEMES as option (option.id)}
          <button
            type="button"
            class="docs-locale-item"
            class:active={theme.value === option.id}
            role="menuitem"
            onclick={() => {
              theme.set(option.id);
              isThemeOpen = false;
            }}
          >
            <span class="locale-check">{#if theme.value === option.id}✓{/if}</span>
            <span>{option.label}</span>
          </button>
        {/each}
      </div>
    {/if}
  </div>
{/snippet}

{#snippet colorModeToggle()}
  <button
    type="button"
    class="docs-header-control docs-header-menuButton docs-header-iconLink docs-color-mode-toggle"
    onclick={() => {
      const next: ColorMode = colorMode.value === 'light' ? 'dark' : colorMode.value === 'dark' ? 'auto' : 'light';
      colorMode.set(next);
    }}
    aria-label={
      colorMode.value === 'light'
        ? (locale.value === 'fr' ? 'Mode sombre' : 'Dark mode')
        : colorMode.value === 'dark'
          ? (locale.value === 'fr' ? 'Mode auto' : 'Auto mode')
          : (locale.value === 'fr' ? 'Mode clair' : 'Light mode')
    }
  >
    {#if colorMode.value === 'dark'}
      <Moon size={16} strokeWidth={2} aria-hidden="true" />
    {:else if colorMode.value === 'light'}
      <Sun size={16} strokeWidth={2} aria-hidden="true" />
    {:else}
      <Sun size={16} strokeWidth={1.5} aria-hidden="true" style="opacity: 0.65;" />
    {/if}
  </button>
{/snippet}

{#snippet langSelector()}
  <div class="docs-locale-wrapper">
    <button
      type="button"
      class="docs-header-control docs-header-menuButton docs-locale-trigger"
      onclick={() => (isLocaleOpen = !isLocaleOpen)}
      aria-expanded={isLocaleOpen}
      aria-haspopup="true"
      aria-label={locale.value === 'fr' ? 'Changer la langue' : 'Change language'}
    >
      <Globe size={14} class="docs-locale-trigger-icon" aria-hidden="true" />
      <span>{locale.value.toUpperCase()}</span>
      <ChevronDown
        size={12}
        class="docs-locale-trigger-chevron {isLocaleOpen ? 'rotated' : ''}"
        aria-hidden="true"
      />
    </button>

    {#if isLocaleOpen}
      <div class="docs-locale-menu" role="menu">
        <button
          type="button"
          class="docs-locale-item"
          class:active={locale.value === 'fr'}
          role="menuitem"
          onclick={() => {
            locale.value = 'fr';
            isLocaleOpen = false;
          }}
        >
          <span class="locale-check">{#if locale.value === 'fr'}✓{/if}</span>
          <span>Français</span>
        </button>
        <button
          type="button"
          class="docs-locale-item"
          class:active={locale.value === 'en'}
          role="menuitem"
          onclick={() => {
            locale.value = 'en';
            isLocaleOpen = false;
          }}
        >
          <span class="locale-check">{#if locale.value === 'en'}✓{/if}</span>
          <span>English</span>
        </button>
      </div>
    {/if}
  </div>
{/snippet}

{#snippet emptySwitcher()}{/snippet}

{#snippet docsUtilityNav()}
  <nav class="docs-utility-nav" aria-label="Outils">
    {@render searchTrigger()}
    {#if showFrameworkSwitcher}
      {@render frameworkSelector()}
    {/if}
    {@render themeSelector()}
    {@render colorModeToggle()}
    {@render langSelector()}
    <button
      type="button"
      class="docs-header-control docs-header-menuButton docs-login-trigger"
      aria-label={locale.value === 'fr' ? 'Se connecter' : 'Sign in'}
    >
      <User size={16} strokeWidth={2.1} aria-hidden="true" />
    </button>
  </nav>

  <button
    type="button"
    class="docs-mobile-menu-trigger"
    onclick={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    aria-expanded={isMobileMenuOpen}
    aria-label="Menu principal"
  >
    {#if isMobileMenuOpen}
      <X size={20} />
    {:else}
      <Menu size={20} />
    {/if}
  </button>
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

{#if useCustomChrome && theme.value === 'carbon'}
  <div data-st-theme={theme.value} use:chromeRouting>
    <ChromeCarbon
      activeThemeId={theme.value}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={showFrameworkSwitcher ? frameworkSelector : emptySwitcher}
      localeSwitcher={langSelector}
      compareButton={emptySwitcher}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}{@render routeContent()}{/snippet}
    </ChromeCarbon>
  </div>
{:else if useCustomChrome && theme.value === 'dsfr'}
  <div data-st-theme={theme.value} use:chromeRouting>
    <ChromeDsfr
      activeThemeId={theme.value}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={showFrameworkSwitcher ? frameworkSelector : emptySwitcher}
      localeSwitcher={langSelector}
      compareButton={emptySwitcher}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}{@render routeContent()}{/snippet}
    </ChromeDsfr>
  </div>
{:else if useCustomChrome && theme.value === 'airbus'}
  <div data-st-theme={theme.value} use:chromeRouting>
    <ChromeAirbus
      activeThemeId={theme.value}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={showFrameworkSwitcher ? frameworkSelector : emptySwitcher}
      localeSwitcher={langSelector}
      compareButton={emptySwitcher}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}{@render routeContent()}{/snippet}
    </ChromeAirbus>
  </div>
{:else if useCustomChrome && theme.value === 'canada'}
  <div data-st-theme={theme.value} use:chromeRouting>
    <ChromeCanada
      activeThemeId={theme.value}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={showFrameworkSwitcher ? frameworkSelector : emptySwitcher}
      localeSwitcher={langSelector}
      compareButton={emptySwitcher}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}{@render routeContent()}{/snippet}
    </ChromeCanada>
  </div>
{:else if useCustomChrome && theme.value === 'quebec'}
  <div data-st-theme={theme.value} use:chromeRouting>
    <ChromeQuebec
      activeThemeId={theme.value}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={showFrameworkSwitcher ? frameworkSelector : emptySwitcher}
      localeSwitcher={langSelector}
      compareButton={emptySwitcher}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}{@render routeContent()}{/snippet}
    </ChromeQuebec>
  </div>
{:else}
  <a class="docs-skip-link" href="#main-content">Aller au contenu</a>
  <div class="docs-shell" data-st-theme={theme.value} use:chromeRouting>
    <Header
      class="docs-header"
      label="En-tête de la documentation Sentropic dataviz"
      logo={docsBrand}
      navigation={docsTopNav}
      actions={docsUtilityNav}
    />

    {#if isMobileMenuOpen}
      <nav class="docs-mobile-nav" aria-label="Menu mobile">
        <div class="docs-mobile-nav-section">
          <span class="docs-mobile-nav-label">{locale.value === 'fr' ? 'Navigation' : 'Navigation'}</span>
          {#each topNavItems as item (item.href)}
            <a
              href={item.href}
              onclick={() => (isMobileMenuOpen = false)}
              aria-current={isActive(item.href) ? 'page' : undefined}
            >
              <span>{item.label}</span>
            </a>
          {/each}
        </div>
        <div class="docs-mobile-nav-section">
          <span class="docs-mobile-nav-label">Framework</span>
          <div class="docs-mobile-locale-switcher docs-mobile-framework-switcher">
            {#each FRAMEWORKS as option (option.id)}
              <button
                type="button"
                class="docs-mobile-locale-btn"
                class:active={framework.value === option.id}
                onclick={() => {
                  framework.set(option.id);
                  isMobileMenuOpen = false;
                }}
              >
                {option.label}
              </button>
            {/each}
          </div>

          <span class="docs-mobile-nav-label">{locale.value === 'fr' ? 'Mode couleur' : 'Color mode'}</span>
          <div class="docs-mobile-locale-switcher docs-mobile-color-mode-switcher">
            {#each (['light', 'dark', 'auto'] as ColorMode[]) as mode (mode)}
              <button
                type="button"
                class="docs-mobile-locale-btn"
                class:active={colorMode.value === mode}
                onclick={() => colorMode.set(mode)}
              >
                {mode === 'light'
                  ? (locale.value === 'fr' ? 'Clair' : 'Light')
                  : mode === 'dark'
                    ? (locale.value === 'fr' ? 'Sombre' : 'Dark')
                    : 'Auto'}
              </button>
            {/each}
          </div>

          <span class="docs-mobile-nav-label">{locale.value === 'fr' ? 'Langue' : 'Language'}</span>
          <div class="docs-mobile-locale-switcher docs-mobile-lang-switcher">
            {@render langSelector()}
          </div>

          <span class="docs-mobile-nav-label">{locale.value === 'fr' ? 'Thème' : 'Theme'}</span>
          <div class="docs-mobile-locale-switcher docs-mobile-theme-switcher">
            {#each THEMES as option (option.id)}
              <button
                type="button"
                class="docs-mobile-locale-btn"
                class:active={theme.value === option.id}
                onclick={() => {
                  theme.set(option.id);
                  isMobileMenuOpen = false;
                }}
              >
                {option.label}
              </button>
            {/each}
          </div>
        </div>
      </nav>
    {/if}

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
{/if}

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
