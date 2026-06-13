import { ENTRIES, SECTION_META, groupsFor, type Section } from "../registry";
import { router } from "./router.svelte";

export type Locale = "fr" | "en";

type ComponentSection = Section;

export type ComponentNavItem = {
  label: string;
  href: string;
  slug: string;
  section: ComponentSection;
  status: "documented";
};

export type ComponentNavGroup = {
  section: ComponentSection;
  label: string;
  items: ComponentNavItem[];
};

export type NavItem = {
  label: string;
  href: string;
  external?: boolean;
};

export const DOCS_VERSION = "dataviz";

export const DOCS_UTILITY_NAV: NavItem[] = [
  {
    label: "GitHub",
    href: "https://github.com/rhanka/dataviz",
    external: true,
  },
];

function appHref(path: string): string {
  return router.href(path);
}

const COMPONENT_SECTIONS: ComponentSection[] = ["charts", "dashboards", "grids"];

const COMPONENT_SECTION_LABELS: Record<ComponentSection, Record<Locale, string>> = {
  charts: { fr: "Charts", en: "Charts" },
  dashboards: { fr: "Dashboards", en: "Dashboards" },
  grids: { fr: "Grilles", en: "Grids" },
};

const OVERVIEW_LABEL: Record<Locale, string> = { fr: "Vue d'ensemble", en: "Overview" };
const HOME_LABEL: Record<Locale, string> = { fr: "Accueil", en: "Home" };
const PAGE_LABEL: Record<Locale, string> = { fr: "Page", en: "Page" };

export function buildTopNav(_locale: Locale = "fr"): NavItem[] {
  return [
    { label: COMPONENT_SECTION_LABELS.charts[_locale], href: appHref("/charts") },
    { label: COMPONENT_SECTION_LABELS.dashboards[_locale], href: appHref("/dashboards") },
    { label: COMPONENT_SECTION_LABELS.grids[_locale], href: appHref("/grids") },
  ];
}

export function buildFoundationNav(locale: Locale = "fr"): NavItem[] {
  return [{ label: OVERVIEW_LABEL[locale], href: appHref("/") }];
}

export function buildComponentNavGroups(_locale: Locale = "fr"): ComponentNavGroup[] {
  return COMPONENT_SECTIONS.map((section) => ({
    section,
    label: COMPONENT_SECTION_LABELS[section][_locale],
    items: [
      {
        label: OVERVIEW_LABEL[_locale],
        href: appHref(SECTION_META[section].href),
        slug: `${section}-overview`,
        section,
        status: "documented" as const,
      },
      ...groupsFor(section).flatMap((group) =>
        group.entries.map((entry) => ({
          label: entry.name,
          href: appHref(`/${section}/${entry.slug}`),
          slug: entry.slug,
          section,
          status: "documented" as const,
        })),
      ),
    ],
  }));
}

export function resolveBreadcrumb(pathname: string, _locale: Locale = "fr"): NavItem[] {
  const clean = pathname.replace(/\/+$/, "") || "/";
  const crumbs: NavItem[] = [{ label: HOME_LABEL[_locale], href: appHref("/") }];

  if (clean === "/") return crumbs;

  const [section, slug] = clean.split("/").filter(Boolean) as [Section | undefined, string | undefined];
  if (!section || !(section in SECTION_META)) return [...crumbs, { label: PAGE_LABEL[_locale], href: appHref(clean) }];

  crumbs.push({ label: COMPONENT_SECTION_LABELS[section][_locale], href: appHref(SECTION_META[section].href) });

  if (slug) {
    const entry = ENTRIES.find((item) => item.section === section && item.slug === slug);
    crumbs.push({ label: entry?.name ?? slug, href: appHref(`/${section}/${slug}`) });
  }

  return crumbs;
}
