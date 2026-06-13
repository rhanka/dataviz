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
  it("renders the top bar via the published DS AppChrome component", () => {
    const app = source("App.svelte");

    expect(app).toContain("@sentropic/design-system-svelte");
    expect(app).toContain("<AppChrome");
    // marque + nav + contrôles pilotés par les props du composant DS
    expect(app).toContain('brandName="Sentropic"');
    expect(app).toContain('productName="dataviz"');
    expect(app).toContain("nav={appNavItems}");
    expect(app).toContain("themes={appThemeOptions}");
    expect(app).toContain("identity={identityControl}");
    expect(app).toContain("extraSelectors={extraControls}");
    // le chrome bespoke (Header + snippets copiés) a disparu
    expect(app).not.toContain("{#snippet docsBrand()}");
    expect(app).not.toContain("{#snippet docsTopNav()}");
    expect(app).not.toContain("{#snippet docsUtilityNav()}");
  });

  it("keeps the body shell + search overlay as the dataviz frame", () => {
    const css = source("app.css");

    expect(css).toContain(".docs-shell");
    expect(css).toContain(".docs-body");
    expect(css).toContain(".docs-sidebar");
    expect(css).toContain(".docs-search-overlay");
  });

  it("styles search + framework as AppChrome controls, ordered first", () => {
    const app = source("App.svelte");
    const css = source("app.css");

    // recherche + switcher framework empruntent les classes de contrôle du DS
    expect(app).toContain("st-appChrome__control");
    expect(app).toContain("st-appChrome__menu");
    // et sont remontés en tête des contrôles utilitaires (parité site source)
    const extraRule = css.match(/\.st-appChrome__extraSelectors\s*\{[^}]+\}/)?.[0] ?? "";
    expect(extraRule).toContain("order: -1;");
  });

  it("drops the per-tenant bespoke chrome copies in favour of AppChrome", () => {
    for (const file of [
      "lib/site/chrome/ChromeAirbus.svelte",
      "lib/site/chrome/ChromeCanada.svelte",
      "lib/site/chrome/ChromeCarbon.svelte",
      "lib/site/chrome/ChromeDsfr.svelte",
      "lib/site/chrome/ChromeQuebec.svelte",
    ]) {
      expect(existsSync(resolve(srcRoot, file)), file).toBe(false);
    }
  });

  it("exposes Canada and Quebec themes in the theme switcher", () => {
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
    const nav = source("lib/site/docs-navigation.ts");

    expect(nav).toContain('charts: { fr: "Charts", en: "Charts" }');
    expect(nav).toContain('dashboards: { fr: "Dashboards", en: "Dashboards" }');
    expect(nav).toContain('grids: { fr: "Grilles", en: "Grids" }');
  });

  it("keeps the sidebar min-heights aligned to the DS docs source", () => {
    const css = source("app.css");
    const sideDocsRule = css.match(/\.docs-side-link--docs\s*\{[^}]+\}/)?.[0] ?? "";
    const sideComponentRule = css.match(/\.docs-side-link--component\s*\{[^}]+\}/)?.[0] ?? "";

    expect(sideDocsRule).toContain("min-height: 2rem;");
    expect(sideComponentRule).toContain("min-height: 1.75rem;");
  });

  it("keeps the component categories as collapsible first-level menus", () => {
    const app = source("App.svelte");

    expect(app).toContain('<details class="docs-side-group" open={isGroupOpen(group.items)}>');
    expect(app).toContain("<summary>");
  });

  it("removes Guides from the dataviz site surface", () => {
    for (const file of [
      "App.svelte",
      "lib/site/docs-navigation.ts",
      "lib/site/LandingPage.svelte",
      "lib/site/search/search-index.ts",
      "lib/site/search/DatavizSearch.svelte",
      "lib/registry/index.ts",
      "lib/registry/types.ts",
    ]) {
      const text = source(file);

      expect(text, file).not.toContain("Guides");
      expect(text, file).not.toContain("GuidesPage");
    }

    expect(existsSync(resolve(srcRoot, "lib/site/GuidesPage.svelte"))).toBe(false);
    expect(existsSync(resolve(srcRoot, "lib/site/Sidebar.svelte"))).toBe(false);
  });

  it("caps chart demos to the source docs chart scale", () => {
    const liveDemo = source("lib/site/LiveDemo.svelte");

    expect(liveDemo).toContain("class:dv-demo--chart={entry.section === 'charts'}");
  });
});
