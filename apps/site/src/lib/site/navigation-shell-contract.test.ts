import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const siteRoot = fileURLToPath(new URL("../../../", import.meta.url));
const srcRoot = resolve(siteRoot, "src");

function source(path: string): string {
  return readFileSync(resolve(srcRoot, path), "utf8");
}

describe("dataviz navigation shell contract", () => {
  it("uses the same docs shell base instead of the generic AppChrome wrapper", () => {
    const app = source("App.svelte");

    expect(app).toContain("Header");
    expect(app).toContain("docsBrand");
    expect(app).toContain("docsTopNav");
    expect(app).toContain("docsUtilityNav");
    expect(app).not.toContain("AppChrome");
  });

  it("keeps the docs shell class vocabulary as the site frame", () => {
    const css = source("app.css");

    expect(css).toContain(".docs-header.st-header");
    expect(css).toContain(".docs-body");
    expect(css).toContain(".docs-sidebar");
    expect(css).toContain(".docs-search-overlay");
  });

  it("keeps the header navigation left-aligned and visually quiet", () => {
    const css = source("app.css");
    const app = source("App.svelte");
    const utilityNav = app.match(/\{#snippet docsUtilityNav\(\)\}[\s\S]*?\{\/snippet\}/)?.[0] ?? "";
    const topNavRule = css.match(/\.docs-top-nav a\s*\{[^}]+\}/)?.[0] ?? "";
    const topNavCurrentRule = css.match(/\.docs-top-nav a\[aria-current="page"\]\s*\{[^}]+\}/)?.[0] ?? "";
    const sideDocsRule = css.match(/\.docs-side-link--docs\s*\{[^}]+\}/)?.[0] ?? "";
    const sideComponentRule = css.match(/\.docs-side-link--component\s*\{[^}]+\}/)?.[0] ?? "";
    const searchRule = css.match(/\.docs-search-trigger\s*\{[^}]+\}/)?.[0] ?? "";
    const headerMenuButtonRule = css.match(/\.docs-header-menuButton\s*\{[^}]+\}/)?.[0] ?? "";
    const localeTriggerRule = css.match(/\.docs-locale-trigger\s*\{[^}]+\}/)?.[0] ?? "";
    const sideHeadingRule = css.match(/\.docs-side-section h2,\s*\.docs-side-group summary\s*\{[^}]+\}/)?.[0] ?? "";
    const sideSummaryRule =
      [...css.matchAll(/\.docs-side-group summary\s*\{[^}]+\}/g)]
        .find((match) => match[0].includes("min-height"))?.[0] ?? "";

    expect(css).toContain(".docs-header.st-header .st-header__navigation");
    expect(css).toContain("justify-content: flex-start;");
    expect(css).toContain("--docs-header-control-height: 2.75rem;");
    expect(topNavRule).toContain("min-height: var(--docs-header-control-height);");
    expect(topNavRule).toContain("font-size: 14px;");
    expect(topNavRule).toContain("font-weight: 400;");
    expect(topNavRule).toContain("line-height: 14px;");
    expect(topNavCurrentRule).toContain("font-weight: 650;");
    expect(searchRule).toContain("font-size: 14px;");
    expect(searchRule).toContain("font-weight: 650;");
    expect(searchRule).toContain("line-height: 14px;");
    expect(headerMenuButtonRule).toContain("font-size: 12px;");
    expect(headerMenuButtonRule).toContain("font-weight: 650;");
    expect(headerMenuButtonRule).toContain("line-height: 12px;");
    expect(localeTriggerRule).toContain("font-size: 12px;");
    expect(localeTriggerRule).toContain("font-weight: 650;");
    expect(localeTriggerRule).toContain("line-height: 12px;");
    expect(sideHeadingRule).toContain("font-size: 12px;");
    expect(sideHeadingRule).toContain("font-weight: 750;");
    expect(sideHeadingRule).toContain("line-height: 14.4px;");
    expect(sideDocsRule).toContain("min-height: 2rem;");
    expect(sideDocsRule).toContain("font-weight: 400;");
    expect(sideDocsRule).toContain("line-height: 21.6px;");
    expect(sideSummaryRule).toContain("min-height: 2.75rem;");
    expect(sideComponentRule).toContain("min-height: 1.75rem;");
    expect(sideComponentRule).toContain("font-weight: 400;");
    expect(sideComponentRule).toContain("line-height: 18.9px;");
    expect(app).toContain('<span class="docs-brand-product">dataviz</span>');
    expect(app).toContain("{#snippet langSelector()}");
    expect(app).toContain("Globe");
    expect(app).toContain("User");
    expect(app).toContain("docs-login-trigger");
    expect(utilityNav).toContain("{@render searchTrigger()}");
    expect(utilityNav).toContain("{@render frameworkSelector()}");
    expect(utilityNav).toContain("{@render themeSelector()}");
    expect(utilityNav).toContain("{@render colorModeToggle()}");
    expect(utilityNav).toContain("{@render langSelector()}");
    expect(utilityNav).toContain("docs-login-trigger");
    expect(utilityNav).not.toContain("DOCS_UTILITY_NAV");
    expect(utilityNav).not.toContain("<Github");
  });

  it("ships the same tenant chrome set as the design-system docs site", () => {
    for (const file of [
      "lib/site/chrome/ChromeAirbus.svelte",
      "lib/site/chrome/ChromeCanada.svelte",
      "lib/site/chrome/ChromeCarbon.svelte",
      "lib/site/chrome/ChromeDsfr.svelte",
      "lib/site/chrome/ChromeQuebec.svelte",
    ]) {
      expect(existsSync(resolve(srcRoot, file)), file).toBe(true);
    }
  });

  it("exposes Canada and Quebec themes in the tenant switcher", () => {
    const theme = source("lib/site/theme.ts");

    expect(theme).toContain("canadaTheme");
    expect(theme).toContain("quebecTheme");
    expect(theme).toContain("@sentropic/design-system-theme-canada");
    expect(theme).toContain("@sentropic/design-system-theme-quebec");
  });

  it("keeps search local to dataviz registry entries", () => {
    const app = source("App.svelte");

    expect(app).toContain("DatavizSearch");
    expect(existsSync(resolve(srcRoot, "lib/site/search/DatavizSearch.svelte"))).toBe(true);
    expect(existsSync(resolve(srcRoot, "lib/site/search/search-index.ts"))).toBe(true);
  });

  it("uses Charts, Dashboards and Grilles as the component sidebar categories", () => {
    const app = source("App.svelte");
    const nav = source("lib/site/docs-navigation.ts");

    expect(app).not.toContain("Composants dataviz");
    expect(nav).toContain('charts: { fr: "Charts", en: "Charts" }');
    expect(nav).toContain('dashboards: { fr: "Dashboards", en: "Dashboards" }');
    expect(nav).toContain('grids: { fr: "Grilles", en: "Grids" }');
    expect(nav).toContain('label: COMPONENT_SECTION_LABELS[section][_locale]');
    expect(nav).toContain('slug: `${section}-overview`');
    expect(nav).not.toContain('label: `${SECTION_META[section].label} · ${group.label}`');
    expect(nav).not.toContain('{ label: SECTION_META.charts.label');
    expect(nav).not.toContain('{ label: SECTION_META.dashboards.label');
    expect(nav).not.toContain('{ label: SECTION_META.grids.label');
  });

  it("keeps the component categories as collapsible first-level menus", () => {
    const app = source("App.svelte");
    const css = source("app.css");

    expect(app).toContain('<section class="docs-side-section" aria-labelledby="docs-components-heading">');
    expect(app).toContain("<h2 id=\"docs-components-heading\">{locale.value === 'fr' ? 'Composants' : 'Components'}</h2>");
    expect(app).toContain('<details class="docs-side-group" open={isGroupOpen(group.items)}>');
    expect(app).toContain("<summary>");
    expect(app).toContain("{group.label}");
    expect(app).not.toContain('<h2 id={`docs-components-${group.section}-heading`}>{group.label}</h2>');
    expect(css).toContain(".docs-side-section + .docs-side-section");
    expect(css).toContain(".docs-side-section ul");
    expect(css).toContain("list-style: none");
  });

  it("removes Guides from the dataviz site surface", () => {
    for (const file of [
      "App.svelte",
      "lib/site/docs-navigation.ts",
      "lib/site/LandingPage.svelte",
      "lib/site/search/search-index.ts",
      "lib/site/search/DatavizSearch.svelte",
      "lib/site/chrome/ChromeAirbus.svelte",
      "lib/registry/index.ts",
      "lib/registry/types.ts",
    ]) {
      const text = source(file);

      expect(text, file).not.toMatch(/\\b[Gg]uides?\\b/);
      expect(text, file).not.toContain("Guides");
      expect(text, file).not.toContain("/guides");
      expect(text, file).not.toContain("SECTION_META.guides");
      expect(text, file).not.toContain("GuidesPage");
    }

    expect(existsSync(resolve(srcRoot, "lib/site/GuidesPage.svelte"))).toBe(false);
    expect(existsSync(resolve(srcRoot, "lib/site/Sidebar.svelte"))).toBe(false);
  });

  it("caps chart demos to the source docs chart scale", () => {
    const liveDemo = source("lib/site/LiveDemo.svelte");
    const css = source("app.css");

    expect(liveDemo).toContain("class:dv-demo--chart={entry.section === 'charts'}");
    expect(css).toContain(".dv-demo--chart .stage svg");
    expect(css).toContain("max-width: 35rem");
    expect(css).toContain("max-width: 37rem");
    expect(css).toContain("width: 100% !important");
  });
});
